import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AchievementUnlockCelebration } from '../shared/AchievementUnlockCelebration';
import { StreakCelebrationModal } from '../streak/StreakCelebrationModal';
import { useStudent } from '../../context/StudentContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { LuniAssistantWidget } from '../luni/LuniAssistantWidget';
import { scrollViewportToTop } from '../../utils/scrollTop';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, storageWarning } = useStudent();
  useEffect(()=>{
    const root=document.documentElement;
    const theme = state.preferences.theme || 'dark';
    root.dataset.theme = theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dataset.textSize=state.preferences.textSize;
    root.dataset.highContrast=String(state.preferences.highContrast);
    root.dataset.reducedMotion=String(state.preferences.reducedMotion);
    return ()=>{
      delete root.dataset.theme;
      root.classList.remove('dark');
      delete root.dataset.textSize;
      delete root.dataset.highContrast;
      delete root.dataset.reducedMotion;
    };
  },[state.preferences.theme,state.preferences.textSize,state.preferences.highContrast,state.preferences.reducedMotion]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const [quizAnsweringActive, setQuizAnsweringActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('ctrl_quiz_answering') === 'true';
  });

  useEffect(() => {
    const syncAnswering = () => {
      if (typeof window !== 'undefined') {
        setQuizAnsweringActive(window.sessionStorage.getItem('ctrl_quiz_answering') === 'true');
      }
    };
    syncAnswering();
    window.addEventListener('ctrl_quiz_answering_changed', syncAnswering);
    return () => window.removeEventListener('ctrl_quiz_answering_changed', syncAnswering);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }
    }
    scrollViewportToTop();
  }, [location.pathname, location.search, location.hash]);

  const isQuizAnswering = location.pathname === '/quiz' && quizAnsweringActive;
  const isResultsRoute = location.pathname === '/results';

  const isDark = state.preferences.theme === 'dark';

  return (
    <div
      data-reduced-motion={state.preferences.reducedMotion}
      className={`min-h-screen ${
        isDark ? 'bg-[#0a0f1d] text-slate-100' : 'bg-transparent text-[var(--text)]'
      } flex flex-col md:flex-row antialiased transition-colors duration-200`}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isQuizAnswering ? 'h-dvh max-h-dvh overflow-hidden' : ''}`}>
        <Topbar onToggleMobileNav={() => setMobileNavOpen(true)} />
        <main
          className={
            isQuizAnswering
              ? 'flex-none h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 max-w-7xl w-full mx-auto flex flex-col'
              : `flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${isResultsRoute ? 'pb-4' : 'pb-24'}`
          }
        >
          {storageWarning && <p role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{storageWarning}</p>}
          {children}
        </main>
        {isResultsRoute && <LuniAssistantWidget docked />}
      </div>

      {/* Floating Luni Companion Widget & Modals */}
      {!isResultsRoute && <LuniAssistantWidget />}
      <AchievementUnlockCelebration />
      <StreakCelebrationModal />
    </div>
  );
};
