import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  FileText,
  Layers,
  Lock,
  Mic,
  MicOff,
  Monitor,
  Moon,
  PhoneIncoming,
  PhoneOff,
  Play,
  RotateCcw,
  ScanLine,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  Upload,
  Volume2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { LiquidVoiceWaveformVisual } from './BentoVisuals';
import { DEMO_SCENARIOS, STAGE_METADATA } from './demoScenarios';
import type {
  AppThemeMode,
  CallAnalysisResult,
  DemoScenario,
  PermissionItem,
  PrototypeTab,
  TranscriptTurn,
  WarrantVerdict,
} from './types';

function themeClasses(isDark: boolean) {
  return {
    textPrimary: isDark ? 'text-white' : 'text-[#110F1D]',
    textSecondary: isDark ? 'text-white/70' : 'text-[#4F4B66]',
    textMuted: isDark ? 'text-white/45' : 'text-[#7D7896]',
    glassPanel: isDark
      ? 'bg-[#0D0D14]/88 border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
      : 'bg-white/88 border-[#5C5091]/18 shadow-[0_8px_24px_rgba(59,46,120,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]',
    glassAlt: isDark
      ? 'bg-[#141320]/90 border-white/[0.10]'
      : 'bg-[#ECEAF7]/90 border-[#5C5091]/14',
  };
}

/* ============================================================================
 * TAB 2 — WARRANT FORENSICS (Port of WarrantTabPane + Real Gemini Vision)
 * ========================================================================== */
interface AndroidWarrantTabProps {
  isDark: boolean;
  previewDataUrl: string | null;
  verdict: WarrantVerdict | null;
  isScanning: boolean;
  scanError: string | null;
  onScanSampleWarrant: () => void;
  onUploadFile: (file: File) => void;
  onClearWarrant: () => void;
  onHangUp: () => void;
  onReport1930: () => void;
}

export function AndroidWarrantTab({
  isDark,
  previewDataUrl,
  verdict,
  isScanning,
  scanError,
  onScanSampleWarrant,
  onUploadFile,
  onClearWarrant,
  onHangUp,
  onReport1930,
}: AndroidWarrantTabProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = themeClasses(isDark);
  const isForged = verdict?.verdict === 'LIKELY FORGED';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      <div
        className={`rounded-[28px] p-4 backdrop-blur-xl border space-y-4 ${
          verdict && isForged
            ? isDark
              ? 'bg-[#0D0D14]/92 border-[#FF4D79]/45'
              : 'bg-white/92 border-[#D61A44]/40'
            : t.glassPanel
        }`}
      >
        {/* Header matching Android WarrantTabPane */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
              isDark
                ? 'bg-[#E6F88A]/15 border-[#E6F88A]/45 text-[#E6F88A]'
                : 'bg-[#EEF7C5] border-[#6B8A14]/30 text-[#4F6B06]'
            }`}
          >
            <FileSearch className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <h3 className={`font-display text-[16px] font-bold leading-tight ${t.textPrimary}`}>
              Warrant Forensics
            </h3>
            <p className={`text-[11px] leading-snug ${t.textSecondary}`}>
              Instant inspection of arrest notices &amp; legal seals
            </p>
          </div>
        </div>

        {/* Error banner */}
        {scanError && (
          <div className="rounded-2xl border border-[#FF4D79]/55 bg-[#D61A44]/15 px-3 py-2 text-[11px] text-[#FF8AA5] flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* IDLE STATE: Exact Sample PDF Preview Card + Acid Lime Mint Scan Pill */}
        {!isScanning && !verdict && (
          <div className="space-y-3">
            <div className={`rounded-[20px] p-3.5 border space-y-2 ${t.glassAlt}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isDark ? 'text-[#B8A4F8]' : 'text-[#3318B8]'
                    }`}
                  />
                  <span
                    className={`text-[10.5px] font-space font-bold truncate ${
                      isDark ? 'text-[#B8A4F8]' : 'text-[#3318B8]'
                    }`}
                  >
                    CBI_ARREST_ORDER_FINAL.PDF
                  </span>
                </div>
                <span className="text-[9.5px] font-space font-bold text-[#FF5C84] shrink-0">
                  WHATSAPP
                </span>
              </div>
              <p className={`text-[12px] font-display font-bold ${t.textPrimary}`}>
                NON-BAILABLE DIGITAL ARREST NOTICE
              </p>
              <p className={`text-[11px] leading-relaxed ${t.textSecondary}`}>
                Ref: CBI/CYB/2026-9941 · Section 999 BNS · RBI Safe-Custody UPI verification demanded within 20 minutes.
              </p>
            </div>

            <button
              type="button"
              onClick={onScanSampleWarrant}
              className={`w-full h-[48px] rounded-full flex items-center justify-center gap-2 text-[12.5px] font-display font-bold transition-transform active:scale-[0.98] cursor-pointer border ${
                isDark
                  ? 'bg-[#E6F88A]/20 border-[#E6F88A]/65 text-[#E6F88A] hover:bg-[#E6F88A]/30'
                  : 'bg-[#E6F88A] border-[#6B8A14]/35 text-[#050508] hover:brightness-95'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Sample CBI Notice</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-[42px] rounded-full flex items-center justify-center gap-2 text-[11.5px] font-medium border border-dashed transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/25 text-white/80 hover:bg-white/[0.06]'
                  : 'border-[#5C5091]/35 text-[#110F1D] hover:bg-[#ECEAF7]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Any Warrant / Notice Image</span>
            </button>
          </div>
        )}

        {/* SCANNING STATE: Exact Acid Lime Laser Sweep over Document Preview */}
        {isScanning && (
          <div className="space-y-3 text-center py-2">
            <div className="relative rounded-[20px] overflow-hidden border border-white/15 bg-black/70 h-[190px]">
              {previewDataUrl && (
                <img
                  src={previewDataUrl}
                  alt="Scanning notice preview"
                  className="w-full h-full object-contain bg-[#f8f5ee]/95 opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-black/35">
                <div className="absolute inset-x-3 top-0 h-full overflow-hidden">
                  <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-[#E6F88A] to-transparent shadow-[0_0_18px_#E6F88A] animate-scan-beam" />
                </div>
              </div>
            </div>
            <p className={`text-[12px] font-medium ${isDark ? 'text-[#E6F88A]' : 'text-[#536F08]'}`}>
              Analyzing typography, BNS citations &amp; seal hashes…
            </p>
            <p className={`text-[9.5px] font-space tracking-wider uppercase ${t.textMuted}`}>
              GEMINI MULTIMODAL VISION · LIVE FORENSIC CHECK
            </p>
          </div>
        )}

        {/* VERDICT STATE: Exact Crimson Forensic Verdict Card from WarrantTabPane */}
        {verdict && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            {previewDataUrl && (
              <div className="rounded-[18px] overflow-hidden border border-white/12 h-[126px] bg-[#f8f5ee]">
                <img
                  src={previewDataUrl}
                  alt="Scanned warrant thumbnail"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div
              className={`rounded-[22px] p-4 border space-y-3 ${
                isForged
                  ? 'bg-[#5E0B24]/88 border-[#FF4D79]/55 text-white'
                  : 'bg-emerald-950/85 border-emerald-400/50 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-space font-bold uppercase tracking-wider ${
                    isForged ? 'text-[#FF4D79]' : 'text-emerald-300'
                  }`}
                >
                  {isForged ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  FORENSIC VERDICT
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-space font-bold uppercase ${
                    isForged ? 'bg-[#D61A44]/65 text-white' : 'bg-emerald-500/35 text-emerald-100'
                  }`}
                >
                  {isForged ? 'HIGH RISK' : 'VERIFIED'}
                </span>
              </div>

              <div>
                <p className="font-display text-[23px] font-bold leading-none tracking-tight text-white">
                  {verdict.verdict}
                </p>
                <p className="text-[11px] text-[#FFC1CE] mt-1 font-space">
                  {verdict.confidence}% Forgery Confidence · {verdict.documentType}
                </p>
              </div>

              <p className="text-[11.5px] leading-relaxed text-white/90">{verdict.summary}</p>

              {/* Dark translucent inline flag rows matching InlineFlagItem */}
              <div className="space-y-2">
                {verdict.redFlags.slice(0, 4).map((flag, idx) => (
                  <div
                    key={idx}
                    className="rounded-[15px] bg-black/38 px-3 py-2.5 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D79] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-snug text-white/90">{flag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hang Up + Report 1930 Action Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onHangUp}
                className="h-[46px] rounded-full bg-[#D61A44] border border-[#FF4D79]/60 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#e11d48] active:scale-95 transition-all cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Hang Up</span>
              </button>
              <button
                type="button"
                onClick={onReport1930}
                className={`h-[46px] rounded-full border text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.08] border-white/20 text-[#E6F88A] hover:bg-white/15'
                    : 'bg-[#ECEAF7] border-[#5C5091]/20 text-[#536F08]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Report 1930</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClearWarrant}
              className={`w-full py-2 text-[11px] font-medium cursor-pointer ${t.textSecondary} hover:underline`}
            >
              Scan Another Notice
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * TAB 3 — HUB & CALL-MERGE OTP GUARD (Port of HubTabPane + OTP Simulator)
 * ========================================================================== */
const SAMPLE_OTPS = [
  {
    bank: 'HDFC Bank',
    sender: 'VM-HDFCBK',
    rawCode: '849207',
    amount: '₹1,85,000 via UPI Mandate',
  },
  {
    bank: 'State Bank of India',
    sender: 'AD-SBIBNK',
    rawCode: '613942',
    amount: '₹4,50,000 RTGS Beneficiary',
  },
  {
    bank: 'ICICI Bank',
    sender: 'AX-ICICIB',
    rawCode: '390518',
    amount: '₹2,10,000 NetBanking Login',
  },
];

interface AndroidHubOtpTabProps {
  isDark: boolean;
  isArmed: boolean;
  isAlert: boolean;
  enabledPermCount: number;
  onToggleDemoAlert: () => void;
  onNavigateTab: (tab: PrototypeTab) => void;
  onSimulateOtpIntercept: (payload: {
    bank: string;
    sender: string;
    rawCode: string;
    amount: string;
  }) => void;
}

export function AndroidHubOtpTab({
  isDark,
  isArmed,
  isAlert,
  enabledPermCount,
  onToggleDemoAlert,
  onNavigateTab,
  onSimulateOtpIntercept,
}: AndroidHubOtpTabProps) {
  const t = themeClasses(isDark);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [activeSms, setActiveSms] = useState<{
    bank: string;
    sender: string;
    rawCode: string;
    amount: string;
    masked: boolean;
  } | null>(null);
  const [peeking, setPeeking] = useState(false);

  const handleTriggerOtp = () => {
    const sample = SAMPLE_OTPS[sampleIndex % SAMPLE_OTPS.length];
    setSampleIndex((i) => i + 1);
    setPeeking(false);
    setActiveSms({ ...sample, masked: isArmed });
    onSimulateOtpIntercept(sample);
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Call-Merge OTP Guard Simulator Card */}
      <div className={`rounded-[28px] p-4 backdrop-blur-xl border space-y-3 ${t.glassPanel}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-display text-[16px] font-bold leading-tight ${t.textPrimary}`}>
              Call-Merge OTP Guard
            </h3>
            <p className={`text-[11px] mt-0.5 ${t.textSecondary}`}>
              Masks bank SMS OTP banners during flagged calls
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-space font-bold uppercase shrink-0 ${
              isArmed
                ? isDark
                  ? 'bg-[#4ADE80]/18 text-[#4ADE80]'
                  : 'bg-[#159947]/15 text-[#159947]'
                : 'bg-white/10 text-white/55'
            }`}
          >
            {isArmed ? 'SHIELDED' : 'PAUSED'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleTriggerOtp}
          className="w-full h-[46px] rounded-full bg-gradient-to-r from-[#C9BAFA] via-[#B8A4F8] to-[#9E87F4] text-[#050508] text-[11.5px] font-display font-bold inline-flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <BellOff className="w-3.5 h-3.5 shrink-0" />
          <span>Simulate Incoming Bank OTP</span>
        </button>

        {/* Live Intercepted SMS Notification Card */}
        <AnimatePresence mode="wait">
          {activeSms && (
            <motion.div
              key={`${activeSms.sender}-${activeSms.rawCode}`}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-[20px] p-3 border space-y-2 ${
                activeSms.masked
                  ? 'bg-[#5E0B24]/88 border-[#FF4D79]/60 text-white'
                  : 'bg-amber-950/80 border-amber-400/50 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-space font-bold">
                  <Lock className="w-3 h-3 text-[#FF4D79]" />
                  SMS · {activeSms.sender}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#D61A44] text-white text-[9px] font-space font-bold">
                  {activeSms.masked ? 'OTP MASKED' : 'EXPOSED'}
                </span>
              </div>

              <div className="rounded-xl bg-black/45 px-3 py-2 space-y-1">
                <span className="text-[10px] text-white/65 block">
                  {activeSms.bank} · {activeSms.amount}
                </span>
                <p className="text-[11.5px] font-space text-white leading-snug">
                  {activeSms.masked && !peeking ? (
                    <>
                      OTP{' '}
                      <span className="px-1.5 py-0.5 rounded bg-[#D61A44]/40 border border-[#FF4D79]/60 text-[#FFC1CE] tracking-[0.2em]">
                        ••••••
                      </span>{' '}
                      hidden while suspicious call is active.
                    </>
                  ) : (
                    <>
                      Your OTP is{' '}
                      <strong className="text-[#E6F88A] tracking-widest">{activeSms.rawCode}</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/75">
                <span className="inline-flex items-center gap-1">
                  <PhoneIncoming className="w-3 h-3 text-[#FF4D79]" />
                  Logged to Threat Log
                </span>
                {activeSms.masked && (
                  <button
                    type="button"
                    onClick={() => setPeeking((p) => !p)}
                    className="inline-flex items-center gap-1 font-space text-[#E6F88A] hover:text-white cursor-pointer"
                  >
                    {peeking ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{peeking ? 'Re-mask' : 'Peek'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Shield Matrix (exact 2x2 tiles from HubTabPane) */}
      <div className={`rounded-[28px] p-4 backdrop-blur-xl border space-y-3 ${t.glassPanel}`}>
        <div>
          <h3 className={`font-display text-[15px] font-bold ${t.textPrimary}`}>
            Quick Shield Matrix
          </h3>
          <p className={`text-[10.5px] ${t.textSecondary}`}>
            Instant shield triggers &amp; on-device safety controls
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: isAlert ? 'Exit Demo Alert' : 'Trigger Demo Alert',
              caption: isAlert ? 'ACTIVE NOW' : 'SIMULATE CALL',
              icon: AlertTriangle,
              accent: isAlert
                ? 'text-[#FF4D79]'
                : isDark
                  ? 'text-[#B8A4F8]'
                  : 'text-[#3318B8]',
              onClick: onToggleDemoAlert,
            },
            {
              label: 'Warrant Scan',
              caption: 'CBI FORENSICS',
              icon: FileSearch,
              accent: isDark ? 'text-[#E6F88A]' : 'text-[#536F08]',
              onClick: () => onNavigateTab('warrant'),
            },
            {
              label: 'Shield Access',
              caption: `${enabledPermCount}/4 ENABLED`,
              icon: ShieldCheck,
              accent: isDark ? 'text-[#4ADE80]' : 'text-[#159947]',
              onClick: () => onNavigateTab('settings'),
            },
            {
              label: 'Voice Co-Pilot',
              caption: 'LIVE 90S WINDOW',
              icon: Volume2,
              accent: t.textPrimary,
              onClick: () => onNavigateTab('voice'),
            },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.label}
                type="button"
                onClick={tile.onClick}
                className={`rounded-[20px] p-3.5 border text-left space-y-2 hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer ${t.glassAlt}`}
              >
                <Icon className={`w-5 h-5 ${tile.accent}`} />
                <div>
                  <p className={`text-[12px] font-display font-semibold leading-tight ${t.textPrimary}`}>
                    {tile.label}
                  </p>
                  <p className={`text-[9px] font-space tracking-wider mt-0.5 ${t.textMuted}`}>
                    {tile.caption}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TAB 4 — VOICE STREAM & FULL FIREFLIES-STYLE LIVE CALL CO-PILOT
 * ========================================================================== */
interface AndroidVoiceTabProps {
  isDark: boolean;
  isArmed: boolean;
  isAlert: boolean;
  analysis: CallAnalysisResult;
  isAnalyzing: boolean;
  apiError: string | null;
  turns: TranscriptTurn[];
  windowTurnCount: number;
  activeScenarioId: DemoScenario['id'] | null;
  isMicListening: boolean;
  micSupported: boolean;
  micError: string | null;
  interimTranscript: string;
  onToggleMic: () => void;
  onRunScenario: (scenario: DemoScenario) => void;
  onStopScenario: () => void;
  onSubmitCustomTurn: (text: string) => void;
  onResetSession: () => void;
}

export function AndroidVoiceTab({
  isDark,
  isArmed,
  isAlert,
  analysis,
  isAnalyzing,
  apiError,
  turns,
  windowTurnCount,
  activeScenarioId,
  isMicListening,
  micSupported,
  micError,
  interimTranscript,
  onToggleMic,
  onRunScenario,
  onStopScenario,
  onSubmitCustomTurn,
  onResetSession,
}: AndroidVoiceTabProps) {
  const t = themeClasses(isDark);
  const [customLine, setCustomLine] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns.length, interimTranscript]);

  const stageInfo = STAGE_METADATA[analysis.stage] ?? STAGE_METADATA.NOMINAL;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customLine.trim()) return;
    onSubmitCustomTurn(customLine.trim());
    setCustomLine('');
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Voice Stream Sentinel Header + Waveform (exact port of VoiceTabPane) */}
      <div
        className={`rounded-[28px] p-4 backdrop-blur-xl border space-y-3 ${
          isAlert
            ? isDark
              ? 'bg-[#240814]/82 border-[#FF4D79]/45'
              : 'bg-[#FFE8EE] border-[#D61A44]/40'
            : t.glassPanel
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-display text-[16px] font-bold leading-tight ${t.textPrimary}`}>
              Voice Stream Sentinel
            </h3>
            <p className={`text-[10.5px] ${t.textSecondary}`}>
              Fireflies-style rolling 90s coercion co-pilot
            </p>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-space font-bold uppercase shrink-0 ${
              isAlert
                ? 'bg-[#D61A44]/30 text-[#FF5C84]'
                : isDark
                  ? 'bg-[#4ADE80]/16 text-[#4ADE80]'
                  : 'bg-[#159947]/15 text-[#159947]'
            }`}
          >
            {isAlert ? 'COERCION' : isArmed ? 'LISTENING' : 'STANDBY'}
          </span>
        </div>

        <div className={`rounded-[20px] px-3 py-2 border ${t.glassAlt}`}>
          <LiquidVoiceWaveformVisual isAlert={isAlert} isDark={isDark} tall />
        </div>

        {/* Score + Stage + Forensic Reason */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-space text-[22px] font-bold tabular-nums leading-none ${
                isAlert ? 'text-[#FF5C84]' : t.textPrimary
              }`}
            >
              {analysis.score}/100
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-[9px] font-space font-bold ${stageInfo.colorClass} ${stageInfo.borderClass}`}
            >
              {stageInfo.label}
            </span>
          </div>
          {isAnalyzing && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-space text-[#E6F88A]">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Analyzing
            </span>
          )}
        </div>
        <p className={`text-[11px] leading-snug ${t.textSecondary}`}>{analysis.reason}</p>

        {/* Live Mic + 3 One-Click Judge Demos */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!isArmed}
              onClick={onToggleMic}
              title={micSupported ? 'Start live microphone transcription' : 'SpeechRecognition unavailable'}
              className={`flex-1 h-9 rounded-full text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-40 ${
                isMicListening
                  ? 'bg-[#D61A44] border-[#FF4D79] text-white'
                  : isDark
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                    : 'bg-[#110F1D] border-[#110F1D] text-white'
              }`}
            >
              {isMicListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicListening ? 'Stop Live Microphone' : 'Start Live Microphone'}</span>
            </button>
            {turns.length > 0 && (
              <button
                type="button"
                onClick={onResetSession}
                aria-label="Reset call transcript"
                className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer ${t.glassAlt} ${t.textSecondary}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {DEMO_SCENARIOS.map((scenario) => {
              const running = activeScenarioId === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={!isArmed}
                  onClick={() => (running ? onStopScenario() : onRunScenario(scenario))}
                  className={`w-full px-3 py-2 rounded-2xl border flex items-center justify-between gap-2 text-[11px] font-medium transition-all cursor-pointer disabled:opacity-40 ${
                    running
                      ? 'bg-[#D61A44]/25 border-[#FF4D79]/65 text-white'
                      : isDark
                        ? 'bg-white/[0.045] border-white/12 text-white/90 hover:bg-white/10'
                        : 'bg-[#ECEAF7] border-[#5C5091]/18 text-[#110F1D]'
                  }`}
                >
                  <span className="truncate">{scenario.label}</span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-space shrink-0">
                    {running ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-current text-[#FF4D79]" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Run</span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {(apiError || micError) && (
        <div className="rounded-2xl border border-[#FF4D79]/55 bg-[#D61A44]/15 px-3 py-2 text-[11px] text-[#FF8AA5] flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{apiError ?? micError}</span>
        </div>
      )}

      {/* Rolling 90-Second Transcript Stream */}
      <div className={`rounded-[24px] p-3.5 backdrop-blur-xl border space-y-2.5 ${t.glassPanel}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[12px] font-display font-semibold ${t.textPrimary}`}>
            Rolling Transcript
          </span>
          <span className={`text-[9.5px] font-space ${t.textMuted}`}>
            90s window · {windowTurnCount} turn{windowTurnCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="max-h-[155px] overflow-y-auto satark-phone-scroll space-y-2 pr-1">
          {turns.length === 0 && !interimTranscript ? (
            <p className={`text-[11px] text-center py-4 ${t.textMuted}`}>
              Run a simulation or speak live to watch Gemini score each turn.
            </p>
          ) : (
            <>
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`rounded-2xl px-3 py-2 border text-[11px] leading-snug ${t.glassAlt} ${t.textPrimary}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={`text-[9px] font-space font-bold uppercase ${
                        turn.speaker === 'Caller' ? 'text-[#FF5C84]' : 'text-[#B8A4F8]'
                      }`}
                    >
                      {turn.speaker}
                    </span>
                    <span className={`text-[9px] font-space ${t.textMuted}`}>
                      {new Date(turn.timestampMs).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p>{turn.text}</p>
                </div>
              ))}
              {interimTranscript && (
                <p className={`text-[11px] italic px-2 ${t.textSecondary}`}>
                  Live Mic: {interimTranscript}
                </p>
              )}
            </>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            value={customLine}
            disabled={!isArmed}
            onChange={(e) => setCustomLine(e.target.value)}
            placeholder="Type any Hinglish/English call utterance…"
            className={`flex-1 min-w-0 rounded-full px-3 py-1.5 text-[11px] border focus:outline-none ${
              isDark
                ? 'bg-black/50 border-white/15 text-white placeholder:text-white/40 focus:border-[#B8A4F8]'
                : 'bg-[#F3F2FA] border-[#5C5091]/20 text-[#110F1D] placeholder:text-[#7D7896]'
            }`}
          />
          <button
            type="submit"
            disabled={!isArmed || !customLine.trim() || isAnalyzing}
            aria-label="Send call turn"
            className="w-8 h-8 rounded-full bg-[#B8A4F8] text-[#050508] flex items-center justify-center disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Native On-Device Telemetry Lines from VoiceTabPane */}
        <div className="pt-2 border-t border-white/10 space-y-1 text-[10.5px]">
          {[
            ['Acoustic Buffer', 'On-Device RAM Ring'],
            ['NPU Inference Latency', '18 ms (INT4 Quantized)'],
            ['Native Cloud Audio', '0 KB (Zero Cloud)'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className={t.textSecondary}>{label}</span>
              <span className={`font-space font-semibold ${t.textPrimary}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * TAB 5 — SETTINGS (Port of SettingsTabPane: Apple Liquid-Glass Theme Switcher + Permissions)
 * ========================================================================== */
interface AndroidSettingsTabProps {
  isDark: boolean;
  themeMode: AppThemeMode;
  onSelectTheme: (mode: AppThemeMode) => void;
  permissions: PermissionItem[];
  onTogglePermission: (id: string) => void;
  onEnableAll: () => void;
}

export function AndroidSettingsTab({
  isDark,
  themeMode,
  onSelectTheme,
  permissions,
  onTogglePermission,
  onEnableAll,
}: AndroidSettingsTabProps) {
  const t = themeClasses(isDark);
  const allEnabled = permissions.every((p) => p.enabled);

  const permIcon = (iconType: PermissionItem['iconType']) => {
    switch (iconType) {
      case 'voice':
        return Mic;
      case 'overlay':
        return Layers;
      case 'otp':
        return Shield;
      case 'alerts':
        return Bell;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Adaptive Appearance Switcher (Light / Dark / System) */}
      <div className={`rounded-[26px] p-4 backdrop-blur-xl border space-y-3 ${t.glassPanel}`}>
        <div>
          <h3 className={`font-display text-[15px] font-bold ${t.textPrimary}`}>Appearance</h3>
          <p className={`text-[11px] ${t.textSecondary}`}>
            Switch between Light Pearl, Dark OLED, or System theme
          </p>
        </div>

        <div
          className={`relative grid grid-cols-3 p-1 rounded-full border ${
            isDark
              ? 'bg-[#161522]/90 border-white/15'
              : 'bg-[#E7E4F4] border-[#5C5091]/18'
          }`}
        >
          {(
            [
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ] as const
          ).map((mode) => {
            const Icon = mode.icon;
            const selected = themeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectTheme(mode.id)}
                className={`relative z-10 h-9 rounded-full flex items-center justify-center gap-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                  selected ? 'text-[#0B0A12]' : t.textSecondary
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="satark-theme-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-[#E9E7F4] shadow-[0_4px_12px_rgba(0,0,0,0.22)] -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Device Shield Permissions Checklist */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h3 className={`font-display text-[14.5px] font-bold ${t.textPrimary}`}>
              Device Shield Permissions
            </h3>
            <p className={`text-[10.5px] ${t.textSecondary}`}>
              Autonomous on-device call &amp; SMS protection
            </p>
          </div>
          {!allEnabled && (
            <button
              type="button"
              onClick={onEnableAll}
              className={`text-[10.5px] font-semibold cursor-pointer ${
                isDark ? 'text-[#B8A4F8]' : 'text-[#5632D6]'
              }`}
            >
              Enable All
            </button>
          )}
        </div>

        <div className="space-y-2">
          {permissions.map((perm) => {
            const Icon = permIcon(perm.iconType);
            return (
              <div
                key={perm.id}
                className={`rounded-[22px] p-3 border flex items-center gap-3 transition-colors ${
                  perm.enabled
                    ? isDark
                      ? 'bg-[#0D0D14]/90 border-[#B8A4F8]/35'
                      : 'bg-white/92 border-[#5632D6]/25'
                    : t.glassPanel
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0 ${
                    perm.enabled
                      ? isDark
                        ? 'bg-[#5632D6]/25 text-[#B8A4F8]'
                        : 'bg-[#5632D6]/14 text-[#3318B8]'
                      : `${t.glassAlt} ${t.textSecondary}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-display font-semibold truncate ${t.textPrimary}`}>
                    {perm.title}
                  </p>
                  <p className={`text-[10px] truncate ${t.textSecondary}`}>{perm.subtitle}</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={perm.enabled}
                  aria-label={`Toggle ${perm.title}`}
                  onClick={() => onTogglePermission(perm.id)}
                  className={`relative w-[44px] h-[26px] rounded-full border transition-colors shrink-0 cursor-pointer ${
                    perm.enabled
                      ? isDark
                        ? 'bg-[#B8A4F8]/85 border-white/40'
                        : 'bg-[#6B4FF0] border-white/60'
                      : isDark
                        ? 'bg-white/12 border-white/20'
                        : 'bg-[#382F63]/18 border-white/60'
                  }`}
                >
                  <span
                    className={`block w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${
                      perm.enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
