export const BRAND_LOGOS = {
  mark: 'https://i.postimg.cc/66LyNKV4/Whats-App-Image-2026-11-20-at-12-26-19-PM.png',
  wordmark: 'https://i.postimg.cc/wT3ZmS5Q/Whats-App-Image-2026-11-20-at-2-37-51-PM.png',
} as const;

export const ASSETS = {
  acousticShield: '/src/assets/images/satark_acoustic_shield_1795204451813.jpg',
  warrantVerify: '/src/assets/images/satark_warrant_verify_1795204450449.jpg',
  otpGuard: '/src/assets/images/satark_otp_guard_1795204450947.jpg',
  indianFamily: '/src/assets/images/satark_indian_family_1795204450295.jpg',
  smartphoneCall: '/src/assets/images/satark_smartphone_call_1795204451107.jpg',
} as const;

export interface ProtectionLayerOverview {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  engine: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  image: string;
  imageAlt: string;
}

export const THREE_LAYERS_OVERVIEW: ProtectionLayerOverview[] = [
  {
    id: 'listen',
    index: '01',
    title: 'Listen On-Device',
    subtitle: 'Gemma · On Your Phone',
    engine: 'MediaPipe / LiteRT + Local Speech Recognition',
    description:
      'Hears the call through the mic, turns speech into text locally on Android, and spots scam language like "you are under arrest" or "merge the call" without sending raw audio to the cloud.',
    metricValue: '0 KB',
    metricLabel: 'Call audio uploaded during passive on-device sentinel listening',
    image: ASSETS.acousticShield,
    imageAlt:
      'Matte-black Android smartphone on obsidian stone with cobalt acoustic wave rings representing on-device Gemma listening',
  },
  {
    id: 'verify',
    index: '02',
    title: 'Verify On Tap',
    subtitle: 'Gemini · Only When You Tap',
    engine: 'Gemini Multimodal & Live API + Cloud Run',
    description:
      'One tap sends a screenshot of the warrant or a frame of the video call to the cloud. Gemini extracts cited sections, seals, and wording while fixed legal rules verify the law behind it.',
    metricValue: '1 Tap',
    metricLabel: 'User-initiated cloud check — never automatic, never without consent',
    image: ASSETS.warrantVerify,
    imageAlt:
      'Smartphone inspecting a folded paper warrant with a focused cobalt blue optical verification beam',
  },
  {
    id: 'protect',
    index: '03',
    title: 'Protect Mid-Call',
    subtitle: 'Fixed Rules + OTP Guard',
    engine: 'Pinned Overlay + Notification Listener',
    description:
      'A plain-English warning stays pinned over the call while the scammer is still talking, and OTP notification previews are hidden during flagged calls so a code is never read out under pressure.',
    metricValue: '1930',
    metricLabel: 'One-tap hang up and direct cybercrime helpline reporting action',
    image: ASSETS.otpGuard,
    imageAlt:
      'Layered obsidian security glass barriers refracting vivid blue prism light representing OTP guard protection',
  },
];

export interface DefenceComparisonRow {
  defence: string;
  whatItDoes: string;
  whatSatarkAdds: string;
  highlight?: boolean;
}

export const DEFENCE_LANDSCAPE: DefenceComparisonRow[] = [
  {
    defence: 'Caller-ID apps',
    whatItDoes: 'Show who is calling before pickup',
    whatSatarkAdds:
      'Listens to what is actually said, so a spoofed trusted bank number still gets flagged',
  },
  {
    defence: 'Bank & NPCI awareness',
    whatItDoes: 'Warns people in advance via SMS or banners',
    whatSatarkAdds:
      'Warns live during the call, at the exact moment of emotional pressure',
  },
  {
    defence: '1930 helpline & reporting',
    whatItDoes: 'Report a fraud and act on it afterwards',
    whatSatarkAdds: 'Interrupts the scam mid-call before any money moves',
  },
  {
    defence: 'Authority account blocking',
    whatItDoes: 'Freezes scam accounts once discovered',
    whatSatarkAdds: 'Protects the person on the line right now',
  },
  {
    defence: 'Satark Live',
    whatItDoes: 'Listens, verifies, protects',
    whatSatarkAdds:
      'One guardian inside the live call, with the person always in control',
    highlight: true,
  },
];

export interface InterruptionPlaybook {
  id: string;
  tabLabel: string;
  badgeStat: string;
  badgeUnit: string;
  headline: string;
  quote: string;
  steps: Array<{
    number: string;
    threat: string;
    counter: string;
  }>;
}

export const INTERRUPTION_PLAYBOOKS: InterruptionPlaybook[] = [
  {
    id: 'digital-arrest',
    tabLabel: 'Digital Arrest',
    badgeStat: '5 Steps',
    badgeUnit: 'Every stage of a digital arrest script interrupted live',
    headline: 'Anatomy of a Digital Arrest — Interrupted Before Transfer',
    quote:
      'No law enforcement agency in India arrests anyone over a video call or serves warrants on WhatsApp.',
    steps: [
      {
        number: '01',
        threat: 'A cold call from an unknown number or video call',
        counter: 'Satark listens locally on the phone — nothing is sent out',
      },
      {
        number: '02',
        threat: 'A fake officer claims to be from CBI, ED, or TRAI',
        counter: 'Spoken "arrest over video" triggers the floating alert mid-call',
      },
      {
        number: '03',
        threat: 'Fake paperwork — a forged "warrant" or customs "parcel"',
        counter: 'Verify Call reads the document and checks real IT Act, BNS & CrPC rules',
      },
      {
        number: '04',
        threat: 'No escape — "stay on the line and tell no one"',
        counter: 'Pinned warning stays visible on screen to break isolation panic',
      },
      {
        number: '05',
        threat: 'Money moves toward a fake "RBI safe verification account"',
        counter: 'OTP guard hides banking codes during the flagged call',
      },
    ],
  },
  {
    id: 'call-merge',
    tabLabel: 'Call-Merge OTP',
    badgeStat: 'NPCI',
    badgeUnit: 'Stops the call-merging OTP trick warned against by NPCI',
    headline: 'Stopping the Call-Merge OTP Trap Mid-Conversation',
    quote:
      'Do not merge. The second incoming call is often your bank reading out a live OTP aloud.',
    steps: [
      {
        number: '01',
        threat: 'A friendly call — a stranger, "recruiter", or "bank officer" starts chatting',
        counter: 'On-device speech sentinel monitors call language passively',
      },
      {
        number: '02',
        threat: '"Please merge this call — a colleague or friend is trying to join"',
        counter: 'Merge language trips the Gemma sentinel immediately',
      },
      {
        number: '03',
        threat: 'The second call is your bank automated OTP verification line',
        counter: 'Overlay warns first: "Do not merge. This may be your bank OTP line."',
      },
      {
        number: '04',
        threat: 'The OTP is spoken aloud on the merged bridge and funds move',
        counter: 'Notification listener hides SMS/OTP previews throughout the flagged call',
      },
    ],
  },
  {
    id: 'warrant-check',
    tabLabel: 'Forged Warrant',
    badgeStat: '4 Checks',
    badgeUnit: 'How a forged warrant gets caught with AI + fixed rules',
    headline: 'Gemini Extracts Structure. Fixed Legal Rules Decide.',
    quote:
      'Law sections and agency checks come from a fixed verified list, never from model memory.',
    steps: [
      {
        number: '01',
        threat: 'Capture — a screenshot of the PDF warrant or frame of the video call',
        counter: 'Sent to Cloud Run only when you explicitly tap Verify Call',
      },
      {
        number: '02',
        threat: 'Gemini reads — extracts cited law sections, agency names, seals, and wording',
        counter: 'Produces clean structured fields without guessing legal validity',
      },
      {
        number: '03',
        threat: 'Fixed rules check IT Act, BNS, CrPC existence + WhatsApp delivery rule',
        counter: 'Inspects PDF metadata, fonts, and official agency protocol rules',
      },
      {
        number: '04',
        threat: 'Plain-English verdict — Genuine or Likely Forged',
        counter: 'Lists every concrete red flag with one-tap Hang up & Report on 1930',
      },
    ],
  },
];

export interface IndiaCorridor {
  id: string;
  code: string;
  name: string;
  hub: string;
  x: number;
  y: number;
  kpiValue: string;
  kpiUnit: string;
  scamVector: string;
  summary: string;
  protectionMode: string;
}

export const INDIA_CORRIDORS: IndiaCorridor[] = [
  {
    id: 'north',
    code: 'Corridor 01',
    name: 'Delhi NCR & North',
    hub: 'New Delhi · Gurugram · Noida',
    x: 153,
    y: 176,
    kpiValue: '₹1,935 Cr',
    kpiUnit: 'Annual national digital arrest losses (MHA to Parliament)',
    scamVector: 'Fake CBI / TRAI Video Arrest Calls',
    summary:
      'High concentration of Hindi & English impersonation scripts citing fabricated customs parcels, SIM deactivation, and virtual courtrooms.',
    protectionMode: 'On-device Hindi/English trigger sentinel + Warrant Verify',
  },
  {
    id: 'west',
    code: 'Corridor 02',
    name: 'Mumbai & West',
    hub: 'Mumbai · Pune · Ahmedabad',
    x: 96,
    y: 311,
    kpiValue: '₹5L+',
    kpiUnit: 'Common single-incident victim losses reported online',
    scamVector: 'Spoofed Bank & RBI "Safe Account" Transfers',
    summary:
      'Scammers spoof trusted bank helplines and coerce salaried professionals and retirees into liquidating fixed deposits under video surveillance.',
    protectionMode: 'Speech anomaly alert overrides spoofed Caller ID',
  },
  {
    id: 'south',
    code: 'Corridor 03',
    name: 'Bengaluru & South',
    hub: 'Bengaluru · Hyderabad · Chennai',
    x: 158,
    y: 398,
    kpiValue: 'NPCI',
    kpiUnit: 'Active national warning on call-merge OTP fraud',
    scamVector: 'Call-Merge Recruiter & KYC OTP Hijack',
    summary:
      'Tech professionals and UPI power users targeted with fake recruiter interviews and courier verifications asking victims to merge a bank OTP call.',
    protectionMode: 'Merge-phrase detection + automatic OTP notification shield',
  },
  {
    id: 'east',
    code: 'Corridor 04',
    name: 'Kolkata & East',
    hub: 'Kolkata · Bhubaneswar · Guwahati',
    x: 299,
    y: 262,
    kpiValue: 'Family',
    kpiUnit: 'Linked parent alert network beachhead',
    scamVector: 'Senior-Citizen Isolation & Fake Police Threats',
    summary:
      'Elderly parents living apart from working children face prolonged "do not tell anyone" coercion calls designed to prevent family verification.',
    protectionMode: 'Pinned screen alert + upcoming Family Shield push alerts',
  },
];

export interface PrivacyMatrixMode {
  id: string;
  label: string;
  percentage: number;
  litCount: number;
  caption: string;
  detail: string;
  outlookText: string;
}

export const PRIVACY_MATRIX_MODES: PrivacyMatrixMode[] = [
  {
    id: 'on-device',
    label: 'On-Device First',
    percentage: 100,
    litCount: 50,
    caption: 'Passive listening and scam detection run locally on your Android phone',
    detail:
      'Nothing leaves the device during normal calls. The cloud only sees the single warrant screenshot or frame you explicitly tap to verify.',
    outlookText:
      'Private by default. Listening stays on the phone; verification happens only on tap.',
  },
  {
    id: 'rules',
    label: 'Fixed Legal Rules',
    percentage: 100,
    litCount: 50,
    caption: 'Law section and agency checks validated against deterministic registries',
    detail:
      'Gemini extracts structured document fields, while fixed code verifies IT Act, BNS, and CrPC sections so hallucinations never decide your verdict.',
    outlookText:
      'AI explains in plain language. Fixed legal rules decide. You stay in control.',
  },
  {
    id: 'fallback',
    label: 'Fallback Coverage',
    percentage: 100,
    litCount: 50,
    caption: 'Every stage has a resilient fallback when networks or hardware degrade',
    detail:
      'If on-device AI is slow, local keyword matching still raises the alert. If live streaming is flaky, a standard Gemini request still verifies.',
    outlookText:
      'Engineered honestly around Android 14 limits with zero API keys stored on the phone.',
  },
];

export interface PipelineLayer {
  id: string;
  index: string;
  name: string;
  zone: 'On Your Phone · Private' | 'In The Cloud · On Tap' | 'Rules, Not AI';
  leftMetric: string;
  leftTitle: string;
  leftDetail: string;
  rightMetric: string;
  rightTitle: string;
  rightDetail: string;
}

export const SATARK_PIPELINE_LAYERS: PipelineLayer[] = [
  {
    id: 'audio',
    index: '01',
    name: 'Call Audio',
    zone: 'On Your Phone · Private',
    leftMetric: 'Mic',
    leftTitle: 'Speaker Path Input',
    leftDetail:
      'Because Android 14 restricts third-party call recording, Satark listens transparently through the speakerphone and device microphone.',
    rightMetric: 'Local',
    rightTitle: 'Zero Raw Upload',
    rightDetail:
      'Audio stays strictly in volatile on-device memory and is never archived on external servers.',
  },
  {
    id: 'stt',
    index: '02',
    name: 'Speech to Text',
    zone: 'On Your Phone · Private',
    leftMetric: 'Android',
    leftTitle: 'On-Device Transcription',
    leftDetail:
      'Native Android speech recognition converts live call audio into a rolling local transcript right on the handset.',
    rightMetric: 'Real-Time',
    rightTitle: 'Low-Latency Stream',
    rightDetail:
      'Transcripts are analyzed sentence by sentence so warnings land while the scammer is still speaking.',
  },
  {
    id: 'gemma',
    index: '03',
    name: 'Gemma Sentinel',
    zone: 'On Your Phone · Private',
    leftMetric: 'Gemma',
    leftTitle: 'MediaPipe / LiteRT',
    leftDetail:
      'Classifies the live transcript on-device for digital arrest threats, coercion scripts, and call-merge OTP triggers.',
    rightMetric: 'Fallback',
    rightTitle: 'Keyword Guardrail',
    rightDetail:
      'If on-device inference slows down on older phones, deterministic keyword matching still trips the alert.',
  },
  {
    id: 'overlay',
    index: '04',
    name: 'Overlay & OTP Guard',
    zone: 'On Your Phone · Private',
    leftMetric: 'Pinned',
    leftTitle: 'Floating Mid-Call Alert',
    leftDetail:
      'Foreground service raises an unmistakable alert directly over the video or voice call screen.',
    rightMetric: 'Hidden',
    rightTitle: 'Notification Listener',
    rightDetail:
      'Masks banking OTP previews during flagged calls so a stressed victim cannot accidentally read codes aloud.',
  },
  {
    id: 'cloudrun',
    index: '05',
    name: 'Cloud Run Gateway',
    zone: 'In The Cloud · On Tap',
    leftMetric: '0 Keys',
    leftTitle: 'FastAPI Token Broker',
    leftDetail:
      'Hands out short-lived session tokens on demand so API credentials never sit inside the Android app binary.',
    rightMetric: 'On Tap',
    rightTitle: 'Explicit User Trigger',
    rightDetail:
      'Invoked strictly when the user taps Verify Call to inspect a warrant image or video frame.',
  },
  {
    id: 'gemini',
    index: '06',
    name: 'Gemini Vision & Live',
    zone: 'In The Cloud · On Tap',
    leftMetric: 'Multimodal',
    leftTitle: 'Document & Frame Reader',
    leftDetail:
      'Reads captured warrant screenshots or streamed video call frames to extract agency names, seals, and cited legal sections.',
    rightMetric: 'Fallback',
    rightTitle: 'Standard Call Backup',
    rightDetail:
      'If live streaming degrades over mobile data, Satark seamlessly falls back to a standard Gemini verification call.',
  },
  {
    id: 'rules',
    index: '07',
    name: 'Fixed Rule Verdict',
    zone: 'Rules, Not AI',
    leftMetric: 'Verified',
    leftTitle: 'IT Act · BNS · CrPC',
    leftDetail:
      'Deterministic registries check whether cited law sections exist, verify WhatsApp warrant rules, and inspect PDF font/file anomalies.',
    rightMetric: '1930',
    rightTitle: 'Plain Verdict Card',
    rightDetail:
      'Returns Genuine or Likely Forged with every red flag explained clearly plus one-tap Hang up & Report on 1930.',
  },
];

export interface LiveScamScenario {
  id: string;
  tag: string;
  callerLabel: string;
  callType: string;
  alertTitle: string;
  alertSubtitle: string;
  verdictBadge: string;
  verdictHeadline: string;
  redFlags: string[];
  recommendedAction: string;
  statValue: string;
  statLabel: string;
  quote: string;
  visualImage: string;
  visualAlt: string;
}

export const LIVE_SCAM_SCENARIOS: LiveScamScenario[] = [
  {
    id: 'cbi-warrant',
    tag: 'Digital Arrest',
    callerLabel: '"CBI Officer"',
    callType: 'Incoming video call',
    alertTitle: 'Likely digital arrest scam',
    alertSubtitle: 'No agency arrests anyone over a video call.',
    verdictBadge: 'LIKELY FORGED',
    verdictHeadline: 'Why this warrant looks forged',
    redFlags: [
      'The law section it cites does not exist in the IT Act, BNS, or CrPC',
      'No Indian enforcement agency serves arrest warrants over WhatsApp',
      'PDF metadata and typography do not match an official court document',
    ],
    recommendedAction: 'Hang up · Report on 1930',
    statValue: '₹1,935 Cr',
    statLabel: 'Annual losses to digital arrest scams in India (MHA Parliament data)',
    quote:
      'Every red flag comes with its reason in plain words, so a worried person can act immediately.',
    visualImage: ASSETS.warrantVerify,
    visualAlt: 'Smartphone scanning a forged paper warrant with cobalt blue verification beam',
  },
  {
    id: 'otp-merge',
    tag: 'Call-Merge OTP',
    callerLabel: '"HR Recruiter / Bank"',
    callType: 'Active voice call + 2nd incoming line',
    alertTitle: 'Do not merge this call',
    alertSubtitle: 'The second call may be your bank automated OTP line.',
    verdictBadge: 'OTP SHIELD ACTIVE',
    verdictHeadline: 'Call-merge fraud pattern detected',
    redFlags: [
      'Caller repeatedly asked you to merge an incoming unknown line',
      'Timing matches automated bank voice-OTP delivery window',
      'SMS & banking OTP notification previews automatically masked on screen',
    ],
    recommendedAction: 'Reject 2nd Call · Hang up',
    statValue: 'NPCI',
    statLabel: 'Official NPCI advisory warns against call-merging OTP theft',
    quote: 'When the scammer asks you to merge, Satark warns you first and hides the code.',
    visualImage: ASSETS.otpGuard,
    visualAlt: 'Smoked obsidian glass security barriers illuminated in electric blue',
  },
  {
    id: 'spoofed-bank',
    tag: 'Spoofed Bank ID',
    callerLabel: 'Trusted Bank Number (Spoofed)',
    callType: 'Voice call · Caller ID shows safe',
    alertTitle: 'Caller ID spoof risk detected',
    alertSubtitle: 'Screen shows a trusted number, but speech matches coercion script.',
    verdictBadge: 'COERCION SCRIPT',
    verdictHeadline: 'Why Satark flagged this "safe" number',
    redFlags: [
      'Caller demands urgent transfer to an "RBI verification safe account"',
      'Caller instructs you not to inform family members or hang up',
      'Official banks never ask customers to move funds to verify accounts',
    ],
    recommendedAction: 'Hang up · Dial Official Bank Back',
    statValue: '₹5L+',
    statLabel: 'Victim losses reported even by cautious users when Caller ID looked safe',
    quote: 'Caller ID checks the number. Satark Live listens to the voice on the line.',
    visualImage: ASSETS.acousticShield,
    visualAlt: 'Matte black Android phone on obsidian with acoustic cobalt rings',
  },
];

export interface GrowthChannel {
  id: string;
  tag: string;
  title: string;
  summary: string;
  detail: string;
  phase: string;
}

export const GROWTH_CHANNELS: GrowthChannel[] = [
  {
    id: 'family',
    tag: 'Family Plan · Beachhead',
    title: 'Protect the people you love',
    summary:
      'A linked family member is alerted immediately when a parent’s phone is under a suspected digital arrest or OTP scam attack.',
    detail: 'Beachhead: families who worry about a parent taking that call.',
    phase: 'Phase 01–02',
  },
  {
    id: 'bank-sdk',
    tag: 'Bank & UPI SDK',
    title: 'Warn inside the app they trust',
    summary:
      'Banks and UPI payment apps embed the Satark guardian directly, so customers receive mid-call warnings right where they authorize payments.',
    detail: 'Stops high-value transfers before UPI PIN confirmation.',
    phase: 'Phase 03',
  },
  {
    id: 'telecom',
    tag: 'Telecom Partners',
    title: 'Reach every call at network scale',
    summary:
      'Telecom operators bring scam detection closer to the voice network itself, scaling protection far beyond a single app on one phone.',
    detail: 'Network-level safety net across Indian languages.',
    phase: 'Phase 04',
  },
];

export interface RoadmapStep {
  phase: string;
  stage: string;
  title: string;
  items: string[];
}

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    phase: '01',
    stage: 'First',
    title: 'Core Guardian',
    items: [
      'On-device scam listening with Gemma',
      'One-tap Verify Call for warrants & video calls',
      'Real-time OTP notification guard',
    ],
  },
  {
    phase: '02',
    stage: 'Next',
    title: 'Family Shield',
    items: [
      'Link a parent’s phone securely to yours',
      'Alert family when a live call looks like a scam',
      'Instant push alerts to linked trusted phones',
    ],
  },
  {
    phase: '03',
    stage: 'Later',
    title: 'Go Wider',
    items: [
      'Expanded Indian regional languages',
      'Embeddable SDK for banks and UPI apps',
      'Continuously updated scam-pattern rules',
    ],
  },
  {
    phase: '04',
    stage: 'Vision',
    title: 'Network',
    items: [
      'Direct telecom operator partnerships',
      'Warnings closer to the voice network',
      'National partner safety ecosystem',
    ],
  },
];
