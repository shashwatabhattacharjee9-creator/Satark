import { Reveal } from './MotionPrimitives';
import { CornerMark } from './Primitives';
import { CountingNumber } from './ui/counting-number';

const TRUST_PILLARS = [
  {
    title: 'Private by default',
    body: 'Listening and detection run on your phone. The cloud only sees the warrant screenshot or frame you choose to send.',
  },
  {
    title: 'AI explains, rules decide',
    body: 'Law sections and agency checks come from a fixed verified registry of IT Act, BNS, and CrPC rules — never from model memory.',
  },
  {
    title: 'No keys on the phone',
    body: 'A lightweight Cloud Run FastAPI backend issues short-lived tokens on demand so API keys never sit on the device.',
  },
  {
    title: 'You choose, always',
    body: 'Cloud verification is an explicit tap, never automatic. You remain in full command of every call decision.',
  },
  {
    title: 'Honest about limits',
    body: 'Android 14 blocks third-party call recording, so Satark listens transparently through the speaker path and microphone.',
  },
  {
    title: 'A fallback for each step',
    body: 'If on-device AI is slow, local keyword matching still raises the alert. If live streaming is flaky, a standard Gemini call still verifies.',
  },
];

export function DecentralizedFutureSection() {
  return (
    <section className="overflow-hidden border-b border-white/10">
      {/* Upper Crisp Paper White Half (Slide 8 top + PDF Page 10 Trust) */}
      <div className="bg-white text-black">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24">
          <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <p className="font-display text-sm font-semibold text-black leading-snug">
                Trust Architecture, Not Black-Box Promises
              </p>
              <p className="mt-2 text-xs text-[#595959] leading-relaxed max-w-md">
                Engineered honestly around mobile privacy, OS boundaries, and deterministic Indian legal verification.
              </p>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 flex items-start justify-between lg:block text-left lg:text-center">
              <h2 className="font-display font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(2.25rem,5.2vw,4.5rem)] text-black">
                Built To Be
                <span className="block text-[#0000EE] sm:pl-8 lg:pl-12">
                  Trusted
                </span>
              </h2>
              <div className="lg:hidden pt-1 shrink-0">
                <CornerMark variant="dark" position="top-right" />
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-2 lg:order-3 lg:justify-end">
              <CornerMark variant="dark" position="top-right" />
            </div>
          </Reveal>

          {/* 6 Trust Guarantees from PDF Page 10 */}
          <Reveal
            delay={0.08}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/10"
          >
            {TRUST_PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="p-6 sm:p-7 border-r border-b border-black/10 bg-white flex flex-col justify-between gap-3"
              >
                <span className="font-mono text-xs text-[#0000EE] tabular-nums">
                  0{idx + 1}.
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-black mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Lower Full-Bleed Branding Gradient Band (Slide 8 bottom) */}
      <div className="bg-brand-gradient-horizontal text-white">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-16 lg:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <Reveal className="sm:col-span-2 lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/20 pb-6 lg:pb-0 lg:pr-8">
            <h3 className="font-display text-lg font-semibold text-white mb-2.5">
              The Right Model In The Right Place
            </h3>
            <p className="text-sm text-white/80 leading-relaxed max-w-xl">
              Gemma runs privately on the handset, Gemini verifies visual evidence strictly on tap, and deterministic rules issue the final verdict.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="sm:col-span-1 lg:col-span-4 lg:pl-4">
            <p className="font-display text-5xl sm:text-6xl font-semibold tracking-[-0.04em] tabular-nums text-white">
              <CountingNumber
                from={12}
                target={0}
                useGrouping={false}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
              />{' '}
              Keys
            </p>
            <p className="mt-3 font-display text-base font-medium text-white">
              Stored on the Android Device
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80">
              Short-lived session tokens minted via Cloud Run FastAPI keep credentials completely off the handset.
            </p>
          </Reveal>

          <Reveal
            delay={0.14}
            className="sm:col-span-1 lg:col-span-4 pt-6 border-t border-white/15 sm:pt-0 sm:border-t-0 sm:border-l sm:border-white/20 sm:pl-8"
          >
            <p className="font-display text-5xl sm:text-6xl font-semibold tracking-[-0.04em] tabular-nums text-white">
              On Tap
            </p>
            <p className="mt-3 font-display text-base font-medium text-white">
              Cloud Verification Consent
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80">
              Every warrant scan or video frame check requires an explicit tap from the caller on the line.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
