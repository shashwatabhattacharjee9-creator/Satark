import type { DemoScenario } from './types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'cbi-arrest',
    label: 'Simulate CBI Digital Arrest',
    shortLabel: 'CBI Digital Arrest',
    callerLabel: 'Insp. R. Verma · CBI Cyber HQ',
    callerNumber: '+91 98110-44219 · WhatsApp Video',
    turns: [
      {
        speaker: 'Caller',
        text: 'Hello, this is Inspector Rajesh Verma calling from CBI Cyber Crime Headquarters, New Delhi. Your Aadhaar number has been flagged in a ₹2.4 crore money laundering FIR.',
      },
      {
        speaker: 'Caller',
        text: 'A non-bailable Digital Arrest Warrant under Section 999 BNS is issued against you. Lock your room door immediately, keep your video camera on, and do not inform your spouse or children.',
      },
      {
        speaker: 'Caller',
        text: 'To avoid immediate physical arrest in 20 minutes, transfer ₹4,50,000 into the RBI Safe-Custody Verification Account via RTGS or UPI right now so Supreme Court audit can clear your name.',
      },
    ],
  },
  {
    id: 'hinglish-parcel',
    label: 'Simulate Hinglish Parcel Scam',
    shortLabel: 'Hinglish Parcel Scam',
    callerLabel: 'FedEx / Mumbai Customs Desk',
    callerNumber: '+91 88201-73910 · VoIP Call',
    turns: [
      {
        speaker: 'Caller',
        text: 'Aapka FedEx parcel customs mein seize hua hai, camera band mat karna. Mumbai airport pe aapke naam se Taiwan bheje gaye parcel mein 4 fake passports aur 200 gram MDMA mila hai.',
      },
      {
        speaker: 'Caller',
        text: 'Abhi Mumbai Cyber Police ke DCP line par hain. Agar aapne call kata ya ghar mein kisi ko bataya toh 15 minute mein local police aapko arrest karne aa jayegi.',
      },
      {
        speaker: 'Caller',
        text: 'Aapka bank account verify karne ke liye RBI escrow account mein apna balance transfer kijiye, verification ke baad 30 minute mein paisa wapas mil jayega.',
      },
    ],
  },
  {
    id: 'victim-compliance',
    label: 'Simulate Victim Compliance',
    shortLabel: 'Victim Compliance',
    callerLabel: 'ED / Telecom Enforcement Cell',
    callerNumber: '+91 70452-11908 · Video Call',
    turns: [
      {
        speaker: 'Caller',
        text: 'Your case file is open before the magistrate on Skype. Stay silent, do not hang up, and confirm your savings account balance for RBI clearance.',
      },
      {
        speaker: 'User',
        text: 'Sir please don’t arrest me, I have never done anything wrong. I am alone in my room and I am opening my banking app now to transfer the verification amount.',
      },
    ],
  },
];

export const STAGE_METADATA: Record<
  string,
  { label: string; description: string; colorClass: string; borderClass: string }
> = {
  NOMINAL: {
    label: 'NOMINAL',
    description: 'No coercion or fraud markers detected in the active window.',
    colorClass: 'text-emerald-300 bg-emerald-500/15',
    borderClass: 'border-emerald-400/35',
  },
  AUTHORITY_CLAIM: {
    label: 'AUTHORITY_CLAIM',
    description: 'Unverified police, CBI, customs, or bank authority claim detected.',
    colorClass: 'text-amber-300 bg-amber-500/15',
    borderClass: 'border-amber-400/35',
  },
  ISOLATION_COERCION: {
    label: 'ISOLATION_COERCION',
    description: 'Active secrecy, camera-lock, or digital arrest threat detected.',
    colorClass: 'text-orange-300 bg-orange-500/20',
    borderClass: 'border-orange-400/45',
  },
  FINANCIAL_EXTORTION: {
    label: 'FINANCIAL_EXTORTION',
    description: 'High-urgency money transfer, safe-custody, or compliance risk.',
    colorClass: 'text-[#ff7a99] bg-[#D61A44]/25',
    borderClass: 'border-[#D61A44]/65',
  },
  OTP_TRAP: {
    label: 'OTP_TRAP',
    description: 'OTP harvesting, call-merge hijack, or remote screen-share attempt.',
    colorClass: 'text-[#ff7a99] bg-[#D61A44]/25',
    borderClass: 'border-[#D61A44]/65',
  },
};
