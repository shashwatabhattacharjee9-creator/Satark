'use client';

import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type ValueAnimationTransition,
} from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { cn } from '../../lib/utils';

export type CountingNumberRef = {
  startAnimation: () => void;
};

export type CountingNumberProps = {
  from?: number;
  target: number;
  transition?: ValueAnimationTransition;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
  triggerOnView?: boolean;
  padZero?: number;
  decimals?: number;
  locale?: string;
  useGrouping?: boolean;
  /** When true, smoothly transitions from the current displayed value when `target` updates dynamically */
  animateFromPrevious?: boolean;
};

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  duration: 1.85,
  ease: [0.16, 1, 0.3, 1],
  type: 'tween',
};

export const CountingNumber = forwardRef<
  CountingNumberRef,
  CountingNumberProps
>(
  (
    {
      from = 0,
      target = 100,
      transition = DEFAULT_TRANSITION,
      className,
      onStart,
      onComplete,
      autoStart = true,
      triggerOnView = true,
      padZero = 0,
      decimals = 0,
      locale = 'en-IN',
      useGrouping = true,
      animateFromPrevious = false,
      ...props
    },
    ref,
  ) => {
    const spanRef = useRef<HTMLSpanElement | null>(null);
    const isInView = useInView(spanRef, { once: true, amount: 'some' });
    const prefersReduced = useReducedMotion();

    const count = useMotionValue(prefersReduced ? target : from);
    const controlsRef = useRef<AnimationPlaybackControls | null>(null);
    const hasStartedRef = useRef(false);

    const formatted = useTransform(count, (latest) => {
      const value =
        decimals > 0
          ? Number(latest.toFixed(decimals))
          : Math.round(latest);

      if (padZero > 0 && decimals === 0) {
        return String(Math.abs(value)).padStart(padZero, '0');
      }

      if (!useGrouping) {
        return decimals > 0 ? value.toFixed(decimals) : String(value);
      }

      return value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    });

    const startAnimation = useCallback(
      (startVal?: number) => {
        controlsRef.current?.stop();
        onStart?.();
        if (prefersReduced) {
          count.set(target);
          onComplete?.();
          return;
        }
        const initial = startVal !== undefined ? startVal : from;
        count.set(initial);
        controlsRef.current = animate(count, target, {
          ...transition,
          onComplete: () => onComplete?.(),
        });
      },
      [from, target, transition, onStart, onComplete, count, prefersReduced],
    );

    useImperativeHandle(ref, () => ({
      startAnimation: () => startAnimation(),
    }));

    useEffect(() => {
      if (!autoStart) return;
      if (triggerOnView && !isInView) return;

      if (animateFromPrevious && hasStartedRef.current) {
        startAnimation(count.get());
      } else {
        hasStartedRef.current = true;
        startAnimation(from);
      }

      return () => {
        controlsRef.current?.stop();
      };
    }, [
      autoStart,
      triggerOnView,
      isInView,
      target,
      from,
      animateFromPrevious,
      startAnimation,
      count,
    ]);

    return (
      <motion.span
        ref={spanRef}
        className={cn('tabular-nums inline-block', className)}
        {...props}
      >
        {formatted}
      </motion.span>
    );
  },
);

CountingNumber.displayName = 'CountingNumber';

/**
 * Parses a display metric string like "₹1,935 Cr", "₹5L+", "5 Steps", "0 KB",
 * "1930", or "2.4 GB" and smoothly animates its numeric portion on scroll into view.
 * Non-numeric strings (e.g. "NPCI", "Family", "Mid-Call") render cleanly untouched.
 */
export function AnimatedMetricText({
  text,
  className,
  duration = 1.65,
  triggerOnView = true,
}: {
  text: string;
  className?: string;
  duration?: number;
  triggerOnView?: boolean;
}) {
  const match = text.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) {
    return <span className={className}>{text}</span>;
  }

  const [, prefix, rawNum, suffix] = match;
  const cleanNumStr = rawNum.replace(/,/g, '');
  const numericTarget = Number(cleanNumStr);

  if (Number.isNaN(numericTarget)) {
    return <span className={className}>{text}</span>;
  }

  const hasCommas = rawNum.includes(',');
  const decimalPart = cleanNumStr.split('.')[1];
  const decimals = decimalPart ? decimalPart.length : 0;
  const padZero =
    !hasCommas && decimals === 0 && cleanNumStr.length > 1 && cleanNumStr.startsWith('0')
      ? cleanNumStr.length
      : 0;

  // For zero-target metrics like "0 KB" or "0 Keys", glide smoothly down from 12 -> 0
  const startFrom = numericTarget === 0 ? 12 : 0;

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      <CountingNumber
        from={startFrom}
        target={numericTarget}
        decimals={decimals}
        padZero={padZero}
        useGrouping={hasCommas}
        triggerOnView={triggerOnView}
        transition={{
          duration,
          ease: [0.16, 1, 0.3, 1],
          type: 'tween',
        }}
      />
      {suffix}
    </span>
  );
}

export default CountingNumber;
