function checkAMG(ctx, soc) {
  const { courses, ipUnits, totalUnits, cumGPA, config, catalog } = ctx;
  
  const qualCourses = getQualifyingCoursesForSociety(courses, soc, config, catalog);
  const count = qualCourses.length;
  const qualUnits = qualCourses.reduce((sum, c) => sum + c.creditHours, 0);
  const qualGPA = averageGPA(qualCourses);

  // A-grades only (for Permanent: need 2 A's in same language)
  const aGradeCourses = qualCourses.filter(c => String(c.grade).toUpperCase().replace(/\s*E\s*/g, '').trim() === 'A');
  // Group A-grades by language (derive from course code prefix, e.g. SPAN 101 -> SPAN, FREN 201 -> FREN)
  const aCountByLanguage = {};
  aGradeCourses.forEach(c => {
    const code = (c.code || '').trim().toUpperCase();
    const language = code.split(/\s+/)[0] || code.substring(0, 4) || code;
    aCountByLanguage[language] = (aCountByLanguage[language] || 0) + 1;
  });
  const hasTwoAsInSameLanguage = Object.keys(aCountByLanguage).some(lang => aCountByLanguage[lang] >= 2);

  const abCount = qualCourses.filter(c => ['A'].includes(String(c.grade).toUpperCase().replace(/\s*E\s*/g, '').trim())).length;
  
  // Check In-Progress AMG
  let ipAMGCount = 0;
  if (Array.isArray(ctx.data.inProgressCourses)) {
    ctx.data.inProgressCourses.forEach(ipc => {
      const code = (ipc.code || '').trim().toUpperCase();
      const s = catalog.societyMap[code] || [];
      if (s.includes('AMG')) ipAMGCount++;
    });
  }

  const gpaOK = cumGPA >= 3.0;
  const unitsOK = totalUnits >= 12;
  
  let qualifies = false, membershipLevel = '', reason = '';

  // Permanent: 12+ units, GPA >= 3.0, and 2 A grades in the same language
  if (unitsOK && gpaOK && hasTwoAsInSameLanguage) {
    qualifies = true; membershipLevel = 'Permanent (Check DB for Prev Membership)';
    reason = `AMG Permanent: 12+ units, GPA >= 3.0, 2 A-grades in same language (AMG courses).`;
  } else {
    const baseReqs = (totalUnits >= 6 && gpaOK);
    if (baseReqs && (abCount > 0 || ipAMGCount > 0)) {
      qualifies = true; membershipLevel = 'Associate Membership (Check DB for Prev Membership)';
      reason = `AMG Associate: 6+ units, GPA >= 3.0, and A in AMG course or in-progress.`;
    } else {
      reason = `Not qualified AMG: GPA>=3.0=${gpaOK}, 6+ units=${totalUnits>=6}, 2 A's in same language=${hasTwoAsInSameLanguage}, A count=${abCount}.`;
    }
  }
  return { qualifies, membershipLevel, reason, qualUnits, qualGPA, qualCoursesArr: qualCourses };
}