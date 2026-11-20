import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  INDIA_CORRIDORS,
  PRIVACY_MATRIX_MODES,
  type IndiaCorridor,
} from '../data/landingData';
import { EASE_ARCHITECTURAL, Reveal } from './MotionPrimitives';
import { CornerMark } from './Primitives';
import { AnimatedMetricText, CountingNumber } from './ui/counting-number';

/**
 * Accurate geographic (longitude, latitude) waypoints tracing the official
 * Survey of India international mainland boundary, including Jammu & Kashmir,
 * Ladakh, Gujarat's Kutch & Saurashtra peninsulas, Sikkim, and the Seven Sisters.
 */
const INDIA_MAINLAND_LONLAT: Array<[number, number]> = [
  // Jammu & Kashmir + Ladakh crown
  [73.8, 33.2],
  [73.5, 34.1],
  [72.65, 35.35],
  [72.5, 36.35],
  [73.4, 36.9],
  [74.8, 37.06],
  [75.95, 36.82],
  [76.9, 35.95],
  [78.0, 35.5],
  [79.5, 35.8],
  [79.95, 35.15],
  [79.55, 34.1],
  [78.9, 33.15],
  [79.1, 32.35],
  // Himachal Pradesh & Uttarakhand
  [78.6, 31.8],
  [79.0, 31.1],
  [80.1, 30.5],
  [80.95, 30.18],
  // Uttarakhand -> UP -> Bihar (Nepal border)
  [80.1, 29.0],
  [80.2, 28.42],
  [81.35, 28.1],
  [83.0, 27.45],
  [84.55, 27.32],
  [86.5, 26.52],
  [88.08, 26.48],
  // Sikkim
  [88.04, 27.2],
  [88.16, 27.96],
  [88.86, 28.0],
  [88.94, 27.35],
  // North Bengal & Western Assam (Bhutan border)
  [88.92, 27.08],
  [89.8, 26.74],
  [91.48, 26.82],
  [92.06, 27.0],
  // Arunachal Pradesh
  [91.72, 27.72],
  [92.6, 28.02],
  [94.0, 28.82],
  [95.3, 29.26],
  [96.22, 29.3],
  [97.36, 28.22],
  [97.12, 27.3],
  [96.0, 26.92],
  // Nagaland, Manipur, Mizoram, Tripura
  [95.12, 26.02],
  [94.7, 24.92],
  [94.15, 23.92],
  [93.3, 23.82],
  [93.15, 22.05],
  [92.65, 21.98],
  [92.35, 23.48],
  [92.15, 24.22],
  [91.52, 22.95],
  [91.2, 23.72],
  [91.78, 24.48],
  [92.32, 25.02],
  // Meghalaya & Bangladesh border -> Siliguri corridor -> Sundarbans
  [91.3, 25.16],
  [89.88, 25.24],
  [89.82, 26.08],
  [88.92, 26.35],
  [88.18, 26.14],
  [88.42, 25.42],
  [88.88, 24.78],
  [88.68, 24.08],
  [88.98, 22.82],
  [89.04, 21.65],
  // East Coast: West Bengal -> Odisha -> Andhra Pradesh -> Tamil Nadu -> Kanyakumari
  [88.1, 21.65],
  [87.1, 21.52],
  [86.95, 20.72],
  [85.82, 19.8],
  [84.78, 19.12],
  [83.32, 17.72],
  [82.3, 16.95],
  [81.1, 16.0],
  [80.12, 15.1],
  [80.15, 13.7],
  [80.28, 13.08],
  [79.85, 11.9],
  [79.86, 10.3],
  [79.32, 10.2],
  [79.12, 9.28],
  [78.15, 8.8],
  [77.55, 8.08],
  // West Coast: Kerala -> Karnataka -> Goa -> Maharashtra -> Gulf of Khambhat
  [76.9, 8.45],
  [76.25, 9.95],
  [75.75, 11.25],
  [74.85, 12.88],
  [74.35, 14.6],
  [73.82, 15.4],
  [73.3, 17.0],
  [72.85, 19.08],
  [72.75, 20.5],
  [72.8, 21.2],
  [72.6, 21.75],
  // Gujarat: Saurashtra Peninsula -> Gulf of Kutch -> Rann of Kutch
  [72.2, 21.6],
  [71.5, 20.8],
  [70.35, 20.9],
  [69.6, 21.65],
  [68.98, 22.25],
  [69.8, 22.52],
  [70.32, 22.86],
  [69.5, 22.86],
  [68.85, 23.25],
  [68.18, 23.75],
  [68.8, 24.35],
  [70.1, 24.65],
  // Rajasthan & Punjab western border
  [71.0, 24.75],
  [70.2, 25.7],
  [69.55, 26.95],
  [70.5, 27.9],
  [72.0, 28.45],
  [73.3, 29.45],
  [73.9, 30.2],
  [74.6, 31.1],
  [74.8, 31.72],
  [74.6, 32.5],
];

const ANDAMAN_NICOBAR_LONLAT: Array<[number, number]> = [
  [92.96, 13.42],
  [92.9, 13.02],
  [92.86, 12.58],
  [92.8, 12.14],
  [92.72, 11.68],
  [92.54, 10.75],
  [92.78, 9.18],
  [93.36, 8.22],
  [93.62, 7.62],
  [93.84, 7.04],
];

const LAKSHADWEEP_LONLAT: Array<[number, number]> = [
  [72.72, 11.62],
  [72.64, 10.88],
  [72.78, 10.12],
  [73.04, 8.28],
];

const MAP_SCALE = 14.2;
const MAP_LON_COS = 0.924; // cos(22.5 deg) for true aspect ratio across India

function projectLonLat(lon: number, lat: number): [number, number] {
  const x = 32 + (lon - 68.0) * MAP_SCALE * MAP_LON_COS;
  const y = 490 - (lat - 6.5) * MAP_SCALE;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

const INDIA_PROJECTED_POLYGON: Array<[number, number]> =
  INDIA_MAINLAND_LONLAT.map(([lon, lat]) => projectLonLat(lon, lat));

const INDIA_OUTLINE_PATH =
  INDIA_PROJECTED_POLYGON.map(
    ([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`
  ).join(' ') + ' Z';

const ISLAND_POINTS = [
  ...ANDAMAN_NICOBAR_LONLAT.map(([lon, lat]) => ({
    coords: projectLonLat(lon, lat),
    corridor: 'south',
  })),
  ...LAKSHADWEEP_LONLAT.map(([lon, lat]) => ({
    coords: projectLonLat(lon, lat),
    corridor: 'south',
  })),
];

function pointInPolygon(x: number, y: number, poly: Array<[number, number]>) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function generateIndiaDots(): Array<{ x: number; y: number; corridor: string }> {
  const dots: Array<{ x: number; y: number; corridor: string }> = [];
  const step = 6.8;

  for (let y = 52; y <= 474; y += step) {
    for (let x = 30; x <= 424; x += step) {
      if (pointInPolygon(x, y, INDIA_PROJECTED_POLYGON)) {
        // Geographic corridor clustering matching real Indian regions
        let corridor = 'north';
        if (y > 335) {
          corridor = 'south';
        } else if (x > 252) {
          corridor = 'east';
        } else if (x < 168 && y >= 232) {
          corridor = 'west';
        }
        dots.push({
          x: Number(x.toFixed(1)),
          y: Number(y.toFixed(1)),
          corridor,
        });
      }
    }
  }
  return dots;
}

const HUB_CODES: Record<string, string> = {
  north: 'DEL',
  west: 'BOM',
  south: 'BLR',
  east: 'CCU',
};

function ShieldNodeGlyph({ lit, accent }: { lit: boolean; accent: boolean }) {
  const fill = !lit ? '#42424C' : accent ? '#BFBFFB' : '#FFFFFF';
  return (
    <svg
      viewBox="0 0 16 30"
      aria-hidden="true"
      className="w-3 h-6 sm:w-4 sm:h-[30px] transition-colors duration-200"
    >
      <circle cx="8" cy="4.5" r="3" fill={fill} />
      <path
        d="M3.2 11.2C3.2 9.6 4.5 8.5 6.2 8.5H9.8C11.5 8.5 12.8 9.6 12.8 11.2V18.2H10.9V28H8.6V19.6H7.4V28H5.1V18.2H3.2V11.2Z"
        fill={fill}
      />
    </svg>
  );
}

export function GlobalNetworkSection() {
  const [selectedCorridor, setSelectedCorridor] = useState<IndiaCorridor>(
    INDIA_CORRIDORS[0]
  );
  const [matrixModeId, setMatrixModeId] = useState(PRIVACY_MATRIX_MODES[0].id);
  const prefersReduced = useReducedMotion();

  const indiaDots = useMemo(() => generateIndiaDots(), []);
  const activeMatrix =
    PRIVACY_MATRIX_MODES.find((m) => m.id === matrixModeId) ??
    PRIVACY_MATRIX_MODES[0];

  return (
    <section
      id="network"
      className="relative bg-black text-white border-b border-white/10 overflow-hidden"
    >
      {/* Part 1: Slide 1 Layout — India Fraud Corridors Dotted Map */}
      <div className="relative bg-brand-aura-right">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-45" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-28 pb-14 sm:pb-16 lg:pb-24">
          {/* Header Row */}
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div>
              <p className="font-mono text-xs text-[#BFBFFB] mb-3">
                [India Call-Scam Protection Corridors]
              </p>
              <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.08] text-[clamp(1.85rem,4vw,3.35rem)] text-white">
                Built for India&apos;s Live Call Landscape
              </h2>
            </div>

            {/* Corridor Selector Buttons */}
            <div
              role="tablist"
              aria-label="India regional protection corridors"
              className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5"
            >
              {INDIA_CORRIDORS.map((corridor) => {
                const isSelected = corridor.id === selectedCorridor.id;
                return (
                  <button
                    key={corridor.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCorridor(corridor)}
                    className={`min-h-[42px] sm:min-h-0 px-3.5 py-2 text-xs font-medium border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-black/50 text-white/80 border-white/20 hover:border-white/50 hover:text-white'
                    }`}
                  >
                    {corridor.name}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Interactive Dotted India Map Canvas */}
          <Reveal
            delay={0.08}
            className="relative border border-white/15 bg-black/55 backdrop-blur-[2px] p-4 sm:p-6 lg:p-8"
          >
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left contextual threat vector note on desktop */}
              <div className="hidden lg:flex lg:col-span-3 flex-col justify-between h-full py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`left-${selectedCorridor.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: EASE_ARCHITECTURAL }}
                    className="space-y-4"
                  >
                    <p className="font-mono text-xs text-[#BFBFFB]">
                      {selectedCorridor.code} · Primary Vector
                    </p>
                    <h3 className="font-display text-xl font-semibold text-white leading-snug">
                      {selectedCorridor.scamVector}
                    </h3>
                    <p className="text-xs text-white/75 leading-relaxed">
                      {selectedCorridor.summary}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-6 border-t border-white/15">
                  <p className="font-mono text-[11px] text-white/55 mb-1">
                    Active Guardrail
                  </p>
                  <p className="text-xs font-medium text-[#BFBFFB]">
                    {selectedCorridor.protectionMode}
                  </p>
                </div>
              </div>

              {/* Centerpiece Cartographically Accurate India Map SVG */}
              <div className="lg:col-span-6 relative w-full max-w-[440px] mx-auto aspect-[460/510]">
                <svg
                  viewBox="0 0 460 510"
                  className="w-full h-full"
                  role="img"
                  aria-label="Cartographically accurate dotted map of India highlighting Satark Live protection corridors"
                >
                  <defs>
                    <radialGradient id="indiaGlow" cx="50%" cy="46%" r="54%">
                      <stop offset="0%" stopColor="#0000EE" stopOpacity="0.32" />
                      <stop offset="65%" stopColor="#0000B3" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Soft interior glow clipped to true India silhouette */}
                  <path
                    d={INDIA_OUTLINE_PATH}
                    fill="url(#indiaGlow)"
                    stroke="rgba(191, 191, 251, 0.42)"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />

                  {/* High-density precision dot matrix inside India boundary */}
                  {indiaDots.map((dot, idx) => {
                    const isActiveCorridor = dot.corridor === selectedCorridor.id;
                    return (
                      <circle
                        key={idx}
                        cx={dot.x}
                        cy={dot.y}
                        r={isActiveCorridor ? 1.85 : 1.3}
                        fill={
                          isActiveCorridor
                            ? '#BFBFFB'
                            : 'rgba(255, 255, 255, 0.36)'
                        }
                        className="transition-colors duration-200"
                      />
                    );
                  })}

                  {/* Lakshadweep & Andaman and Nicobar Islands */}
                  {ISLAND_POINTS.map((island, idx) => {
                    const active = island.corridor === selectedCorridor.id;
                    return (
                      <circle
                        key={`isl-${idx}`}
                        cx={island.coords[0]}
                        cy={island.coords[1]}
                        r={active ? 2.1 : 1.65}
                        fill={active ? '#BFBFFB' : 'rgba(255, 255, 255, 0.45)'}
                      />
                    );
                  })}

                  {/* Inter-corridor arcs connecting DEL, BOM, BLR, CCU */}
                  <path
                    d="M153 176 Q 116 238 96 311"
                    fill="none"
                    stroke="rgba(191,191,251,0.42)"
                    strokeWidth="1.15"
                    strokeDasharray="3.5 3.5"
                  />
                  <path
                    d="M153 176 Q 232 204 299 262"
                    fill="none"
                    stroke="rgba(191,191,251,0.42)"
                    strokeWidth="1.15"
                    strokeDasharray="3.5 3.5"
                  />
                  <path
                    d="M96 311 Q 124 360 158 398"
                    fill="none"
                    stroke="rgba(191,191,251,0.42)"
                    strokeWidth="1.15"
                    strokeDasharray="3.5 3.5"
                  />
                  <path
                    d="M158 398 Q 236 340 299 262"
                    fill="none"
                    stroke="rgba(191,191,251,0.34)"
                    strokeWidth="1.15"
                    strokeDasharray="3.5 3.5"
                  />

                  {/* Interactive Metro Hub Pins at Exact Geographic Coordinates */}
                  {INDIA_CORRIDORS.map((corridor) => {
                    const active = corridor.id === selectedCorridor.id;
                    const labelOffsetX =
                      corridor.id === 'west' ? -34 : 13;
                    const labelOffsetY = corridor.id === 'south' ? 16 : 4;
                    return (
                      <g
                        key={corridor.id}
                        onClick={() => setSelectedCorridor(corridor)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${corridor.name} corridor`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCorridor(corridor);
                          }
                        }}
                      >
                        <circle
                          cx={corridor.x}
                          cy={corridor.y}
                          r="24"
                          fill="transparent"
                        />
                        {active && (
                          <circle
                            cx={corridor.x}
                            cy={corridor.y}
                            r="15"
                            fill="rgba(0, 0, 238, 0.45)"
                            stroke="#BFBFFB"
                            strokeWidth="1.25"
                          />
                        )}
                        <circle
                          cx={corridor.x}
                          cy={corridor.y}
                          r={active ? 5.5 : 4.2}
                          fill={active ? '#FFFFFF' : '#0000EE'}
                          stroke="#FFFFFF"
                          strokeWidth={active ? 1.8 : 1.3}
                        />
                        <text
                          x={corridor.x + labelOffsetX}
                          y={corridor.y + labelOffsetY}
                          fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.75)'}
                          fontSize="10"
                          fontFamily="IBM Plex Mono, monospace"
                          fontWeight={active ? '600' : '400'}
                        >
                          {HUB_CODES[corridor.id]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Right Selected Hub Info Card (desktop) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col justify-between h-full py-2">
                <div className="bg-black/85 border border-white/20 p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-mono text-xs text-[#BFBFFB]">
                      {selectedCorridor.name}
                    </span>
                    <CornerMark variant="light" position="top-right" />
                  </div>
                  <p className="font-display text-sm font-semibold text-white">
                    {selectedCorridor.hub}
                  </p>
                  <p className="mt-2 text-xs text-white/75 leading-relaxed">
                    Designed for expanding Indian languages, bank UPI SDK integration, and linked parent Family Shield alerts.
                  </p>
                </div>

                <div className="pt-6 font-mono text-xs text-white/60">
                  <span>Helpline 1930 · I4C · NPCI Ready</span>
                </div>
              </div>
            </div>

            {/* Bottom Map Telemetry Strip matching Slide 1 */}
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-end">
              <div className="md:col-span-7 space-y-1.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`info-${selectedCorridor.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: EASE_ARCHITECTURAL }}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#BFBFFB]">
                      <span>{selectedCorridor.hub}</span>
                      <span aria-hidden="true" className="text-white/35">
                        ·
                      </span>
                      <span>{selectedCorridor.scamVector}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-white/80 max-w-xl leading-relaxed">
                      {selectedCorridor.protectionMode} — {selectedCorridor.summary}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide 1 Signature Right KPI Box with Candlestick Glyph */}
              <div className="md:col-span-5 flex items-center justify-between gap-4 sm:gap-6 bg-white/[0.06] border border-white/20 px-5 sm:px-6 py-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  className="shrink-0 text-white"
                >
                  <line
                    x1="10"
                    y1="4"
                    x2="10"
                    y2="28"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="7"
                    y="10"
                    width="6"
                    height="12"
                    fill="#000000"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="22"
                    y1="6"
                    x2="22"
                    y2="26"
                    stroke="#BFBFFB"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="19"
                    y="12"
                    width="6"
                    height="9"
                    fill="#0000EE"
                    stroke="#BFBFFB"
                    strokeWidth="1.6"
                  />
                </svg>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`kpi-${selectedCorridor.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
                    transition={{ duration: 0.16, ease: EASE_ARCHITECTURAL }}
                    className="text-right"
                  >
                    <p className="font-display text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-white">
                      <AnimatedMetricText
                        key={selectedCorridor.id}
                        text={selectedCorridor.kpiValue}
                        duration={1.7}
                      />
                    </p>
                    <p className="text-xs text-white/75 mt-0.5">
                      {selectedCorridor.kpiUnit}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Part 2: Slide 7 Layout — Privacy & Determinism 50-Unit Matrix */}
      <div className="border-t border-white/15 bg-black">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24">
          <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 lg:mb-12">
            <span className="font-mono text-xs text-white/70">
              [Privacy &amp; Safety Guarantees]
            </span>
            <div
              role="tablist"
              aria-label="Satark privacy and rule guarantees"
              className="grid grid-cols-3 sm:inline-flex items-center border border-white/15 p-1 bg-black w-full sm:w-auto"
            >
              {PRIVACY_MATRIX_MODES.map((mode) => {
                const active = mode.id === activeMatrix.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMatrixModeId(mode.id)}
                    className={`min-h-[40px] sm:min-h-0 px-2 sm:px-3.5 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer truncate ${
                      active
                        ? 'bg-[#0000EE] text-white'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left: Monumental Percentage Column */}
            <Reveal
              delay={0.05}
              className="md:col-span-5 lg:col-span-3 flex flex-col justify-between"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`matrix-stat-${activeMatrix.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                >
                  <p className="font-display text-6xl sm:text-7xl font-semibold tracking-[-0.04em] tabular-nums text-white leading-none">
                    <CountingNumber
                      key={activeMatrix.id}
                      from={0}
                      target={activeMatrix.percentage}
                      useGrouping={false}
                      transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                    />
                    %
                  </p>
                  <p className="mt-4 sm:mt-5 font-display text-base font-medium text-white leading-snug">
                    {activeMatrix.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
              <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/15 pt-5">
                {activeMatrix.detail}
              </p>
            </Reveal>

            {/* Center: 10x5 Precision Pictogram Matrix */}
            <Reveal
              delay={0.1}
              className="md:col-span-7 lg:col-span-6 border border-white/15 bg-white/[0.02] p-5 sm:p-8 flex flex-col justify-between"
            >
              <div
                className="grid grid-cols-10 gap-y-3.5 sm:gap-y-5 gap-x-1 sm:gap-x-2 justify-items-center"
                role="img"
                aria-label={`${activeMatrix.percentage} percent protection coverage represented across 50 call units`}
              >
                {Array.from({ length: 50 }).map((_, idx) => {
                  const isLit = idx < activeMatrix.litCount;
                  const isAccentColumn = idx % 10 >= 7;
                  return (
                    <ShieldNodeGlyph
                      key={idx}
                      lit={isLit}
                      accent={isAccentColumn}
                    />
                  );
                })}
              </div>

              <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-white/65 tabular-nums">
                <span>Protected Callers · Zero Raw Cloud Uploads</span>
                <span>Android 14 Compliant</span>
              </div>
            </Reveal>

            {/* Right: Branding Gradient Outlook Block */}
            <Reveal
              delay={0.15}
              className="md:col-span-12 lg:col-span-3 bg-brand-gradient p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm text-white tabular-nums">
                  SATARK
                </span>
                <CornerMark variant="light" position="top-right" />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`outlook-${activeMatrix.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                  className="mt-8 lg:mt-10 font-display text-lg font-medium text-white leading-snug"
                >
                  &ldquo;{activeMatrix.outlookText}&rdquo;
                </motion.p>
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
