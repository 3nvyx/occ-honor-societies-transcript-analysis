function checkPTE(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  const enrolledOK = ipUnits > 0;
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && gpaOK && count >= 1 && qualGPA >= 3.5) {
    qualifies = true; membershipLevel = 'Permanent';
    reason = `PTE Permanent: Enrolled, 12+ units, GPA >= 3.0, 1+ PTE course avg >= 3.5.`;
  } else {
    reason = `Not qualified PTE: Enrolled(${enrolledOK}), GPA(${gpaOK}), PTE Avg(${qualGPA.toFixed(2)}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}