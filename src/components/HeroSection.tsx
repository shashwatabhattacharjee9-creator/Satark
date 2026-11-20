import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { type FormEvent, useRef, useState } from 'react';
import { BRAND_LOGOS } from '../data/landingData';
import {
  detectContactChannel,
  submitWaitlist,
  type WaitlistResponseDTO,
} from '../utils/waitlistClient';
import { EASE_ARCHITECTURAL, smoothScrollToSection } from './MotionPrimitives';
import { CornerMark } from './Primitives';

interface HeroSectionProps {
  onOpenInquiry: () => void;
}

export function HeroSection({ onOpenInquiry }: HeroSectionProps) {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const headlineY = useTransform(scrollYProgress, [0, 1], ['0px', '38px']);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.28]);
  const [heroCallState, setHeroCallState] = useState<'alert' | 'verdict' | 'ended'>('alert');
  const [heroLogoError, setHeroLogoError] = useState(false);
  const [quickContact, setQuickContact] = useState('');
  const [quickError, setQuickError] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickResult, setQuickResult] = useState<WaitlistResponseDTO | null>(null);

  const handleQuickLead = async (e: FormEvent) => {
    e.preventDefault();
    const val = quickContact.trim();
    const channel = detectContactChannel(val);
    if (!channel) {
      setQuickError('Enter a valid email or 10-digit WhatsApp number.');
      return;
    }
    setQuickError('');
    setQuickSubmitting(true);
    try {
      const result = await submitWaitlist({
        name: 'Satark Beta Member',
        contact: val,
        track: 'family',
        familySize: '2–4 Family Phones',
        source: 'hero-quick-capture',
      });
      setQuickResult(result);
    } catch (err) {
      setQuickError(
        err instanceof Error
          ? err.message
          : 'Could not reserve your spot right now. Please try again.'
      );
    } finally {
      setQuickSubmitting(false);
    }
  };

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-[78svh] sm:min-h-[82vh] bg-brand-hero overflow-hidden flex flex-col justify-between pt-24 pb-10 sm:pb-12 lg:pt-28 lg:pb-14 border-b border-white/10"
    >
      {/* Subtle architectural hairline coordinate grid with GPU scroll parallax */}
      <motion.div
        style={prefersReduced ? undefined : { y: gridY, willChange: 'transform' }}
        className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70"
      />

      {/* Top editorial metadata strip */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE_ARCHITECTURAL }}
        className="relative z-10 max-w-[1360px] w-full mx-auto px-5 sm:px-6 lg:px-12 flex items-center justify-between gap-4 text-xs text-white/75 font-mono"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Gemma on-device</span>
          <span aria-hidden="true" className="text-white/40">
            ·
          </span>
          <span>Gemini Live</span>
          <span aria-hidden="true" className="text-white/40">
            ·
          </span>
          <span>You stay in control</span>
        </div>
        <CornerMark variant="light" position="top-right" />
      </motion.div>

      {/* Center monumental Satark wordmark + generous editorial gap + Instrument Serif tagline */}
      <motion.div
        style={
          prefersReduced
            ? undefined
            : { y: headlineY, opacity: headlineOpacity, willChange: 'transform, opacity' }
        }
        className="relative z-10 max-w-[1360px] w-full mx-auto px-5 sm:px-6 lg:px-12 my-10 sm:my-12 lg:my-14"
      >
        <div>
          {/* Line 1: Satark Brand Wordmark */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_ARCHITECTURAL }}
            className="grid grid-cols-1 md:grid-cols-12 items-end gap-3 md:gap-4"
          >
            <h1 className="md:col-span-8 font-display font-semibold text-white tracking-[-0.04em] leading-[0.88] text-[clamp(2.85rem,9.5vw,6.65rem)]">
              {!heroLogoError ? (
                <>
                  <span
                    className="relative block w-[min(5.06em,100%)] aspect-[1062/168] overflow-hidden select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    <img
                      src={BRAND_LOGOS.wordmark}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={() => setHeroLogoError(true)}
                      className="absolute top-[-117.26%] left-[-10.55%] w-[120.53%] h-[409.52%] max-w-none max-h-none block"
                    />
                  </span>
                  <span className="sr-only">Satark</span>
                </>
              ) : (
                'Satark'
              )}
            </h1>
            <p className="md:col-span-4 text-xs sm:text-sm text-[#BFBFFB] font-mono md:text-right md:pb-1">
              [On-Device Call Guardian]
            </p>
          </motion.div>

          {/* Generous editorial gap + Instrument Serif display tagline & CTA row */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.1, ease: EASE_ARCHITECTURAL }}
            className="mt-10 sm:mt-14 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8"
          >
            <p className="lg:col-span-7 font-editorial text-[clamp(2.15rem,5.2vw,4.35rem)] leading-[1.04] tracking-[-0.015em] text-white">
              Hear the lie{' '}
              <span className="italic text-[#BFBFFB]">before you act on it.</span>
            </p>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => smoothScrollToSection('prototype')}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-[#0000EE] text-white border border-[#BFBFFB]/55 text-sm font-semibold hover:bg-[#0000B3] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BFBFFB]"
              >
                <span>Try Live Prototype</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenInquiry}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-white text-black text-sm font-medium hover:bg-[#BFBFFB] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BFBFFB]"
              >
                <span>Book Partner Demo</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom asymmetric balance: Interactive Mid-Call Alert Inset left + High-Converting Instant Beta Capture right */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: EASE_ARCHITECTURAL }}
        className="relative z-10 max-w-[1360px] w-full mx-auto px-5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end"
      >
        {/* Bottom-left Interactive Mid-Call Overlay Preview */}
        <div className="lg:col-span-5 border border-white/20 bg-black/90 backdrop-blur-md p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-white/15">
            <div className="font-mono text-xs text-white/75">
              <span>Incoming video call</span>
              <span aria-hidden="true" className="mx-2 text-white/35">
                ·
              </span>
              <span className="text-white font-medium">&ldquo;CBI Officer&rdquo;</span>
            </div>
            <span className="font-mono text-[11px] text-[#BFBFFB] shrink-0">
              SATARK ALERT
            </span>
          </div>

          <AnimatePresence mode="wait">
            {heroCallState === 'alert' && (
              <motion.div
                key="alert"
                initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                className="pt-4 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    className="w-5 h-5 text-[#BFBFFB] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display text-base font-semibold text-white">
                      Likely digital arrest scam
                    </p>
                    <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                      No agency arrests anyone over a video call. Tap Verify Call to check their warrant against real Indian law.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setHeroCallState('verdict')}
                    className="min-h-[42px] px-4 py-2 bg-[#0000EE] text-white text-xs font-medium hover:bg-[#0000B3] transition-colors cursor-pointer"
                  >
                    Verify Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroCallState('ended')}
                    className="min-h-[42px] px-4 py-2 border border-white/25 text-white text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Hang up
                  </button>
                </div>
              </motion.div>
            )}

            {heroCallState === 'verdict' && (
              <motion.div
                key="verdict"
                initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                className="pt-4 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold text-[#BFBFFB]">
                    Verdict: Likely Forged Warrant
                  </p>
                  <button
                    type="button"
                    onClick={() => setHeroCallState('alert')}
                    className="text-xs font-mono text-white/65 hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <ul className="space-y-1.5 text-xs text-white/80 leading-relaxed">
                  <li>· Cited section does not exist in IT Act, BNS, or CrPC</li>
                  <li>· No agency serves arrest warrants over WhatsApp</li>
                  <li>· File metadata and fonts do not match an official court order</li>
                </ul>
                <button
                  type="button"
                  onClick={() => setHeroCallState('ended')}
                  className="w-full min-h-[42px] px-4 py-2 bg-white text-black text-xs font-semibold hover:bg-[#BFBFFB] transition-colors cursor-pointer"
                >
                  Hang up · Report on 1930
                </button>
              </motion.div>
            )}

            {heroCallState === 'ended' && (
              <motion.div
                key="ended"
                initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_ARCHITECTURAL }}
                className="pt-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="w-5 h-5 text-[#BFBFFB] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-white">
                      Call disconnected safely
                    </p>
                    <p className="text-xs text-white/75 mt-0.5">
                      OTP previews shielded · Ready to report on 1930.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroCallState('alert')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/25 text-xs text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Replay</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom-right High-Converting Instant Beta Capture Block */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5 border-t border-white/20 pt-5 sm:pt-6">
          <p className="text-base sm:text-lg lg:text-xl text-white font-medium leading-snug max-w-2xl">
            The guardian that listens while the scammer talks, and warns you before you act — built for digital arrest calls, call-merge OTP fraud, and spoofed bank numbers.
          </p>

          {/* 1-Step Frictionless Above-the-Fold Lead Capture */}
          {quickResult ? (
            <div className="flex flex-col gap-3.5 bg-black/85 border border-[#BFBFFB]/60 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#0000EE] text-white shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] text-[#BFBFFB]">
                      {quickResult.entry.ticketCode} · Spot #{quickResult.entry.position}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      You are on the waiting list — {quickResult.delivery.headline}
                    </p>
                    <p className="text-xs text-white/75 mt-0.5">
                      {quickResult.delivery.detail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuickResult(null);
                    setQuickContact('');
                  }}
                  className="text-xs font-mono text-[#BFBFFB] hover:text-white underline shrink-0 cursor-pointer self-start"
                >
                  Add another
                </button>
              </div>
              {(quickResult.delivery.previewUrl || quickResult.delivery.whatsappUrl) && (
                <div className="flex flex-wrap items-center gap-2.5 pl-9">
                  {quickResult.delivery.previewUrl && (
                    <a
                      href={quickResult.delivery.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0000EE] text-white text-xs font-semibold hover:bg-white hover:text-black transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View Sent Email</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                  {quickResult.delivery.whatsappUrl && (
                    <a
                      href={quickResult.delivery.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0000EE] text-white text-xs font-semibold hover:bg-white hover:text-black transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open in WhatsApp</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleQuickLead} noValidate className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <label htmlFor="hero-quick-contact" className="sr-only">
                  Email address or WhatsApp number for Android beta access
                </label>
                <input
                  id="hero-quick-contact"
                  type="text"
                  value={quickContact}
                  onChange={(e) => {
                    setQuickContact(e.target.value);
                    if (quickError) setQuickError('');
                  }}
                  placeholder="Enter email or WhatsApp number for free Android beta"
                  className="flex-1 min-h-[48px] px-4 py-3 text-sm bg-black/80 border border-white/25 text-white placeholder:text-white/55 focus:outline-none focus:border-[#BFBFFB] transition-colors"
                />
                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#0000EE] text-white text-sm font-semibold hover:bg-white hover:text-black active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BFBFFB]"
                >
                  {quickSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Protect My Family Free</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
              {quickError ? (
                <p role="alert" className="text-xs text-[#BFBFFB] font-medium">
                  {quickError}
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/70 pt-0.5">
                  <span>
                    Free for families during pilot · Zero call audio stored · Includes 1-page Parent Safety Card
                  </span>
                  <a
                    href="#overview"
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollToSection('overview');
                    }}
                    className="inline-flex items-center gap-1 text-[#BFBFFB] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>See 3 Layers</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
