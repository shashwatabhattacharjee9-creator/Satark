import { Menu, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { type MouseEvent, useEffect, useState } from 'react';
import { EASE_ARCHITECTURAL, smoothScrollToSection } from './MotionPrimitives';
import { SatarkBrand } from './Primitives';

interface NavbarProps {
  onOpenInquiry: () => void;
  currentPage: 'home' | 'co-founders';
  onNavigateHome: (sectionId?: string) => void;
}

const NAV_LINKS = [
  { id: 'prototype', label: 'Live Prototype', href: '#prototype' },
  { id: 'overview', label: 'How It Works', href: '#overview' },
  { id: 'impact', label: 'The Threat', href: '#impact' },
  { id: 'network', label: 'India Corridors', href: '#network' },
  { id: 'architecture', label: 'Architecture', href: '#architecture' },
  { id: 'leadership', label: 'Roadmap', href: '#leadership' },
];

export function Navbar({
  onOpenInquiry,
  currentPage,
  onNavigateHome,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < 160) {
        setActiveSection('');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (currentPage !== 'home') {
      setActiveSection('');
      return;
    }

    const elements = NAV_LINKS.map((link) =>
      document.getElementById(link.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.05, 0.2, 0.45],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentPage]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    event.preventDefault();
    setMobileOpen(false);
    if (currentPage !== 'home') {
      onNavigateHome(targetId === 'top' ? undefined : targetId);
      return;
    }
    smoothScrollToSection(targetId);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${
        scrolled || mobileOpen
          ? 'satark-nav-glass'
          : 'satark-nav-glass-top'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-12 h-[72px] sm:h-20 flex items-center justify-between gap-6 lg:gap-8">
        {/* Zone 1: Satark Logo Mark + Text Logo */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, 'top')}
          aria-label="Satark Live Home"
          className="inline-flex items-center whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BFBFFB]"
        >
          <SatarkBrand size="nav" />
        </a>

        {/* Zone 2: 5 concise single-line text links with smooth active indicator */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/80"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BFBFFB] ${
                  isActive ? 'text-white' : 'text-white/75 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId={prefersReduced ? undefined : 'nav-active-bar'}
                    transition={{ duration: 0.22, ease: EASE_ARCHITECTURAL }}
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#BFBFFB]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA + mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenInquiry}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium text-black bg-white hover:bg-[#BFBFFB] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BFBFFB]"
          >
            Get Early Access
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-white hover:text-[#BFBFFB] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Ultra-thin scroll progress rail along bottom edge of navbar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: prefersReduced ? scrollYProgress : scaleX }}
        className="h-[2px] w-full origin-left bg-gradient-to-r from-[#0000B3] via-[#0000EE] to-[#BFBFFB]"
      />

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: EASE_ARCHITECTURAL }}
            className="md:hidden satark-drawer-glass border-b border-white/15 px-5 sm:px-6 py-6 shadow-2xl"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className={`flex items-center justify-between min-h-[44px] px-2 text-base font-medium border-b border-white/10 transition-colors ${
                      isActive
                        ? 'text-[#BFBFFB]'
                        : 'text-white/90 hover:text-[#BFBFFB]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="font-mono text-xs text-[#BFBFFB]">
                        Active
                      </span>
                    )}
                  </a>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenInquiry();
                }}
                className="mt-5 w-full min-h-[46px] py-3 px-5 bg-[#0000EE] text-white text-sm font-medium hover:bg-[#0000B3] transition-colors cursor-pointer"
              >
                Get Early Access
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
