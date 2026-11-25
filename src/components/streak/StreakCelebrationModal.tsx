import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Flame, Check, Sparkles } from 'lucide-react';
import {
  type StreakCelebrationDetail,
  getCurrentWeekDays,
  loadStreakState,
} from '../../utils/streakManager';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface LuniPoseProps {
  pose?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * LuniPose component: Displays the pixel-art mascot and allows swapping poses easily.
 */
export const LuniPose: React.FC<LuniPoseProps> = ({
  size = 96,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/aistudio/luni_celebration_45aeaff1.png"
        alt="Luni celebrating your streak"
        className="w-full h-full object-contain drop-shadow-md"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export const StreakCelebrationModal: React.FC = () => {
  const [detail, setDetail] = useState<StreakCelebrationDetail | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useBodyScrollLock(isOpen);

  // Check prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Listen for streak celebration events
  useEffect(() => {
    const handleCelebrate = (e: Event) => {
      const customEvent = e as CustomEvent<StreakCelebrationDetail>;
      if (customEvent.detail) {
        showCelebration(customEvent.detail);
      }
    };

    window.addEventListener('ctrl_streak_celebrate', handleCelebrate);

    // Dev helper for previewing: window.__previewStreak(n)
    if (typeof window !== 'undefined') {
      (window as unknown as { __previewStreak?: (n: number) => void }).__previewStreak = (n: number) => {
        const isMilestone = [3, 7, 14, 30].includes(n);
        showCelebration({
          streakCount: n,
          previousCount: Math.max(0, n - 1),
          isMilestone,
          isFreshStart: n === 1,
          headline: isMilestone
            ? `${n}-Day Streak! ${n === 7 ? 'One whole week!' : n === 14 ? 'Trailblazer!' : n === 30 ? 'Celestial Master!' : 'Spark ignited!'}`
            : n === 1
            ? 'Fresh start! Day 1.'
            : `${n}-Day Streak!`,
          subtext: isMilestone
            ? 'Incredible dedication to your BatStateU BSIT pathway!'
            : 'You showed up again. Keep the flame burning!',
        });
      };
    }

    return () => {
      window.removeEventListener('ctrl_streak_celebrate', handleCelebrate);
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __previewStreak?: unknown }).__previewStreak;
      }
    };
  }, []);

  const showCelebration = (data: StreakCelebrationDetail) => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setDetail(data);
    setDisplayCount(data.previousCount);
    setIsOpen(true);

    // One-time confetti burst (non-looping, accent colors: blue, purple, green, gold)
    if (!reducedMotion) {
      setTimeout(() => {
        try {
          confetti({
            particleCount: data.isMilestone ? 70 : 40,
            spread: data.isMilestone ? 80 : 60,
            origin: { y: 0.55 },
            colors: ['#2563EB', '#9333EA', '#10B981', '#F59E0B'],
            ticks: data.isMilestone ? 250 : 180,
            gravity: 1.1,
            disableForReducedMotion: true,
          });
        } catch {
          // ignore if canvas not supported
        }
      }, 200);
    }

    // Auto-dismiss after ~6 seconds if user does not interact
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    autoDismissTimerRef.current = setTimeout(() => {
      handleClose();
    }, 6200);
  };

  // Count-up animation
  useEffect(() => {
    if (!isOpen || !detail) return;

    if (reducedMotion || detail.previousCount === detail.streakCount) {
      setDisplayCount(detail.streakCount);
      return;
    }

    const start = detail.previousCount;
    const end = detail.streakCount;
    const duration = 750;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, detail, reducedMotion]);

  // Focus trap and accessibility
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        continueBtnRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard dismiss (Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleClose = () => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setIsOpen(false);

    // Notify hero badge to play pop animation once
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ctrl_streak_badge_pop'));
    }

    // Return focus
    setTimeout(() => {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    }, 150);
  };

  if (!isOpen || !detail) return null;

  const streakState = loadStreakState();
  const weekDays = getCurrentWeekDays(streakState.activeDates);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[calc(1rem+var(--safe-top))] pb-[calc(1rem+var(--safe-bottom))] overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${detail.streakCount}-day streak celebration`}
      >
        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          {`${detail.streakCount}-day streak`}
        </div>

        {/* Dimmed, blurred backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className={`relative w-full max-w-sm max-h-[90dvh] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl z-10 border overflow-y-auto overflow-x-hidden ${
            detail.isMilestone
              ? 'bg-linear-to-b from-amber-50 via-[var(--surface)] to-orange-50 dark:from-[#131c36] dark:via-[#0e162b] dark:to-[#17142b] border-amber-300 dark:border-amber-500/50 shadow-orange-500/20'
              : 'bg-[var(--surface)] dark:bg-[#0e1526] border-[var(--border)] dark:border-slate-800 shadow-xl'
          }`}
        >
          {/* Close X Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 md:top-4 md:right-4 w-11 h-11 md:w-auto md:h-auto md:p-1.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close streak celebration"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Central Glowing Flame & Day Count (~120px) */}
          <div className="relative my-2 flex items-center justify-center">
            {/* Ambient Flame Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl opacity-70 pointer-events-none ${
                detail.isMilestone
                  ? 'bg-orange-500 dark:bg-amber-400 scale-125'
                  : 'bg-orange-400 dark:bg-orange-500 scale-110'
              }`}
            />

            {/* Glowing Flame SVG */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-md select-none"
                style={{
                  filter: detail.isMilestone
                    ? 'drop-shadow(0 0 24px rgba(245, 158, 11, 0.75))'
                    : 'drop-shadow(0 0 18px rgba(249, 115, 22, 0.6))',
                }}
              >
                <defs>
                  <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="50%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                  <linearGradient id="flameInnerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FEF08A" />
                  </linearGradient>
                </defs>
                {/* Outer flame */}
                <path
                  d="M50 5 C50 5 62 25 62 38 C62 46 58 52 58 52 C58 52 68 44 68 35 C68 35 84 55 84 72 C84 87 71 96 50 96 C29 96 16 87 16 72 C16 52 35 32 35 32 C35 32 32 45 38 52 C38 52 42 22 50 5 Z"
                  fill="url(#flameGrad)"
                />
                {/* Inner hot core */}
                <path
                  d="M50 35 C50 35 56 46 56 55 C56 61 52 65 52 65 C52 65 60 58 60 52 C60 52 70 66 70 77 C70 86 61 92 50 92 C39 92 30 86 30 77 C30 64 42 50 42 50 C42 50 40 58 44 63 C44 63 45 44 50 35 Z"
                  fill="url(#flameInnerGrad)"
                />
              </svg>

              {/* Number inside or centered on the flame */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-xs">
                  {displayCount}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950/80 -mt-1">
                  Days
                </span>
              </div>
            </div>
          </div>

          {/* Luni reacts: Bounces in from bottom and gentle idle bob */}
          <div className="my-1 flex items-center justify-center">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 35, scale: 0.8 }}
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      y: [0, -5, 0],
                      scale: 1,
                      transition: {
                        y: {
                          repeat: Infinity,
                          duration: 2.2,
                          ease: 'easeInOut',
                          delay: 0.4,
                        },
                        opacity: { duration: 0.25 },
                        scale: { type: 'spring', damping: 10, stiffness: 220 },
                      },
                    }
              }
            >
              <LuniPose size={96} />
            </motion.div>
          </div>

          {/* Headline & Encouraging Text */}
          <div className="space-y-1.5 mt-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
              <span>{detail.headline}</span>
              {detail.isMilestone && <Sparkles className="w-5 h-5 text-amber-500 animate-sparkle-spin" />}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xs">
              {detail.subtext}
            </p>
          </div>

          {/* 7-Day Week Tracker (Mon to Sun) */}
          <div className="w-full mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between gap-1">
              {weekDays.map((wd, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    {wd.dayLetter}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      wd.isActive
                        ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-xs'
                        : wd.isToday
                        ? 'bg-[var(--surface)] dark:bg-slate-800 border-2 border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {wd.isActive ? (
                      <Flame className="w-4 h-4 text-white fill-current" />
                    ) : (
                      <span className="text-[11px] font-semibold">{wd.dayLetter}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button: Primary "Continue" */}
          <div className="w-full mt-5">
            <button
              ref={continueBtnRef}
              type="button"
              onClick={handleClose}
              className="w-full min-h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm py-3 px-6 rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
