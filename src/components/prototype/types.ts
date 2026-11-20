export type ScamStage =
  | 'NOMINAL'
  | 'AUTHORITY_CLAIM'
  | 'ISOLATION_COERCION'
  | 'FINANCIAL_EXTORTION'
  | 'OTP_TRAP';

export type PrototypeTab = 'shield' | 'warrant' | 'hub' | 'voice' | 'settings';

export type AppThemeMode = 'light' | 'dark' | 'system';

export type ThreatLogFilter = 'all' | 'blocked' | 'flagged';

export type ThreatChannel =
  | 'WhatsAppVideo'
  | 'OtpCallMerge'
  | 'VoiceCoercion'
  | 'WarrantPdf';

export interface TranscriptTurn {
  id: string;
  speaker: 'Caller' | 'User' | 'Live Mic';
  text: string;
  timestampMs: number;
}

export interface CallAnalysisResult {
  score: number;
  stage: ScamStage;
  reason: string;
  model?: string;
}

export interface WarrantVerdict {
  verdict: 'LIKELY FORGED' | 'AUTHENTIC';
  confidence: number;
  documentType: string;
  summary: string;
  redFlags: string[];
  recommendedActions: string[];
  model?: string;
}

export interface ThreatLogEntry {
  id: string;
  timestampMs: number;
  timestampLabel?: string;
  category: 'CALL_INTERCEPT' | 'WARRANT_FORENSICS' | 'OTP_SHIELD';
  channel: ThreatChannel;
  status: 'blocked' | 'flagged';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  title: string;
  source: string;
  detail: string;
  riskScoreLabel: string;
  maskedValue?: string;
}

export interface PermissionItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'voice' | 'overlay' | 'otp' | 'alerts';
  enabled: boolean;
}

export interface DemoScenario {
  id: 'cbi-arrest' | 'hinglish-parcel' | 'victim-compliance';
  label: string;
  shortLabel: string;
  callerLabel: string;
  callerNumber: string;
  turns: Array<{
    speaker: 'Caller' | 'User';
    text: string;
  }>;
}
