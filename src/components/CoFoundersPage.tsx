import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { EASE_ARCHITECTURAL } from './MotionPrimitives';
import { CountingNumber } from './ui/counting-number';

interface CoFoundersPageProps {
  onNavigateHome: () => void;
  onOpenInquiry: () => void;
}

interface FounderProfile {
  id: 'shashwata' | 'hemant';
  name: string;
  role: string;
  imageUrl?: string;
  imageAlt: string;
  kicker: string;
  bio: string;
  highlights: string[];
}

const FOUNDERS: FounderProfile[] = [
  {
    id: 'shashwata',
    name: 'Shashwata Bhattacharjee',
    role: 'Co-Founder · CEO, CTO & Team Lead',
    imageUrl:
      'https://i.postimg.cc/vmvNkmkc/Picsart-26-04-21-21-35-08-393-(1).png',
    imageAlt: 'Portrait of Shashwata Bhattacharjee, Co-Founder, CEO, CTO and Team Lead at Satark Live',
    kicker: 'First-Year B.Tech · SRM Institute of Science & Technology, KTR',
    bio: 'Building and shipping since age 13. Wired at the intersection of deep tech, on-device AI systems, and modern finance — turning complex engineering bottlenecks into calm, zero-latency software that protects real families at scale. Leads Satark’s core architecture, mobile AI runtime, and product execution from zero to production.',
    highlights: [
      'Shipping since age 13',
      'Deep Tech & Finance',
      'On-Device AI & Architecture',
    ],
  },
  {
    id: 'hemant',
    name: 'Hemant Rai',
    role: 'Co-Founder · Director of Product, Head of Marketing & AI Supervisor',
    imageUrl: undefined,
    imageAlt: 'Portrait placeholder for Hemant Rai, Co-Founder at Satark Live',
    kicker: 'AI Thinktank · Strategic Product, Growth & Adversarial Defense',
    bio: 'Immersed in technology since age 12 and wired with the foresight of a chess grandmaster — always six moves ahead of social-engineering playbooks and market shifts. An unapologetic AI heavyweight and first-principles thinktank shaping how Satark reasons, communicates, and earns trust across Indian households.',
    highlights: [
      'Into tech since age 12',
      'Chess Grandmaster Mindset',
      'AI Supervision & Brand Growth',
    ],
  },
];

function FourPointStar({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: active ? 45 : 0, scale: active ? 1.12 : 1 }}
      transition={{ duration: 0.28, ease: EASE_ARCHITECTURAL }}
      className="shrink-0"
    >
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.78)'}
      />
    </motion.svg>
  );
}

export function CoFoundersPage({
  onNavigateHome,
  onOpenInquiry,
}: CoFoundersPageProps) {
  const prefersReduced = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const toggleFounder = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#020206] text-white pt-28 sm:pt-32 pb-20 sm:pb-28">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-6 lg:px-12">
        {/* Top Back Navigation */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_ARCHITECTURAL }}
          className="mb-10 sm:mb-12"
        >
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/65 hover:text-white transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BFBFFB]"
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>Back to Satark Live</span>
          </button>
        </motion.div>

        {/* Hero Heading — matching the clean editorial display aesthetic of the reference */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: EASE_ARCHITECTURAL }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16"
        >
          <div>
            <h1 className="font-display font-medium tracking-[-0.04em] leading-[1.02] text-[clamp(2.65rem,6vw,4.75rem)] text-white">
              Our Founding Team
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-xl leading-relaxed">
              Two builders engineering on-device call intelligence so no Indian family stands alone on a scam call. Select a portrait to open their full dossier.
            </p>
          </div>
          <p className="font-mono text-xs text-white/45 shrink-0">
            <CountingNumber
              from={0}
              target={2}
              padZero={2}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
            />{' '}
            Co-Founders · Click portrait to expand
          </p>
        </motion.div>

        {/* Two-Member Founding Team Grid (items-start so each card extends smoothly downwards independently) */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8 lg:gap-10 max-w-[880px]">
          {FOUNDERS.map((founder, idx) => {
            const isExpanded = expandedId === founder.id;
            const hasImage = Boolean(founder.imageUrl && !failedImages[founder.id]);

            return (
              <motion.article
                key={founder.id}
                layout={!prefersReduced}
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.08,
                  ease: EASE_ARCHITECTURAL,
                }}
                className={`group rounded-[22px] overflow-hidden border transition-colors duration-300 bg-[#05050A] ${
                  isExpanded
                    ? 'border-[#3344FF]/70 shadow-[0_24px_64px_-24px_rgba(0,0,238,0.45)]'
                    : 'border-white/12 hover:border-white/25'
                }`}
              >
                {/* Interactive Clickable Trigger covering Portrait + Nameplate */}
                <button
                  type="button"
                  onClick={() => toggleFounder(founder.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`founder-dossier-${founder.id}`}
                  className="w-full text-left block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#BFBFFB]"
                >
                  {/* Top Portrait Surface */}
                  <div className="relative aspect-[4/4.15] w-full overflow-hidden bg-[#121218]">
                    {hasImage ? (
                      <>
                        <img
                          src={founder.imageUrl}
                          alt={founder.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [founder.id]: true,
                            }))
                          }
                          className={`w-full h-full object-cover object-top transition-all duration-500 ease-out ${
                            isExpanded
                              ? 'grayscale-0 scale-[1.03]'
                              : 'grayscale contrast-[1.06] group-hover:grayscale-0 group-hover:scale-[1.02]'
                          }`}
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent"
                        />
                      </>
                    ) : (
                      /* Intentionally Blank Portrait Frame for Hemant Rai (ready for photo upload later) */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0C0C12] relative">
                        <div
                          aria-hidden="true"
                          className="absolute inset-4 rounded-[14px] border border-dashed border-white/12"
                        />
                        <span className="font-display text-3xl font-medium tracking-tight text-white/18 select-none">
                          HR
                        </span>
                        <span className="mt-2.5 font-mono text-[11px] text-white/32 tracking-wide">
                          Portrait slot reserved
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Nameplate + Signature Reference Blue Illumination */}
                  <div className="relative overflow-hidden px-6 py-5 sm:px-7 sm:py-6 border-t border-white/10 bg-[#05050B]">
                    {/* Deep Vivid Blue Glow Layer matching reference card highlight */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-350 ${
                        isExpanded
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-90'
                      }`}
                      style={{
                        background:
                          'radial-gradient(120% 140% at 8% 100%, #0000EE 0%, #0000B3 42%, #040412 88%)',
                      }}
                    />

                    <div className="relative z-10 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-xl sm:text-[1.4rem] font-semibold tracking-[-0.02em] text-white leading-snug">
                          {founder.name}
                        </h2>
                        <p
                          className={`mt-1.5 text-xs sm:text-[13px] leading-relaxed transition-colors duration-200 ${
                            isExpanded
                              ? 'text-white/90'
                              : 'text-white/55 group-hover:text-white/80'
                          }`}
                        >
                          {founder.role}
                        </p>
                      </div>
                      <div className="pb-0.5">
                        <FourPointStar active={isExpanded} />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Smooth Downward-Extending Bio Drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`founder-dossier-${founder.id}`}
                      key="dossier"
                      initial={
                        prefersReduced
                          ? { opacity: 1 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={
                        prefersReduced
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={{
                        height: { duration: 0.42, ease: EASE_ARCHITECTURAL },
                        opacity: { duration: 0.28, ease: 'easeOut' },
                      }}
                      className="overflow-hidden border-t border-white/12 bg-[#070712]"
                    >
                      <div className="px-6 py-6 sm:px-7 sm:py-7 space-y-4">
                        <p className="font-mono text-xs text-[#BFBFFB] leading-relaxed">
                          {founder.kicker}
                        </p>

                        <p className="text-sm sm:text-[15px] text-white/85 leading-[1.68]">
                          {founder.bio}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-white/55">
                          {founder.highlights.map((item, i) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-2.5"
                            >
                              {i > 0 && (
                                <span aria-hidden="true" className="text-white/25">
                                  ·
                                </span>
                              )}
                              <span>{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>

        {/* Quiet Bottom Action Strip */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-20 sm:mt-24 pt-8 border-t border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <p className="font-display text-lg font-medium text-white">
              Want to partner or test Satark Live with your family?
            </p>
            <p className="text-xs sm:text-sm text-white/55 mt-1">
              Join the Android beta waitlist or book a direct architecture walkthrough with the founders.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#0000EE] text-white text-xs sm:text-sm font-semibold hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Reserve Early Access</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
