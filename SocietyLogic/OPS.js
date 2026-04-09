function checkOPS(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  const enrolledOK = ipUnits > 0;
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && gpaOK && count >= 2 && qualGPA >= 3.25) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `OPS Permanent: Enrolled, 12+ units, GPA >= 3.0, 2+ OPS courses avg >= 3.25.`;
  } else if (enrolledOK && unitsOK && gpaOK && count >= 1 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `OPS Initial: Enrolled, 12+ units, GPA >= 3.0, 1+ OPS course avg >= 3.0.`;
  } else {
    reason = `Not qualified OPS: Enrolled(${enrolledOK}), GPA(${gpaOK}), OPS Avg(${qualGPA.toFixed(2)}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}