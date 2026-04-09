/**
 * DETERMINISTIC TRANSCRIPT PARSER
 * Converts raw text-layer transcript output into the existing transcript schema.
 * This parser is designed for Ellucian-style transcripts and keeps transcript facts as printed.
 */

const KNOWN_TRANSCRIPT_SOCIETIES = [
  'Alpha Beta Gamma',
  'Alpha Gamma Sigma',
  'Alpha Mu Gamma',
  'Eta Eta Omicron',
  'Iota Xi',
  'Mu Alpha Theta',
  'Mu Delta Rho',
  'National Technical Honor Society',
  'Omega Psi Sigma',
  'Phi Alpha Mu',
  'Phi Theta Kappa',
  'Pi Rho Sigma',
  'Pi Tau Epsilon',
  'Psi Beta',
  'SALUTE',
  'Sigma Chi Eta',
  'Sigma Kappa Delta'
];

function parseTranscriptTextDeterministically(extractedText) {
  const text = String(extractedText || '').replace(/\r\n/g, '\n').trim();
  if (!text) return buildEmptyParsedTranscriptData_();

  const chunks = text
    .split(/\n+\s*--- TRANSCRIPT SEPARATOR ---\s*\n+/i)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  const parsedChunks = chunks.map(parseSingleTranscriptChunkDeterministically_);
  return mergeParsedTranscriptData_(parsedChunks);
}

function parseSingleTranscriptChunkDeterministically_(text) {
  const record = buildEmptyParsedTranscriptData_();
  const lines = text.split('\n').map(line => line.replace(/\s+$/g, ''));

  const studentInfo = extractStudentIdentity_(lines, text);
  record.name = studentInfo.name;
  record.studentId = studentInfo.studentId;
  record.dob = extractSingleLineFieldValue_(lines, 'Birth Date');
  record.major = extractMajorField_(lines);

  const totals = extractOverallTotals_(lines);
  record.earnedHours = totals.earnedHours;
  record.gpaHours = totals.gpaHours;
  record.qualityPoints = totals.qualityPoints;
  record.gpa = totals.gpa;

  record.courses = extractCompletedCourses_(lines);
  record.inProgressCourses = extractInProgressCourses_(lines);
  record.societies = extractTranscriptSocieties_(text);
  record.hasAPEnglish = detectHasAPEnglish_(record.courses, record.inProgressCourses, text);

  return record;
}

function buildEmptyParsedTranscriptData_() {
  return {
    name: '',
    studentId: '',
    dob: '',
    major: '',
    earnedHours: 0,
    gpaHours: 0,
    qualityPoints: 0,
    gpa: 0,
    courses: [],
    inProgressCourses: [],
    societies: [],
    hasAPEnglish: false
  };
}

function extractStudentIdentity_(lines, text) {
  let name = '';
  let studentId = '';

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*Name\s*:\s*(.+?)\s*$/i);
    if (!match) continue;

    const rawValue = match[1].replace(/\s+/g, ' ').trim();
    const idMatch = rawValue.match(/,\s*([A-Z]\d{7,}|\d{7,})\s*$/i);
    if (idMatch) {
      studentId = idMatch[1].trim();
      name = rawValue.replace(/,\s*([A-Z]\d{7,}|\d{7,})\s*$/i, '').trim();
    } else {
      name = rawValue;
    }
    break;
  }

  if (!studentId) {
    const topIdMatch = text.match(/\b([A-Z]\d{7,}|\d{7,})\b/);
    if (topIdMatch) studentId = topIdMatch[1].trim();
  }

  if (!name) {
    const topLineMatch = text.match(/\b(?:[A-Z]\d{7,}|\d{7,})\b\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+)+)/);
    if (topLineMatch) {
      name = topLineMatch[1].replace(/\s+/g, ' ').trim();
    }
  }

  return { name: name, studentId: studentId };
}

function extractSingleLineFieldValue_(lines, fieldLabel) {
  const escapedLabel = fieldLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^\\s*' + escapedLabel + '\\s*:\\s*(.+?)\\s*$', 'i');

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(regex);
    if (match) return match[1].replace(/\s+/g, ' ').trim();
  }

  return '';
}

function extractMajorField_(lines) {
  const programValue = extractSingleLineFieldValue_(lines, 'Program');
  if (programValue) return programValue;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*Major and Department\s*:\s*(.+?)\s*$/i);
    if (!match) continue;

    let value = match[1].trim();
    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j];
      if (!next.trim()) break;
      if (/^\s*[A-Z][A-Za-z ]+\s*:/.test(next)) break;
      if (/^\s{10,}\S/.test(next)) {
        value += ' ' + next.trim();
        j++;
        continue;
      }
      break;
    }
    return value.replace(/\s+/g, ' ').trim();
  }

  return '';
}

function extractOverallTotals_(lines) {
  let lastMatch = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const overallMatch = line.match(/^\s*Overall:\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*$/);
    if (overallMatch) {
      lastMatch = overallMatch;
    }
  }

  if (lastMatch) {
    return {
      earnedHours: parseFloat(lastMatch[3]) || 0,
      gpaHours: parseFloat(lastMatch[4]) || 0,
      qualityPoints: parseFloat(lastMatch[5]) || 0,
      gpa: parseFloat(lastMatch[6]) || 0
    };
  }

  return {
    earnedHours: 0,
    gpaHours: 0,
    qualityPoints: 0,
    gpa: 0
  };
}

function extractCompletedCourses_(lines) {
  const courses = [];
  let currentTerm = '';
  let inProgressSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^COURSES IN PROGRESS\b/i.test(trimmed)) {
      inProgressSection = true;
      continue;
    }
    if (/^(IGETC|CSU|Transcripts Received)\b/i.test(trimmed)) {
      inProgressSection = false;
      currentTerm = '';
      continue;
    }

    const termMatch = line.match(/^\s*Term:\s+(.+?)\s*$/);
    if (termMatch) {
      currentTerm = termMatch[1].trim();
      continue;
    }

    if (!currentTerm || inProgressSection) continue;

    const course = parseCompletedCourseLine_(line, currentTerm);
    if (course) courses.push(course);
  }

  return courses;
}

function parseCompletedCourseLine_(line, currentTerm) {
  const match = line.match(/^\s*([A-Z]{2,6})\s+([A-Z]\d{3,4}[A-Z]?)\s+([A-Z]{1,4})\s+(.+?)\s+([A-Z]{1,3}[+-]?)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)(?:\s+([A-Z]))?\s*$/);
  if (!match) return null;

  const subject = match[1];
  const courseNumber = match[2];
  const level = match[3];
  const title = match[4].replace(/\s+/g, ' ').trim();
  const grade = match[5].trim();
  const creditHours = parseFloat(match[6]) || 0;
  const qualityPoints = parseFloat(match[7]) || 0;
  const trailingCode = (match[8] || '').trim();
  const markers = trailingCode ? [trailingCode] : [];

  return {
    code: subject + ' ' + courseNumber,
    term: currentTerm,
    title: title,
    grade: grade,
    creditHours: creditHours,
    qualityPoints: qualityPoints,
    isOcc: isOccCourseByLevel_(level),
    institution: resolveInstitutionName_(level),
    markers: markers
  };
}

function extractInProgressCourses_(lines) {
  const courses = [];
  let currentTerm = '';
  let inProgressSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^COURSES IN PROGRESS\b/i.test(trimmed)) {
      inProgressSection = true;
      currentTerm = '';
      continue;
    }
    if (inProgressSection && /^(IGETC|CSU|Transcripts Received)\b/i.test(trimmed)) {
      inProgressSection = false;
      currentTerm = '';
      continue;
    }
    if (!inProgressSection) continue;

    const termMatch = line.match(/^\s*Term:\s+(.+?)\s*$/);
    if (termMatch) {
      currentTerm = termMatch[1].trim();
      continue;
    }
    if (!currentTerm) continue;

    const course = parseInProgressCourseLine_(line, currentTerm);
    if (course) courses.push(course);
  }

  return courses;
}

function parseInProgressCourseLine_(line, currentTerm) {
  const match = line.match(/^\s*([A-Z]{2,6})\s+([A-Z]\d{3,4}[A-Z]?)\s+([A-Z]{1,4})\s+(.+?)\s+([0-9]+\.[0-9]+)\s*$/);
  if (!match) return null;

  const subject = match[1];
  const courseNumber = match[2];
  const level = match[3];
  const title = match[4].replace(/\s+/g, ' ').trim();
  const creditHours = parseFloat(match[5]) || 0;

  return {
    code: subject + ' ' + courseNumber,
    term: currentTerm,
    title: title,
    creditHours: creditHours,
    isOcc: isOccCourseByLevel_(level),
    institution: resolveInstitutionName_(level)
  };
}

function isOccCourseByLevel_(level) {
  return String(level || '').toUpperCase() === 'OC';
}

function resolveInstitutionName_(level) {
  if (isOccCourseByLevel_(level)) return 'Orange Coast College';
  return '';
}

function extractTranscriptSocieties_(text) {
  const found = [];
  const seen = {};
  const upper = String(text || '').toUpperCase();

  for (let i = 0; i < KNOWN_TRANSCRIPT_SOCIETIES.length; i++) {
    const societyName = KNOWN_TRANSCRIPT_SOCIETIES[i];
    const escaped = societyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'i');
    if (regex.test(upper) && !seen[societyName]) {
      seen[societyName] = true;
      found.push(societyName);
    }
  }

  return found;
}

function detectHasAPEnglish_(courses, inProgressCourses, text) {
  const allCourseText = []
    .concat(courses || [])
    .concat(inProgressCourses || [])
    .map(course => [course.code || '', course.title || ''].join(' ').toUpperCase());

  for (let i = 0; i < allCourseText.length; i++) {
    const value = allCourseText[i];
    if (/\bAP\b/.test(value) && /\b(ENGL|ENGLISH|COMP|COMPOSITION|LANGUAGE|LIT|LITERATURE)\b/.test(value)) {
      return true;
    }
  }

  return /\bAP\b.*\b(ENGL|ENGLISH|COMPOSITION|LITERATURE|LANGUAGE)\b/i.test(String(text || ''));
}

function mergeParsedTranscriptData_(records) {
  const merged = buildEmptyParsedTranscriptData_();
  if (!records || !records.length) return merged;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!merged.name && record.name) merged.name = record.name;
    if (!merged.studentId && record.studentId) merged.studentId = record.studentId;
    if (!merged.dob && record.dob) merged.dob = record.dob;
    if (!merged.major && record.major) merged.major = record.major;

    if (record.earnedHours > merged.earnedHours) merged.earnedHours = record.earnedHours;
    if (record.gpaHours > merged.gpaHours) merged.gpaHours = record.gpaHours;
    if (record.qualityPoints > merged.qualityPoints) merged.qualityPoints = record.qualityPoints;
    if (record.gpa > merged.gpa) merged.gpa = record.gpa;

    merged.courses = mergeCourseArrays_(merged.courses, record.courses, buildCompletedCourseKey_);
    merged.inProgressCourses = mergeCourseArrays_(merged.inProgressCourses, record.inProgressCourses, buildInProgressCourseKey_);
    merged.societies = mergeStringArrays_(merged.societies, record.societies);
    merged.hasAPEnglish = merged.hasAPEnglish || Boolean(record.hasAPEnglish);
  }

  return merged;
}

function mergeCourseArrays_(existing, incoming, keyBuilder) {
  const merged = (existing || []).slice();
  const seen = {};

  for (let i = 0; i < merged.length; i++) {
    seen[keyBuilder(merged[i])] = true;
  }

  for (let j = 0; j < (incoming || []).length; j++) {
    const item = incoming[j];
    const key = keyBuilder(item);
    if (seen[key]) continue;
    seen[key] = true;
    merged.push(item);
  }

  return merged;
}

function buildCompletedCourseKey_(course) {
  return [
    course.code || '',
    course.term || '',
    course.grade || '',
    ((course.markers || []).join(',')) || '',
    course.title || ''
  ].join('|');
}

function buildInProgressCourseKey_(course) {
  return [
    course.code || '',
    course.term || '',
    course.title || ''
  ].join('|');
}

function mergeStringArrays_(existing, incoming) {
  const merged = (existing || []).slice();
  const seen = {};

  for (let i = 0; i < merged.length; i++) {
    seen[String(merged[i]).toUpperCase()] = true;
  }

  for (let j = 0; j < (incoming || []).length; j++) {
    const value = String(incoming[j] || '');
    const key = value.toUpperCase();
    if (!value || seen[key]) continue;
    seen[key] = true;
    merged.push(value);
  }

  return merged;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseTranscriptTextDeterministically: parseTranscriptTextDeterministically
  };
}
