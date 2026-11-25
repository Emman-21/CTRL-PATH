import React, { useEffect } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { Sparkles, X } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface LuniCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  gemstoneImage?: string;
  gemstoneName?: string;
  autoDismissMs?: number;
}

export const LuniCelebration: React.FC<LuniCelebrationProps> = ({
  isOpen,
  onClose,
  title,
  message,
  gemstoneImage,
  gemstoneName,
  autoDismissMs = 4500,
}) => {
  const { state } = useStudent();
  const prefersReducedMotion =
    state.preferences?.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!isOpen || autoDismissMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoDismissMs, onClose]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[calc(1rem+var(--safe-top))] pb-[calc(1rem+var(--safe-bottom))] overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-[var(--surface)] dark:bg-[#0f172a] rounded-3xl p-6 shadow-2xl border border-[var(--border)] dark:border-slate-800 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 md:top-4 md:right-4 w-11 h-11 md:w-auto md:h-auto md:p-1 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Dismiss celebration"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Stars Effect (Controlled count) */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <span className="absolute top-3 left-6 text-amber-400 text-sm animate-sparkle-spin">✦</span>
            <span className="absolute top-8 right-10 text-blue-400 text-xs animate-pulse">★</span>
            <span className="absolute bottom-10 left-8 text-violet-400 text-xs animate-pulse">✦</span>
            <span className="absolute bottom-6 right-8 text-emerald-400 text-sm animate-sparkle-spin">★</span>
          </div>
        )}

        {/* Character & Optional Gemstone */}
        <div className="relative my-2 flex items-center justify-center gap-2">
          <LuniCharacter state="celebrating" size={96} animate glow />

          {gemstoneImage && (
            <div className="flex flex-col items-center">
              <img
                src={gemstoneImage}
                alt={gemstoneName || 'Unlocked Gemstone'}
                className="w-16 h-16 object-contain pixelated drop-shadow-md animate-bounce duration-1000"
              />
              {gemstoneName && (
                <span className="text-[10px] font-black text-[var(--accent-ink)] dark:text-indigo-300 tracking-wide mt-1 uppercase">
                  {gemstoneName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Badge & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800/70 dark:text-amber-200 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{title}</span>
        </div>

        <p className="text-xs text-[var(--text-muted)] dark:text-slate-300 leading-relaxed max-w-xs">{message}</p>

        <div className="mt-5 w-full">
          <button
            onClick={onClose}
            className="w-full min-h-11 md:min-h-0 py-2.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Splendid, Luni! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
