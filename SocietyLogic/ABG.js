function checkABG(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;

  // 1. Get Data
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((sum, c) => sum + c.creditHours, 0);

  // 2. Base Checks
  const enrolledOK = ipUnits > 0;
  const gpaOK = cumGPA >= 3.0;
  const unitsOK = totalUnits >= 12;

  let qualifies = false, membershipLevel = '', reason = '';

  // 3. Logic
  if (enrolledOK && gpaOK && unitsOK && count >= 2 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `ABG Permanent: Currently enrolled, GPA >= 3.0, 12+ units, and 2+ ABG courses with avg >= 3.0.`;
  } else if (enrolledOK && gpaOK && unitsOK && count >= 1 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `ABG Initial: Currently enrolled, GPA >= 3.0, 12+ units, and 1+ ABG course with avg >= 3.0.`;
  } else {
    reason = `Not qualified for ABG: Enrolled=${enrolledOK}, GPA>=3.0=${gpaOK}, Units>=12=${unitsOK}, Courses=${count}, Avg=${qualGPA.toFixed(2)}.`;
  }

  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}