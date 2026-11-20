import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { THREE_LAYERS_OVERVIEW } from '../data/landingData';
import { EASE_ARCHITECTURAL, Reveal } from './MotionPrimitives';
import { CornerMark, SmartImage } from './Primitives';
import { AnimatedMetricText } from './ui/counting-number';

export function OverviewAccordionSection() {
  const [activeId, setActiveId] = useState(THREE_LAYERS_OVERVIEW[0].id);
  const prefersReduced = useReducedMotion();
  const activeItem =
    THREE_LAYERS_OVERVIEW.find((item) => item.id === activeId) ??
    THREE_LAYERS_OVERVIEW[0];

  return (
    <section
      id="overview"
      className="relative bg-black text-white border-b border-white/10 overflow-hidden"
    >
      {/* Subtle left ambient glow mirroring Slide 3 */}
      <div className="pointer-events-none absolute inset-0 bg-brand-aura-left opacity-55" />

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
        {/* Section kicker */}
        <Reveal className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5 mb-10 lg:mb-12">
          <div className="flex items-center gap-3 text-xs font-mono text-white/75">
            <span>The Solution · Three Layers Between You and the Scam</span>
            <span aria-hidden="true" className="text-white/35">
              ·
            </span>
            <span>01 — 03</span>
          </div>
          <span className="text-xs font-mono text-[#BFBFFB]">
            [AI explains. Rules decide. You choose.]
          </span>
        </Reveal>

        {/* Main 12-col split: Interactive numbered rows left + visual plate right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <Reveal
            delay={0.05}
            className="lg:col-span-8 flex flex-col justify-between divide-y divide-white/15 border-y border-white/15"
          >
            {THREE_LAYERS_OVERVIEW.map((item) => {
              const isActive = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  onMouseEnter={() => setActiveId(item.id)}
                  aria-pressed={isActive}
                  className={`group w-full text-left px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-9 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#BFBFFB] ${
                    isActive
                      ? 'bg-brand-gradient-horizontal'
                      : 'bg-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                    <div className="md:col-span-6 flex items-baseline gap-4 sm:gap-5">
                      <span
                        className={`font-mono text-xs sm:text-sm tabular-nums transition-colors ${
                          isActive ? 'text-[#BFBFFB]' : 'text-white/55'
                        }`}
                      >
                        ({item.index})
                      </span>
                      <div>
                        <span className="block font-display text-xl sm:text-2xl md:text-3xl font-medium tracking-[-0.025em] text-white">
                          {item.title}
                        </span>
                        <span
                          className={`block mt-1 font-mono text-xs ${
                            isActive ? 'text-[#BFBFFB]' : 'text-white/55'
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-6 flex items-center justify-between gap-4 pl-8 sm:pl-9 md:pl-0">
                      <p
                        className={`text-sm leading-relaxed transition-colors ${
                          isActive ? 'text-white/95' : 'text-white/60'
                        }`}
                      >
                        {item.description}
                      </p>
                      <ArrowRight
                        aria-hidden="true"
                        className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                          isActive
                            ? 'text-white translate-x-0.5'
                            : 'text-white/35 group-hover:text-white/75'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </Reveal>

          {/* Right visual plate + live metric summary with smooth crossfade */}
          <Reveal
            delay={0.12}
            className="lg:col-span-4 flex flex-col justify-between border border-white/15 bg-black overflow-hidden"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:flex-1 overflow-hidden bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial={prefersReduced ? false : { opacity: 0.25, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0.25 }}
                  transition={{ duration: 0.22, ease: EASE_ARCHITECTURAL }}
                  className="w-full h-full"
                >
                  <SmartImage
                    src={activeItem.image}
                    alt={activeItem.imageAlt}
                    className="w-full h-full object-cover"
                    fallbackLabel={activeItem.subtitle}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute top-4 right-4">
                <CornerMark variant="light" position="top-right" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`metric-${activeItem.id}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                  className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-mono text-[#BFBFFB] mb-1">
                      {activeItem.engine}
                    </p>
                    <p className="font-display text-3xl sm:text-4xl font-semibold tabular-nums text-white tracking-tight">
                      <AnimatedMetricText
                        key={activeItem.id}
                        text={activeItem.metricValue}
                        duration={1.55}
                      />
                    </p>
                  </div>
                  <CornerMark variant="blue" position="bottom-right" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 border-t border-white/15 bg-black flex items-center justify-between gap-4">
              <p className="text-xs text-white/80 leading-relaxed">
                {activeItem.metricLabel}
              </p>
              <span className="font-mono text-xs text-white/55 tabular-nums shrink-0">
                {activeItem.index} / 03
              </span>
            </div>
          </Reveal>
        </div>

        {/* Quiet bottom principle footer bar matching Slide 3 + PDF Page 4 */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/65">
          <span>[Edge First · Cloud Only On Tap]</span>
          <div className="flex items-center gap-6">
            <span>[Rules Have The Last Word]</span>
            <CornerMark variant="light" position="bottom-right" />
          </div>
        </div>
      </div>
    </section>
  );
}
