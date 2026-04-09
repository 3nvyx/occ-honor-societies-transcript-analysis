function checkPTK(ctx, soc) {
  const { courses, ipUnits, cumGPA } = ctx;
  
  // Custom Filter: OCC courses, Level 100+
  const ptkQual = courses.filter(c => {
    if (!c.isOcc || c.numericGrade === null || c.creditHours <= 0) return false;
    const match = c.code.match(/(\d+)/);
    return match && parseInt(match[1]) >= 100;
  });

  const qualUnits = ptkQual.reduce((s,c)=>s+c.creditHours,0);
  const qualGPA = averageGPA(ptkQual);
  const enrolledAtOCC = ipUnits > 0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledAtOCC && qualUnits >= 12 && qualGPA >= 3.50 && cumGPA >= 3.50) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `PTK Permanent: Enrolled OCC, 12+ qualifying units (GPA ${qualGPA.toFixed(2)}), Cum GPA ${cumGPA.toFixed(2)}.`;
  } else if (enrolledAtOCC) {
    // Provisional Checks
    const has6 = qualUnits >= 6;
    const cum350 = cumGPA >= 3.50;
    const lessThan12 = qualUnits < 12;
    const has12 = qualUnits >= 12;
    const gpa30_349 = qualGPA >= 3.0 && qualGPA < 3.50;

    // Check Other Colleges
    const otherCol = courses.filter(c => !c.isOcc && c.numericGrade !== null && c.creditHours > 0 && parseInt((c.code.match(/(\d+)/)||['0','0'])[1]) >= 100);
    const otherUnits = otherCol.reduce((s,c)=>s+c.creditHours,0);
    const otherGPA = averageGPA(otherCol);
    const otherGood = otherUnits >= 12 && otherGPA >= 3.0 && otherGPA < 3.50;

    if (has6 && cum350 && lessThan12) {
      qualifies = true; membershipLevel = 'Provisional (Check DB for Prev Membership)';
      reason = `PTK Provisional: Enrolled, ${qualUnits} units (GPA ${qualGPA.toFixed(2)}), Cum GPA >= 3.50.`;
    } else if (has12 && gpa30_349) {
      qualifies = true; membershipLevel = 'Provisional (Check DB for Prev Membership)';
      reason = `PTK Provisional: Enrolled, 12+ units (GPA ${qualGPA.toFixed(2)}).`;
    } else if (otherGood) {
      qualifies = true; membershipLevel = 'Check for other College Transcript. (Check DB for Prev Membership)';
      reason = `PTK Provisional: Check other college units (${otherUnits}).`;
    } else {
      qualifies = true; membershipLevel = 'Check for HS transcript (Check DB for Prev Membership)';
      reason = `PTK Check HS: Enrolled. Need verify HS grad within 12mo.`;
    }
  } else {
    reason = `Not qualified PTK: Not enrolled at OCC.`;
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: ptkQual };
}