import { ArrowRight } from 'lucide-react';
import { ASSETS, DEFENCE_LANDSCAPE } from '../data/landingData';
import { Reveal, smoothScrollToSection } from './MotionPrimitives';
import { CornerMark, SmartImage } from './Primitives';
import { CountingNumber } from './ui/counting-number';

interface ImpactSplitSectionProps {
  onOpenInquiry: () => void;
}

export function ImpactSplitSection({ onOpenInquiry }: ImpactSplitSectionProps) {
  return (
    <section
      id="impact"
      className="bg-white text-black border-b border-black/10"
    >
      {/* Part 1: Slide 4 layout — Paper White top + Massive ₹1,935 Crore Branding Gradient Block */}
      <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-28 pb-14 sm:pb-16 lg:pb-24">
        <Reveal className="flex items-start justify-between gap-6 sm:gap-8 mb-10 sm:mb-14 lg:mb-16">
          <div>
            <p className="font-mono text-xs text-[#0000EE] mb-3">
              [The Problem · India Call Fraud Crisis]
            </p>
            <h2 className="font-display font-semibold tracking-[-0.035em] leading-[1.08] text-[clamp(1.85rem,4vw,3.5rem)] max-w-3xl text-black">
              One Phone Call Can Empty a{' '}
              <span className="text-[#0000EE]">Bank Account</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-4 shrink-0">
            <CornerMark variant="dark" position="top-right" />
            <span className="hidden sm:inline font-mono text-xs text-[#595959]">
              [MHA Parliament Data]
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left narrow Paper White column — What Victims Say */}
          <Reveal
            delay={0.05}
            className="lg:col-span-4 flex flex-col justify-between py-1 sm:py-2"
          >
            <div className="space-y-4">
              <p className="font-mono text-xs text-[#595959]">
                What Victims Report
              </p>
              <p className="font-display text-lg font-semibold text-black leading-snug">
                Losses of ₹
                <CountingNumber
                  from={0}
                  target={50000}
                  locale="en-IN"
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                />{' '}
                to ₹
                <CountingNumber
                  from={0}
                  target={500000}
                  locale="en-IN"
                  transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                />
                + in a Single Coerced Call
              </p>
              <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
                Across r/india and r/IsThisAScamIndia, even cautious, tech-literate callers describe falling for digital arrest and call-merge scripts because the voice, uniform, and Caller ID look completely real.
              </p>
            </div>

            <div className="pt-6 lg:pt-8 space-y-4">
              <button
                type="button"
                onClick={onOpenInquiry}
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 py-3 bg-black text-white text-xs font-medium hover:bg-[#0000EE] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0000EE]"
              >
                <span>Shield Your Family Before It Rings</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <p className="font-mono text-[11px] text-[#595959]">
                Sources: MHA data to Parliament (via Inc42) · NPCI call-merge warning
              </p>
            </div>
          </Reveal>

          {/* Right monumental Branding Gradient ₹1,935 crore panel */}
          <Reveal
            delay={0.12}
            className="lg:col-span-8 bg-brand-gradient text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
          >
            <div className="pb-8 sm:pb-10 border-b border-white/20">
              <p className="font-mono text-xs text-[#BFBFFB] mb-3">
                Lost to Digital Arrest in One Year
              </p>
              <p className="font-display font-medium text-[clamp(2.5rem,10vw,5.25rem)] leading-none tracking-[-0.04em] tabular-nums">
                ₹
                <CountingNumber
                  from={0}
                  target={1935}
                  locale="en-IN"
                  transition={{ duration: 2.1, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                />{' '}
                <span className="text-[0.45em] font-normal text-[#BFBFFB]">crore</span>
              </p>
              <p className="mt-4 text-xs sm:text-sm text-white/80 font-mono">
                Government data presented to Parliament · Rising across video arrest &amp; OTP fraud
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8">
              <div>
                <h3 className="font-display text-base font-semibold text-white mb-2">
                  Digital Arrest Video Calls
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  A fake CBI or TRAI officer on a video call claims you are under arrest, flashes a forged warrant, and keeps you on the line until you pay.
                </p>
              </div>
              <div className="pt-6 border-t border-white/15 sm:pt-0 sm:border-t-0 sm:border-l sm:border-white/20 sm:pl-8">
                <h3 className="font-display text-base font-semibold text-white mb-2">
                  Call-Merge OTP &amp; Spoofed Bank IDs
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Callers trick victims into merging their bank&apos;s automated OTP line, or spoof trusted bank numbers so Caller ID says safe while the voice is not.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Part 2: Slide 9 Bento + PDF Page 11 — Defences Exist. The Live Call Is The Gap */}
      <div className="border-t border-black/10">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-16 lg:py-24">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-10 sm:mb-12">
            <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.12] text-[clamp(1.65rem,3.2vw,2.75rem)] max-w-3xl text-black">
              Defences Exist. The{' '}
              <span className="text-[#0000EE]">Live Call Is The Gap</span>
            </h2>
            <div className="flex items-center gap-6 font-mono text-xs text-[#595959] shrink-0">
              <span>[Landscape]</span>
              <span>[I4C · NPCI · 1930]</span>
            </div>
          </Reveal>

          {/* 3-Part Bento Strip with real editorial smartphone-call photography */}
          <Reveal
            delay={0.06}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 border border-black/10 mb-12"
          >
            {/* Mist Card */}
            <div className="md:col-span-1 lg:col-span-3 bg-[#EFEFEF] p-6 sm:p-8 flex flex-col justify-between min-h-[240px] sm:min-h-[270px]">
              <div>
                <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums text-black">
                  ₹
                  <CountingNumber
                    from={0}
                    target={5}
                    useGrouping={false}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
                  />
                  L+
                </p>
                <p className="mt-4 text-sm text-[#4A4A4A] leading-relaxed">
                  Typical single-call loss reported by victims before post-fraud helplines or account freezes can intervene.
                </p>
              </div>
              <a
                href="#architecture"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToSection('architecture');
                }}
                className="mt-6 inline-flex items-center gap-2 min-h-[44px] sm:min-h-0 text-xs font-semibold text-black hover:text-[#0000EE] transition-colors whitespace-nowrap"
              >
                <span>Inspect Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Onyx-to-Vivid-Blue Block */}
            <div className="md:col-span-1 lg:col-span-5 bg-brand-aura-right text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[240px] sm:min-h-[270px] border-t md:border-t-0 md:border-l lg:border-x border-black/10">
              <div className="flex items-start justify-between">
                <p className="font-display text-5xl sm:text-6xl font-semibold tracking-[-0.04em] tabular-nums">
                  Mid-Call
                </p>
                <CornerMark variant="light" position="top-right" />
              </div>
              <div className="pt-6">
                <p className="font-display text-base font-medium text-white mb-1.5">
                  One Guardian Inside the Call, With You in Control
                </p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Caller ID checks numbers before pickup and 1930 acts after money leaves. Satark Live warns you at the exact moment of pressure.
                </p>
              </div>
            </div>

            {/* Authentic Documentary Evening Call Photo */}
            <div className="relative md:col-span-2 lg:col-span-4 bg-black h-[220px] sm:h-[260px] lg:h-auto lg:min-h-[270px] overflow-hidden border-t lg:border-t-0 border-black/10">
              <SmartImage
                src={ASSETS.smartphoneCall}
                alt="Person answering an evening smartphone call in a modern home with cool cobalt edge lighting"
                className="w-full h-full object-cover"
                fallbackLabel="Live Call Moment"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] text-white/90">
                  Interrupting the script while the call is still live
                </p>
                <CornerMark variant="light" position="bottom-right" />
              </div>
            </div>
          </Reveal>

          {/* Clean Swiss Comparison Matrix directly from PDF Page 11 */}
          <Reveal delay={0.1}>
            <div className="border border-black/15 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-[#EFEFEF] border-b border-black/15 text-xs font-mono text-[#4A4A4A]">
                    <th className="py-4 px-5 font-medium">Existing Defence</th>
                    <th className="py-4 px-5 font-medium">What It Does</th>
                    <th className="py-4 px-5 font-medium">What Satark Live Adds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-sm">
                  {DEFENCE_LANDSCAPE.map((row) => (
                    <tr
                      key={row.defence}
                      className={
                        row.highlight
                          ? 'bg-brand-gradient-horizontal text-white font-medium'
                          : 'bg-white text-black'
                      }
                    >
                      <td className="py-4 px-5 font-display font-semibold whitespace-nowrap">
                        {row.defence}
                      </td>
                      <td
                        className={`py-4 px-5 ${
                          row.highlight ? 'text-white/90' : 'text-[#4A4A4A]'
                        }`}
                      >
                        {row.whatItDoes}
                      </td>
                      <td
                        className={`py-4 px-5 ${
                          row.highlight ? 'text-white' : 'text-black'
                        }`}
                      >
                        {row.whatSatarkAdds}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* High-Converting Lead Magnet Strip directly after Proof */}
          <Reveal
            delay={0.14}
            className="mt-10 bg-[#EFEFEF] border border-black/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 max-w-2xl">
              <p className="font-mono text-xs text-[#0000EE]">
                Free Family Resource + Priority Android Beta
              </p>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-black">
                Get the 1-Page Digital Arrest &amp; Call-Merge Safety Card for Your Parents
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4A4A]">
                Shareable on family WhatsApp groups — plus early installation access when Satark Live opens for your city.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenInquiry}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 bg-[#0000EE] text-white text-xs sm:text-sm font-semibold hover:bg-black active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Send Free Safety Card &amp; Beta Invite</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
