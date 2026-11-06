import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { StudentAvatar } from '../control/ControlShared';
import { useStudent } from '../../context/StudentContext';
import { Link } from 'react-router-dom';

export interface TopbarProps {
  onToggleMobileNav?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileNav }) => {
  const { state } = useStudent();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileNav}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-1 font-black text-slate-900 tracking-tight text-base">
          <span>CTRL</span>
          <span className="text-blue-600">+</span>
          <span>PATH</span>
        </Link>
      </div>

      {/* Global Search Input */}
      <div className="hidden lg:flex items-center flex-1 min-w-0 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, modules, careers, or quiz topics..."
          className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <kbd className="hidden lg:inline-block absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Campus indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>BatStateU Alangilan</span>
        </div>

        <Link to="/announcements" className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50" aria-label="Open announcements"><Bell className="w-4 h-4" /></Link>
        {/* Student Profile Pill */}
        <Link
          to="/control-center"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all group"
        >
          <span className="topbar-avatar"><StudentAvatar name={state.name} style={state.avatarStyle}/></span>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors max-w-36 truncate">
              {state.name}
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Student</div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
        </Link>
      </div>
    </header>
  );
};
