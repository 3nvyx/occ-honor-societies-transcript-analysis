function checkEEO(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const qualUnits = qualCourses.reduce((s,c) => s+c.creditHours, 0);

  const enrolledOK = ipUnits >= 6; // Note: original script used >=6 here specifically
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (!enrolledOK || !unitsOK || !gpaOK) {
    reason = `Not qualified EEO: Enrolled>=6(${enrolledOK}), Units>=12(${unitsOK}), GPA>=3(${gpaOK}).`;
  } else if (qualGPA < 3.0) {
    reason = `Not qualified EEO: Qualifying GPA (${qualGPA.toFixed(2)}) < 3.0.`;
  } else {
    const marineCount = qualCourses.filter(c => /marine/i.test(c.title)).length;
    if (marineCount >= 2) {
      qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
      reason = `EEO Permanent: Criteria met, 2+ marine courses (avg ${qualGPA.toFixed(2)}).`;
    } else if (qualCourses.length >= 1) {
      qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
      reason = `EEO Initial: Criteria met, 1+ qualifying course (avg ${qualGPA.toFixed(2)}).`;
    } else {
      reason = `Not qualified EEO: No EEO courses found.`;
    }
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}
