function checkMDR(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);
  const count = qualCourses.length;

  const enrolledOK = ipUnits > 0;
  const enrolled6 = ipUnits > 0;
  const x = ipUnits >= 6;
  
  const has3UnitsQ = qualUnits >= 3 && qualGPA >= 3.0;
  const has12UnitsQ = qualUnits >= 12 && qualGPA >= 3.0;
  const has12Units325 = totalUnits >= 12 && cumGPA >= 3.25;
  const has12Units350 = totalUnits >= 12 && cumGPA >= 3.50;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolled6 && has12Units350 && has12UnitsQ) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `MDR Permanent: Enrolled(>=6), 12+ units(>=3.50), 12+ MDR units(>=3.0).`;
  } else if (enrolled6 && has12Units325 && has3UnitsQ) {
    qualifies = true; membershipLevel = 'Initial (Check DB for Prev Membership)';
    reason = `MDR Initial: Enrolled(>=6), 12+ units(>=3.25), 3+ MDR units(>=3.0).`;
  } else if (enrolled6 && cumGPA >= 3.0 && qualGPA >= 3.0 && count >= 1) {
    qualifies = true; membershipLevel = 'Provisional (Check DB for Prev Membership)';
    reason = `MDR Provisional:Enrolled(>=6), GPA>=3.0, MDR GPA>=3.0, 1+ qualifying course.`;
  } else {
    reason = `Not qualified MDR: Enrolled(${enrolledOK}), CumGPA(${cumGPA.toFixed(2)}), MDR Units(${qualUnits}).`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}
