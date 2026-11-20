import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type FormEvent, type MouseEvent, useState } from 'react';
import { ASSETS, GROWTH_CHANNELS, ROADMAP_STEPS } from '../data/landingData';
import {
  detectContactChannel,
  resendWaitlistMessage,
  submitWaitlist,
  type WaitlistResponseDTO,
} from '../utils/waitlistClient';
import {
  EASE_ARCHITECTURAL,
  Reveal,
  smoothScrollToSection,
} from './MotionPrimitives';
import { CornerMark, SatarkBrand, SmartImage } from './Primitives';
import { CountingNumber } from './ui/counting-number';

interface LeadershipContactSectionProps {
  inquiryOpen: boolean;
  onCloseInquiry: () => void;
  onOpenInquiry: () => void;
  onNavigateToCoFounders: () => void;
  renderOnlyModal?: boolean;
}

export function LeadershipContactSection({
  inquiryOpen,
  onCloseInquiry,
  onOpenInquiry,
  onNavigateToCoFounders,
  renderOnlyModal = false,
}: LeadershipContactSectionProps) {
  const [audienceTrack, setAudienceTrack] = useState<'family' | 'partner'>('family');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [familySize, setFamilySize] = useState('2–4 Family Phones');
  const [orgName, setOrgName] = useState('');
  const [partnerType, setPartnerType] = useState('Bank / UPI SDK');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResponseDTO | null>(null);
  const prefersReduced = useReducedMotion();

  const detectedChannel = detectContactChannel(contact);

  const handleSubmit = async (
    e: FormEvent,
    source: 'modal' | 'contact-section' = 'contact-section'
  ) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const channel = detectContactChannel(trimmedContact);

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!channel) {
      setError('Please enter a valid email address or 10-digit WhatsApp number.');
      return;
    }
    if (audienceTrack === 'partner' && !orgName.trim()) {
      setError('Please enter your bank, UPI app, or organization name.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const response = await submitWaitlist({
        name: trimmedName,
        contact: trimmedContact,
        track: audienceTrack,
        familySize: audienceTrack === 'family' ? familySize : undefined,
        orgName: audienceTrack === 'partner' ? orgName.trim() : undefined,
        partnerType: audienceTrack === 'partner' ? partnerType : undefined,
        note: message.trim() || undefined,
        source,
      });
      setWaitlistResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not register your spot right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!waitlistResult || resending) return;
    setResending(true);
    setError('');
    try {
      const updated = await resendWaitlistMessage(waitlistResult.entry.ticketCode);
      setWaitlistResult(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not resend confirmation right now.'
      );
    } finally {
      setResending(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!waitlistResult?.delivery.messageText) return;
    try {
      await navigator.clipboard.writeText(waitlistResult.delivery.messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2200);
    } catch {
      // Clipboard blocked in restricted frame
    }
  };

  const resetForm = () => {
    setName('');
    setContact('');
    setOrgName('');
    setMessage('');
    setError('');
    setCopiedMessage(false);
    setWaitlistResult(null);
  };

  const handleFooterNav = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    event.preventDefault();
    smoothScrollToSection(targetId);
  };

  return (
    <>
      {!renderOnlyModal && (
        <>
          {/* Slide 11 Layout + PDF Pages 12 & 13: Family Shield Visual Hero + Growth Channels + 4-Step Roadmap */}
      <section
        id="leadership"
        className="bg-white text-black border-b border-black/10"
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
          {/* Top Header Row */}
          <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-end mb-12 sm:mb-14">
            <div className="md:col-span-7 lg:col-span-6">
              <p className="font-mono text-xs text-[#0000EE] mb-3">
                [Where It Grows · Distribution &amp; Roadmap]
              </p>
              <h2 className="font-display font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(2.1rem,4.5vw,3.75rem)] text-black">
                Start With Families,
                <span className="block text-[#0000EE] sm:pl-10">
                  Grow Through Partners
                </span>
              </h2>
            </div>

            <div className="md:col-span-5 lg:col-span-3 flex items-baseline gap-3">
              <p className="font-display text-5xl sm:text-6xl font-semibold tracking-[-0.04em] tabular-nums text-black">
                <CountingNumber
                  from={0}
                  target={4}
                  padZero={2}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                />
              </p>
              <span className="font-mono text-xs text-[#595959]">
                Trust-earned phases
              </span>
            </div>

            <div className="md:col-span-12 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
              <p className="text-xs sm:text-sm text-[#525252] leading-relaxed max-w-md lg:text-right">
                Beachhead: families who worry about a parent taking that digital arrest or OTP call.
              </p>
              <button
                type="button"
                onClick={onOpenInquiry}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-black text-white text-xs font-medium hover:bg-[#0000EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Reserve Family Shield</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* Editorial Documentary Family Spotlight Card (Slide 11 horizontal portrait split) */}
          <Reveal
            delay={0.05}
            className="grid grid-cols-1 lg:grid-cols-12 border border-black/12 bg-white overflow-hidden mb-12"
          >
            <div className="lg:col-span-6 bg-[#EFEFEF] aspect-[4/3] lg:aspect-auto overflow-hidden">
              <SmartImage
                src={ASSETS.indianFamily}
                alt="Indian adult daughter and elderly father looking calmly at an Android smartphone together in a sunlit home"
                className="w-full h-full object-cover"
                fallbackLabel="Family Shield"
              />
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between">
              <div className="bg-brand-gradient-horizontal text-white px-6 sm:px-8 py-6 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[#BFBFFB] mb-1.5">
                    Beachhead · Family Shield
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Peace of mind for every call your parents answer
                  </h3>
                </div>
                <CornerMark variant="light" position="top-right" />
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6 bg-white">
                <p className="text-sm sm:text-base text-[#404040] leading-relaxed">
                  Scammers rely on isolating elderly parents with &ldquo;do not tell anyone&rdquo; threats. Satark Live warns on the parent&apos;s screen mid-call and, with Family Shield, notifies a linked family member the moment a suspected scam begins.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-black/10 text-xs">
                  <div>
                    <p className="font-display font-semibold text-black text-base">
                      Free Pilot
                    </p>
                    <p className="text-[#595959] mt-0.5">
                      For early Android families
                    </p>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-black text-base">
                      On-Device
                    </p>
                    <p className="text-[#595959] mt-0.5">
                      Zero call recordings uploaded
                    </p>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-black text-base">
                      <CountingNumber
                        from={0}
                        target={2}
                        useGrouping={false}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                      />
                      -Min Setup
                    </p>
                    <p className="text-[#595959] mt-0.5">
                      Simple toggle for parents
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAudienceTrack('family');
                      smoothScrollToSection('contact');
                    }}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Get Priority Family Beta</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudienceTrack('partner');
                      smoothScrollToSection('contact');
                    }}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 border border-black/20 text-black text-xs font-semibold hover:border-black transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Bank &amp; Telecom SDK Inquiry</span>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 3 Growth Channels (PDF Page 12) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-14 lg:mb-16">
            {GROWTH_CHANNELS.map((channel, idx) => (
              <Reveal key={channel.id} delay={idx * 0.06}>
                <article className="border border-black/10 bg-white flex flex-col justify-between h-full overflow-hidden">
                  <div className="bg-brand-gradient-horizontal text-white px-6 py-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] text-[#BFBFFB] mb-1">
                        {channel.tag}
                      </p>
                      <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-white">
                        {channel.title}
                      </h3>
                    </div>
                    <CornerMark variant="light" position="top-right" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-6 bg-white">
                    <p className="text-sm text-[#404040] leading-relaxed">
                      {channel.summary}
                    </p>
                    <div className="pt-4 border-t border-black/10 flex items-center justify-between gap-3 font-mono text-xs text-[#595959]">
                      <span>{channel.detail}</span>
                      <span className="text-[#0000EE] shrink-0">
                        {channel.phase}
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* 4-Stage Roadmap Strip (PDF Page 13) */}
          <Reveal delay={0.08}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-xs text-[#595959] mb-1">
                  Roadmap · From One Guardian to a Safety Net
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-black">
                  Each step earns the trust the next one needs.
                </h3>
              </div>
              <span className="font-mono text-xs text-[#0000EE]">
                [Core → Family → SDK → Telecom]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-black/12">
              {ROADMAP_STEPS.map((step, idx) => (
                <div
                  key={step.phase}
                  className={`p-6 border-r border-b border-black/12 flex flex-col justify-between gap-6 ${
                    idx === 0 ? 'bg-[#EFEFEF]' : 'bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-xs text-[#0000EE] tabular-nums">
                        {step.phase} · {step.stage}
                      </span>
                      <CornerMark
                        variant={idx === 0 ? 'blue' : 'dark'}
                        position="top-right"
                      />
                    </div>
                    <h4 className="font-display text-xl font-semibold text-black mb-4">
                      {step.title}
                    </h4>
                    <ul className="space-y-2.5 text-sm text-[#404040] leading-relaxed">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="font-mono text-[#0000EE]"
                          >
                            ·
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* High-Converting Dual-Track Lead Capture Engine (#contact) */}
      <section
        id="contact"
        className="bg-[#EFEFEF] text-black border-b border-black/10"
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <Reveal className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs text-[#0000EE]">
              [Early Access &amp; Enterprise Pilots]
            </span>
            <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.08] text-[clamp(1.85rem,3.6vw,3rem)] text-black">
              Put a guardian on the line before the next scam call rings.
            </h2>
            <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed max-w-md">
              Join our Android early-access cohort for families — including the shareable 1-page Parent Digital Arrest Safety Card — or schedule a live technical walkthrough of the Satark Bank/UPI SDK.
            </p>

            {/* Concrete Lead Benefits */}
            <ul className="space-y-2.5 text-sm text-black pt-2">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Priority Android beta invite with zero subscription fee during pilot</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Instant unlock of the printable 1-page Parent Scam Response Card</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Direct 15-minute architecture demo for Banks, UPI apps &amp; Telecoms</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-black/10 grid grid-cols-2 gap-6 text-xs text-[#4A4A4A]">
              <div>
                <p className="font-semibold text-black mb-1">National Helpline</p>
                <p>Report cyber fraud on 1930</p>
              </div>
              <div>
                <p className="font-semibold text-black mb-1">Privacy Standard</p>
                <p>On-device first · Cloud only on tap</p>
              </div>
            </div>
          </Reveal>

          <Reveal
            delay={0.08}
            className="lg:col-span-7 bg-white border border-black/12 p-6 sm:p-8 lg:p-10"
          >
            {/* Track Switcher: Families vs Enterprise Partners */}
            <div
              role="tablist"
              aria-label="Select access type"
              className="grid grid-cols-2 border border-black/15 p-1 bg-[#EFEFEF] mb-7"
            >
              <button
                type="button"
                role="tab"
                aria-selected={audienceTrack === 'family'}
                onClick={() => {
                  setAudienceTrack('family');
                  setError('');
                }}
                className={`min-h-[42px] px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  audienceTrack === 'family'
                    ? 'bg-[#0000EE] text-white'
                    : 'text-black/75 hover:text-black'
                }`}
              >
                Protect My Family (Free Beta)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={audienceTrack === 'partner'}
                onClick={() => {
                  setAudienceTrack('partner');
                  setError('');
                }}
                className={`min-h-[42px] px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  audienceTrack === 'partner'
                    ? 'bg-black text-white'
                    : 'text-black/75 hover:text-black'
                }`}
              >
                Bank / UPI SDK &amp; Telecom
              </button>
            </div>

            {waitlistResult ? (
              <div className="py-3 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex items-center justify-center w-11 h-11 bg-[#0000EE] text-white shrink-0">
                      <Check className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#0000EE] mb-1">
                        {waitlistResult.entry.ticketCode} · Spot #{waitlistResult.entry.position}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-black">
                        You are on the waiting list
                      </h3>
                      <p className="text-sm text-[#4A4A4A] mt-1 leading-relaxed">
                        {waitlistResult.alreadyRegistered
                          ? `Welcome back, ${waitlistResult.entry.name}. Your existing spot is confirmed for `
                          : `Confirmed for ${waitlistResult.entry.name} on `}
                        <span className="font-medium text-black">
                          {waitlistResult.entry.normalizedContact}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real Email / WhatsApp Dispatch Confirmation Card */}
                <div className="border border-[#0000EE]/30 bg-[#F7F7FC] p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    {waitlistResult.delivery.channel === 'email' ? (
                      <Mail className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <MessageCircle
                        className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-black">
                        {waitlistResult.delivery.headline}
                      </p>
                      <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
                        {waitlistResult.delivery.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {waitlistResult.delivery.previewUrl && (
                      <a
                        href={waitlistResult.delivery.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View Sent Email</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                    {waitlistResult.delivery.whatsappUrl && (
                      <a
                        href={waitlistResult.delivery.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Open in WhatsApp</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 border border-black/20 bg-white text-black text-xs font-medium hover:border-black transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>{resending ? 'Resending...' : 'Resend'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 border border-black/20 bg-white text-black text-xs font-medium hover:border-black transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{copiedMessage ? 'Copied' : 'Copy Pass'}</span>
                    </button>
                  </div>
                </div>

                {/* Instant Value Delivery: Shareable Parent Safety Checklist */}
                <div className="border border-black/15 bg-[#EFEFEF] p-5 space-y-2.5">
                  <p className="font-mono text-xs text-[#0000EE]">
                    Unlocked · Included in Your Confirmation Message
                  </p>
                  <p className="font-display text-sm font-semibold text-black">
                    3 Rules Every Family Member Should Know Right Now
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#333333] leading-relaxed">
                    <li>1. No police, CBI, ED, or court in India ever conducts an arrest over video call or WhatsApp.</li>
                    <li>2. Never merge an incoming call while talking to an unknown caller — it is often your bank&apos;s voice OTP line.</li>
                    <li>3. Hang up immediately, call a family member back on a separate line, and report suspicious attempts on 1930.</li>
                  </ul>
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-black text-white text-xs font-medium hover:bg-[#0000EE] transition-colors cursor-pointer"
                >
                  Register Another Contact
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => handleSubmit(e, 'contact-section')}
                noValidate
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-black mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rohan Sharma"
                      required
                      className="w-full min-h-[44px] px-4 py-3 text-sm bg-white border border-black/20 text-black placeholder:text-[#737373] focus:outline-none focus:border-[#0000EE] transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-black"
                      >
                        Email or WhatsApp Number
                      </label>
                      {detectedChannel && (
                        <span className="font-mono text-[11px] text-[#0000EE]">
                          {detectedChannel === 'email' ? '→ Email' : '→ WhatsApp'}
                        </span>
                      )}
                    </div>
                    <input
                      id="contact-email"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={
                        audienceTrack === 'family'
                          ? 'rohan@example.com or +91 98XXX XXXXX'
                          : 'rohan@bank.co.in or +91 98XXX XXXXX'
                      }
                      required
                      className="w-full min-h-[44px] px-4 py-3 text-sm bg-white border border-black/20 text-black placeholder:text-[#737373] focus:outline-none focus:border-[#0000EE] transition-colors"
                    />
                  </div>
                </div>

                {audienceTrack === 'family' ? (
                  <div>
                    <span className="block text-xs font-medium text-black mb-2">
                      Phones to Protect
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        '1 Phone',
                        '2–4 Family Phones',
                        '5+ Extended Family',
                      ].map((option) => {
                        const active = familySize === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFamilySize(option)}
                            className={`min-h-[42px] px-3 py-2 text-xs font-medium border transition-colors whitespace-nowrap truncate cursor-pointer ${
                              active
                                ? 'bg-[#0000EE] text-white border-[#0000EE]'
                                : 'bg-white text-black border-black/20 hover:border-black'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="org-name"
                        className="block text-xs font-medium text-black mb-2"
                      >
                        Organization Name
                      </label>
                      <input
                        id="org-name"
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Bank, UPI App, or Telecom"
                        required
                        className="w-full min-h-[44px] px-4 py-3 text-sm bg-white border border-black/20 text-black placeholder:text-[#737373] focus:outline-none focus:border-[#0000EE] transition-colors"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-black mb-2">
                        Integration Track
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {['Bank / UPI SDK', 'Telecom Network'].map((opt) => {
                          const active = partnerType === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPartnerType(opt)}
                              className={`min-h-[44px] px-3 py-2 text-xs font-medium border transition-colors whitespace-nowrap truncate cursor-pointer ${
                                active
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-black border-black/20 hover:border-black'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-black mb-2"
                  >
                    Optional Note
                  </label>
                  <textarea
                    id="contact-message"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      audienceTrack === 'family'
                        ? 'Preferred Indian languages (Hindi, Bengali, Tamil, Marathi, English...)'
                        : 'Target rollout timeline or pilot integration requirements.'
                    }
                    className="w-full px-4 py-3 text-sm bg-white border border-black/20 text-black placeholder:text-[#737373] focus:outline-none focus:border-[#0000EE] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-[#595959]">
                    {audienceTrack === 'family'
                      ? 'Free during beta · Instant Parent Safety Card unlock'
                      : 'Direct technical briefing within 24 hours'}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[#0000EE] text-white text-xs sm:text-sm font-semibold hover:bg-black active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0000EE]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Sending Confirmation...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {audienceTrack === 'family'
                            ? 'Reserve Free Beta + Safety Card'
                            : 'Book Partner SDK Demo'}
                        </span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* Dedicated Meet the Co-Founders Section leading to /co-founders subpage */}
      <section
        id="co-founders-callout"
        className="bg-[#050508] text-white border-b border-white/10"
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-16 lg:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2.5 max-w-2xl">
            <p className="font-mono text-xs text-[#BFBFFB]">
              [People Behind Satark Live]
            </p>
            <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(1.75rem,3.4vw,2.75rem)] text-white">
              Two builders shipping real-time protection for Indian families.
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed">
              Explore the story and dossiers of Shashwata Bhattacharjee and Hemant Rai.
            </p>
          </div>
          <a
            href="/co-founders"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToCoFounders();
            }}
            className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 bg-white text-black text-xs sm:text-sm font-semibold hover:bg-[#0000EE] hover:text-white active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 self-start md:self-center"
          >
            <span>Meet the Co-Founders</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Quiet Architectural Onyx Footer */}
      <footer className="bg-black text-white">
        <div className="h-[3px] w-full bg-brand-gradient-horizontal" />

        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-12 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-white/15">
            <div className="sm:col-span-2 lg:col-span-4 space-y-4">
              <a
                href="#top"
                onClick={(e) => handleFooterNav(e, 'top')}
                aria-label="Satark Live Home"
                className="inline-flex items-center"
              >
                <SatarkBrand size="footer" />
              </a>
              <p className="text-sm text-white/75 max-w-sm leading-relaxed">
                Hear the lie before you act on it. On-device call guardian for digital arrest calls, call-merge OTP fraud, and spoofed bank numbers.
              </p>
            </div>

            <div className="lg:col-span-2 space-y-3 text-sm">
              <p className="font-mono text-xs text-white/55">Product</p>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="#overview"
                    onClick={(e) => handleFooterNav(e, 'overview')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    Three Layers
                  </a>
                </li>
                <li>
                  <a
                    href="#impact"
                    onClick={(e) => handleFooterNav(e, 'impact')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    The Threat
                  </a>
                </li>
                <li>
                  <a
                    href="#live-simulator"
                    onClick={(e) => handleFooterNav(e, 'live-simulator')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    Mid-Call Demo
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3 text-sm">
              <p className="font-mono text-xs text-white/55">Engineering</p>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="#architecture"
                    onClick={(e) => handleFooterNav(e, 'architecture')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    System Layers
                  </a>
                </li>
                <li>
                  <a
                    href="#network"
                    onClick={(e) => handleFooterNav(e, 'network')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    India Corridors
                  </a>
                </li>
                <li>
                  <a
                    href="#leadership"
                    onClick={(e) => handleFooterNav(e, 'leadership')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3 text-sm">
              <p className="font-mono text-xs text-white/55">Team</p>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="/co-founders"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToCoFounders();
                    }}
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#BFBFFB] font-medium transition-colors"
                  >
                    <span>Meet the Co-Founders</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => handleFooterNav(e, 'contact')}
                    className="hover:text-[#BFBFFB] transition-colors"
                  >
                    Partner Inquiries
                  </a>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 space-y-3 text-sm">
              <p className="font-mono text-xs text-white/55">References</p>
              <p className="text-xs text-white/75 leading-relaxed">
                Sources: MHA data to Parliament (via Inc42) · NPCI call-merging advisory · I4C account blocking · National Cybercrime Helpline 1930
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/55">
            <p>&copy; 2026 Satark Live. Hear the lie before you act on it.</p>
            <div className="flex items-center gap-6">
              <a
                href="/co-founders"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToCoFounders();
                }}
                className="hover:text-white transition-colors"
              >
                Meet the Co-Founders
              </a>
              <a
                href="#top"
                onClick={(e) => handleFooterNav(e, 'top')}
                className="hover:text-white transition-colors"
              >
                Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}

      {/* Animated On-Demand Early Access & Partner Modal */}
      <AnimatePresence>
        {inquiryOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-briefing-title"
            data-lenis-prevent
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onCloseInquiry}
          >
            <motion.div
              initial={
                prefersReduced ? false : { opacity: 0, scale: 0.97, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 8 }
              }
              transition={{ duration: 0.2, ease: EASE_ARCHITECTURAL }}
              className="w-full max-w-lg bg-white text-black border border-black/15 p-6 sm:p-8 shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-black/10">
                <div>
                  <p className="font-mono text-xs text-[#0000EE] mb-1">
                    [Satark Live · Priority Access]
                  </p>
                  <h3
                    id="modal-briefing-title"
                    className="font-display text-2xl font-semibold text-black"
                  >
                    Get Satark Live Early Access
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={onCloseInquiry}
                  className="inline-flex items-center justify-center w-10 h-10 text-black/70 hover:text-black hover:bg-[#EFEFEF] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {waitlistResult ? (
                <div className="pt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-9 h-9 bg-[#0000EE] text-white shrink-0 mt-0.5">
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-mono text-[11px] text-[#0000EE]">
                        {waitlistResult.entry.ticketCode} · Spot #{waitlistResult.entry.position}
                      </p>
                      <p className="font-display text-xl font-semibold text-black">
                        You are on the waiting list
                      </p>
                      <p className="text-xs sm:text-sm text-[#4A4A4A] mt-0.5 leading-relaxed">
                        Reserved for <span className="font-medium text-black">{waitlistResult.entry.name}</span> ({waitlistResult.entry.normalizedContact}).
                      </p>
                    </div>
                  </div>

                  {/* Automated Email / WhatsApp Dispatch Status */}
                  <div className="border border-[#0000EE]/30 bg-[#F7F7FC] p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      {waitlistResult.delivery.channel === 'email' ? (
                        <Mail className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <MessageCircle
                          className="w-4 h-4 text-[#0000EE] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-black">
                          {waitlistResult.delivery.headline}
                        </p>
                        <p className="text-xs text-[#4A4A4A] mt-0.5 leading-relaxed">
                          {waitlistResult.delivery.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {waitlistResult.delivery.previewUrl && (
                        <a
                          href={waitlistResult.delivery.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>View Sent Email</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                      {waitlistResult.delivery.whatsappUrl && (
                        <a
                          href={waitlistResult.delivery.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Open in WhatsApp</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-2 border border-black/20 bg-white text-black text-xs font-medium hover:border-black transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                        <span>{resending ? 'Resending...' : 'Resend'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-2 border border-black/20 bg-white text-black text-xs font-medium hover:border-black transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Exact Dispatched Message Preview */}
                  <div className="border border-black/12 bg-[#FAFAFC] p-3.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#595959] mb-1.5">
                      Dispatched Confirmation Message
                    </p>
                    <p className="text-xs text-[#262626] whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                      {waitlistResult.delivery.messageText}
                    </p>
                  </div>

                  {error && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onCloseInquiry}
                      className="min-h-[44px] px-5 py-2.5 bg-black text-white text-xs font-medium hover:bg-[#0000EE] transition-colors cursor-pointer"
                    >
                      Return to Page
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="min-h-[44px] px-4 py-2.5 text-xs font-medium text-black border border-black/20 hover:border-black transition-colors cursor-pointer"
                    >
                      Add Another Contact
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleSubmit(e, 'modal')}
                  noValidate
                  className="pt-5 space-y-4"
                >
                  <div className="grid grid-cols-2 border border-black/15 p-1 bg-[#EFEFEF]">
                    <button
                      type="button"
                      onClick={() => {
                        setAudienceTrack('family');
                        setError('');
                      }}
                      className={`min-h-[38px] text-xs font-semibold transition-colors cursor-pointer ${
                        audienceTrack === 'family'
                          ? 'bg-[#0000EE] text-white'
                          : 'text-black/75'
                      }`}
                    >
                      Family Beta (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAudienceTrack('partner');
                        setError('');
                      }}
                      className={`min-h-[38px] text-xs font-semibold transition-colors cursor-pointer ${
                        audienceTrack === 'partner'
                          ? 'bg-black text-white'
                          : 'text-black/75'
                      }`}
                    >
                      Bank / Telecom SDK
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="modal-name"
                      className="block text-xs font-medium text-black mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rohan Sharma"
                      required
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-black/20 text-black focus:outline-none focus:border-[#0000EE]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="modal-email"
                        className="block text-xs font-medium text-black"
                      >
                        Email or WhatsApp Number
                      </label>
                      {detectedChannel && (
                        <span className="font-mono text-[11px] text-[#0000EE]">
                          {detectedChannel === 'email'
                            ? 'Sends via Email'
                            : 'Sends via WhatsApp'}
                        </span>
                      )}
                    </div>
                    <input
                      id="modal-email"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={
                        audienceTrack === 'family'
                          ? 'rohan@example.com or +91 98XXX XXXXX'
                          : 'rohan@bank.co.in or +91 98XXX XXXXX'
                      }
                      required
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-black/20 text-black focus:outline-none focus:border-[#0000EE]"
                    />
                    <p className="text-[11px] text-[#595959] mt-1.5">
                      We&apos;ll automatically send your &ldquo;You are on the waiting list&rdquo; pass to your email or WhatsApp.
                    </p>
                  </div>

                  {audienceTrack === 'partner' && (
                    <div>
                      <label
                        htmlFor="modal-org"
                        className="block text-xs font-medium text-black mb-1.5"
                      >
                        Organization Name
                      </label>
                      <input
                        id="modal-org"
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Bank, UPI App, or Telecom"
                        required
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-sm border border-black/20 text-black focus:outline-none focus:border-[#0000EE]"
                      />
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onCloseInquiry}
                      className="min-h-[44px] px-4 py-2.5 text-xs font-medium text-[#4A4A4A] hover:text-black transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#0000EE] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>
                          {audienceTrack === 'family'
                            ? 'Reserve Free Beta'
                            : 'Request Partner Demo'}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
