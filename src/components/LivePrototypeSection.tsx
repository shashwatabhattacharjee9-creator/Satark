import {
  ArrowUpRight,
  AudioWaveform,
  Cpu,
  FileSearch,
  Maximize2,
  Minimize2,
  Settings,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BRAND_LOGOS } from '../data/landingData';
import { generateSampleForgedWarrantDataUrl } from '../utils/forgedWarrantCanvas';
import { Reveal, setSmoothScrollPaused } from './MotionPrimitives';
import { CornerMark } from './Primitives';
import { CountingNumber } from './ui/counting-number';
import { AndroidDashboardTab } from './prototype/AndroidDashboardTab';
import {
  AndroidHubOtpTab,
  AndroidSettingsTab,
  AndroidVoiceTab,
  AndroidWarrantTab,
} from './prototype/AndroidTabPanes';
import { FourDotGridGlyph } from './prototype/BentoVisuals';
import type {
  AppThemeMode,
  CallAnalysisResult,
  DemoScenario,
  PermissionItem,
  PrototypeTab,
  ThreatLogEntry,
  ThreatLogFilter,
  TranscriptTurn,
  WarrantVerdict,
} from './prototype/types';

const ROLLING_WINDOW_MS = 90_000;
const ANDROID_REPO_URL =
  'https://github.com/shashwatabhattacharjee9-creator/Satark-AI-Android-Apk';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

const INITIAL_ANALYSIS: CallAnalysisResult = {
  score: 0,
  stage: 'NOMINAL',
  reason: 'On-device sentinel armed. Speak via live mic or tap a judge simulation.',
};

const INITIAL_THREAT_LOGS: ThreatLogEntry[] = [
  {
    id: 'seed-1',
    timestampMs: Date.now() - 1000 * 60 * 14,
    timestampLabel: '14m ago',
    category: 'CALL_INTERCEPT',
    channel: 'WhatsAppVideo',
    status: 'blocked',
    severity: 'CRITICAL',
    title: 'Fake CBI Video Arrest',
    source: 'WhatsApp Video · +91 98110-44219',
    detail:
      'Impersonation coercion pattern flagged locally ("Digital Arrest Warrant"). Call disconnected before financial transfer.',
    riskScoreLabel: '96% RISK',
  },
  {
    id: 'seed-2',
    timestampMs: Date.now() - 1000 * 60 * 52,
    timestampLabel: '52m ago',
    category: 'OTP_SHIELD',
    channel: 'OtpCallMerge',
    status: 'blocked',
    severity: 'HIGH',
    title: 'Call-Merge Bank OTP Trap',
    source: 'SMS Banner Masked · VM-HDFCBK',
    detail:
      'Incoming 6-digit HDFC Bank OTP redacted automatically while an unverified VoIP call was active.',
    riskScoreLabel: '89% RISK',
    maskedValue: '••••••',
  },
  {
    id: 'seed-3',
    timestampMs: Date.now() - 1000 * 60 * 130,
    timestampLabel: '2h ago',
    category: 'WARRANT_FORENSICS',
    channel: 'WarrantPdf',
    status: 'flagged',
    severity: 'CRITICAL',
    title: 'Forged Section 999 BNS PDF',
    source: 'Warrant Forensics · WhatsApp Doc',
    detail:
      'Fabricated BNS section and personal RBI safe-custody UPI ID flagged with 99.4% forgery confidence.',
    riskScoreLabel: '99% RISK',
  },
];

const INITIAL_PERMISSIONS: PermissionItem[] = [
  {
    id: 'voice_sentinel',
    title: 'On-Device Voice Sentinel',
    subtitle: 'Detects coercion locally with zero cloud audio',
    iconType: 'voice',
    enabled: true,
  },
  {
    id: 'floating_overlay',
    title: 'Mid-Call Floating Overlay',
    subtitle: 'Alerts over WhatsApp & phone video calls',
    iconType: 'overlay',
    enabled: true,
  },
  {
    id: 'otp_guard',
    title: 'Call-Merge OTP Guard',
    subtitle: 'Hides bank OTP previews during flagged calls',
    iconType: 'otp',
    enabled: true,
  },
  {
    id: 'threat_alerts',
    title: 'Instant Threat Alerts',
    subtitle: 'Real-time tamper and scam notifications',
    iconType: 'alerts',
    enabled: true,
  },
];

const DOCK_TABS: Array<{
  id: PrototypeTab;
  label: string;
}> = [
  { id: 'shield', label: 'Guardian' },
  { id: 'warrant', label: 'Warrant' },
  { id: 'hub', label: 'OTP Hub' },
  { id: 'voice', label: 'Co-Pilot' },
  { id: 'settings', label: 'Settings' },
];

export function LivePrototypeSection() {
  const [activeTab, setActiveTab] = useState<PrototypeTab>('shield');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeMode, setThemeMode] = useState<AppThemeMode>('dark');

  // Guardian & Live Call Co-Pilot State
  const [armed, setArmed] = useState(true);
  const [demoAlertManual, setDemoAlertManual] = useState(false);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [analysis, setAnalysis] = useState<CallAnalysisResult>(INITIAL_ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [callApiError, setCallApiError] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<DemoScenario['id'] | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Speech API state
  const [micSupported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const [isMicListening, setIsMicListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Warrant Forensics state
  const [warrantPreview, setWarrantPreview] = useState<string | null>(null);
  const [warrantVerdict, setWarrantVerdict] = useState<WarrantVerdict | null>(null);
  const [isScanningWarrant, setIsScanningWarrant] = useState(false);
  const [warrantError, setWarrantError] = useState<string | null>(null);

  // Threat Log & Permissions state (matching SatarkViewModel.kt)
  const [threatLogs, setThreatLogs] = useState<ThreatLogEntry[]>(INITIAL_THREAT_LOGS);
  const [threatFilter, setThreatFilter] = useState<ThreatLogFilter>('all');
  const [selectedThreatLog, setSelectedThreatLog] = useState<ThreatLogEntry | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>(INITIAL_PERMISSIONS);
  const [otpShieldedCount, setOtpShieldedCount] = useState(0);

  // Refs
  const turnsRef = useRef<TranscriptTurn[]>([]);
  const armedRef = useRef(armed);
  const analysisSeqRef = useRef(0);
  const scenarioTimersRef = useRef<number[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const micShouldContinueRef = useRef(false);
  const loggedCallAlertRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    armedRef.current = armed;
  }, [armed]);

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setSmoothScrollPaused(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      setSmoothScrollPaused(false);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      scenarioTimersRef.current.forEach((id) => window.clearTimeout(id));
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      micShouldContinueRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore teardown errors
      }
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2800);
  }, []);

  const appendThreatLog = useCallback(
    (entry: Omit<ThreatLogEntry, 'id' | 'timestampMs' | 'timestampLabel'>) => {
      setThreatLogs((prev) => [
        {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestampMs: Date.now(),
          timestampLabel: 'Just now',
        },
        ...prev.slice(0, 24),
      ]);
    },
    []
  );

  const clearScenarioTimers = useCallback(() => {
    scenarioTimersRef.current.forEach((id) => window.clearTimeout(id));
    scenarioTimersRef.current = [];
    setActiveScenarioId(null);
  }, []);

  const stopMic = useCallback(() => {
    micShouldContinueRef.current = false;
    setIsMicListening(false);
    setInterimTranscript('');
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore already stopped
    }
    recognitionRef.current = null;
  }, []);

  // Server-side Gemini call analysis over rolling 90-second window
  const evaluateConversationWindow = useCallback(
    async (allTurns: TranscriptTurn[]) => {
      if (!armedRef.current) return;
      const cutoff = Date.now() - ROLLING_WINDOW_MS;
      const windowTurns = allTurns.filter((t) => t.timestampMs >= cutoff);
      if (windowTurns.length === 0) return;

      const seq = ++analysisSeqRef.current;
      setIsAnalyzing(true);
      setCallApiError(null);

      try {
        const response = await fetch('/api/satark/analyze-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            turns: windowTurns.map((t) => ({
              speaker: t.speaker,
              text: t.text,
              timestampMs: t.timestampMs,
            })),
          }),
        });

        const payload = (await response.json()) as Partial<CallAnalysisResult> & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || `Server returned ${response.status}`);
        }
        if (seq !== analysisSeqRef.current) return;

        const nextAnalysis: CallAnalysisResult = {
          score: typeof payload.score === 'number' ? payload.score : 0,
          stage: payload.stage ?? 'NOMINAL',
          reason:
            payload.reason ?? 'Conversation evaluated across rolling 90-second threat window.',
          model: payload.model,
        };

        setAnalysis(nextAnalysis);

        if (nextAnalysis.score >= 70) {
          setAlertDismissed(false);
          if (!loggedCallAlertRef.current) {
            loggedCallAlertRef.current = true;
            appendThreatLog({
              category: 'CALL_INTERCEPT',
              channel: 'VoiceCoercion',
              status: 'flagged',
              severity: 'CRITICAL',
              title: `Coercion Call Flagged (${nextAnalysis.stage})`,
              source: `Live Co-Pilot · Risk ${nextAnalysis.score}/100`,
              detail: nextAnalysis.reason,
              riskScoreLabel: `${nextAnalysis.score}% RISK`,
            });
          }
        }
      } catch (err) {
        if (seq !== analysisSeqRef.current) return;
        setCallApiError(
          err instanceof Error ? err.message : 'Unable to reach Gemini call analysis endpoint.'
        );
      } finally {
        if (seq === analysisSeqRef.current) {
          setIsAnalyzing(false);
        }
      }
    },
    [appendThreatLog]
  );

  const pushTurnAndAnalyze = useCallback(
    (speaker: TranscriptTurn['speaker'], text: string) => {
      const clean = text.trim();
      if (!clean) return;
      const newTurn: TranscriptTurn = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        speaker,
        text: clean,
        timestampMs: Date.now(),
      };
      const updated = [...turnsRef.current, newTurn];
      turnsRef.current = updated;
      setTurns(updated);
      setNowMs(Date.now());
      void evaluateConversationWindow(updated);
    },
    [evaluateConversationWindow]
  );

  const handleToggleMic = useCallback(() => {
    setMicError(null);
    if (isMicListening) {
      stopMic();
      showToast('Live microphone paused');
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setMicError(
        'Web Speech API is unavailable in this browser. Use Chrome/Edge or the 3 judge demos.'
      );
      return;
    }

    clearScenarioTimers();
    try {
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? '';
          if (result.isFinal) {
            setInterimTranscript('');
            pushTurnAndAnalyze('Live Mic', text);
          } else {
            interim += text;
          }
        }
        if (interim) setInterimTranscript(interim.trim());
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission denied. Allow mic access or run a simulation.');
          stopMic();
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setMicError(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (micShouldContinueRef.current && armedRef.current) {
          try {
            recognition.start();
          } catch {
            setIsMicListening(false);
          }
        } else {
          setIsMicListening(false);
        }
      };

      recognitionRef.current = recognition;
      micShouldContinueRef.current = true;
      recognition.start();
      setIsMicListening(true);
      showToast('Live microphone listening (en-IN)');
    } catch {
      setMicError('Could not start browser microphone.');
      stopMic();
    }
  }, [clearScenarioTimers, isMicListening, pushTurnAndAnalyze, showToast, stopMic]);

  const handleRunScenario = useCallback(
    (scenario: DemoScenario) => {
      stopMic();
      clearScenarioTimers();
      setCallApiError(null);
      setAlertDismissed(false);
      setDemoAlertManual(false);
      loggedCallAlertRef.current = false;

      turnsRef.current = [];
      setTurns([]);
      setAnalysis({
        score: 8,
        stage: 'NOMINAL',
        reason: `Monitoring incoming call from ${scenario.callerLabel}…`,
      });
      setActiveScenarioId(scenario.id);
      showToast(`Simulating: ${scenario.shortLabel}`);

      scenario.turns.forEach((turn, idx) => {
        const delayMs = idx === 0 ? 150 : idx * 3200;
        const timerId = window.setTimeout(() => {
          pushTurnAndAnalyze(turn.speaker, turn.text);
          if (idx === scenario.turns.length - 1) {
            setActiveScenarioId(null);
          }
        }, delayMs);
        scenarioTimersRef.current.push(timerId);
      });
    },
    [clearScenarioTimers, pushTurnAndAnalyze, showToast, stopMic]
  );

  const handleResetSession = useCallback(() => {
    stopMic();
    clearScenarioTimers();
    analysisSeqRef.current++;
    loggedCallAlertRef.current = false;
    turnsRef.current = [];
    setTurns([]);
    setAnalysis(INITIAL_ANALYSIS);
    setDemoAlertManual(false);
    setAlertDismissed(false);
    setCallApiError(null);
    setMicError(null);
    setIsAnalyzing(false);
    showToast('Session cleared');
  }, [clearScenarioTimers, showToast, stopMic]);

  const handleToggleDemoAlert = useCallback(() => {
    setDemoAlertManual((prev) => {
      const next = !prev;
      if (next) {
        setArmed(true);
        setAlertDismissed(false);
        setAnalysis((curr) =>
          curr.score >= 70
            ? curr
            : {
                score: 96,
                stage: 'FINANCIAL_EXTORTION',
                reason:
                  'Simulated CBI Digital Arrest coercion detected — no agency arrests over video call.',
              }
        );
        showToast('Live Threat Interception Triggered');
      } else {
        setAnalysis(INITIAL_ANALYSIS);
        showToast('Returned to Safe Mode');
      }
      return next;
    });
  }, [showToast]);

  const handleHangUp = useCallback(() => {
    stopMic();
    clearScenarioTimers();
    setDemoAlertManual(false);
    setAlertDismissed(true);
    appendThreatLog({
      category: 'CALL_INTERCEPT',
      channel: 'WhatsAppVideo',
      status: 'blocked',
      severity: 'CRITICAL',
      title: 'Digital Arrest Video Call',
      source: 'Live Interception · Call Terminated',
      detail: `Call terminated safely via Satark Guardian at ${Math.max(analysis.score, 96)}% risk.`,
      riskScoreLabel: `${Math.max(analysis.score, 96)}% RISK`,
    });
    setAnalysis(INITIAL_ANALYSIS);
    showToast('Call terminated & logged to Threat Log');
  }, [analysis.score, appendThreatLog, clearScenarioTimers, showToast, stopMic]);

  const handleReport1930 = useCallback(() => {
    appendThreatLog({
      category: 'WARRANT_FORENSICS',
      channel: 'WarrantPdf',
      status: 'flagged',
      severity: 'CRITICAL',
      title: 'Forged CBI Notice (1930)',
      source: 'Warrant Forensics · Reported',
      detail:
        'Forensic dossier packaged for National Cyber Crime Helpline 1930 (cybercrime.gov.in).',
      riskScoreLabel: '99% RISK',
    });
    showToast('Forensic dossier queued for Cyber Helpline 1930');
  }, [appendThreatLog, showToast]);

  // Multimodal Warrant Vision API call
  const runWarrantAnalysis = useCallback(
    async (dataUrl: string, mimeType: string) => {
      setWarrantPreview(dataUrl);
      setWarrantVerdict(null);
      setWarrantError(null);
      setIsScanningWarrant(true);

      try {
        const response = await fetch('/api/satark/scan-warrant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl, mimeType }),
        });

        const payload = (await response.json()) as Partial<WarrantVerdict> & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || `Server returned ${response.status}`);
        }

        const verdict: WarrantVerdict = {
          verdict: payload.verdict === 'AUTHENTIC' ? 'AUTHENTIC' : 'LIKELY FORGED',
          confidence: typeof payload.confidence === 'number' ? payload.confidence : 96,
          documentType: payload.documentType ?? 'Scanned Legal Notice',
          summary: payload.summary ?? 'Document analyzed via Gemini multimodal vision.',
          redFlags: Array.isArray(payload.redFlags) ? payload.redFlags : [],
          recommendedActions: Array.isArray(payload.recommendedActions)
            ? payload.recommendedActions
            : [],
          model: payload.model,
        };

        setWarrantVerdict(verdict);

        if (verdict.verdict === 'LIKELY FORGED') {
          appendThreatLog({
            category: 'WARRANT_FORENSICS',
            channel: 'WarrantPdf',
            status: 'flagged',
            severity: 'CRITICAL',
            title: `Forged Warrant (${verdict.confidence}% Conf.)`,
            source: 'Warrant Forensics · Gemini Vision',
            detail: verdict.summary,
            riskScoreLabel: `${verdict.confidence}% RISK`,
          });
        }
      } catch (err) {
        setWarrantError(
          err instanceof Error
            ? err.message
            : 'Unable to reach Gemini multimodal warrant scanner.'
        );
      } finally {
        setIsScanningWarrant(false);
      }
    },
    [appendThreatLog]
  );

  const handleScanSampleWarrant = useCallback(() => {
    const dataUrl = generateSampleForgedWarrantDataUrl();
    if (!dataUrl) {
      setWarrantError('Unable to render sample CBI notice in this browser.');
      return;
    }
    void runWarrantAnalysis(dataUrl, 'image/png');
  }, [runWarrantAnalysis]);

  const handleUploadWarrantFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setWarrantError('Please upload a PNG, JPG, or WebP warrant image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          void runWarrantAnalysis(reader.result, file.type);
        }
      };
      reader.readAsDataURL(file);
    },
    [runWarrantAnalysis]
  );

  const handleVerifyWarrant = useCallback(() => {
    setAlertDismissed(true);
    setActiveTab('warrant');
    if (!warrantPreview && !isScanningWarrant) {
      handleScanSampleWarrant();
    }
  }, [handleScanSampleWarrant, isScanningWarrant, warrantPreview]);

  const handleSimulateOtpIntercept = useCallback(
    (payload: { bank: string; sender: string; rawCode: string; amount: string }) => {
      if (armed) {
        setOtpShieldedCount((c) => c + 1);
      }
      if (armed && analysis.score < 70) {
        setAnalysis({
          score: 88,
          stage: 'OTP_TRAP',
          reason: `${payload.bank} SMS OTP intercepted mid-call — likely call-merge hijack.`,
        });
      }
      appendThreatLog({
        category: 'OTP_SHIELD',
        channel: 'OtpCallMerge',
        status: armed ? 'blocked' : 'flagged',
        severity: 'CRITICAL',
        title: armed
          ? `${payload.bank} OTP Masked`
          : `${payload.bank} OTP Exposed`,
        source: `SMS Guard · ${payload.sender}`,
        detail: `${payload.amount} · Code ${armed ? '•••••• redacted by Satark' : payload.rawCode} during active suspicious call.`,
        riskScoreLabel: '92% RISK',
        maskedValue: '••••••',
      });
      showToast(armed ? `${payload.bank} OTP redacted & logged` : 'OTP exposed (Guardian Disarmed)');
    },
    [analysis.score, appendThreatLog, armed, showToast]
  );

  const windowTurnCount = turns.filter((t) => t.timestampMs >= nowMs - ROLLING_WINDOW_MS).length;
  const isDark = themeMode !== 'light';
  const isAlertActive = armed && !alertDismissed && (demoAlertManual || analysis.score >= 70);
  const enabledPermCount = permissions.filter((p) => p.enabled).length;

  // Exact Android Screen Background (Dark OLED #000000 or Light Pearl #F3F2FA + subtle internal top aurora)
  const phoneScreenBgStyle = isDark
    ? isAlertActive
      ? {
          background:
            'radial-gradient(circle at 14% 3%, rgba(214, 26, 68, 0.56) 0%, rgba(214, 26, 68, 0.16) 36%, transparent 65%), radial-gradient(circle at 88% 7%, rgba(255, 77, 121, 0.36) 0%, rgba(157, 27, 106, 0.16) 34%, transparent 60%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.58) 28%, #000000 44%, #000000 100%)',
          backgroundColor: '#000000',
        }
      : {
          background:
            'radial-gradient(circle at 14% 3%, rgba(51, 24, 184, 0.44) 0%, rgba(51, 24, 184, 0.14) 36%, transparent 65%), radial-gradient(circle at 88% 7%, rgba(125, 76, 224, 0.28) 0%, rgba(86, 50, 214, 0.12) 34%, transparent 60%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.58) 28%, #000000 44%, #000000 100%)',
          backgroundColor: '#000000',
        }
    : isAlertActive
      ? {
          background:
            'radial-gradient(circle at 14% 3%, rgba(214, 26, 68, 0.30) 0%, transparent 60%), radial-gradient(circle at 88% 7%, rgba(255, 77, 121, 0.22) 0%, transparent 55%), #F3F2FA',
        }
      : {
          background:
            'radial-gradient(circle at 14% 3%, rgba(140, 117, 250, 0.34) 0%, transparent 60%), radial-gradient(circle at 88% 7%, rgba(220, 210, 255, 0.36) 0%, transparent 55%), #F3F2FA',
        };

  // Phone Chassis — Zero external blue glow/haze, pure crisp hardware bezel matching landing page
  const phoneFrame = (
    <div className="relative mx-auto w-full max-w-[404px]">
      <div
        className={`relative rounded-[52px] p-[10px] bg-gradient-to-b from-[#2b2b2e] via-[#171719] to-[#262629] shadow-[0_28px_72px_rgba(0,0,0,0.9)] transition-all duration-500 ${
          isAlertActive
            ? 'ring-2 ring-[#D61A44]/85'
            : 'ring-1 ring-white/18'
        }`}
      >
        {/* Inner OLED / Pearl Screen */}
        <div
          style={phoneScreenBgStyle}
          className={`relative rounded-[42px] overflow-hidden flex flex-col border border-white/10 transition-colors duration-500 ${
            isFullscreen ? 'h-[min(790px,calc(100svh-116px))]' : 'h-[735px] sm:h-[760px]'
          }`}
        >
          {/* Phone Status Bar + Dynamic Island */}
          <div
            className={`relative z-10 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-space shrink-0 ${
              isDark ? 'text-white/85' : 'text-[#110F1D]/85'
            }`}
          >
            <span className="font-semibold">9:41</span>
            <div className="w-[100px] h-[25px] rounded-full bg-black border border-white/12 flex items-center justify-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAlertActive
                    ? 'bg-[#D61A44] animate-ping'
                    : isMicListening
                      ? 'bg-[#4ADE80] animate-pulse'
                      : armed
                        ? 'bg-[#B8A4F8]'
                        : 'bg-zinc-600'
                }`}
              />
              <span className="text-[9px] font-space text-white/75 tracking-wider">
                {isAlertActive ? 'THREAT' : isMicListening ? 'MIC ON' : 'SATARK'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">5G</span>
            </div>
          </div>

          {/* EXACT ANDROID DASHBOARD TOP BAR (DashboardTopBar port) */}
          <div className="relative z-10 px-4 pt-1 pb-2.5 flex items-center gap-2.5 shrink-0">
            {/* Circular 44px Apple Liquid-Glass Profile/Emblem Avatar with Live Status Dot */}
            <button
              type="button"
              onClick={() => setActiveTab('shield')}
              aria-label="Satark Guardian Dashboard"
              className="relative w-11 h-11 shrink-0 cursor-pointer"
            >
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md ${
                  isDark
                    ? 'bg-[#191826]/85 border-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]'
                    : 'bg-white/90 border-[#5C5091]/20 shadow-sm'
                }`}
              >
                <img
                  src={BRAND_LOGOS.mark}
                  alt="Satark"
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 object-contain"
                />
              </span>
              <span
                className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full p-[2px] ${
                  isDark ? 'bg-black' : 'bg-[#F3F2FA]'
                }`}
              >
                <span
                  className={`block w-full h-full rounded-full ${
                    isAlertActive
                      ? 'bg-[#FF5C84]'
                      : armed
                        ? isDark
                          ? 'bg-[#4ADE80]'
                          : 'bg-[#159947]'
                        : 'bg-zinc-500'
                  }`}
                />
              </span>
            </button>

            {/* Title + Subtitle */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-display text-[16px] font-bold leading-tight truncate ${
                  isDark ? 'text-white' : 'text-[#110F1D]'
                }`}
              >
                Satark Guardian
              </p>
              <p
                className={`text-[10.5px] leading-tight truncate mt-0.5 ${
                  isAlertActive
                    ? isDark
                      ? 'text-[#FF5C84]'
                      : 'text-[#D61A44]'
                    : isDark
                      ? 'text-white/65'
                      : 'text-[#4F4B66]'
                }`}
              >
                {isAlertActive
                  ? 'High-severity coercion threat active'
                  : 'On-device AI protection active'}
              </p>
            </div>

            {/* Right Frosted Pill: "Demo Alert" / "Safe Mode" */}
            <button
              type="button"
              onClick={handleToggleDemoAlert}
              className={`h-8 px-3 rounded-full border backdrop-blur-md inline-flex items-center gap-1.5 text-[10.5px] font-display font-semibold shrink-0 transition-all active:scale-95 cursor-pointer ${
                isAlertActive
                  ? isDark
                    ? 'bg-[#D61A44]/38 border-[#FF4D79]/65 text-white'
                    : 'bg-[#D61A44]/16 border-[#D61A44]/50 text-[#D61A44]'
                  : isDark
                    ? 'bg-[#191826]/80 border-white/22 text-white hover:bg-white/15'
                    : 'bg-white/85 border-[#5C5091]/22 text-[#110F1D]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAlertActive ? 'bg-[#FF4D79]' : isDark ? 'bg-[#B8A4F8]' : 'bg-[#5632D6]'
                }`}
              />
              <span>{isAlertActive ? 'Safe Mode' : 'Demo Alert'}</span>
            </button>
          </div>

          {/* Floating Toast Confirmation Pill (exact port from DashboardScreen.kt) */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute top-[98px] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
              >
                <div
                  className={`px-4 py-2 rounded-full border backdrop-blur-xl text-[11px] font-medium whitespace-nowrap shadow-xl ${
                    isDark
                      ? 'bg-[#161522]/92 border-white/22 text-white'
                      : 'bg-white/95 border-[#5C5091]/20 text-[#110F1D]'
                  }`}
                >
                  {toastMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Tab Content Area */}
          <div
            data-lenis-prevent
            className="relative z-10 flex-1 overflow-y-auto satark-phone-scroll px-4 pt-1 pb-24"
          >
            {activeTab === 'shield' && (
              <AndroidDashboardTab
                isDark={isDark}
                isArmed={armed}
                isAlert={isAlertActive}
                onToggleArmed={() => {
                  setArmed((prev) => {
                    const next = !prev;
                    if (!next) {
                      stopMic();
                      clearScenarioTimers();
                      setDemoAlertManual(false);
                      showToast('Guardian Placed on Standby');
                    } else {
                      showToast('Satark Guardian Armed');
                    }
                    return next;
                  });
                }}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                apiError={callApiError}
                turns={turns}
                windowTurnCount={windowTurnCount}
                activeScenarioId={activeScenarioId}
                isMicListening={isMicListening}
                micSupported={micSupported}
                micError={micError}
                interimTranscript={interimTranscript}
                onToggleMic={handleToggleMic}
                onRunScenario={handleRunScenario}
                onStopScenario={clearScenarioTimers}
                onResetSession={handleResetSession}
                onVerifyWarrant={handleVerifyWarrant}
                onHangUp={handleHangUp}
                onDismissAlert={() => {
                  setDemoAlertManual(false);
                  setAlertDismissed(true);
                  showToast('Alert dismissed · Monitoring continues');
                }}
                onNavigateTab={setActiveTab}
                otpShieldedCount={otpShieldedCount}
                threatLogs={threatLogs}
                threatFilter={threatFilter}
                onSelectThreatFilter={setThreatFilter}
                onSelectThreatEntry={setSelectedThreatLog}
              />
            )}

            {activeTab === 'warrant' && (
              <AndroidWarrantTab
                isDark={isDark}
                previewDataUrl={warrantPreview}
                verdict={warrantVerdict}
                isScanning={isScanningWarrant}
                scanError={warrantError}
                onScanSampleWarrant={handleScanSampleWarrant}
                onUploadFile={handleUploadWarrantFile}
                onClearWarrant={() => {
                  setWarrantPreview(null);
                  setWarrantVerdict(null);
                  setWarrantError(null);
                }}
                onHangUp={handleHangUp}
                onReport1930={handleReport1930}
              />
            )}

            {activeTab === 'hub' && (
              <AndroidHubOtpTab
                isDark={isDark}
                isArmed={armed}
                isAlert={isAlertActive}
                enabledPermCount={enabledPermCount}
                onToggleDemoAlert={handleToggleDemoAlert}
                onNavigateTab={setActiveTab}
                onSimulateOtpIntercept={handleSimulateOtpIntercept}
              />
            )}

            {activeTab === 'voice' && (
              <AndroidVoiceTab
                isDark={isDark}
                isArmed={armed}
                isAlert={isAlertActive}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                apiError={callApiError}
                turns={turns}
                windowTurnCount={windowTurnCount}
                activeScenarioId={activeScenarioId}
                isMicListening={isMicListening}
                micSupported={micSupported}
                micError={micError}
                interimTranscript={interimTranscript}
                onToggleMic={handleToggleMic}
                onRunScenario={handleRunScenario}
                onStopScenario={clearScenarioTimers}
                onSubmitCustomTurn={(text) => pushTurnAndAnalyze('Caller', text)}
                onResetSession={handleResetSession}
              />
            )}

            {activeTab === 'settings' && (
              <AndroidSettingsTab
                isDark={isDark}
                themeMode={themeMode}
                onSelectTheme={(mode) => {
                  setThemeMode(mode);
                  showToast(
                    mode === 'light'
                      ? 'Light Pearl theme active'
                      : mode === 'dark'
                        ? 'Dark OLED theme active'
                        : 'Following system theme'
                  );
                }}
                permissions={permissions}
                onTogglePermission={(id) =>
                  setPermissions((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
                  )
                }
                onEnableAll={() => {
                  setPermissions((prev) => prev.map((p) => ({ ...p, enabled: true })));
                  showToast('All 4 Device Shield permissions enabled');
                }}
              />
            )}
          </div>

          {/* Threat Log Entry Detail Overlay Sheet (matching ThreatLogDetailSheet) */}
          <AnimatePresence>
            {selectedThreatLog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/72 backdrop-blur-sm flex items-end p-4"
                onClick={() => setSelectedThreatLog(null)}
              >
                <motion.div
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full rounded-[26px] p-4 border space-y-3 ${
                    isDark
                      ? 'bg-[#12111D]/96 border-white/20 text-white'
                      : 'bg-white border-[#5C5091]/20 text-[#110F1D]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9.5px] font-space font-bold uppercase tracking-wider text-[#FF5C84]">
                        INTERCEPTION FORENSICS · {selectedThreatLog.riskScoreLabel}
                      </span>
                      <h4 className="font-display text-[15px] font-bold mt-0.5">
                        {selectedThreatLog.title}
                      </h4>
                      <p className={`text-[11px] ${isDark ? 'text-white/60' : 'text-[#4F4B66]'}`}>
                        {selectedThreatLog.source}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedThreatLog(null)}
                      aria-label="Close detail sheet"
                      className="p-1 opacity-65 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={`text-[11.5px] leading-relaxed ${isDark ? 'text-white/80' : 'text-[#4F4B66]'}`}>
                    {selectedThreatLog.detail}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleReport1930();
                      setSelectedThreatLog(null);
                    }}
                    className="w-full h-10 rounded-full bg-[#D61A44] text-white text-[11.5px] font-semibold cursor-pointer"
                  >
                    Report to Cyber Helpline 1930
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EXACT 5-TAB FLOATING APPLE LIQUID-GLASS CAPSULE DOCK WITH LIQUID-MERCURY SLIDING PEARL PILL */}
          <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-3 pt-4 pointer-events-none bg-gradient-to-t from-black/80 via-black/35 to-transparent">
            <nav
              aria-label="Satark Android App Dock"
              className={`pointer-events-auto relative h-[58px] rounded-full px-1.5 grid grid-cols-5 items-center border backdrop-blur-2xl shadow-[0_14px_34px_rgba(0,0,0,0.55)] ${
                isDark
                  ? 'bg-[#161522]/85 border-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]'
                  : 'bg-[#E7E4F4]/90 border-white/80 shadow-[0_10px_24px_rgba(59,46,120,0.16)]'
              }`}
            >
              {DOCK_TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-label={tab.label}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative h-[44px] flex items-center justify-center rounded-full cursor-pointer"
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="android-liquid-dock-pill"
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        className="absolute inset-x-1 inset-y-0 rounded-full bg-gradient-to-b from-white/95 to-[#E9E7F4]/88 border border-white/75 shadow-[0_4px_14px_rgba(255,255,255,0.22)]"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-transform duration-200 ${
                        isSelected
                          ? 'scale-105 text-[#0B0A12]'
                          : isDark
                            ? 'scale-95 text-white/62 hover:text-white'
                            : 'scale-95 text-[#352F52]/65 hover:text-[#110F1D]'
                      }`}
                    >
                      {tab.id === 'shield' && <Shield className="w-[19px] h-[19px]" />}
                      {tab.id === 'warrant' && <FileSearch className="w-[19px] h-[19px]" />}
                      {tab.id === 'hub' && <FourDotGridGlyph className="w-[17px] h-[17px]" />}
                      {tab.id === 'voice' && <AudioWaveform className="w-[19px] h-[19px]" />}
                      {tab.id === 'settings' && <Settings className="w-[19px] h-[19px]" />}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mx-auto mt-2 w-28 h-1 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
    </div>
  );

  // Full-Screen App Mode Overlay (crisp Onyx matching landing page — no blue haze)
  if (isFullscreen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Satark Full-Screen App Mode"
        data-lenis-prevent
        className="fixed inset-0 z-[70] bg-black text-white overflow-y-auto"
      >
        <div className="pointer-events-none fixed inset-0 bg-grid-dark opacity-50" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 py-4 sm:py-6 min-h-screen flex flex-col">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGOS.mark}
                alt="Satark"
                referrerPolicy="no-referrer"
                className="w-7 h-7 object-contain"
              />
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-white">
                  Satark Live — Full-Screen App Mode
                </p>
                <p className="text-[11px] font-mono text-white/60">
                  Native Android Liquid-Glass UI · Powered by Server-Side Gemini
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold hover:bg-[#BFBFFB] transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Full-Screen</span>
            </button>
          </div>

          <div className="flex-1 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 flex justify-center">{phoneFrame}</div>

            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-mono text-white/65">[Live App Walkthrough]</span>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                  Real Satark Android UI + Live Gemini Co-Pilot
                </h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  Built directly from the native Satark Android Jetpack Compose interface (Pastel Lavender &amp; Acid Lime Mint Bento cards, tactile Slide-to-Arm control, Liquid-Mercury 5-tab dock, Light/Dark OLED switcher) enhanced with our live Fireflies-style Call Co-Pilot.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    tab: 'shield' as const,
                    num: '01',
                    title: 'Guardian Dashboard + Live Co-Pilot',
                    desc: 'Hero Sentinel slider, 3 one-click Hinglish/CBI scam simulations, 2×2 animated Bento grid, and live Threat Log.',
                  },
                  {
                    tab: 'warrant' as const,
                    num: '02',
                    title: 'Warrant Forensics Scanner',
                    desc: 'Scan the forged CBI Section 999 BNS notice or upload any document for a structured Gemini Vision verdict.',
                  },
                  {
                    tab: 'hub' as const,
                    num: '03',
                    title: 'OTP Guard & Quick Shield Matrix',
                    desc: 'Simulate an incoming bank SMS OTP during a flagged call to watch real-time redaction and Threat Log capture.',
                  },
                  {
                    tab: 'voice' as const,
                    num: '04',
                    title: 'Voice Stream Sentinel (Full Co-Pilot)',
                    desc: 'Full-screen live SpeechRecognition microphone capture, rolling 90-second transcript, and risk scoring.',
                  },
                ].map((item) => (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    className={`text-left p-4 border transition-colors cursor-pointer ${
                      activeTab === item.tab
                        ? 'bg-white text-black border-white'
                        : 'bg-[#0A0A0A] border-white/15 text-white hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold">
                        <span className="font-mono opacity-65 mr-2">({item.num})</span>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono opacity-70">
                        {activeTab === item.tab ? 'ACTIVE' : 'OPEN'}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        activeTab === item.tab ? 'text-black/75' : 'text-white/65'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="border border-white/15 bg-[#0A0A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <p className="text-xs text-white/75 leading-relaxed">
                    <strong className="text-white">Native Android APK:</strong> Runs{' '}
                    <span className="text-white font-mono">Gemma 4 E2B (2.4 GB)</span> 100% offline
                    on-device via LiteRT-LM.
                  </p>
                </div>
                <a
                  href={ANDROID_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-semibold hover:bg-[#BFBFFB] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Android APK Repo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Embedded Landing Page Section — Pure Swiss Onyx Architecture (Zero Blue Hues Around Phone!)
  return (
    <section
      id="prototype"
      className="relative bg-black text-white py-20 sm:py-24 lg:py-32 border-b border-white/12 overflow-hidden"
    >
      {/* Subtle architectural hairline grid matching the rest of the landing page */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-55" />

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12">
        {/* Section Header */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-white/15">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-white/70">
                [Live Interactive Prototype]
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60">
                <Sparkles className="w-3.5 h-3.5 text-white/75" />
                <span>Native Android UI · Powered by Server-Side Gemini</span>
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.06] text-white">
              Experience the real Satark app{' '}
              <span className="text-[#8B8B8B]">live in your browser.</span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
              Faithfully ported from the native Satark Android Jetpack Compose build — complete with the Pastel Bento dashboard, tactile Guardian slider, liquid-glass 5-tab dock, Light/Dark OLED theme switcher, and our live Fireflies-style Call Co-Pilot.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-white text-black text-xs sm:text-sm font-semibold hover:bg-[#BFBFFB] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full-Screen App Mode</span>
            </button>
            <CornerMark variant="light" position="top-right" className="hidden sm:block" />
          </div>
        </Reveal>

        {/* Main Interactive Stage: Monochrome Architectural Sidebar + Phone Frame */}
        <div className="pt-12 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Swiss Architectural Module Switcher */}
          <Reveal className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="space-y-1.5">
              <p className="font-mono text-xs uppercase tracking-wider text-white/55">
                Interactive Prototype Controls
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Tap any section below or use the floating liquid-glass dock inside the phone to test every defense engine live.
              </p>
            </div>

            <div className="border-t border-white/15 divide-y divide-white/15">
              {[
                {
                  tab: 'shield' as const,
                  num: '01',
                  title: 'Guardian Dashboard & Live Co-Pilot',
                  desc: 'Slide-to-Arm Hero Sentinel, 3 one-click Hinglish/CBI simulations over a rolling 90s Gemini window, 2×2 Pastel Bento cards, and live Threat Log.',
                },
                {
                  tab: 'warrant' as const,
                  num: '02',
                  title: 'Warrant Forensics Scanner',
                  desc: 'Tap "Scan Sample CBI Notice" (fake Section 999 BNS + RBI safe-custody UPI) or upload any image for Gemini multimodal verification.',
                },
                {
                  tab: 'hub' as const,
                  num: '03',
                  title: 'Call-Merge OTP Guard & Quick Matrix',
                  desc: 'Simulate an incoming bank SMS OTP arriving during a flagged call to see real-time 6-digit masking and Threat Log recording.',
                },
                {
                  tab: 'voice' as const,
                  num: '04',
                  title: 'Voice Stream Sentinel (Full Co-Pilot)',
                  desc: 'Expanded Fireflies-style live SpeechRecognition mic capture, waveform telemetry, and custom Hinglish/English utterance tester.',
                },
                {
                  tab: 'settings' as const,
                  num: '05',
                  title: 'Adaptive Light / Dark OLED & Permissions',
                  desc: 'Switch the phone live between Dark OLED and Light Pearl mode and toggle all 4 autonomous Android Shield permissions.',
                },
              ].map((module) => {
                const isSelected = activeTab === module.tab;
                return (
                  <button
                    key={module.tab}
                    type="button"
                    onClick={() => setActiveTab(module.tab)}
                    className={`w-full text-left py-4 px-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-transparent text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-sm sm:text-base font-semibold">
                        <span
                          className={`font-mono text-xs mr-2.5 ${
                            isSelected ? 'text-black/60' : 'text-white/45'
                          }`}
                        >
                          ({module.num})
                        </span>
                        {module.title}
                      </h3>
                      <span
                        className={`font-mono text-[10px] uppercase shrink-0 ${
                          isSelected ? 'text-black/70' : 'text-white/40'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Open'}
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed mt-2 ${
                        isSelected ? 'text-black/75' : 'text-white/65'
                      }`}
                    >
                      {module.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Clean Monochrome Live Metrics Strip */}
            <div className="grid grid-cols-3 border border-white/15 divide-x divide-white/15 bg-[#080808]">
              <div className="p-3.5">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  Risk Score
                </span>
                <span
                  className={`font-space text-xl font-bold tabular-nums mt-1 block ${
                    isAlertActive ? 'text-[#FF5C84]' : 'text-white'
                  }`}
                >
                  <CountingNumber
                    from={0}
                    target={analysis.score}
                    useGrouping={false}
                    animateFromPrevious
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                  />
                  /100
                </span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  90s Window
                </span>
                <span className="font-space text-xl font-bold tabular-nums text-white mt-1 block">
                  <CountingNumber
                    from={0}
                    target={windowTurnCount}
                    useGrouping={false}
                    animateFromPrevious
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                  />{' '}
                  turns
                </span>
              </div>
              <div className="p-3.5">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  Threat Log
                </span>
                <span className="font-space text-xl font-bold tabular-nums text-white mt-1 block">
                  <CountingNumber
                    from={0}
                    target={threatLogs.length}
                    useGrouping={false}
                    animateFromPrevious
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                  />{' '}
                  events
                </span>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Clean Hardware Phone Frame (No Blue Glows Around Phone!) */}
          <Reveal delay={0.08} className="lg:col-span-7 flex justify-center order-1 lg:order-2">
            {phoneFrame}
          </Reveal>
        </div>

        {/* Architecture & Native Android APK Callout — Clean Swiss Monochrome Card */}
        <Reveal
          delay={0.12}
          className="mt-14 lg:mt-16 border border-white/15 bg-[#0A0A0A] p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-12 h-12 shrink-0 border border-white/20 bg-black flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">
                    Architecture &amp; Native Android APK
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="font-mono text-[11px] text-[#4ADE80]">
                    100% Offline On-Device Inference
                  </span>
                </div>
                <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                  While this interactive web demo runs on the{' '}
                  <strong className="text-white">Gemini Cloud API</strong> for instant zero-install
                  browser testing, the{' '}
                  <strong className="text-white">native Satark Android APK</strong> runs{' '}
                  <span className="font-mono text-white">
                    Gemma 4 E2B (
                    <CountingNumber
                      from={0}
                      target={2.4}
                      decimals={1}
                      useGrouping={false}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                    />{' '}
                    GB)
                  </span>{' '}
                  <strong className="text-white">100% offline on-device via LiteRT-LM</strong> —
                  ensuring zero call audio or personal transcripts ever leave the user’s phone.
                </p>
              </div>
            </div>

            <a
              href={ANDROID_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-white text-black text-sm font-semibold hover:bg-[#BFBFFB] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 self-start lg:self-center"
            >
              <span>View Native Android APK on GitHub</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
