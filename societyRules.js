/**
 * SOCIETY RULES REGISTRY
 * Maps society names to their specific calculation functions.
 */

const SOCIETY_STRATEGIES = {
  'ABG': checkABG,
  'AGS': checkAGS, 
  'AMG': checkAMG,
  'EEO': checkEEO,
  'IX':  checkIX,
  'MAT': checkMAT,
  'MDR': checkMDR,
  'NTHS': checkNTHS,
  'OPS': checkOPS,
  'PAM': checkPAM,
  'PTK': checkPTK,
  'PRS': checkPRS,
  'PTE': checkPTE,
  'PB':  checkPB,
  'SALUTE': checkSALUTE,
  'SCE': checkSCE,
  'SKD': checkSKD
};

function determineSocietyMembership(parsedData, catalogMap) {
  console.log("Starting Society Membership Check...");
  
  // 1. Prepare Context (Globals)
  const studentCourses = prepareStudentCourses(parsedData);
  const context = {
    data: parsedData,
    courses: studentCourses,
    catalog: catalogMap,
    cumGPA: parseFloat(parsedData.gpa) || 0,
    totalUnits: parseFloat(parsedData.earnedHours) || 0,
    ipUnits: getInProgressUnitsAtOCC(parsedData),
    config: CONFIG.SOCIETY_CONFIG // From configuration.js
  };

  const results = {};
  const allSocieties = Object.keys(CONFIG.SOCIETY_CONFIG);
  console.log('[determineSocietyMembership] Context: cumGPA=' + context.cumGPA + ', totalUnits=' + context.totalUnits + ', ipUnits=' + context.ipUnits);

  // 2. Loop through societies
  for (const soc of allSocieties) {
    let result = {
      qualifies: false,
      membershipLevel: '',
      reason: 'No rule defined',
      qualUnits: "",
      qualGPA: "",
      qualCoursesArr: []
    };

    const strategy = SOCIETY_STRATEGIES[soc];

    if (strategy) {
      try {
        result = strategy(context, soc);
      } catch (e) {
        console.error(`Error checking ${soc}: ${e.message}`);
        result.reason = `Calculation Error: ${e.message}`;
      }
    }
    
    // Check for Manual Override (Already listed on transcript)
    const nameMap = {
      'ALPHA BETA GAMMA': 'ABG', 'ALPHA GAMMA SIGMA': 'AGS', 'ALPHA MU GAMMA': 'AMG',
      'ETA ETA OMICRON': 'EEO', 'IOTA XI': 'IX', 'MU ALPHA THETA': 'MAT',
      'MU DELTA RHO': 'MDR', 'NATIONAL TECHNICAL HONOR SOCIETY': 'NTHS',
      'OMEGA PSI SIGMA': 'OPS', 'PHI ALPHA MU': 'PAM', 'PHI THETA KAPPA': 'PTK',
      'PI RHO SIGMA': 'PRS', 'PSI BETA': 'PB', 'PI TAU EPSILON': 'PTE',
      'SALUTE': 'SALUTE', 'SIGMA CHI ETA': 'SCE', 'SIGMA KAPPA DELTA': 'SKD'
    };
    
    // Filter out academic achievement lists that are not societies
    const academicAchievements = ['HONOR\'S LIST', 'HONORS LIST', 'DEAN\'S LIST', 'DEANS LIST', 
                                  'PRESIDENT\'S LIST', 'PRESIDENTS LIST'];
    
    const societiesFoundShort = (parsedData.societies || [])
      .filter(orig => {
        const cleaned = (orig || '').trim().toUpperCase();
        return !academicAchievements.includes(cleaned);
      })
      .map(orig => {
        const cleaned = (orig || '').trim().toUpperCase();
        return nameMap[cleaned] || cleaned;
      });

    if (societiesFoundShort.includes(soc)) {
      result.membershipLevel = 'MEMBER';
      result.qualifies = true;
      result.reason = `Already listed on transcript as ${soc} member.`;
    }

    // Formatting for display
    result.qualGPA = (typeof result.qualGPA === 'number') ? result.qualGPA.toFixed(2) : result.qualGPA;
    results[soc] = result;
  }

  return results;
}
