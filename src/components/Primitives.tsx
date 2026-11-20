import { useState } from 'react';
import { BRAND_LOGOS } from '../data/landingData';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SmartImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'Visual Plate',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-brand-gradient text-white/80 font-mono text-xs tracking-wider ${className}`}
      >
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

interface SatarkBrandProps {
  size?: 'nav' | 'footer';
}

/**
 * Renders the user's provided Satark emblem logo + Satark text logo with resilient
 * typographic/geometric fallbacks so the brand mark never renders broken.
 */
export function SatarkBrand({ size = 'nav' }: SatarkBrandProps) {
  const [markError, setMarkError] = useState(false);
  const [textError, setTextError] = useState(false);

  const markBox = size === 'nav' ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-11 w-11';
  const wordmarkHeight =
    size === 'nav'
      ? 'h-9 sm:h-11 max-w-[180px] sm:max-w-[230px]'
      : 'h-9 max-w-[190px]';

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0">
      {!markError ? (
        <img
          src={BRAND_LOGOS.mark}
          alt="Satark emblem"
          referrerPolicy="no-referrer"
          onError={() => setMarkError(true)}
          className={`${markBox} object-contain rounded-sm shrink-0`}
        />
      ) : (
        <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
          <span className="w-[4px] h-5 bg-white inline-block" />
          <span className="w-[4px] h-5 bg-[#0000EE] inline-block" />
        </span>
      )}

      {!textError ? (
        <img
          src={BRAND_LOGOS.wordmark}
          alt="Satark Live"
          referrerPolicy="no-referrer"
          onError={() => setTextError(true)}
          className={`${wordmarkHeight} w-auto object-contain shrink-0`}
        />
      ) : (
        <span className="text-white font-display text-xl font-bold tracking-[-0.03em]">
          Satark Live
        </span>
      )}
    </span>
  );
}

interface CornerMarkProps {
  variant?: 'light' | 'dark' | 'blue';
  position?: 'top-right' | 'bottom-right' | 'bottom-left';
  className?: string;
}

/**
 * Architectural geometric corner triangle motif propagated from the layout reference sheet.
 */
export function CornerMark({
  variant = 'light',
  position = 'top-right',
  className = '',
}: CornerMarkProps) {
  const fill =
    variant === 'light'
      ? '#FFFFFF'
      : variant === 'blue'
        ? '#0000EE'
        : '#000000';

  const points =
    position === 'top-right'
      ? '0,0 14,0 14,14'
      : position === 'bottom-right'
        ? '14,0 14,14 0,14'
        : '0,0 0,14 14,14';

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <polygon points={points} fill={fill} />
    </svg>
  );
}
