import { ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import {
  LIVE_SCAM_SCENARIOS,
  SATARK_PIPELINE_LAYERS,
  type PipelineLayer,
} from '../data/landingData';
import { EASE_ARCHITECTURAL, Reveal } from './MotionPrimitives';
import { CornerMark, SmartImage } from './Primitives';
import { AnimatedMetricText } from './ui/counting-number';

interface LayersDiagramSectionProps {
  onOpenInquiry: () => void;
}

export function LayersDiagramSection({
  onOpenInquiry,
}: LayersDiagramSectionProps) {
  const [activeLayer, setActiveLayer] = useState<PipelineLayer>(
    SATARK_PIPELINE_LAYERS[2]
  );
  const [activeScenarioId, setActiveScenarioId] = useState(
    LIVE_SCAM_SCENARIOS[0].id
  );
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const prefersReduced = useReducedMotion();

  const currentScenario =
    LIVE_SCAM_SCENARIOS.find((p) => p.id === activeScenarioId) ??
    LIVE_SCAM_SCENARIOS[0];
  const isVerified = Boolean(verifiedMap[currentScenario.id]);

  const toggleVerify = () => {
    setVerifiedMap((prev) => ({
      ...prev,
      [currentScenario.id]: !prev[currentScenario.id],
    }));
  };

  return (
    <section
      id="architecture"
      className="relative bg-black text-white overflow-hidden border-b border-white/10"
    >
      {/* Part 1: Slide 12 — Interactive Isometric Frosted Glass Layers Diagram */}
      <div className="relative bg-brand-aura-center border-b border-white/15">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-45" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
          <Reveal className="flex flex-wrap items-start justify-between gap-6 mb-10 sm:mb-12 lg:mb-16">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#BFBFFB] mb-3">
                <span>[From a Spoken Threat to a Verdict]</span>
                <span aria-hidden="true" className="text-white/35">
                  ·
                </span>
                <span>Select any layer to inspect</span>
              </div>
              <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.04] text-[clamp(2.1rem,4.5vw,3.75rem)] text-white">
                System
                <span className="block">Layers</span>
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <span className="font-mono text-xs text-white/70">
                [Gemma · Cloud Run · Gemini · Rules]
              </span>
              <CornerMark variant="light" position="top-right" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Callout */}
            <Reveal
              delay={0.08}
              className="md:col-span-1 lg:col-span-3 order-2 lg:order-1 space-y-6"
            >
              <div className="border-t border-white/25 pt-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`left-layer-${activeLayer.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                  >
                    <p className="font-mono text-xs text-[#BFBFFB] mb-2">
                      Stage {activeLayer.index} · {activeLayer.zone}
                    </p>
                    <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums text-white">
                      <AnimatedMetricText
                        key={`l-${activeLayer.id}`}
                        text={activeLayer.leftMetric}
                        duration={1.45}
                      />
                    </p>
                    <p className="mt-1.5 font-display text-sm font-medium text-white">
                      {activeLayer.leftTitle}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                      {activeLayer.leftDetail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Reveal>

            {/* Centerpiece: 7 Stacked Frosted Translucent Glass Planes */}
            <Reveal
              delay={0.04}
              className="md:col-span-2 lg:col-span-6 order-1 lg:order-2 flex flex-col items-center justify-center py-4 sm:py-8"
            >
              <div
                className="iso-stage relative w-full max-w-[540px] h-[220px] sm:h-[275px] md:h-[310px] flex items-center justify-center"
                style={{ perspective: '1200px' }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 sm:right-6 top-2 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl opacity-80"
                  style={{
                    background:
                      'radial-gradient(circle, #8C8CF7 0%, #0000EE 48%, transparent 75%)',
                  }}
                />

                {SATARK_PIPELINE_LAYERS.map((layer, index) => {
                  const isSelected = layer.id === activeLayer.id;
                  const deltaX = index - 3;
                  const deltaY = 3 - index;
                  const opacity = isSelected
                    ? 0.98
                    : Math.max(0.32, 0.86 - index * 0.08);

                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveLayer(layer)}
                      onMouseEnter={() => setActiveLayer(layer)}
                      aria-label={`Inspect Stage ${layer.index}: ${layer.name}`}
                      aria-pressed={isSelected}
                      style={{
                        transform: `translate3d(calc(${deltaX} * var(--iso-step-x)), calc(${deltaY} * var(--iso-step-y) ${
                          isSelected ? '- 16px' : '+ 0px'
                        }), 0) rotateY(-34deg) rotateX(10deg) skewY(-8deg)`,
                        zIndex: isSelected ? 30 : 20 - index,
                        opacity,
                      }}
                      className={`absolute w-[92px] h-[134px] sm:w-[126px] sm:h-[172px] md:w-[144px] md:h-[192px] rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-2.5 sm:p-4 text-left backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                        isSelected
                          ? 'bg-gradient-to-br from-white/95 via-[#BFBFFB]/75 to-[#0000EE]/55 border-2 border-white shadow-[0_24px_60px_rgba(0,0,238,0.55)] text-black'
                          : 'bg-gradient-to-br from-white/75 via-white/30 to-[#8C8CF7]/15 border border-white/40 hover:border-white/80 text-black'
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] sm:text-[11px] font-medium tabular-nums ${
                          isSelected ? 'text-[#0000EE]' : 'text-black/70'
                        }`}
                      >
                        {layer.index}
                      </span>
                      <span className="block font-display text-[10px] sm:text-xs font-semibold leading-tight text-black">
                        {layer.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Stage Selector Bar */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5">
                {SATARK_PIPELINE_LAYERS.map((layer) => {
                  const isSelected = layer.id === activeLayer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveLayer(layer)}
                      className={`min-h-[38px] sm:min-h-0 px-3 py-1.5 font-mono text-[11px] sm:text-xs transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer border ${
                        isSelected
                          ? 'bg-white text-black border-white font-medium'
                          : 'bg-black/60 text-white/75 border-white/15 hover:border-white/45 hover:text-white'
                      }`}
                    >
                      {layer.index}. {layer.name}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Right Callout */}
            <Reveal
              delay={0.12}
              className="md:col-span-1 lg:col-span-3 order-3 space-y-6 lg:text-right"
            >
              <div className="border-t border-white/25 pt-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`right-layer-${activeLayer.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                  >
                    <p className="font-mono text-xs text-[#BFBFFB] mb-2">
                      {activeLayer.name}
                    </p>
                    <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums text-white">
                      <AnimatedMetricText
                        key={`r-${activeLayer.id}`}
                        text={activeLayer.rightMetric}
                        duration={1.55}
                      />
                    </p>
                    <p className="mt-1.5 font-display text-sm font-medium text-white">
                      {activeLayer.rightTitle}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
                      {activeLayer.rightDetail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Part 2: Slide 10 Layout — Interactive Mid-Call Product Showcase + Bespoke Scenario Photography */}
      <div id="live-simulator" className="relative bg-brand-aura-left scroll-mt-16">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Quote, Bespoke Visual Plate & Stat */}
            <Reveal
              delay={0.05}
              className="lg:col-span-4 order-2 lg:order-1 flex flex-col justify-between gap-7 pt-6 border-t border-white/15 lg:pt-0 lg:border-t-0 lg:border-r lg:border-white/15 lg:pr-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`scen-copy-${currentScenario.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                  className="space-y-5"
                >
                  <p className="font-display text-lg sm:text-xl font-medium text-white leading-snug">
                    &ldquo;{currentScenario.quote}&rdquo;
                  </p>

                  {/* Scenario-matched bespoke product photography */}
                  <div className="aspect-[4/3] w-full border border-white/20 bg-black overflow-hidden">
                    <SmartImage
                      src={currentScenario.visualImage}
                      alt={currentScenario.visualAlt}
                      className="w-full h-full object-cover"
                      fallbackLabel={currentScenario.tag}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="pt-4 border-t border-white/15 space-y-4">
                <div>
                  <p className="font-display text-3xl sm:text-4xl font-semibold tabular-nums text-white">
                    <AnimatedMetricText
                      key={`s-${currentScenario.id}`}
                      text={currentScenario.statValue}
                      duration={1.7}
                    />
                  </p>
                  <p className="mt-1 text-xs text-white/75 leading-relaxed">
                    {currentScenario.statLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenInquiry}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#BFBFFB] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Install this guardian on Android beta</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </Reveal>

            {/* Right Asymmetric Interactive Phone Alert & Verdict Simulator */}
            <Reveal
              delay={0.1}
              className="lg:col-span-8 order-1 lg:order-2 flex flex-col justify-between gap-10"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-xs text-[#BFBFFB] mb-2">
                    [The Product · Interactive Preview]
                  </p>
                  <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.06] text-[clamp(1.95rem,4.2vw,3.35rem)] text-white">
                    The Warning That
                    <span className="block sm:pl-12 text-[#BFBFFB]">
                      Appears Mid-Call
                    </span>
                  </h2>
                </div>

                {/* Scenario Selector */}
                <div
                  role="tablist"
                  aria-label="Interactive scam call scenarios"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {LIVE_SCAM_SCENARIOS.map((scenario, idx) => {
                    const active = scenario.id === currentScenario.id;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveScenarioId(scenario.id)}
                        className={`min-h-[40px] sm:min-h-0 px-3.5 py-2 text-xs font-medium border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-black border-white'
                            : 'bg-black/60 text-white/80 border-white/20 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        0{idx + 1}. {scenario.tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Phone Panels matching PDF Page 6 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/15 pt-8">
                {/* Panel A: Live Call Overlay */}
                <div className="border border-white/20 bg-black/90 p-6 flex flex-col justify-between gap-6">
                  <div className="text-center pb-5 border-b border-white/15">
                    <p className="font-mono text-xs text-white/65">
                      {currentScenario.callType}
                    </p>
                    <p className="mt-1.5 font-display text-xl font-semibold text-white">
                      {currentScenario.callerLabel}
                    </p>
                  </div>

                  <div className="border border-[#8C8CF7]/60 bg-[#0000B3]/25 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[#BFBFFB]">
                        SATARK ALERT
                      </span>
                      <ShieldAlert
                        className="w-4 h-4 text-[#BFBFFB]"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">
                        {currentScenario.alertTitle}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed">
                        {currentScenario.alertSubtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleVerify}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#0000EE] text-white text-xs font-semibold hover:bg-white hover:text-black transition-colors cursor-pointer"
                    >
                      {isVerified ? 'Hide Verdict Detail' : 'Verify Call'}
                    </button>
                  </div>
                </div>

                {/* Panel B: Plain-English Rule Verdict */}
                <div
                  className={`border p-6 flex flex-col justify-between gap-6 transition-colors duration-200 ${
                    isVerified
                      ? 'border-white bg-brand-gradient text-white'
                      : 'border-white/20 bg-black/80 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/20">
                    <span className="font-mono text-xs text-[#BFBFFB]">
                      {currentScenario.verdictBadge}
                    </span>
                    <ShieldCheck
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="space-y-4 flex-1">
                    <h3 className="font-display text-base font-semibold text-white">
                      {currentScenario.verdictHeadline}
                    </h3>
                    <ul className="space-y-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                      {currentScenario.redFlags.map((flag) => (
                        <li key={flag} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="font-mono text-[#BFBFFB] shrink-0"
                          >
                            —
                          </span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-3">
                    <span className="font-display text-xs sm:text-sm font-semibold text-white">
                      {currentScenario.recommendedAction}
                    </span>
                    <CornerMark variant="light" position="bottom-right" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
