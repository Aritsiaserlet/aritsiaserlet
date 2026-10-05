import React, { useState, useEffect, useCallback } from 'react';
import { Work } from './types';
import { useTheme } from './hooks/useTheme';
import { useNavbarScroll } from './hooks/useNavbarScroll';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useGitHubStats } from './hooks/useGitHubStats';
import { RippleBackground } from './components/effects/RippleBackground';
import { FireflyCanvas } from './components/effects/FireflyCanvas';
import { NavBar } from './components/layout/NavBar';
import { ThemeToggle } from './components/layout/ThemeToggle';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/hero/Hero';
import { WorkSection } from './components/work/WorkSection';
import { About } from './components/sections/About';
import { Archetypes } from './components/sections/Archetypes';
import { Contact } from './components/sections/Contact';
import { ProjectModal } from './components/modal/ProjectModal';

export const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isScrolled, showScrollIndicator } = useNavbarScroll();
  const { works, settings, isLoading } = usePortfolioData();
  const { stats, isLivePulsing, hasLoaded } = useGitHubStats(settings);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Check URL hash route for deep linking or admin redirect
  const checkHashRoute = useCallback(() => {
    const hash = window.location.hash;
    if (hash === '#admin') {
      window.location.href = 'admin.html';
      return;
    }

    if (hash.startsWith('#work-') || hash.startsWith('#project-')) {
      const id = hash.replace(/^#(work|project)-/, '');
      const matched = works.find((w) => String(w.id) === id);
      if (matched) {
        setSelectedWork(matched);
      }
    }
  }, [works]);

  useEffect(() => {
    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, [checkHashRoute]);

  // Load visitor analytics (compatible with existing js/analytics.js)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const analyticsUrl = new URL('js/analytics.js', window.location.href).href;
        const dynamicImport = new Function('url', 'return import(url);');
        dynamicImport(analyticsUrl)
          .then(
            (m: {
              initAnalytics?: () => void;
              trackPortfolioClick?: (name?: string) => void;
            }) => {
              if (typeof m?.initAnalytics === 'function') {
                m.initAnalytics();
              }
              if (typeof m?.trackPortfolioClick === 'function') {
                (
                  window as unknown as {
                    trackPortfolioClick: (name?: string) => void;
                  }
                ).trackPortfolioClick = m.trackPortfolioClick;
              }
            }
          )
          .catch((err: unknown) => {
            console.warn('[Analytics] not loaded:', err);
          });
      } catch (e) {
        console.warn('[Analytics] loader error:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/30 font-body-md overflow-x-hidden relative">
      {/* Background Interactive Effects */}
      <RippleBackground />
      <FireflyCanvas />

      {/* Navigation */}
      <NavBar isScrolled={isScrolled} />

      {/* Floating Theme Toggle */}
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <main className="w-full">
        <Hero
          stats={stats}
          isLivePulsing={isLivePulsing}
          hasLoaded={hasLoaded}
          showScrollIndicator={showScrollIndicator}
        />

        <WorkSection
          works={works}
          isLoading={isLoading}
          onOpenModal={(work) => setSelectedWork(work)}
        />

        <About />

        <Archetypes />

        <Contact socials={settings.socials} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Detail Modal */}
      <ProjectModal work={selectedWork} onClose={() => setSelectedWork(null)} />
    </div>
  );
};
