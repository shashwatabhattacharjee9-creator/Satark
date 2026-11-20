import {
  AlertTriangle,
  ChevronRight,
  Cpu,
  FileSearch,
  FileText,
  Mic,
  MicOff,
  PhoneOff,
  Play,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Square,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import {
  EdgeNeuralCoreVisual,
  LiquidVoiceWaveformVisual,
  OtpVaultShieldVisual,
  WarrantLaserScanVisual,
} from './BentoVisuals';
import { DEMO_SCENARIOS, STAGE_METADATA } from './demoScenarios';
import type {
  CallAnalysisResult,
  DemoScenario,
  PrototypeTab,
  ThreatChannel,
  ThreatLogEntry,
  ThreatLogFilter,
  TranscriptTurn,
} from './types';

interface AndroidDashboardTabProps {
  isDark: boolean;
  isArmed: boolean;
  isAlert: boolean;
  onToggleArmed: () => void;
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
  onResetSession: () => void;
  onVerifyWarrant: () => void;
  onHangUp: () => void;
  onDismissAlert: () => void;
  onNavigateTab: (tab: PrototypeTab) => void;
  otpShieldedCount: number;
  threatLogs: ThreatLogEntry[];
  threatFilter: ThreatLogFilter;
  onSelectThreatFilter: (filter: ThreatLogFilter) => void;
  onSelectThreatEntry: (entry: ThreatLogEntry) => void;
}

function channelIcon(channel: ThreatChannel) {
  switch (channel) {
    case 'WhatsAppVideo':
      return VideoOff;
    case 'OtpCallMerge':
      return Smartphone;
    case 'VoiceCoercion':
      return Mic;
    case 'WarrantPdf':
      return FileText;
  }
}

export function AndroidDashboardTab({
  isDark,
  isArmed,
  isAlert,
  onToggleArmed,
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
  onResetSession,
  onVerifyWarrant,
  onHangUp,
  onDismissAlert,
  onNavigateTab,
  otpShieldedCount,
  threatLogs,
  threatFilter,
  onSelectThreatFilter,
  onSelectThreatEntry,
}: AndroidDashboardTabProps) {
  const [sliderDragging, setSliderDragging] = useState(false);

  const score = Math.max(0, Math.min(100, analysis.score));
  const riskFormatted = String(score).padStart(2, '0');
  const stageInfo = STAGE_METADATA[analysis.stage] ?? STAGE_METADATA.NOMINAL;

  const filteredLogs = threatLogs.filter((entry) => {
    if (threatFilter === 'blocked') return entry.status === 'blocked';
    if (threatFilter === 'flagged') return entry.status === 'flagged';
    return true;
  });

  // Exact theme palette tokens from Android Theme.kt
  const textPrimary = isDark ? 'text-white' : 'text-[#110F1D]';
  const textSecondary = isDark ? 'text-white/70' : 'text-[#4F4B66]';
  const textMuted = isDark ? 'text-white/45' : 'text-[#7D7896]';
  const glassCardClass = isDark
    ? 'bg-[#0D0D14]/88 border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
    : 'bg-white/85 border-[#5C5091]/18 shadow-[0_8px_24px_rgba(59,46,120,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]';

  return (
    <div className="space-y-4 pb-6">
      {/* 1. LIVE CALL INTERCEPTION ALERT BANNER (exact port of ThreatInterceptionCard) */}
      <AnimatePresence>
        {isAlert && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.24 }}
            className="rounded-[26px] p-4 bg-[#5E0B24]/88 backdrop-blur-xl border border-[#FF4D79]/45 shadow-[0_14px_38px_rgba(214,26,68,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4D79] animate-ping" />
              <span className="text-[10px] font-space font-bold tracking-[0.09em] uppercase text-[#FFC1CE]">
                LIVE CALL INTERCEPTION · {riskFormatted}% RISK
              </span>
            </div>

            <div className="flex items-start gap-2">
              <AlertTriangle className="w-[18px] h-[18px] text-white shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[13.5px] font-display font-bold tracking-tight text-white leading-snug">
                  DIGITAL ARREST SCAM DETECTED
                </p>
                <p className="text-[11px] text-[#FFD4DE] leading-snug mt-0.5">
                  {analysis.reason || 'No agency arrests over video call'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5 pt-1">
              <button
                type="button"
                onClick={onVerifyWarrant}
                className="col-span-5 h-9 rounded-full bg-white/95 text-[#050508] text-[11px] font-bold hover:bg-white transition-transform active:scale-95 cursor-pointer"
              >
                Verify Warrant
              </button>
              <button
                type="button"
                onClick={onHangUp}
                className="col-span-4 h-9 rounded-full bg-[#D61A44] border border-[#FF4D79]/60 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 hover:bg-[#e11d48] transition-transform active:scale-95 cursor-pointer"
              >
                <PhoneOff className="w-3 h-3" />
                <span>Hang Up</span>
              </button>
              <button
                type="button"
                onClick={onDismissAlert}
                className="col-span-3 h-9 rounded-full bg-black/45 border border-white/20 text-white text-[11px] font-medium hover:bg-black/60 transition-transform active:scale-95 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SENTINEL CARD (exact port of HeroSentinelCard + tactile Slide-to-Arm slider) */}
      <div
        className={`rounded-[28px] p-4 backdrop-blur-xl border transition-all duration-300 ${
          isAlert
            ? isDark
              ? 'bg-[#240814]/82 border-[#FF4D79]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
              : 'bg-[#FFE8EE]/90 border-[#D61A44]/35'
            : isDark
              ? 'bg-[#141222]/78 border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
              : 'bg-white/88 border-[#5C5091]/18 shadow-[0_8px_24px_rgba(59,46,120,0.08)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-space font-semibold tracking-[0.11em] uppercase ${textSecondary}`}>
            ACOUSTIC &amp; CALL SENTINEL
          </span>
          <span
            className={`font-space text-[17px] font-bold tabular-nums ${
              isAlert
                ? isDark
                  ? 'text-[#FF5C84]'
                  : 'text-[#D61A44]'
                : textPrimary
            }`}
          >
            {riskFormatted}% {isAlert ? 'THREAT' : 'RISK'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className={`font-display text-[17px] font-semibold tracking-tight ${textPrimary}`}>
            {isAlert
              ? 'Coercion Pattern Flagged'
              : isArmed
                ? 'Protected by Gemma 4'
                : 'Sentinel on Standby'}
          </p>
          <span
            className={`px-2 py-0.5 rounded-full border text-[9px] font-space font-bold tracking-wider shrink-0 ${stageInfo.colorClass} ${stageInfo.borderClass}`}
          >
            {stageInfo.label}
          </span>
        </div>

        {/* Tactile Liquid-Glass "Guardian Armed / Slide to Arm" Pill Slider */}
        <button
          type="button"
          role="switch"
          aria-checked={isArmed}
          onMouseDown={() => setSliderDragging(true)}
          onMouseUp={() => setSliderDragging(false)}
          onMouseLeave={() => setSliderDragging(false)}
          onClick={onToggleArmed}
          className={`mt-3.5 relative w-full h-[46px] rounded-full border flex items-center justify-center px-1.5 transition-all cursor-pointer overflow-hidden ${
            isArmed
              ? isDark
                ? 'bg-[#191826]/90 border-white/25'
                : 'bg-[#E7E4F4]/90 border-[#5C5091]/25'
              : isDark
                ? 'bg-white/[0.06] border-white/15'
                : 'bg-[#ECEAF7] border-[#5C5091]/20'
          }`}
        >
          {/* Sliding Frosted Pearl Circular Knob */}
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={`absolute top-[4px] h-[36px] w-[36px] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-white to-[#E9E7F4] text-[#0B0A12] ${
              isArmed ? 'right-[4px]' : 'left-[4px]'
            } ${sliderDragging ? 'scale-95' : ''}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isArmed ? 'rotate-180' : ''}`} />
          </motion.span>

          <span className={`text-[13px] font-display font-semibold ${textPrimary}`}>
            {isArmed ? 'Guardian Armed' : 'Slide to Arm'}
          </span>

          {!isArmed && (
            <span className={`absolute right-3.5 flex items-center ${textMuted}`}>
              <ChevronRight className="w-3.5 h-3.5 -mr-1.5 opacity-55" />
              <ChevronRight className="w-3.5 h-3.5 opacity-85" />
            </span>
          )}
        </button>
      </div>

      {/* 3. FIREFLIES-STYLE LIVE CALL CO-PILOT CARD (Preserved newly added feature!) */}
      <div className={`rounded-[24px] p-3.5 backdrop-blur-xl border space-y-2.5 ${glassCardClass}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#B8A4F8]' : 'text-[#5632D6]'}`} />
            <span className={`text-[12px] font-display font-semibold truncate ${textPrimary}`}>
              Live Call Co-Pilot
            </span>
            {isAnalyzing && (
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-space ${isDark ? 'text-[#E6F88A]' : 'text-[#536F08]'}`}>
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                Scoring
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={!isArmed}
              onClick={onToggleMic}
              title={micSupported ? 'Live Web Speech mic capture' : 'SpeechRecognition unavailable'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer disabled:opacity-40 ${
                isMicListening
                  ? 'bg-[#D61A44]/25 border-[#FF4D79]/60 text-[#FF8AA5]'
                  : isDark
                    ? 'bg-white/[0.08] border-white/15 text-white hover:bg-white/15'
                    : 'bg-[#5632D6]/10 border-[#5632D6]/25 text-[#3318B8]'
              }`}
            >
              {isMicListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              <span>{isMicListening ? 'Stop' : 'Mic'}</span>
            </button>
            {turns.length > 0 && (
              <button
                type="button"
                onClick={onResetSession}
                aria-label="Reset transcript"
                className={`w-6 h-6 rounded-full flex items-center justify-center border cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.07] border-white/15 text-white/70 hover:text-white'
                    : 'bg-[#ECEAF7] border-[#5C5091]/20 text-[#4F4B66]'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 3 One-Click Judge Simulation Pills */}
        <div className="flex flex-wrap gap-1.5">
          {DEMO_SCENARIOS.map((scenario) => {
            const running = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                disabled={!isArmed}
                onClick={() => (running ? onStopScenario() : onRunScenario(scenario))}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer disabled:opacity-40 ${
                  running
                    ? 'bg-[#D61A44]/25 border-[#FF4D79]/65 text-white'
                    : isDark
                      ? 'bg-white/[0.06] border-white/12 text-white/90 hover:bg-[#B8A4F8]/20 hover:border-[#B8A4F8]/50'
                      : 'bg-[#ECEAF7] border-[#5C5091]/20 text-[#110F1D] hover:bg-[#E5DFFF]'
                }`}
              >
                {running ? (
                  <Square className="w-2.5 h-2.5 fill-current text-[#FF4D79]" />
                ) : (
                  <Play className="w-2.5 h-2.5 fill-current" />
                )}
                <span>{scenario.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Live Error Banner if Gemini / Mic returns an error */}
        {(apiError || micError) && (
          <div className="rounded-2xl bg-[#D61A44]/15 border border-[#FF4D79]/50 px-2.5 py-2 text-[10.5px] text-[#FF8AA5] flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{apiError ?? micError}</span>
          </div>
        )}

        {/* Latest Forensic Reason + Rolling 90s Transcript Preview */}
        <div
          className={`rounded-2xl p-2.5 border space-y-1.5 ${
            isDark ? 'bg-black/45 border-white/[0.08]' : 'bg-[#F3F2FA] border-[#5C5091]/12'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[9.5px] font-space uppercase tracking-wider ${textMuted}`}>
              90s Rolling Window · {windowTurnCount} turn{windowTurnCount === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('voice')}
              className={`text-[10px] font-semibold cursor-pointer ${
                isDark ? 'text-[#B8A4F8] hover:text-white' : 'text-[#5632D6]'
              }`}
            >
              Full Co-Pilot →
            </button>
          </div>

          <p className={`text-[11px] leading-snug ${textSecondary}`}>
            {analysis.reason}
          </p>

          {(turns.length > 0 || interimTranscript) && (
            <div className="pt-1.5 border-t border-white/10 space-y-1 max-h-[82px] overflow-y-auto satark-phone-scroll">
              {turns.slice(-2).map((turn) => (
                <p key={turn.id} className={`text-[10.5px] leading-snug ${textPrimary}`}>
                  <span
                    className={`font-space font-bold uppercase text-[9px] mr-1.5 ${
                      turn.speaker === 'Caller' ? 'text-[#FF5C84]' : 'text-[#B8A4F8]'
                    }`}
                  >
                    {turn.speaker}:
                  </span>
                  {turn.text}
                </p>
              ))}
              {interimTranscript && (
                <p className={`text-[10.5px] italic ${textSecondary}`}>
                  Live Mic: {interimTranscript}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. SIGNATURE 2x2 PASTEL & LIQUID-GLASS BENTO GRID (exact port of BentoGuardianGrid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Pastel Lavender — Edge AI Engine */}
        <button
          type="button"
          onClick={() => onNavigateTab('settings')}
          className="h-[192px] rounded-[26px] p-3.5 text-left flex flex-col justify-between bg-gradient-to-br from-[#C9BAFA] via-[#B8A4F8] to-[#9E87F4] border border-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:brightness-[1.03] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[11.5px] font-display font-bold text-[#050508] leading-tight">
                Edge AI Engine
              </p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-white/35 text-[8.5px] font-space font-bold tracking-wider text-[#050508]">
                READY
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/35 flex items-center justify-center text-[#050508] shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </span>
          </div>

          <EdgeNeuralCoreVisual />

          <div>
            <p className="font-display text-[15px] font-bold text-[#050508] leading-tight">
              Gemma 4
            </p>
            <p className="text-[9px] font-space font-semibold tracking-wider text-[#050508]/65">
              2.4GB LOCAL
            </p>
          </div>
        </button>

        {/* Card 2: Liquid Glass — OTP Call Guard */}
        <button
          type="button"
          onClick={() => onNavigateTab('hub')}
          className={`h-[192px] rounded-[26px] p-3.5 text-left flex flex-col justify-between backdrop-blur-xl border hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${glassCardClass}`}
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className={`text-[11.5px] font-display font-bold leading-tight ${textPrimary}`}>
                OTP Call Guard
              </p>
              <span
                className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-space font-bold tracking-wider ${
                  isDark ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-[#159947]/15 text-[#159947]'
                }`}
              >
                ARMED
              </span>
            </div>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#5632D6]/25 text-[#C4B5FA]' : 'bg-[#5632D6]/12 text-[#3318B8]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </span>
          </div>

          <OtpVaultShieldVisual isDark={isDark} />

          <div>
            <p className={`font-display text-[15px] font-bold leading-tight ${textPrimary}`}>
              {otpShieldedCount > 0 ? `${otpShieldedCount} Shielded` : '0 Exposed'}
            </p>
            <p className={`text-[9px] font-space font-semibold tracking-wider ${textMuted}`}>
              SMS SHIELDED
            </p>
          </div>
        </button>

        {/* Card 3: Liquid Glass — Voice Stream */}
        <button
          type="button"
          onClick={() => onNavigateTab('voice')}
          className={`h-[192px] rounded-[26px] p-3.5 text-left flex flex-col justify-between backdrop-blur-xl border hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${
            isAlert
              ? isDark
                ? 'bg-[#240814]/80 border-[#FF4D79]/45'
                : 'bg-[#FFE8EE] border-[#D61A44]/35'
              : glassCardClass
          }`}
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className={`text-[11.5px] font-display font-bold leading-tight ${textPrimary}`}>
                Voice Stream
              </p>
              <span
                className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-space font-bold tracking-wider ${
                  isAlert
                    ? 'bg-[#D61A44]/30 text-[#FF8AA5]'
                    : isDark
                      ? 'bg-white/10 text-white/75'
                      : 'bg-[#5632D6]/12 text-[#3318B8]'
                }`}
              >
                {isAlert ? 'COERCION' : 'OFFLINE'}
              </span>
            </div>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isAlert
                  ? 'bg-[#D61A44]/25 text-[#FF5C84]'
                  : isDark
                    ? 'bg-white/10 text-white/80'
                    : 'bg-[#5632D6]/12 text-[#3318B8]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </span>
          </div>

          <LiquidVoiceWaveformVisual isAlert={isAlert} isDark={isDark} />

          <div>
            <p className={`font-display text-[15px] font-bold leading-tight ${textPrimary}`}>
              {isAlert ? 'Flagged' : 'Listening'}
            </p>
            <p className={`text-[9px] font-space font-semibold tracking-wider ${textMuted}`}>
              ZERO CLOUD
            </p>
          </div>
        </button>

        {/* Card 4: Acid Lime Mint — Warrant Scan */}
        <button
          type="button"
          onClick={() => onNavigateTab('warrant')}
          className="h-[192px] rounded-[26px] p-3.5 text-left flex flex-col justify-between bg-gradient-to-br from-[#F0FCA9] via-[#E6F88A] to-[#D5EA65] border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:brightness-[1.03] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[11.5px] font-display font-bold text-[#050508] leading-tight">
                Warrant Scan
              </p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-[#050508]/12 text-[8.5px] font-space font-bold tracking-wider text-[#050508]">
                INSTANT
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-[#050508]/12 flex items-center justify-center text-[#050508] shrink-0">
              <FileSearch className="w-3.5 h-3.5" />
            </span>
          </div>

          <WarrantLaserScanVisual />

          <div>
            <p className="font-display text-[15px] font-bold text-[#050508] leading-tight">
              Verify
            </p>
            <p className="text-[9px] font-space font-semibold tracking-wider text-[#050508]/65">
              TAP TO SCAN
            </p>
          </div>
        </button>
      </div>

      {/* 5. THREAT LOG SECTION (exact port of ThreatLogSection.kt) */}
      <div className="pt-1 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className={`font-display text-[15px] font-bold leading-tight ${textPrimary}`}>
              Threat Log
            </h3>
            <p className={`text-[10.5px] ${textSecondary}`}>
              Recent on-device scam interceptions
            </p>
          </div>

          {/* All / Blocked / Flagged Pill Filter */}
          <div
            className={`inline-flex items-center rounded-full p-0.5 border ${
              isDark ? 'bg-white/[0.06] border-white/12' : 'bg-[#E7E4F4] border-[#5C5091]/15'
            }`}
          >
            {(['all', 'blocked', 'flagged'] as const).map((filter) => {
              const selected = threatFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onSelectThreatFilter(filter)}
                  className={`px-2.5 py-1 rounded-full text-[9.5px] font-semibold capitalize transition-all cursor-pointer ${
                    selected
                      ? isDark
                        ? 'bg-white/15 text-white'
                        : 'bg-white text-[#110F1D] shadow-xs'
                      : textMuted
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className={`rounded-[22px] p-4 text-center border text-[11px] ${glassCardClass} ${textSecondary}`}>
            No interceptions in this filter
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((entry) => {
              const Icon = channelIcon(entry.channel);
              const isBlocked = entry.status === 'blocked';
              const statusColor = isBlocked
                ? isDark
                  ? '#4ADE80'
                  : '#159947'
                : isDark
                  ? '#FF5C84'
                  : '#D61A44';

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelectThreatEntry(entry)}
                  className={`w-full rounded-[20px] p-3 border text-left flex items-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${glassCardClass}`}
                >
                  <div
                    className="w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${statusColor}1F`,
                      borderColor: `${statusColor}38`,
                      color: isBlocked ? (isDark ? '#B8A4F8' : '#3318B8') : statusColor,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] font-display font-semibold truncate ${textPrimary}`}>
                      {entry.title}
                    </p>
                    <p className={`text-[10.5px] truncate ${textSecondary}`}>
                      {entry.source}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border"
                      style={{
                        backgroundColor: `${statusColor}20`,
                        borderColor: `${statusColor}4D`,
                        color: statusColor,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      {isBlocked ? 'Blocked' : 'Flagged'}
                    </span>
                    <span className={`text-[9.5px] font-space ${textMuted}`}>
                      {entry.timestampLabel ??
                        new Date(entry.timestampMs).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
