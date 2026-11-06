import React, { useEffect, useRef } from 'react';
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
  X,
  Sparkles,
} from 'lucide-react';

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
  { name: 'Announcements', path: '/announcements', icon: Bell },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Control Center', path: '/control-center', icon: Settings },
];

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus so we can restore it when the drawer closes.
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Lock background scroll while the drawer is open.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = originalOverflow;
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
        className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">CTRL+PATH</div>
              <div className="text-[10px] text-slate-400">BatStateU Alangilan</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};