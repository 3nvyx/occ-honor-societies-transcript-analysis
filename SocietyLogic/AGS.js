 function checkAGS(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA } = ctx;

  // Helper: Parse Term
  function parseTerm(termStr) {
    if (!termStr) return { year: 0, semester: 0 };
    const combined = termStr.match(/(\d{4})\s*(Winter\/Spring|Spring\/Summer|Summer\/Fall|Fall\/Winter)/i);
    if (combined) {
      const semMap = { 'winter/spring': 1, 'spring/summer': 2, 'summer/fall': 3, 'fall/winter': 4 };
      return { year: parseInt(combined[1]), semester: semMap[combined[2].toLowerCase()] || 0 };
    }
    const match = termStr.match(/(\d{4})\s*(Spring|Summer|Fall|Winter|SP|SU|FA|WI)/i);
    if (match) {
      const s = match[2].toLowerCase();
      let n = 0;
      if (s.includes('spring') || s==='sp') n=1;
      else if (s.includes('summer') || s==='su') n=2;
      else if (s.includes('fall') || s==='fa') n=3;
      else if (s.includes('winter') || s==='wi') n=4;
      return { year: parseInt(match[1]), semester: n };
    }
    return { year: 0, semester: 0 };
  }

  // 1. Sort Chronologically
  const sorted = [...courses].sort((a, b) => {
    const tA = parseTerm(a.term), tB = parseTerm(b.term);
    return tA.year !== tB.year ? tB.year - tA.year : tB.semester - tA.semester;
  });

  // 2. Group by Semester
  const bySem = {};
  sorted.forEach(c => {
    const t = c.term || 'Unknown';
    if (!bySem[t]) bySem[t] = [];
    bySem[t].push(c);
  });
  const semKeys = Object.keys(bySem).sort((a, b) => {
    const tA = parseTerm(a), tB = parseTerm(b);
    return tA.year !== tB.year ? tB.year - tA.year : tB.semester - tA.semester;
  });

  // 3. Calculate Logic
  const mostRecent = semKeys[0];
  const lastSemCourses = bySem[mostRecent] ? bySem[mostRecent].filter(c => c.numericGrade !== null && c.creditHours > 0) : [];
  const lastSemesterGPA = averageGPA(lastSemCourses);

  let chronUnits = 0, semestersUsed = new Set();
  for (const sem of semKeys) {
    if (chronUnits >= 12) break;
    for (const c of bySem[sem]) {
      if (chronUnits >= 12) break;
      if (c.numericGrade !== null && c.creditHours > 0) {
        chronUnits += c.creditHours;
        semestersUsed.add(sem);
      }
    }
  }

  const enrolledAtOCC = ipUnits >= 6;
  const completed12 = chronUnits >= 12;
  const within3 = semestersUsed.size <= 3;
  const lastGood = lastSemesterGPA >= 3.0;
  const cumGood = cumGPA >= 3.0;

  const totalOCC = courses.filter(c => c.isOcc).reduce((s, c) => s + c.creditHours, 0);
  const has60 = totalUnits >= 60;
  const has30OCC = totalOCC >= 30;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledAtOCC && completed12 && within3 && lastGood && cumGood) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `AGS Initial: Enrolled ${ipUnits} OCC units, ${chronUnits} units in past ${semestersUsed.size} semesters.`;
    
    if (has60 && has30OCC && cumGPA >= 3.25) {
      if (cumGPA >= 3.50) {
        membershipLevel = 'Permanent (3.50+ GPA) (Check DB for Prev Membership)';
        reason = `AGS Permanent (3.50+): ${totalUnits} units, ${totalOCC} OCC units, GPA ${cumGPA.toFixed(2)}.`;
      } else {
        membershipLevel = 'Permanent (3.25-3.49 GPA) (Check DB for Prev Membership)';
        reason = `AGS Permanent (3.25-3.49): ${totalUnits} units, ${totalOCC} OCC units, GPA ${cumGPA.toFixed(2)}.`;
      }
    }
  } else {
    reason = `Not qualified AGS: Enrolled(${enrolledAtOCC}), 12+ units(${completed12}), Last GPA>=3(${lastGood}), Cum>=3(${cumGood}).`;
  }

  // QUAL UNITS / QUAL GPA: show OCC units and OCC GPA (report blanks these when !qualifies)
  const occCourses = courses.filter(c => (typeof isCourseOCC === 'function' ? isCourseOCC(c) : c.isOcc));
  const occUnitsVal = occCourses.reduce((s, c) => s + (c.creditHours || 0), 0);
  const occGPAVal = averageGPA(occCourses);

  return {
    qualifies,
    membershipLevel,
    reason,
    qualUnits: occUnitsVal,
    qualGPA: typeof occGPAVal === 'number' ? occGPAVal.toFixed(2) : occGPAVal,
    qualCoursesArr: courses
  };
}
