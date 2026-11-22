import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardCheck,
  BarChart3,
  GitCompare,
  Users,
  Trophy,
  Settings,
  Sparkles,
} from 'lucide-react';
import { BACKGROUNDS } from '../../assets/manifest';
import { UniversityCrests } from '../shared/UniversityCrests';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Track Explorer', path: '/tracks', icon: Compass },
  { name: 'CTRL Quiz', path: '/quiz', icon: ClipboardCheck },
  { name: 'Smart Results', path: '/results', icon: BarChart3 },
  { name: 'Path Compare', path: '/compare', icon: GitCompare },
  { name: 'Alumni Stories', path: '/alumni', icon: Users },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Control Center', path: '/control-center', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/894455811_1534282605544392_6561933623517659718_n_7d027482.jpg"
            alt="Luni, the CTRL+PATH mascot"
            className="w-10 h-10 rounded-xl object-cover shrink-0 select-none shadow-xs"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <div className="flex items-center gap-1 font-brand" style={{ fontFamily: "'Nunito', 'Inter', sans-serif" }}>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100">CTRL</span>
              <span className="font-black text-lg text-blue-600 dark:text-blue-400">+</span>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100">PATH</span>
            </div>
            <div className="text-xs text-slate-400 font-medium tracking-wide">
              Explore · Compare · Find Your Path
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Decorative Pixel-Art Castle Bottom Card */}
      <div className="p-3 m-3 rounded-2xl relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shadow-xs">
        <div className="absolute inset-0">
          <img
            src={BACKGROUNDS.trackExplorerAcademy}
            alt=""
            className="w-full h-full object-cover pixelated opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent dark:from-[#0d1424] dark:via-[#0d1424]/85 dark:to-transparent" />
        </div>
        <div className="relative z-10 text-center py-2 px-1">
          <UniversityCrests size="md" gapClassName="gap-2.5" className="mb-2 justify-center" />
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Different Paths,</div>
          <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">Brighter Futures ✨</div>
          <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
            <div
              className="flex items-center justify-center gap-1.5 text-[10px] font-semibold mb-1"
              role="status"
              aria-label={isOnline ? 'Website is online' : 'Website is offline'}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  isOnline
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/25'
                    : 'bg-slate-400 dark:bg-slate-600'
                }`}
                aria-hidden="true"
              />
              <span
                className={
                  isOnline
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }
              >
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Batangas State University
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              CICS Alangilan ~ IINTESS
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
