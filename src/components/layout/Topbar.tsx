import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Compass,
  BookOpen,
  GitCompare,
  Trophy,
  Users,
  Sparkles,
  X,
  ArrowRight,
  Sun,
  Moon,
  LogIn,
  LogOut,
} from 'lucide-react';
import { StudentAvatar } from '../control/ControlShared';
import { useStudent } from '../../context/StudentContext';
import { Link, useNavigate } from 'react-router-dom';
import { TRACKS_DATA } from '../../data/tracks';
import { getNextDropdownIndex } from '../../utils/keyboardNav';

export interface TopbarProps {
  onToggleMobileNav?: () => void;
}

interface SearchItem {
  type: 'track' | 'page' | 'module';
  title: string;
  subtitle: string;
  path: string;
  badge?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileNav }) => {
  const { state, updatePreferences, authSession, signOutSession } = useStudent();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setActiveResultIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setActiveResultIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build searchable index
  const allSearchItems: SearchItem[] = [
    // Pages
    {
      type: 'page',
      title: 'Track Explorer',
      subtitle: 'Explore NT, BA, and SM curriculum & modules',
      path: '/tracks',
      badge: 'Explore',
    },
    {
      type: 'page',
      title: 'CTRL Quiz Assessment',
      subtitle: '5-level track affinity assessment for first years',
      path: '/quiz',
      badge: 'Assessment',
    },
    {
      type: 'page',
      title: 'Path Compare Matrix',
      subtitle: 'Compare 2 or 3 tracks side-by-side with matrix',
      path: '/compare',
      badge: 'Compare',
    },
    {
      type: 'page',
      title: 'Smart Results & Recommendations',
      subtitle: 'Your track fit scores, spider analytics, and insights',
      path: '/results',
      badge: 'Results',
    },
    {
      type: 'page',
      title: 'Gemstone Vault (Achievements)',
      subtitle: '20 collectible milestone crystals and badges',
      path: '/achievements',
      badge: 'Trophies',
    },
    {
      type: 'page',
      title: 'Alumni Stories',
      subtitle: 'Real BatStateU BSIT graduate experiences & advice',
      path: '/alumni',
      badge: 'Community',
    },
    {
      type: 'page',
      title: 'Control Center',
      subtitle: 'Profile settings, accessibility, and reflection notes',
      path: '/control-center',
      badge: 'Settings',
    },
    // Tracks
    {
      type: 'track',
      title: 'Networking Technology (NT)',
      subtitle: 'Cisco routing, switching, packet defense, and cloud systems',
      path: '/tracks?track=NT',
      badge: 'Track',
    },
    {
      type: 'track',
      title: 'Business Analytics (BA)',
      subtitle: 'Data intelligence, SQL, Python, Power BI dashboards',
      path: '/tracks?track=BA',
      badge: 'Track',
    },
    {
      type: 'track',
      title: 'Service Management (SM)',
      subtitle: 'ITIL frameworks, SLA delivery, operations and customer experience',
      path: '/tracks?track=SM',
      badge: 'Track',
    },
    // Key modules
    ...Object.values(TRACKS_DATA).flatMap((t) =>
      t.modules.map((m) => ({
        type: 'module' as const,
        title: m.title,
        subtitle: `${t.name} • ${m.subject}`,
        path: `/tracks?track=${t.code}`,
        badge: t.code,
      }))
    ),
  ];

  const searchResults = searchQuery.trim()
    ? allSearchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 7)
    : [];

  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchQuery]);

  const handleSelectItem = (item: SearchItem) => {
    setIsSearchOpen(false);
    setActiveResultIndex(-1);
    setSearchQuery('');
    navigate(item.path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(false);
        setActiveResultIndex(-1);
      } else if (searchQuery) {
        e.preventDefault();
        setSearchQuery('');
      }
      return;
    }

    if (!searchQuery.trim() || searchResults.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setIsSearchOpen(true);
      setActiveResultIndex((prev) => getNextDropdownIndex(prev, e.key, searchResults.length));
      return;
    }

    if (e.key === 'Enter' && isSearchOpen) {
      const targetIndex = activeResultIndex >= 0 ? activeResultIndex : 0;
      const item = searchResults[targetIndex];
      if (item) {
        e.preventDefault();
        handleSelectItem(item);
      }
    }
  };

  return (
    <header className="h-[calc(4rem+var(--safe-top))] pt-[var(--safe-top)] sm:h-16 sm:pt-0 bg-[var(--surface-90)] dark:bg-[#0b1222]/90 backdrop-blur-md border-b border-[var(--border)] dark:border-slate-800/90 sticky top-0 z-30 px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-2 min-w-0 md:hidden">
        <button
          onClick={onToggleMobileNav}
          className="min-w-11 min-h-11 -ml-1.5 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="min-h-11 flex items-center gap-1.5 sm:gap-2 font-black text-slate-900 dark:text-slate-100 tracking-tight text-sm sm:text-base min-w-0">
          <img
            src="/assets/aistudio/894455811_1534282605544392_6561933623517659718_n_7d027482.jpg"
            alt="Luni, the CTRL+PATH mascot"
            className="w-8 h-8 rounded-lg object-cover shrink-0 select-none shadow-xs"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex items-center gap-0.5 font-brand truncate" style={{ fontFamily: "'Nunito', 'Inter', sans-serif" }}>
            <span>CTRL</span>
            <span className="text-blue-600 dark:text-blue-400">+</span>
            <span>PATH</span>
          </div>
        </Link>
      </div>

      {/* Global Search Input with Instant Results Dropdown */}
      <div ref={containerRef} className="hidden lg:flex items-center flex-1 min-w-0 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          role="combobox"
          aria-expanded={Boolean(isSearchOpen && searchQuery.trim())}
          aria-controls="topbar-search-results"
          aria-activedescendant={
            activeResultIndex >= 0 ? `topbar-search-option-${activeResultIndex}` : undefined
          }
          aria-label="Search tracks, modules, careers, or quiz topics"
          value={searchQuery}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleSearchKeyDown}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          placeholder="Search tracks, modules, careers, or quiz topics..."
          className="w-full pl-9 pr-12 py-2 bg-slate-50 dark:bg-[#111c33] border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
        />

        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
              setActiveResultIndex(-1);
              searchInputRef.current?.focus();
            }}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-11 min-h-11 md:min-w-0 md:min-h-0 md:right-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-block absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface)] dark:bg-[#0f172a] border border-[var(--border)] dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        )}

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div
            id="topbar-search-results"
            role="listbox"
            aria-label="Matching search results"
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl shadow-xl border border-[var(--border)] dark:border-slate-700/80 p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
                  Matching Results ({searchResults.length})
                </div>
                {searchResults.map((item, idx) => {
                  const isHighlighted = idx === activeResultIndex;
                  return (
                    <button
                      key={idx}
                      id={`topbar-search-option-${idx}`}
                      role="option"
                      aria-selected={isHighlighted}
                      type="button"
                      onMouseEnter={() => setActiveResultIndex(idx)}
                      onClick={() => handleSelectItem(item)}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between group cursor-pointer ${
                        isHighlighted ? 'bg-blue-50/90 dark:bg-blue-950/60' : 'hover:bg-blue-50/70 dark:hover:bg-[#16223e]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className={`text-xs font-bold truncate ${isHighlighted ? 'text-blue-600 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300'}`}>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-[#131d33] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-500/50 group-hover:bg-blue-100/60 dark:group-hover:bg-blue-950/60 group-hover:text-blue-800 dark:group-hover:text-blue-200 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No matching results found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">

        {/* Quick Theme Toggle: Light / Dark Mode (Moonlit Sky) */}
        <button
          type="button"
          onClick={() => {
            const nextTheme = state.preferences.theme === 'dark' ? 'light' : 'dark';
            updatePreferences({ theme: nextTheme });
          }}
          className={`w-11 h-11 md:w-10 md:h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
            state.preferences.theme === 'dark'
              ? 'border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/80'
              : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={state.preferences.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Moonlit Sky)'}
          aria-label={state.preferences.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Moonlit Sky)'}
        >
          {state.preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 transition-transform duration-300" />
          )}
        </button>

        {/* Student Profile Pill */}
        <Link
          to="/control-center"
          aria-label="Open Control Center profile"
          className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center sm:justify-start gap-2.5 p-1.5 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#131d33] transition-all group"
        >
          <span className="topbar-avatar">
            <StudentAvatar name={state.name} style={state.avatarStyle} />
          </span>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors max-w-36 truncate">
              {state.name}
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5 max-w-36 truncate">
              {authSession ? authSession.email : 'Student'}
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors hidden sm:block" />
        </Link>

        {/* Auth Action: Sign In / Sign Out */}
        {authSession ? (
          <button
            type="button"
            onClick={async () => {
              await signOutSession();
              navigate('/login');
            }}
            className="hidden sm:inline-flex min-h-11 md:min-h-0 items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-flex min-h-11 md:min-h-0 items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
};
