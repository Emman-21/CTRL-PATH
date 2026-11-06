import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardCheck,
  BarChart3,
  GitCompare,
  Users,
  Bell,
  Trophy,
  Settings,
  Sparkles,
} from 'lucide-react';
import { BACKGROUNDS } from '../../assets/manifest';

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
  { name: 'Announcements', path: '/announcements', icon: Bell },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Control Center', path: '/control-center', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg tracking-tight text-slate-900">CTRL</span>
              <span className="font-black text-lg text-blue-600">+</span>
              <span className="font-black text-lg tracking-tight text-slate-900">PATH</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
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
      <div className="p-3 m-3 rounded-2xl relative overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="absolute inset-0">
          <img
            src={BACKGROUNDS.trackExplorerAcademy}
            alt=""
            className="w-full h-full object-cover pixelated opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent" />
        </div>
        <div className="relative z-10 text-center py-2">
          <div className="text-[11px] font-bold text-slate-700">Different Paths,</div>
          <div className="text-[11px] font-extrabold text-blue-600">Brighter Futures ✨</div>
          <div className="text-[9px] text-slate-400 mt-1 font-medium">
            Batangas State University
          </div>
          <div className="text-[9px] text-slate-400 font-medium">Alangilan Campus</div>
        </div>
      </div>
    </aside>
  );
};
