function checkSALUTE(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA } = ctx;
  // Note: SALUTE does not use Course Catalog mapping, it is purely GPA/DD214 based.
  const hasDD214 = ctx.data.hasDD214;
  const enrolledOK = ipUnits > 0;
  const unitsOK = totalUnits >= 12;
  const gpaOK = cumGPA >= 3.0;

  let qualifies = false, membershipLevel = '', reason = '';

  if (!hasDD214) {
    reason = `Not qualified SALUTE: Missing DD214 form.`;
  } else if (enrolledOK && gpaOK && unitsOK) {
    qualifies = true; membershipLevel = 'Permanent';
    let tier = 'DELTA';
    if (cumGPA >= 3.76) tier = 'ALPHA';
    else if (cumGPA >= 3.51) tier = 'BRAVO';
    else if (cumGPA >= 3.26) tier = 'CHARLIE';
    reason = `SALUTE Permanent: Enrolled, 12+ units, GPA>=3.0. Tier ${tier}.`;
  } else {
    reason = `Not qualified SALUTE: Enrolled(${enrolledOK}), Units(${unitsOK}), GPA(${gpaOK}).`;
  }
  // Return N/A for qual metrics as they aren't course specific
  return { qualifies, membershipLevel, reason, qualUnits: "N/A", qualGPA: "N/A", qualCoursesArr: [] };
}