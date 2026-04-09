function checkNTHS(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const qualGPA = averageGPA(qualCourses);
  const qualUnits = qualCourses.reduce((s,c)=>s+c.creditHours,0);

  // Certificate Code Logic
  const certMap = {};
  qualCourses.forEach(c => {
    const programCodes = catalog.programMap[c.code];
    if (programCodes) {
      programCodes.split(',').map(s=>s.trim()).filter(Boolean).forEach(code => {
        if (!certMap[code]) certMap[code] = [];
        certMap[code].push(c.code);
      });
    }
  });

  const validCertCodes = Object.entries(certMap)
    .filter(([_, codes]) => codes.length >= 3)
    .map(([code]) => code);

  const enrolledOK = ipUnits > 0;
  const gpaOK = cumGPA >= 3.0;
  const unitsOK = totalUnits >= 12;

  let qualifies = false, membershipLevel = '', reason = '';

  if (enrolledOK && unitsOK && gpaOK && qualCourses.length >= 3 && qualGPA >= 3.0 && validCertCodes.length > 0) {
    qualifies = true; membershipLevel = 'Permanent';
    reason = `NTHS Permanent: Enrolled, 12+ units, GPA>=3.0, 3+ CTE courses (avg>=3.0), Certs: ${validCertCodes.join(', ')}.`;
  } else {
    reason = `Not qualified NTHS: Enrolled(${enrolledOK}), Units(${unitsOK}), GPA(${gpaOK}), Valid Certs(${validCertCodes.length}).`;
  }

  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses, certificateCodes: validCertCodes, nthsQualCourses: qualCourses };
}