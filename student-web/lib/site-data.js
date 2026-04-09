export const NAV_ITEMS = [
  { href: '/', label: 'home' },
  { href: '/rules', label: 'see occ honor society rules/prerequisites' },
  { href: '/how-it-works', label: 'how this program works' }
];

export const SOCIETY_RULES = [
  {
    code: 'ABG',
    name: 'Alpha Beta Gamma',
    track: 'Business',
    occOnly: false,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Initial membership needs 1 qualifying ABG course with a 3.0 qualifying average.',
      'Permanent membership needs 2 qualifying ABG courses with a 3.0 qualifying average.'
    ]
  },
  {
    code: 'AGS',
    name: 'Alpha Gamma Sigma',
    track: 'General scholarship',
    occOnly: false,
    rules: [
      'At least 6 OCC in-progress units at the time of review.',
      'At least 12 recent graded units within the last 3 semesters considered by the rule.',
      'Last semester GPA of 3.0 or higher and cumulative GPA of 3.0 or higher.',
      'Permanent status adds 60 total units, 30 OCC units, and cumulative GPA of at least 3.25.',
      'Permanent 3.50+ is called out separately when cumulative GPA is 3.50 or higher.'
    ]
  },
  {
    code: 'AMG',
    name: 'Alpha Mu Gamma',
    track: 'Foreign language',
    occOnly: false,
    rules: [
      'Associate membership starts at 6 total units and cumulative GPA of 3.0 or higher.',
      'Associate status also needs either an A in an AMG course or an AMG course in progress.',
      'Permanent membership requires 12 total units and cumulative GPA of 3.0 or higher.',
      'Permanent status also requires 2 A grades in the same language among qualifying AMG courses.'
    ]
  },
  {
    code: 'EEO',
    name: 'Eta Eta Omicron',
    track: 'Marine science',
    occOnly: false,
    rules: [
      'At least 6 OCC in-progress units and 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Qualifying EEO course GPA must be at least 3.0.',
      'Initial status needs 1 qualifying marine course.',
      'Permanent status needs 2 qualifying marine courses.'
    ]
  },
  {
    code: 'IX',
    name: 'Iota Xi',
    track: 'Computing and information',
    occOnly: false,
    rules: [
      'At least 6 OCC in-progress units.',
      'At least 12 completed units overall.',
      'Needs at least 1 qualifying IX course with a B or higher.'
    ]
  },
  {
    code: 'MAT',
    name: 'Mu Alpha Theta',
    track: 'Mathematics',
    occOnly: true,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Needs at least 1 qualifying MAT course with a 3.0 qualifying average.'
    ]
  },
  {
    code: 'MDR',
    name: 'Mu Delta Rho',
    track: 'History / social science',
    occOnly: false,
    rules: [
      'All levels require current enrollment of at least 6 OCC in-progress units.',
      'Provisional needs cumulative GPA of 3.0 or higher, qualifying GPA of 3.0 or higher, and 1 qualifying course.',
      'Initial needs 12 total units, cumulative GPA of 3.25 or higher, and at least 3 qualifying MDR units with a 3.0 average.',
      'Permanent needs 12 total units, cumulative GPA of 3.50 or higher, and at least 12 MDR units with a 3.0 average.'
    ]
  },
  {
    code: 'NTHS',
    name: 'National Technical Honor Society',
    track: 'Career technical education',
    occOnly: true,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Needs at least 3 qualifying CTE courses with a 3.0 qualifying average.',
      'The course catalog must map those courses to at least 1 certificate/program code with 3 matching classes.'
    ]
  },
  {
    code: 'OPS',
    name: 'Omega Psi Sigma',
    track: 'Political science / public service',
    occOnly: false,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Initial status needs 1 qualifying OPS course with a 3.0 qualifying average.',
      'Permanent status needs 2 qualifying OPS courses with a 3.25 qualifying average.'
    ]
  },
  {
    code: 'PAM',
    name: 'Phi Alpha Mu',
    track: 'Music / arts',
    occOnly: true,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Needs 2 qualifying PAM courses with a 3.0 qualifying average.'
    ]
  },
  {
    code: 'PTK',
    name: 'Phi Theta Kappa',
    track: 'General transfer scholarship',
    occOnly: false,
    rules: [
      'Student must be currently enrolled at OCC.',
      'Permanent status needs 12 OCC qualifying units at level 100 or higher, qualifying GPA of 3.50 or higher, and cumulative GPA of 3.50 or higher.',
      'Provisional paths include 6+ qualifying units with cumulative GPA of 3.50+, or 12+ qualifying units with qualifying GPA between 3.0 and 3.49.',
      'The rules also flag additional manual-review paths for other-college units or high-school transcript review.'
    ]
  },
  {
    code: 'PRS',
    name: 'Pi Rho Sigma',
    track: 'Science',
    occOnly: true,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Initial status needs 1 qualifying PRS course with a 3.0 qualifying average.',
      'Permanent status needs 2 qualifying PRS courses with a 3.0 qualifying average.'
    ]
  },
  {
    code: 'PTE',
    name: 'Pi Tau Epsilon',
    track: 'Engineering / technical study',
    occOnly: true,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Needs 1 qualifying PTE course with a qualifying GPA of 3.5 or higher.'
    ]
  },
  {
    code: 'PB',
    name: 'Psi Beta',
    track: 'Psychology',
    occOnly: false,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.25 or higher.',
      'Needs at least 1 qualifying PB course with a B or higher.'
    ]
  },
  {
    code: 'SALUTE',
    name: 'SALUTE Veterans National Honor Society',
    track: 'Veteran recognition',
    occOnly: false,
    rules: [
      'The transcript text must include DD214 language for the current web app flow.',
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Tier labels are GPA-based: Alpha 3.76+, Bravo 3.51+, Charlie 3.26+, Delta 3.00-3.25.'
    ]
  },
  {
    code: 'SCE',
    name: 'Sigma Chi Eta',
    track: 'Communication studies',
    occOnly: false,
    rules: [
      'Currently enrolled at OCC.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Initial status needs 1 qualifying SCE course with a 3.0 qualifying average.',
      'Permanent status needs 3 qualifying SCE courses with a 3.25 qualifying average.'
    ]
  },
  {
    code: 'SKD',
    name: 'Sigma Kappa Delta',
    track: 'English',
    occOnly: false,
    rules: [
      'At least 6 OCC in-progress units.',
      'At least 12 completed units overall.',
      'Cumulative GPA of 3.0 or higher.',
      'Initial status needs 1 qualifying English course with a 3.0 qualifying average.',
      'Permanent status needs 2 qualifying English courses with a 3.0 qualifying average.',
      'AP English can count as an extra English signal if Freshman Composition is not already present.'
    ]
  }
];

export const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Upload a text-based PDF',
    description:
      'The home page accepts transcript PDFs with a real text layer. If the upload is image-only or scanned, the checker stops and asks for a text-based export.'
  },
  {
    number: '02',
    title: 'Read the transcript text layer in-browser',
    descriptionBefore: 'The browser uses ',
    linkLabel: 'PDF.js',
    linkHref: 'https://mozilla.github.io/pdf.js/',
    descriptionAfter:
      ' (local library) to pull the text layer page by page. No OCR, no AI, and no guessing step is used in this flow.'
  },
  {
    number: '03',
    title: 'Pull out the transcript details',
    description:
      'The server reads the transcript text and pulls out student identity, completed courses, in-progress courses, GPA totals, existing societies, and AP English signals.'
  },
  {
    number: '04',
    title: 'Check special transcript signals',
    description:
      'The analyzer also scans the transcript text for DD214 and veteran language so SALUTE can be evaluated from the upload itself.'
  },
  {
    number: '05',
    title: 'Check the OCC course catalog mappings',
    description:
      'Each qualifying course is compared against the course catalog mapping so the engine knows which honor societies or certificate tracks the course can count toward.'
  },
  {
    number: '06',
    title: 'Run the society review',
    description:
      'The society engine evaluates the current rules for every OCC honor society and returns both currently qualified results and not-yet-qualified explanations.'
  }
];

export const TRANSCRIPT_SCHEMAS = [
  {
    name: 'Transcript record',
    description: 'Top-level fields pulled directly from the uploaded transcript.',
    code: `type TranscriptRecord = {
  name: string
  studentId: string
  dob: string
  major: string
  earnedHours: number
  gpaHours: number
  qualityPoints: number
  gpa: number
  courses: Course[]
  inProgressCourses: InProgressCourse[]
  societies: string[]
  hasAPEnglish: boolean
}`
  },
  {
    name: 'Course',
    description: 'Completed course rows that are read from the transcript history.',
    code: `type Course = {
  code: string
  term: string
  title: string
  grade: string
  creditHours: number
  qualityPoints: number
  isOcc: boolean
  institution: string
  markers?: string[]
}`
  },
  {
    name: 'InProgressCourse',
    description: 'Current classes that appear in the in-progress part of the transcript.',
    code: `type InProgressCourse = {
  code: string
  term: string
  title: string
  creditHours: number
  isOcc: boolean
  institution: string
}`
  }
];
