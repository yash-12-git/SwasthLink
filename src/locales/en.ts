const en = {
  // ── Global ─────────────────────────────────────────────────────────
  appName: 'HospiTesch',
  tagline: 'Smart Hospital Queue System',
  loading: 'Loading…',
  error: 'Something went wrong. Please try again.',
  retry: 'Try Again',
  back: 'Back',
  next: 'Continue',
  done: 'Done',
  cancel: 'Cancel',
  yes: 'Yes',
  no: 'No',
  close: 'Close',
  or: 'or',
  optional: 'optional',

  // ── Language picker ────────────────────────────────────────────────
  language: 'Language',
  langEn: 'English',
  langHi: 'हिंदी',

  // ── Nav ────────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    myQueue: 'My Queue',
    help: 'Help',
  },

  // ── Landing ────────────────────────────────────────────────────────
  landing: {
    welcome: 'Welcome',
    subtitle: 'Get your OPD token in under 30 seconds. No need to stand in line.',
    qrScanned: 'QR Scanned · OPD Block',
    getToken: 'Get a Token',
    nowServing: 'Now Serving',
    liveLabel: 'Live',
    departments: 'Departments',
    seeAll: 'See all',
    more: 'More',
    tokenServing: 'token now serving',
    helpCard: {
      title: 'Need help?',
      subtitle: 'Ask at the help desk or call {{phone}}',
    },
  },

  // ── Registration ───────────────────────────────────────────────────
  register: {
    title: 'Your Details',
    stepLabel: 'Step 1 of 3',
    subtitle: 'We only need a few details to issue your token. No documents required.',
    name: 'Full Name',
    namePlaceholder: 'e.g. Sunita Devi',
    mobile: 'Mobile Number',
    mobilePlaceholder: '10-digit number',
    mobileHint: 'Token updates will be sent here via SMS.',
    age: 'Age',
    agePlaceholder: 'Years',
    gender: 'Gender',
    female: 'Female',
    male: 'Male',
    other: 'Other',
    submit: 'Continue',
    errors: {
      nameRequired: 'Name is required',
      nameMin: 'Name must be at least 2 characters',
      mobileRequired: 'Mobile number is required',
      mobileInvalid: 'Enter a valid 10-digit mobile number',
      ageRequired: 'Age is required',
      ageInvalid: 'Enter a valid age (1–120)',
      genderRequired: 'Please select your gender',
    },
  },

  // ── Department ─────────────────────────────────────────────────────
  department: {
    title: 'Choose Department',
    stepLabel: 'Step 2 of 3',
    subtitle: 'Select the department you need to visit today.',
    inQueue: 'in queue',
    wait: '~{{mins}} min',
  },

  // ── Doctor ─────────────────────────────────────────────────────────
  doctor: {
    title: 'Doctors',
    stepLabel: 'Step 3 of 3',
    subtitle: 'Pick an available doctor to join their queue.',
    inQueue: 'in queue',
    estWait: 'est. wait',
    joinQueue: 'Join Queue',
    queuePaused: 'Queue Paused',
    noWait: '—',
  },

  // ── Confirm ────────────────────────────────────────────────────────
  confirm: {
    title: "You're in the queue!",
    yourToken: 'Your Token',
    position: 'Position',
    positionSub: 'patients ahead',
    estWait: 'Est. Wait',
    estWaitSub: 'approx.',
    relaxInfo: "Relax — you don't need to stand in line. We'll alert you when your turn is near.",
    trackLive: 'Track My Queue Live',
    backHome: 'Back to Home',
  },

  // ── Track ──────────────────────────────────────────────────────────
  track: {
    title: 'Live Queue',
    liveLabel: 'Live',
    yourToken: 'Your Token',
    nowServing: 'Now Serving',
    patientsAhead: '{{n}} patients ahead',
    itsYourTurn: "It's your turn! Please go to {{room}} →",
    almostYourTurn: 'Almost your turn — please come near the room',
    relax: 'You can relax — no need to stand in line',
    queueProgress: 'Queue Progress',
    estWait: 'Est. Wait',
    perPatient: '~{{mins}} min / patient',
    doctor: 'Doctor',
    lastCall: 'last call {{secs}}s ago',
    consultResumes: 'Consult resumes soon',
    upcomingTokens: 'Upcoming Tokens',
    tokenNext: 'next',
    yourTurnLabel: 'your turn',
    getHelp: 'Get Help',
    minsWait: '{{mins}}m',
  },

  // ── Widget ─────────────────────────────────────────────────────────
  widget: {
    liveTracking: 'Live tracking',
    nowServing: 'Now Serving',
    yourToken: 'Your Token',
    estWait: 'Est. wait',
    ahead: '{{n}} ahead · ~{{mins}} min wait',
  },

  // ── Help ───────────────────────────────────────────────────────────
  help: {
    title: 'Help & Support',
    callDesk: 'Call Help Desk',
    callDeskSub: '{{phone}} · toll-free',
    findOpd: 'Find OPD Block',
    findOpdSub: 'Ground floor, Gate 2',
    rescan: 'Re-scan QR',
    rescanSub: 'Lost your token? Scan again',
    howItWorks: 'How it works',
    howItWorksSub: 'Watch a 1-minute guide',
    staffNote: 'Hospital staff are available at every help desk to assist elderly and first-time patients.',
  },

  // ── Status ─────────────────────────────────────────────────────────
  status: {
    available: 'Available',
    busy: 'Busy',
    paused: 'Paused',
    serving: 'Now Serving',
    waiting: 'Waiting',
    done: 'Done',
    skipped: 'Skipped',
  },

  // ── Departments ────────────────────────────────────────────────────
  departments: {
    general: 'General OPD',
    ortho: 'Orthopedics',
    ent: 'ENT',
    cardio: 'Cardiology',
    skin: 'Dermatology',
  },
} as const;

export type TranslationKeys = typeof en;
export default en;
