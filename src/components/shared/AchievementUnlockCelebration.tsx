import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { GEMSTONE_ASSETS, LUNI_WINK_V2_SHEET, type GemstoneAsset } from '../../assets/manifest';
import { useStudent } from '../../context/StudentContext';
import {
  ACHIEVEMENT_TOAST_DURATION_MS,
  ACHIEVEMENT_TOAST_RESUME_MIN_MS,
  getAchievementNotificationContent,
  getNextPendingAchievementId,
  shouldOffsetForFloatingLuni,
} from '../../utils/achievementNotification';
import { LuniSprite, useLuniSprite } from '../luni/LuniSprite';
import { useOsReducedMotion } from '../luni/useLuniSprite';

export interface AchievementNotificationBoxProps {
  gem: GemstoneAsset;
  prefersReducedMotion: boolean;
  offsetForLuni: boolean;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
  onDismiss: () => void;
  onViewVault: () => void;
  winkSprite: ReturnType<typeof useLuniSprite>;
}

export function AchievementNotificationBox({
  gem,
  prefersReducedMotion,
  offsetForLuni,
  isPaused,
  onPauseChange,
  onDismiss,
  onViewVault,
  winkSprite,
}: AchievementNotificationBoxProps) {
  const content = getAchievementNotificationContent(gem);

  return (
    <aside
      data-testid="achievement-toast"
      data-reduced-motion={prefersReducedMotion}
      role="status"
      aria-live="polite"
      aria-labelledby="gem-toast-title"
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => onPauseChange(false)}
      onFocusCapture={() => onPauseChange(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onPauseChange(false);
        }
      }}
      className={`achievement-toast gem-category-${gem.category} ${
        offsetForLuni ? 'has-floating-luni' : ''
      } ${isPaused ? 'is-paused' : ''}`}
    >
      <div className="achievement-toast-particles" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>

      <div className="achievement-toast-header">
        <p className="achievement-toast-kicker">
          <span>{content.eyebrow}</span>
          <span aria-hidden="true">·</span>
          <span>{content.rarity}</span>
        </p>
        <button
          type="button"
          className="achievement-toast-close"
          onClick={onDismiss}
          aria-label="Dismiss achievement notification"
        >
          <X size={16} />
        </button>
      </div>

      <div className="achievement-toast-body">
        <div className="achievement-toast-art" aria-hidden="true">
          <img
            src={gem.url}
            alt=""
            width={56}
            height={56}
            decoding="async"
            className="achievement-toast-gem gem-earned"
          />
        </div>

        <div className="achievement-toast-copy">
          <h3 id="gem-toast-title" className="achievement-toast-title">
            {content.title}
          </h3>
          <p className="achievement-toast-message">{content.message}</p>
          <div className="achievement-toast-actions">
            <button
              type="button"
              className="achievement-toast-cta"
              onClick={onViewVault}
            >
              <span>{content.ctaLabel}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => winkSprite.triggerPose('wink')}
          aria-label="Luni celebrating your achievement — tap to wink"
          className="achievement-toast-luni"
        >
          <LuniSprite
            mode="wave-sheet"
            size={48}
            activePoseId="wink"
            sheetUrl={LUNI_WINK_V2_SHEET}
            frameCount={winkSprite.activePose.frames}
            sheetData={winkSprite.sheetsById.wink ?? winkSprite.sheet}
            isPlaying={winkSprite.isPlaying}
            playCount={winkSprite.playCount}
            durationMs={winkSprite.durationMs}
            onWaveAnimationEnd={winkSprite.handleAnimationEnd}
          />
        </button>
      </div>

      {!prefersReducedMotion && (
        <div className="achievement-toast-timer" aria-hidden="true">
          <span
            style={{
              animationDuration: `${ACHIEVEMENT_TOAST_DURATION_MS}ms`,
            }}
          />
        </div>
      )}
    </aside>
  );
}

export function AchievementUnlockCelebration() {
  const { state, acknowledgeAchievement } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuizFocusMode, setIsQuizFocusMode] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true'
    );
  });
  const [quizAnsweringActive, setQuizAnsweringActive] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('ctrl_quiz_answering') === 'true'
    );
  });

  const remainingMsRef = useRef<number>(ACHIEVEMENT_TOAST_DURATION_MS);
  const startedAtRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  const osReducedMotion = useOsReducedMotion();
  const prefersReducedMotion = Boolean(state.preferences.reducedMotion || osReducedMotion);

  const winkSprite = useLuniSprite({
    defaultPoseId: 'wink',
    prefersReducedMotion,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFocusMode = () => {
      setIsQuizFocusMode(window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true');
    };
    const syncQuizAnswering = () => {
      setQuizAnsweringActive(window.sessionStorage.getItem('ctrl_quiz_answering') === 'true');
    };
    syncFocusMode();
    syncQuizAnswering();
    window.addEventListener('ctrl_focus_mode_changed', syncFocusMode);
    window.addEventListener('ctrl_quiz_answering_changed', syncQuizAnswering);
    return () => {
      window.removeEventListener('ctrl_focus_mode_changed', syncFocusMode);
      window.removeEventListener('ctrl_quiz_answering_changed', syncQuizAnswering);
    };
  }, []);

  const pendingId = getNextPendingAchievementId(state.achievementRecords);
  useEffect(() => {
    if (activeId || !pendingId) return;
    if (!state.preferences.notifications) {
      acknowledgeAchievement(pendingId);
      return;
    }
    remainingMsRef.current = ACHIEVEMENT_TOAST_DURATION_MS;
    setIsPaused(false);
    setActiveId(pendingId);
    // Mark presented immediately; refreshing a shown notification never replays it.
    acknowledgeAchievement(pendingId);
  }, [activeId, pendingId, acknowledgeAchievement, state.preferences.notifications]);

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    startedAtRef.current = null;
    setActiveId(null);
  }, []);

  // Auto-dismiss timer with pause on hover / keyboard focus
  useEffect(() => {
    if (!activeId || isPaused) return;
    const delay = Math.max(remainingMsRef.current, ACHIEVEMENT_TOAST_RESUME_MIN_MS);
    startedAtRef.current = Date.now();
    dismissTimerRef.current = window.setTimeout(() => {
      dismiss();
    }, delay);
    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (startedAtRef.current !== null) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
        startedAtRef.current = null;
      }
    };
  }, [activeId, isPaused, dismiss]);

  // Play Luni's celebratory wink animation whenever an achievement unlocks
  useEffect(() => {
    if (!activeId) return;
    const id = window.setTimeout(() => {
      winkSprite.triggerPose('wink');
    }, 180);
    return () => window.clearTimeout(id);
  }, [activeId, winkSprite.triggerPose]);

  // Allow Escape key to dismiss the active side notification without stealing focus
  useEffect(() => {
    if (!activeId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, dismiss]);

  const gem = GEMSTONE_ASSETS.find((g) => g.achievementId === activeId);
  if (!gem || typeof document === 'undefined') return null;

  const offsetForLuni = shouldOffsetForFloatingLuni({
    pathname: location.pathname,
    luniEnabled: state.preferences.luniEnabled,
    isQuizFocusMode,
    isQuizAnswering: quizAnsweringActive,
  });

  const handleViewInVault = () => {
    dismiss();
    navigate('/achievements');
  };

  return createPortal(
    <AchievementNotificationBox
      key={gem.achievementId}
      gem={gem}
      prefersReducedMotion={prefersReducedMotion}
      offsetForLuni={offsetForLuni}
      isPaused={isPaused}
      onPauseChange={setIsPaused}
      onDismiss={dismiss}
      onViewVault={handleViewInVault}
      winkSprite={winkSprite}
    />,
    document.body,
  );
}
