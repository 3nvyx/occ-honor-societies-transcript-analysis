import { determineSocietyMembership, parseTranscriptTextDeterministically } from './gas-analysis.js';
import { loadCourseCatalog } from './load-course-catalog.js';

const SOCIETY_NAMES = {
  ABG: 'Alpha Beta Gamma',
  AGS: 'Alpha Gamma Sigma',
  AMG: 'Alpha Mu Gamma',
  EEO: 'Eta Eta Omicron',
  IX: 'Iota Xi',
  MAT: 'Mu Alpha Theta',
  MDR: 'Mu Delta Rho',
  NTHS: 'National Technical Honor Society',
  OPS: 'Omega Psi Sigma',
  PAM: 'Phi Alpha Mu',
  PTK: 'Phi Theta Kappa',
  PRS: 'Pi Rho Sigma',
  PTE: 'Pi Tau Epsilon',
  PB: 'Psi Beta',
  SALUTE: 'SALUTE Veterans National Honor Society',
  SCE: 'Sigma Chi Eta',
  SKD: 'Sigma Kappa Delta'
};

export class PublicAnalysisError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'PublicAnalysisError';
    this.statusCode = statusCode;
  }
}

function sumCreditHours(courses) {
  return (courses || []).reduce((sum, course) => sum + (Number(course.creditHours) || 0), 0);
}

function looksLikeUsableTranscript(parsedData, text) {
  const hasParsedIdentity = Boolean(parsedData.name || parsedData.studentId || parsedData.major);
  const hasParsedCourses = (parsedData.courses || []).length > 0 || (parsedData.inProgressCourses || []).length > 0;
  const hasTranscriptSignals = [/\bName\s*:/i, /\bTerm\s*:/i, /\bOverall\s*:/i].some((regex) => regex.test(text));

  return hasTranscriptSignals && (hasParsedIdentity || hasParsedCourses);
}

function detectVeteranSignals(text) {
  const source = String(text || '').toUpperCase();
  const hasDd214 = /\bDD\s*[- ]?\s*214\b/.test(source);
  const hasVeteranLanguage = /\b(VETERAN|ACTIVE RESERVIST|RESERVIST|MILITARY|ARMED FORCES|SERVICE MEMBER|SERVICEMEMBER)\b/.test(source);

  return {
    isVeteran: hasDd214 || hasVeteranLanguage,
    hasDd214
  };
}

function mapSocietyResult([societyCode, rawResult]) {
  return {
    code: societyCode,
    name: SOCIETY_NAMES[societyCode] || societyCode,
    qualifies: Boolean(rawResult?.qualifies),
    level: rawResult?.membershipLevel || null,
    reason: rawResult?.reason || 'No result returned.',
    qualifyingUnits:
      typeof rawResult?.qualUnits === 'number' ? Number(rawResult.qualUnits.toFixed(2)) : rawResult?.qualUnits || null,
    qualifyingGpa:
      typeof rawResult?.qualGPA === 'number' ? Number(rawResult.qualGPA.toFixed(2)) : rawResult?.qualGPA || null,
    qualifyingCourses: Array.isArray(rawResult?.qualCoursesArr)
      ? rawResult.qualCoursesArr.map((course) => ({
          code: course.code || '',
          title: course.title || '',
          grade: course.grade || '',
          creditHours: Number(course.creditHours) || 0
        }))
      : []
  };
}

export async function analyzeTranscriptSubmission({
  extractedText,
  fileNames = []
}) {
  const text = String(extractedText || '').replace(/\r\n/g, '\n').trim();
  if (!text) {
    throw new PublicAnalysisError(
      'This PDF does not contain a usable text layer. Please upload a text-based PDF export.',
      422
    );
  }

  const parsedData = parseTranscriptTextDeterministically(text);
  if (!looksLikeUsableTranscript(parsedData, text)) {
    throw new PublicAnalysisError(
      'This PDF could not be parsed with confidence. Please upload a text-based transcript PDF export.',
      422
    );
  }

  const veteranSignals = detectVeteranSignals(text);
  parsedData.isVeteran = veteranSignals.isVeteran;
  parsedData.hasDD214 = veteranSignals.hasDd214;

  const catalogMap = await loadCourseCatalog();
  const membershipResults = determineSocietyMembership(parsedData, catalogMap);
  const allSocieties = Object.entries(membershipResults)
    .map(mapSocietyResult)
    .sort((left, right) => {
      if (left.qualifies !== right.qualifies) return left.qualifies ? -1 : 1;
      return left.code.localeCompare(right.code);
    });

  return {
    transcript: {
      name: parsedData.name || 'Transcript parsed',
      studentId: parsedData.studentId || '',
      dob: parsedData.dob || '',
      major: parsedData.major || '',
      gpa: Number(parsedData.gpa) || 0,
      earnedHours: Number(parsedData.earnedHours) || 0,
      currentEnrollmentHours: sumCreditHours(parsedData.inProgressCourses),
      completedCourseCount: (parsedData.courses || []).length,
      inProgressCourseCount: (parsedData.inProgressCourses || []).length,
      transcriptSocieties: parsedData.societies || [],
      veteranStatusDetected: veteranSignals.isVeteran,
      dd214Detected: veteranSignals.hasDd214
    },
    qualifiedSocieties: allSocieties.filter((society) => society.qualifies),
    allSocieties,
    upload: {
      fileCount: fileNames.length,
      fileNames,
      extractedTextLength: text.length
    }
  };
}
