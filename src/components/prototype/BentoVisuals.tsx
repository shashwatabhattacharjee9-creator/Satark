import { motion } from 'motion/react';

/**
 * 4-dot geometric grid glyph for the center Hub dock tab (ported from FourDotGridGlyph).
 */
export function FourDotGridGlyph({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="6.2" cy="6.2" r="2.3" />
      <circle cx="13.8" cy="6.2" r="2.3" />
      <circle cx="6.2" cy="13.8" r="2.3" />
      <circle cx="13.8" cy="13.8" r="2.3" />
    </svg>
  );
}

/**
 * CARD 1 — EDGE AI ENGINE (Gemma 4):
 * Synaptic neural constellation with orbital ring & glowing core (ported from EdgeNeuralCoreAnimation).
 */
export function EdgeNeuralCoreVisual() {
  const nodes = [
    { cx: 52, cy: 14, r: 3.4, light: true },
    { cx: 92, cy: 20, r: 3.0, light: false },
    { cx: 102, cy: 42, r: 3.6, light: true },
    { cx: 74, cy: 56, r: 3.2, light: false },
    { cx: 34, cy: 50, r: 3.4, light: true },
    { cx: 24, cy: 28, r: 2.9, light: false },
  ];

  return (
    <svg viewBox="0 0 126 68" className="w-full h-[64px] overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="edgeCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="63" cy="34" r="28" fill="url(#edgeCoreGlow)" />

      {/* Outer delicate orbital ellipse */}
      <ellipse
        cx="63"
        cy="34"
        rx="44"
        ry="22"
        fill="none"
        stroke="rgba(255,255,255,0.42)"
        strokeWidth="1"
      />
      {/* Inner breathing ring */}
      <motion.circle
        cx="63"
        cy="34"
        r="15"
        fill="none"
        stroke="rgba(5,5,8,0.18)"
        strokeWidth="1"
        animate={{ r: [14, 17, 14] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Synaptic perimeter + spoke filaments */}
      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % nodes.length];
        return (
          <g key={i}>
            <line
              x1={node.cx}
              y1={node.cy}
              x2={next.cx}
              y2={next.cy}
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="0.9"
            />
            <line
              x1={node.cx}
              y1={node.cy}
              x2="63"
              y2="34"
              stroke="rgba(5,5,8,0.18)"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Orbiting synaptic nodes */}
      {nodes.map((node, i) => (
        <g key={`n-${i}`}>
          <circle cx={node.cx} cy={node.cy} r={node.r * 1.75} fill="rgba(5,5,8,0.10)" />
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.light ? '#FFFFFF' : 'rgba(5,5,8,0.82)'}
          />
        </g>
      ))}

      {/* Central crystalline core */}
      <motion.circle
        cx="63"
        cy="34"
        r="7.5"
        fill="#FFFFFF"
        animate={{ scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '63px 34px' }}
      />
      <circle cx="63" cy="34" r="3.2" fill="#050508" />
    </svg>
  );
}

/**
 * CARD 2 — OTP CALL GUARD:
 * Luminous shielded vault emblem + masked OTP pills (ported from OtpVaultShieldAnimation).
 */
export function OtpVaultShieldVisual({ isDark }: { isDark: boolean }) {
  return (
    <div className="w-full h-[64px] flex flex-col items-center justify-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-11 h-11 rounded-full bg-[#7D4CE0]/35 blur-md"
        />
        <div
          className={`relative px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
            isDark
              ? 'bg-white/[0.08] border-white/20 text-[#C4B5FA]'
              : 'bg-[#5632D6]/10 border-[#5632D6]/25 text-[#3318B8]'
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, delay: dot * 0.14, repeat: Infinity }}
              className={`w-1.5 h-1.5 rounded-full ${
                isDark ? 'bg-[#C4B5FA]' : 'bg-[#5632D6]'
              }`}
            />
          ))}
        </div>
      </div>
      <span
        className={`text-[9px] font-space tracking-widest uppercase ${
          isDark ? 'text-white/45' : 'text-[#4F4B66]'
        }`}
      >
        SHIELD ACTIVE
      </span>
    </div>
  );
}

/**
 * CARD 3 & VOICE TAB — LIQUID VOICE WAVEFORM:
 * Multi-bar acoustic waveform transitioning into Alert Crimson when coercion is detected.
 */
export function LiquidVoiceWaveformVisual({
  isAlert,
  isDark,
  tall = false,
}: {
  isAlert: boolean;
  isDark: boolean;
  tall?: boolean;
}) {
  const bars = tall
    ? [24, 42, 68, 48, 86, 62, 94, 72, 54, 88, 66, 78, 44, 60, 36, 52, 74, 40, 28]
    : [28, 52, 82, 46, 94, 64, 78, 42, 88, 56, 70, 38, 48];

  const barColor = isAlert
    ? 'from-[#FF4D79] via-[#D61A44] to-[#9D1B6A]'
    : isDark
      ? 'from-[#C4B5FA] via-[#B8A4F8] to-[#5632D6]'
      : 'from-[#6B4FF0] via-[#5632D6] to-[#3318B8]';

  return (
    <div
      className={`w-full flex items-center justify-center gap-[3.5px] ${
        tall ? 'h-[84px]' : 'h-[64px]'
      }`}
      aria-hidden="true"
    >
      {bars.map((pct, i) => (
        <motion.span
          key={i}
          className={`w-[3.5px] rounded-full bg-gradient-to-t ${barColor}`}
          animate={{
            height: [
              `${Math.max(18, pct * 0.45)}%`,
              `${isAlert ? Math.min(100, pct * 1.08) : pct}%`,
              `${Math.max(18, pct * 0.45)}%`,
            ],
          }}
          transition={{
            duration: isAlert ? 0.72 : 1.45,
            delay: i * 0.06,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * CARD 4 — WARRANT SCAN (Acid Lime Mint Card):
 * Mini legal notice wireframe with continuous dark-ink laser sweep (ported from WarrantLaserScanAnimation).
 */
export function WarrantLaserScanVisual() {
  return (
    <div className="w-full h-[64px] flex items-center justify-center" aria-hidden="true">
      <div className="relative w-[78px] h-[52px] rounded-xl bg-[#050508]/[0.10] border border-[#050508]/20 p-2 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          <span className="h-[3px] w-7 rounded-full bg-[#050508]/50" />
          <span className="w-3 h-3 rounded-full border border-[#050508]/45" />
        </div>
        <div className="space-y-1">
          <span className="block h-[2.5px] w-full rounded-full bg-[#050508]/30" />
          <span className="block h-[2.5px] w-4/5 rounded-full bg-[#050508]/25" />
          <span className="block h-[2.5px] w-3/5 rounded-full bg-[#050508]/25" />
        </div>
        {/* Sweeping laser line */}
        <motion.div
          animate={{ top: ['10%', '86%', '10%'] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-1 h-[2px] rounded-full bg-[#050508] shadow-[0_0_8px_rgba(5,5,8,0.65)]"
        />
      </div>
    </div>
  );
}
