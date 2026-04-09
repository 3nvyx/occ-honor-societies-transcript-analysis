function checkMAT(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);
  const count = qualCourses.length;

  const enrolledOK = ipUnits > 0;
  const gpaOK = cumGPA >= 3.0;
  const unitsOK = totalUnits >= 12;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && gpaOK && unitsOK && count >= 1 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Permanent';
    reason = `MAT Permanent: Enrolled, GPA >= 3.0, 12+ units, 1+ MAT course with avg >= 3.0.`;
  } else {
    reason = `Not qualified MAT: Enrolled(${enrolledOK}), GPA>=3(${gpaOK}), Units>=12(${unitsOK}), Courses=${count}.`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}