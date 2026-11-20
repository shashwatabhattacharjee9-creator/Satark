import { MotionConfig } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { CoFoundersPage } from './components/CoFoundersPage';
import { DecentralizedFutureSection } from './components/DecentralizedFutureSection';
import { GlobalNetworkSection } from './components/GlobalNetworkSection';
import { HeroSection } from './components/HeroSection';
import { ImpactSplitSection } from './components/ImpactSplitSection';
import { LayersDiagramSection } from './components/LayersDiagramSection';
import { LeadershipContactSection } from './components/LeadershipContactSection';
import { LivePrototypeSection } from './components/LivePrototypeSection';
import { MissionEmpowerSection } from './components/MissionEmpowerSection';
import {
  scrollToTopSmooth,
  SmoothScrollProvider,
  smoothScrollToSection,
} from './components/MotionPrimitives';
import { Navbar } from './components/Navbar';
import { OverviewAccordionSection } from './components/OverviewAccordionSection';

type AppPage = 'home' | 'co-founders';

function getPageFromPath(): AppPage {
  if (typeof window === 'undefined') return 'home';
  const normalized = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return normalized === '/co-founders' ? 'co-founders' : 'home';
}

export default function App() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>(() => getPageFromPath());

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(getPageFromPath());
      scrollToTopSmooth(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!inquiryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setInquiryOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inquiryOpen]);

  const navigateToCoFounders = useCallback(() => {
    if (window.location.pathname !== '/co-founders') {
      window.history.pushState({}, '', '/co-founders');
    }
    setCurrentPage('co-founders');
    scrollToTopSmooth(true);
  }, []);

  const navigateHome = useCallback((sectionId?: string) => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setCurrentPage('home');
    if (sectionId) {
      requestAnimationFrame(() => {
        setTimeout(() => smoothScrollToSection(sectionId), 80);
      });
    } else {
      scrollToTopSmooth(true);
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider paused={inquiryOpen} resetKey={currentPage}>
        <div className="min-h-screen bg-black text-white overflow-x-clip">
        <Navbar
          onOpenInquiry={() => setInquiryOpen(true)}
          currentPage={currentPage}
          onNavigateHome={navigateHome}
        />

        <main>
          {currentPage === 'co-founders' ? (
            <>
              <CoFoundersPage
                onNavigateHome={() => navigateHome()}
                onOpenInquiry={() => setInquiryOpen(true)}
              />
              <LeadershipContactSection
                inquiryOpen={inquiryOpen}
                onCloseInquiry={() => setInquiryOpen(false)}
                onOpenInquiry={() => setInquiryOpen(true)}
                onNavigateToCoFounders={navigateToCoFounders}
                renderOnlyModal
              />
            </>
          ) : (
            <>
              <HeroSection onOpenInquiry={() => setInquiryOpen(true)} />
              <LivePrototypeSection />
              <OverviewAccordionSection />
              <ImpactSplitSection onOpenInquiry={() => setInquiryOpen(true)} />
              <MissionEmpowerSection onOpenInquiry={() => setInquiryOpen(true)} />
              <GlobalNetworkSection />
              <DecentralizedFutureSection />
              <LayersDiagramSection onOpenInquiry={() => setInquiryOpen(true)} />
              <LeadershipContactSection
                inquiryOpen={inquiryOpen}
                onCloseInquiry={() => setInquiryOpen(false)}
                onOpenInquiry={() => setInquiryOpen(true)}
                onNavigateToCoFounders={navigateToCoFounders}
              />
            </>
          )}
        </main>
      </div>
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
