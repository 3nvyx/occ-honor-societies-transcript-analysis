function checkSKD(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const rawCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualCourses = rawCourses.filter(c => c.numericGrade !== null); // Valid grades only
  const qualGPA = averageGPA(qualCourses);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  const hasFreshmanComp = qualCourses.some(c => /Freshman Composition/i.test(c.title || ''));
  const hasAP = ctx.data.hasAPEnglish || false;
  const effectiveCount = count + ((hasAP && !hasFreshmanComp) ? 1 : 0);
  const displayAP = (hasAP && !hasFreshmanComp) ? ' + AP English' : '';

  const enrolledOK = ipUnits >= 6; // Note: Script used >=6 here
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && gpaOK && effectiveCount >= 2 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `SKD Permanent: Enrolled>=6, 12+ units, GPA>=3.0, ${count} courses (avg ${qualGPA.toFixed(2)})${displayAP}.`;
  } else if (enrolledOK && unitsOK && gpaOK && effectiveCount >= 1 && qualGPA >= 3.0) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `SKD Initial: Enrolled>=6, 12+ units, GPA>=3.0, ${count} courses (avg ${qualGPA.toFixed(2)})${displayAP}.`;
  } else {
    reason = `Not qualified SKD: Enrolled>=6(${enrolledOK}), Units(${unitsOK}), Count(${effectiveCount}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}