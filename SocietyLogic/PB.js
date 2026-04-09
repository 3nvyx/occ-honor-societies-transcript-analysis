function checkPB(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);
  const qualGPA = averageGPA(qualCourses);

  const enrolledOK = ipUnits > 0;
  const unitsOK = totalUnits >= 12;
  const cum325 = cumGPA >= 3.25;
  const hasB = qualCourses.some(c => (c.numericGrade||0) >= 3.0);

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && cum325 && unitsOK && hasB) {
    qualifies = true; membershipLevel = 'Permanent';
    reason = `PB Permanent: Enrolled, CumGPA>=3.25, 12+ units, 1+ qualifying PB course (B or higher).`;
  } else {
    reason = `Not qualified PB: Enrolled(${enrolledOK}), Cum>=3.25(${cum325}), Has B-grade(${hasB}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}