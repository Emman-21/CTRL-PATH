import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardCheck,
  BarChart3,
  GitCompare,
  Users,
  Trophy,
  Settings,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UniversityCrests } from '../shared/UniversityCrests';
import { useStudent } from '../../context/StudentContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Track Explorer', path: '/tracks', icon: Compass },
  { name: 'CTRL Quiz', path: '/quiz', icon: ClipboardCheck },
  { name: 'Smart Results', path: '/results', icon: BarChart3 },
  { name: 'Path Compare', path: '/compare', icon: GitCompare },
  { name: 'Alumni Stories', path: '/alumni', icon: Users },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Control Center', path: '/control-center', icon: Settings },
];

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { authSession, signOutSession } = useStudent();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus so we can restore it when the drawer closes.
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Move initial focus to the drawer's close button.
    const initialTarget = drawerRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex="0"]'
    );
    initialTarget?.focus();

    // Trap Tab focus and close on Escape.
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex="0"]'
        ) ?? []
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation menu"
        className="relative w-72 max-w-[80vw] bg-[var(--surface)] dark:bg-[#0b1222] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
      >
        <div className="p-4 pt-[calc(1rem+var(--safe-top))] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/894455811_1534282605544392_6561933623517659718_n_7d027482.jpg"
              alt="Luni, the CTRL+PATH mascot"
              className="w-9 h-9 rounded-xl object-cover shrink-0 select-none shadow-xs"
              style={{ imageRendering: 'pixelated' }}
            />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-brand" style={{ fontFamily: "'Nunito', 'Inter', sans-serif" }}>
                <span>CTRL</span>
                <span className="text-blue-600 dark:text-blue-400">+</span>
                <span>PATH</span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">BatStateU Alangilan</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 -mr-1.5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `min-h-11 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[#111e3b] text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#131d33]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            {authSession ? (
              <button
                type="button"
                onClick={async () => {
                  await signOutSession();
                  onClose();
                  navigate('/login');
                }}
                className="w-full min-h-11 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#131d33] cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="min-h-11 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#111e3b]"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </nav>

        <div className="p-4 pb-[calc(1rem+var(--safe-bottom))] border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <UniversityCrests size="sm" gapClassName="gap-1.5" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              Batangas State University
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              CICS · Alangilan Campus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};