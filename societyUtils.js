/**
 * SOCIETY UTILITIES
 * Helper functions shared by all society calculations.
 */

function loadCourseCatalog() {
  if (CACHED_CATALOG_MAP && CATALOG_LAST_UPDATED && (Date.now() - CATALOG_LAST_UPDATED) < CONFIG.CACHE_DURATION) {
    return CACHED_CATALOG_MAP;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const catSheet = ss.getSheetByName('Course Catalogue');
  if (!catSheet) throw new Error('No "Course Catalogue" sheet found.');

  const data = catSheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);
  
  const knownSocieties = Object.keys(CONFIG.SOCIETY_CONFIG);
  const colIndexBySociety = {};
  
  header.forEach((colName, idx) => {
    const society = colName?.trim().toUpperCase();
    if (knownSocieties.includes(society)) colIndexBySociety[society] = idx;
  });

  const catalogMap = rows.reduce((acc, row) => {
    const code = row[0]?.trim().toUpperCase();
    if (!code) return acc;
    acc[code] = Object.entries(colIndexBySociety)
      .filter(([soc, idx]) => row[idx]?.toString().trim().toUpperCase() === 'X')
      .map(([soc]) => soc);
    return acc;
  }, {});

  const programMap = {};
  rows.forEach(row => {
    const code = row[0]?.trim().toUpperCase();
    if (code) programMap[code] = row[14]?.toString().trim(); // Column O
  });
  
  CACHED_CATALOG_MAP = { societyMap: catalogMap, programMap: programMap };
  CATALOG_LAST_UPDATED = Date.now();
  return CACHED_CATALOG_MAP;
}
function averageGPA(courseArr) {
  if (!courseArr || courseArr.length === 0) return 0;
  let totalQP = 0, totalCr = 0;
  courseArr.forEach(c => {
    if (c.creditHours > 0 && c.qualityPoints !== null) {
      totalQP += c.qualityPoints;
      totalCr += c.creditHours;
    }
  });
  return totalCr > 0 ? totalQP / totalCr : 0;
}

function getInProgressUnitsAtOCC(parsed) {
  console.log('[ipUnits DEBUG] inProgressCourses count:', Array.isArray(parsed.inProgressCourses) ? parsed.inProgressCourses.length : 'NOT AN ARRAY');
  console.log('[ipUnits DEBUG] inProgressCourses raw:', JSON.stringify(parsed.inProgressCourses));
  let total = 0;
  if (Array.isArray(parsed.inProgressCourses)) {
    parsed.inProgressCourses.forEach(ipc => {
      // Use isCourseOCC() helper as fallback — in-progress courses often lack
      // Also check course code pattern (OCC uses "A" prefix like PSYC A100).
      const occByFlag = Boolean(ipc.isOcc);
      const occByHelper = isCourseOCC(ipc);
      const occByCode = hasOCCCourseCodePattern(ipc);
      const isOccResult = occByFlag || occByHelper || occByCode;
      console.log(`[ipUnits DEBUG] Course ${ipc.code}: isOcc=${occByFlag}, institution="${ipc.institution || ''}", isCourseOCC=${occByHelper}, codePattern=${occByCode}, creditHours=${ipc.creditHours}, COUNTED=${isOccResult}`);
      if (isOccResult) {
        total += parseFloat(ipc.creditHours || 0);
      }
    });
  }
  console.log('[ipUnits DEBUG] Total OCC in-progress units:', total);
  return total;
}

function letterGradeToPoints(grade) {
  const g = String(grade || '').toUpperCase();
  const map = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
  return map[g] !== undefined ? map[g] : parseFloat(grade) || null;
}

// Prepare courses with normalized numeric grades and quality points
function prepareStudentCourses(parsedData) {
  return (parsedData.courses || []).map(c => {
    const code = (c.code || '').trim().toUpperCase();
    if (!code) return null;
    
    // Check if grade has "E" (excluded) indicator
    const gradeStr = String(c.grade || '').trim().toUpperCase();
    const markers = Array.isArray(c.markers)
      ? c.markers.map(marker => String(marker || '').trim().toUpperCase()).filter(Boolean)
      : [];
    const hasException = markers.includes('E') || gradeStr.includes(' E') || gradeStr.endsWith('E') || /[A-F]\s*E/.test(gradeStr);
    
    // Extract base grade (remove E)
    const baseGrade = gradeStr.replace(/\s*E\s*/g, '').trim();
    let numericGrade = letterGradeToPoints(baseGrade);
    
    // For excluded grades, set credit hours and quality points to 0
    let creditHours = hasException ? 0 : parseFloat(c.creditHours || 0);
    let qualityPoints = hasException ? 0 : ((c.qualityPoints && parseFloat(c.qualityPoints) > 0) 
        ? parseFloat(c.qualityPoints) 
        : (numericGrade !== null ? numericGrade * creditHours : null));

    return {
      code,
      title: (c.title || '').trim().toUpperCase(),
      term: c.term || '',
      grade: c.grade, // Keep original grade with E
      numericGrade,
      creditHours,
      isOcc: Boolean(c.isOcc),
      qualityPoints,
      hasException: hasException
    };
  }).filter(c => c !== null);
}

// Helper to filter courses based on the Catalog Map
function getQualifyingCoursesForSociety(studentCourses, society, societyConfig, catalogMap) {
    return studentCourses.filter(c => {
        // Basic filtering: Must be A, B, or C (or numeric equivalent >= 2.0)
        if (!['A','B','C'].includes(String(c.grade).toUpperCase()) && (c.numericGrade === null || c.numericGrade < 2.0)) return false;
        
        // OCC Only check
        if (societyConfig[society] && societyConfig[society].occOnly && !c.isOcc) return false;
        
        // Check Catalog Map
        const eligibleSocs = catalogMap.societyMap[c.code];
        return eligibleSocs && eligibleSocs.includes(society);
    });
}

/**
 * Helper function to check if a course is from OCC (Orange Coast College)
 * Handles both boolean and string values of isOcc, and checks institution name as fallback
 * @param {Object} course - Course object with isOcc and institution properties
 * @returns {boolean} True if the course is from OCC
 */
function isCourseOCC(course) {
  if (!course) return false;
  
  // Handle boolean and string values of isOcc
  if (course.isOcc === true || course.isOcc === 'true' || course.isOcc === 1) return true;
  
  // Check institution name as fallback
  const inst = String(course.institution || '').toUpperCase();
  if (inst.includes('ORANGE COAST') || inst.includes('OCC') || inst === 'OC') return true;
  const level = String(course.level || '').toUpperCase();
  if (level.includes('OC')) return true;
  
  // Check course code pattern as last-resort fallback
  if (hasOCCCourseCodePattern(course)) return true;
  
  return false;
}

/**
 * Check if a course code matches the OCC "A" prefix pattern
 * OCC courses use a distinctive pattern: DEPT A### (e.g., PSYC A100, ENGL A100, BIOL A100, CMST A240)
 * @param {Object} course - Course object with code property
 * @returns {boolean} True if the course code matches OCC's pattern
 */
function hasOCCCourseCodePattern(course) {
  if (!course || !course.code) return false;
  const code = String(course.code).toUpperCase().trim();
  // Match patterns like "PSYC A100", "ENGL A100", "BIOL A100", "CMST A240"
  // Format: 2-5 letter dept code, optional space, "A" followed by 3+ digits
  return /^[A-Z]{2,5}\s*A\d{3}/.test(code);
}

/**
 * Helper function to check if a course is an AP (Advanced Placement) course
 * AP courses should not be treated as regular courses in the student report
 * @param {Object} course - Course object with code, title, institution properties
 * @returns {boolean} True if the course is an AP course
 */
function isAPCourse(course) {
  if (!course) return false;
  
  const code = String(course.code || '').toUpperCase();
  const title = String(course.title || '').toUpperCase();
  const institution = String(course.institution || '').toUpperCase();
  
  // Check for AP indicators in code, title, or institution
  // Common patterns: "AP ", "A.P.", "AP-", "ADVANCED PLACEMENT"
  if (code.startsWith('AP ') || code.startsWith('AP-') || code === 'AP' || /^A\.?P\.?\s/.test(code)) return true;
  if (title.includes('ADVANCED PLACEMENT') || title.startsWith('AP ') || /\bA\.?P\.?\s/.test(title)) return true;
  if (institution.includes('ADVANCED PLACEMENT') || institution.includes(' AP ')) return true;
  
  // Check for common AP course patterns
  if (/^AP[A-Z]/.test(code)) return true; // e.g., APENG, APCALC
  
  return false;
}

/**
 * Helper function to get all AP English courses from the course list
 * @param {Array} courses - Array of course objects
 * @returns {Array} Array of AP English course objects
 */
function getAPEnglishCourses(courses) {
  if (!Array.isArray(courses)) return [];
  
  return courses.filter(course => {
    if (!course) return false;
    
    const code = String(course.code || '').toUpperCase();
    const title = String(course.title || '').toUpperCase();
    
    // Must be an AP course first
    if (!isAPCourse(course)) return false;
    
    // Check if it's English-related
    const englishKeywords = ['ENGLISH', 'ENG', 'ENGL', 'LITERATURE', 'COMPOSITION', 'LANGUAGE', 'WRITING'];
    
    for (const keyword of englishKeywords) {
      if (code.includes(keyword) || title.includes(keyword)) return true;
    }
    
    // Common AP English course patterns
    if (title.includes('AP ENGLISH') || title.includes('AP ENG')) return true;
    if (code.includes('APENG') || code.includes('AP ENG')) return true;
    
    return false;
  });
}
