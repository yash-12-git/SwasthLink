import type { TranslationKeys } from './en';

const hi: TranslationKeys = {
  // ── Global ─────────────────────────────────────────────────────────
  appName: 'हॉस्पिटेक',
  tagline: 'स्मार्ट अस्पताल कतार प्रणाली',
  loading: 'लोड हो रहा है…',
  error: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
  retry: 'पुनः प्रयास करें',
  back: 'वापस',
  next: 'आगे बढ़ें',
  done: 'हो गया',
  cancel: 'रद्द करें',
  yes: 'हाँ',
  no: 'नहीं',
  close: 'बंद करें',
  or: 'या',
  optional: 'वैकल्पिक',

  // ── Language picker ────────────────────────────────────────────────
  language: 'भाषा',
  langEn: 'English',
  langHi: 'हिंदी',

  // ── Nav ────────────────────────────────────────────────────────────
  nav: {
    home: 'होम',
    myQueue: 'मेरी कतार',
    help: 'मदद',
  },

  // ── Landing ────────────────────────────────────────────────────────
  landing: {
    welcome: 'स्वागत है',
    subtitle: '30 सेकंड में OPD टोकन लें। कतार में खड़े होने की ज़रूरत नहीं।',
    qrScanned: 'QR स्कैन हुआ · OPD ब्लॉक',
    getToken: 'टोकन लें',
    nowServing: 'अभी सेवा हो रही है',
    liveLabel: 'लाइव',
    departments: 'विभाग',
    seeAll: 'सभी देखें',
    more: 'अधिक',
    tokenServing: 'टोकन अभी सेवा में',
    helpCard: {
      title: 'मदद चाहिए?',
      subtitle: 'हेल्प डेस्क पर पूछें या {{phone}} पर कॉल करें',
    },
  },

  // ── Registration ───────────────────────────────────────────────────
  register: {
    title: 'अपनी जानकारी भरें',
    stepLabel: 'चरण 1 / 3',
    subtitle: 'टोकन जारी करने के लिए बस कुछ जानकारी चाहिए। कोई दस्तावेज़ नहीं।',
    name: 'पूरा नाम',
    namePlaceholder: 'जैसे: सुनीता देवी',
    mobile: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का नंबर',
    mobileHint: 'टोकन अपडेट यहाँ SMS से भेजे जाएंगे।',
    age: 'आयु',
    agePlaceholder: 'वर्ष',
    gender: 'लिंग',
    female: 'महिला',
    male: 'पुरुष',
    other: 'अन्य',
    submit: 'आगे बढ़ें',
    errors: {
      nameRequired: 'नाम आवश्यक है',
      nameMin: 'नाम कम से कम 2 अक्षर का होना चाहिए',
      mobileRequired: 'मोबाइल नंबर आवश्यक है',
      mobileInvalid: 'वैध 10 अंकों का मोबाइल नंबर दर्ज करें',
      ageRequired: 'आयु आवश्यक है',
      ageInvalid: 'वैध आयु दर्ज करें (1–120)',
      genderRequired: 'कृपया अपना लिंग चुनें',
    },
  },

  // ── Department ─────────────────────────────────────────────────────
  department: {
    title: 'विभाग चुनें',
    stepLabel: 'चरण 2 / 3',
    subtitle: 'आज जिस विभाग में जाना है उसे चुनें।',
    inQueue: 'कतार में',
    wait: '~{{mins}} मिनट',
  },

  // ── Doctor ─────────────────────────────────────────────────────────
  doctor: {
    title: 'डॉक्टर',
    stepLabel: 'चरण 3 / 3',
    subtitle: 'उपलब्ध डॉक्टर चुनकर कतार में जुड़ें।',
    inQueue: 'कतार में',
    estWait: 'अनुमानित प्रतीक्षा',
    joinQueue: 'कतार में जुड़ें',
    queuePaused: 'कतार रुकी हुई है',
    noWait: '—',
  },

  // ── Confirm ────────────────────────────────────────────────────────
  confirm: {
    title: 'आप कतार में जुड़ गए हैं!',
    yourToken: 'आपका टोकन',
    position: 'स्थान',
    positionSub: 'आपसे पहले',
    estWait: 'अनुमानित प्रतीक्षा',
    estWaitSub: 'लगभग',
    relaxInfo: 'आराम करें — कतार में खड़े होने की ज़रूरत नहीं। बारी आने पर आपको सूचित किया जाएगा।',
    trackLive: 'लाइव कतार ट्रैक करें',
    backHome: 'होम पर वापस जाएं',
  },

  // ── Track ──────────────────────────────────────────────────────────
  track: {
    title: 'लाइव कतार',
    liveLabel: 'लाइव',
    yourToken: 'आपका टोकन',
    nowServing: 'अभी सेवा हो रही है',
    patientsAhead: '{{n}} मरीज़ आपसे पहले',
    itsYourTurn: 'आपकी बारी है! कृपया {{room}} जाएं →',
    almostYourTurn: 'लगभग आपकी बारी है — कृपया कमरे के पास आ जाएं',
    relax: 'आप आराम कर सकते हैं — कतार में खड़े होने की ज़रूरत नहीं',
    queueProgress: 'कतार की प्रगति',
    estWait: 'अनुमानित प्रतीक्षा',
    perPatient: '~{{mins}} मिनट / मरीज़',
    doctor: 'डॉक्टर',
    lastCall: '{{secs}} सेकंड पहले बुलाया',
    consultResumes: 'परामर्श जल्द शुरू होगा',
    upcomingTokens: 'आगे के टोकन',
    tokenNext: 'अगला',
    yourTurnLabel: 'आपकी बारी',
    getHelp: 'मदद लें',
    minsWait: '{{mins}} मिनट',
  },

  // ── Widget ─────────────────────────────────────────────────────────
  widget: {
    liveTracking: 'लाइव ट्रैकिंग',
    nowServing: 'अभी सेवा हो रही है',
    yourToken: 'आपका टोकन',
    estWait: 'अनुमानित प्रतीक्षा',
    ahead: '{{n}} आगे · ~{{mins}} मिनट प्रतीक्षा',
  },

  // ── Help ───────────────────────────────────────────────────────────
  help: {
    title: 'मदद और सहायता',
    callDesk: 'हेल्प डेस्क पर कॉल करें',
    callDeskSub: '{{phone}} · टोल-फ्री',
    findOpd: 'OPD ब्लॉक खोजें',
    findOpdSub: 'भूतल, गेट 2',
    rescan: 'QR फिर से स्कैन करें',
    rescanSub: 'टोकन खो गया? फिर से स्कैन करें',
    howItWorks: 'यह कैसे काम करता है',
    howItWorksSub: '1 मिनट की गाइड देखें',
    staffNote: 'हर हेल्प डेस्क पर अस्पताल कर्मचारी बुजुर्गों और नए मरीज़ों की सहायता के लिए उपलब्ध हैं।',
  },

  // ── Status ─────────────────────────────────────────────────────────
  status: {
    available: 'उपलब्ध',
    busy: 'व्यस्त',
    paused: 'रुकी हुई',
    serving: 'अभी सेवा में',
    waiting: 'प्रतीक्षारत',
    done: 'पूर्ण',
    skipped: 'छोड़ा गया',
  },

  // ── Departments ────────────────────────────────────────────────────
  departments: {
    general: 'सामान्य ओपीडी',
    ortho: 'हड्डी रोग',
    ent: 'कान-नाक-गला',
    cardio: 'हृदय रोग',
    skin: 'त्वचा रोग',
  },
} as const;

export default hi;
