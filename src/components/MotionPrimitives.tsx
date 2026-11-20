import Lenis from 'lenis';
import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect } from 'react';

export const EASE_ARCHITECTURAL = [0.22, 1, 0.36, 1] as const;

let activeLenis: Lenis | null = null;

function luxuryScrollEasing(t: number): number {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}

export function setSmoothScrollPaused(paused: boolean) {
  if (!activeLenis) return;
  if (paused) {
    activeLenis.stop();
  } else {
    activeLenis.start();
  }
}

export function scrollToTopSmooth(immediate = false) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (activeLenis && !prefersReduced) {
    activeLenis.scrollTo(0, {
      immediate,
      duration: immediate ? 0 : 1.15,
      easing: luxuryScrollEasing,
    });
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: immediate || prefersReduced ? 'auto' : 'smooth',
  });
}

/**
 * Smoothly scrolls to a target section ID via Lenis inertial glide
 * while accounting for the fixed top navigation bar.
 */
export function smoothScrollToSection(targetId: string) {
  const cleanId = targetId.replace(/^#/, '');
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (cleanId === 'top') {
    scrollToTopSmooth(prefersReduced);
    return;
  }

  const el = document.getElementById(cleanId);
  if (!el) return;

  const headerOffset = 72;

  if (activeLenis && !prefersReduced) {
    activeLenis.scrollTo(el, {
      offset: -headerOffset,
      duration: 1.35,
      easing: luxuryScrollEasing,
    });
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReduced ? 'auto' : 'smooth',
  });
}

interface SmoothScrollProviderProps {
  children: ReactNode;
  paused?: boolean;
  resetKey?: string;
}

/**
 * Provides buttery-smooth Lenis inertial wheel scrolling across the entire website,
 * automatically respecting prefers-reduced-motion and nested [data-lenis-prevent] scrollers.
 */
export function SmoothScrollProvider({
  children,
  paused = false,
  resetKey,
}: SmoothScrollProviderProps) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      activeLenis = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.3,
      easing: luxuryScrollEasing,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.25,
      autoRaf: true,
      anchors: false,
    });

    activeLenis = lenis;

    return () => {
      lenis.destroy();
      if (activeLenis === lenis) {
        activeLenis = null;
      }
    };
  }, [prefersReduced]);

  useEffect(() => {
    setSmoothScrollPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (!activeLenis) return;
    activeLenis.resize();
  }, [resetKey]);

  return <>{children}</>;
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/**
 * Silky compositor-only scroll reveal (opacity + transform only)
 * with immediate fallback when prefers-reduced-motion is enabled.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.988 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some', margin: '0px 0px -48px 0px' }}
      transition={{
        duration: 0.72,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      style={{ willChange: 'transform, opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
