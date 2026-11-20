import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { INTERRUPTION_PLAYBOOKS } from '../data/landingData';
import {
  EASE_ARCHITECTURAL,
  Reveal,
  smoothScrollToSection,
} from './MotionPrimitives';
import { CornerMark } from './Primitives';
import { AnimatedMetricText } from './ui/counting-number';

interface MissionEmpowerSectionProps {
  onOpenInquiry: () => void;
}

export function MissionEmpowerSection({
  onOpenInquiry,
}: MissionEmpowerSectionProps) {
  const [activeId, setActiveId] = useState(INTERRUPTION_PLAYBOOKS[0].id);
  const prefersReduced = useReducedMotion();
  const current =
    INTERRUPTION_PLAYBOOKS.find((item) => item.id === activeId) ??
    INTERRUPTION_PLAYBOOKS[0];

  return (
    <section className="relative overflow-hidden border-b border-black/10">
      {/* Upper dark Branding Gradient + Interactive Scam Interruption Playbooks (PDF Pages 3, 7, 8) */}
      <div className="relative bg-brand-aura-right text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24">
          <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 lg:mb-12">
            <div className="flex items-center gap-4 font-mono text-xs text-white/75">
              <span>[How The Scam Works]</span>
              <span>[Where Satark Cuts In]</span>
            </div>

            {/* Interactive Segmented Selector */}
            <div
              role="tablist"
              aria-label="Scam interruption playbooks"
              className="grid grid-cols-3 sm:inline-flex items-center bg-black/60 border border-white/15 p-1 w-full sm:w-auto"
            >
              {INTERRUPTION_PLAYBOOKS.map((item) => {
                const selected = item.id === current.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveId(item.id)}
                    className={`min-h-[40px] sm:min-h-0 px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer truncate ${
                      selected
                        ? 'bg-[#0000EE] text-white'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {item.tabLabel}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left: Monumental Heading + Legal Principle */}
            <Reveal
              delay={0.05}
              className="lg:col-span-4 flex flex-col justify-between gap-8"
            >
              <div>
                <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.06] text-[clamp(2rem,4vw,3.35rem)] text-white">
                  Anatomy of
                  <span className="block text-[#BFBFFB] pl-4 sm:pl-8">
                    Interruption
                  </span>
                </h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`headline-${current.id}`}
                    initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                    className="mt-5 font-display text-base sm:text-lg text-white/95 leading-snug"
                  >
                    {current.headline}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="bg-black/60 border border-white/15 p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-4xl font-semibold tracking-tight tabular-nums text-white">
                    <AnimatedMetricText
                      key={current.id}
                      text={current.badgeStat}
                      duration={1.45}
                    />
                  </p>
                  <CornerMark variant="light" position="top-right" />
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {current.badgeUnit}
                </p>
                <p className="pt-3 border-t border-white/15 text-xs font-mono text-[#BFBFFB] leading-relaxed">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </div>
            </Reveal>

            {/* Right: Interactive Scammer Script vs. Satark Interruption Flow */}
            <Reveal
              delay={0.1}
              className="lg:col-span-8 border border-white/15 bg-black/70 backdrop-blur-sm p-5 sm:p-8 flex flex-col justify-between"
            >
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/15 font-mono text-[11px] sm:text-xs text-white/60">
                <span className="col-span-2 sm:col-span-1">Step</span>
                <span className="col-span-10 sm:col-span-5">What The Scammer Does</span>
                <span className="hidden sm:block sm:col-span-6 text-[#BFBFFB]">
                  Where Satark Live Cuts In
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`steps-${current.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE_ARCHITECTURAL }}
                  className="divide-y divide-white/12 flex-1 flex flex-col justify-center"
                >
                  {current.steps.map((step) => (
                    <div
                      key={step.number}
                      className="py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-4 items-start"
                    >
                      <span className="sm:col-span-1 font-mono text-xs text-white/55 tabular-nums">
                        {step.number}
                      </span>
                      <p className="sm:col-span-5 text-sm text-white/85 leading-relaxed">
                        {step.threat}
                      </p>
                      <div className="sm:col-span-6 sm:border-l sm:border-[#0000EE]/70 sm:pl-4">
                        <span className="sm:hidden block font-mono text-[10px] text-[#BFBFFB] mb-1">
                          Satark Response
                        </span>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          {step.counter}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Attached Lower Paper White Mission Bar (Slide 5 split + PDF Page 14 Closing Line) */}
      <div className="bg-white text-black">
        <Reveal className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="md:col-span-12 lg:col-span-7">
            <p className="font-display text-xl sm:text-2xl lg:text-[1.85rem] font-semibold tracking-[-0.025em] leading-[1.24] text-black">
              &ldquo;The scammer has a script. Now your phone has a guardian.&rdquo;
            </p>
          </div>

          <div className="md:col-span-5 lg:col-span-2 flex lg:justify-center">
            <button
              type="button"
              onClick={() => smoothScrollToSection('live-simulator')}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 bg-black text-white text-xs font-medium hover:bg-[#0000EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0000EE]"
            >
              <span>Test Live Alert</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="md:col-span-7 lg:col-span-3 md:border-l md:border-black/10 md:pl-8">
            <p className="font-display text-sm font-semibold text-black mb-1.5">
              Built For High-Pressure Calls
            </p>
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              Listen on the phone. Verify on tap. Protect the person before money leaves.{' '}
              <button
                type="button"
                onClick={onOpenInquiry}
                className="underline text-[#0000EE] hover:text-black cursor-pointer"
              >
                Request pilot access.
              </button>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
