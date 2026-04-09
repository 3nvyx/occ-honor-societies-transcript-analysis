// 🦆
function checkIX(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  const bCount = qualCourses.filter(c => c.numericGrade >= 3.0).length;
  const enrolledOK = ipUnits >= 6;
  const unitsOK = totalUnits >= 12;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && bCount >= 1) {
    qualifies = true; membershipLevel = 'Permanent';
    reason = `IX Permanent: Enrolled >=6 units, 12+ units, and 1+ IX course (B or higher).`;
  } else {
    reason = `Not qualified IX: Enrolled>=6(${enrolledOK}), Units>=12(${unitsOK}), B-grade courses=${bCount}.`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
  
}
