import React, { useState, useEffect } from 'react';
import { AchievementUnlockCelebration } from '../shared/AchievementUnlockCelebration';
import { useStudent } from '../../context/StudentContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { LuniAssistantWidget } from '../luni/LuniAssistantWidget';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, storageWarning } = useStudent();
  useEffect(()=>{
    const root=document.documentElement;
    root.dataset.textSize=state.preferences.textSize;
    root.dataset.highContrast=String(state.preferences.highContrast);
    root.dataset.reducedMotion=String(state.preferences.reducedMotion);
    return ()=>{delete root.dataset.textSize;delete root.dataset.highContrast;delete root.dataset.reducedMotion;};
  },[state.preferences.textSize,state.preferences.highContrast,state.preferences.reducedMotion]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div data-reduced-motion={state.preferences.reducedMotion} className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {storageWarning && <p role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{storageWarning}</p>}
          {children}
        </main>
      </div>

      {/* Floating Luni Companion Widget */}
      <LuniAssistantWidget />
      <AchievementUnlockCelebration />
    </div>
  );
};
