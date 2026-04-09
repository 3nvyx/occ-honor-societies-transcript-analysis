function checkSCE(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  const enrolledOK = ipUnits > 0;
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && gpaOK && count >= 3 && qualGPA >= 3.25) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `SCE Permanent: Enrolled, 12+ units, GPA >= 3.0, 3+ SCE courses avg >= 3.25.`;
  } else if (enrolledOK && unitsOK && gpaOK && count >= 1 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `SCE Initial: Enrolled, 12+ units, GPA >= 3.0, 1+ SCE course avg 3.0-3.24.`;
  } else {
    reason = `Not qualified SCE: Enrolled(${enrolledOK}), GPA(${gpaOK}), SCE Count(${count}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}