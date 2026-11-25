import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { LuniSprite } from './LuniSprite';
import { LuniDialogueBubble } from './LuniDialogueBubble';
import { LuniAssistantPanel } from './LuniAssistantPanel';
import { ROUTE_DIALOGUES, TRACK_SPECIFIC_DIALOGUES } from '../../data/luniDialogues';
import { getLuniLoginGreetPoseId } from '../../data/luniSpritePoses';
import { LuniState, LuniDialogueItem } from '../../types/luni';
import { TrackCode } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { useStudent } from '../../context/StudentContext';
import { useLuniState } from '../../context/LuniStateContext';
import { useLocation } from 'react-router-dom';
import { Sparkles, MessageCircle, Minus, Volume2, VolumeX } from 'lucide-react';
import {
  LUNI_GREET_DELAY_MS,
  consumeLuniLoginGreetPending,
  shouldPlayLuniLoginGreet,
} from '../../utils/luniLoginGreet';
import { LUNI_WINK_MILESTONE_EVENT } from '../../utils/luniWaveSprite';
import { isKeyboardOpenFromViewport } from '../../hooks/useBottomBarOffset';

const TOUCH_PILL_AUTO_CLOSE_MS = 4000;

export const LuniAssistantWidget: React.FC<{ docked?: boolean }> = ({ docked = false }) => {
  const { state: studentState, updatePreferences } = useStudent();
  const luniState = useLuniState();
  const location = useLocation();
  const { stories } = useCommunity();

  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [showFullPanel, setShowFullPanel] = useState(false);
  const [characterState, setCharacterState] = useState<LuniState>('waving');
  const [touchPillOpen, setTouchPillOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(hover: none)').matches;
  });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const touchPillTimerRef = useRef<number | null>(null);
  const isMinimized = studentState.preferences?.luniMinimized ?? false;

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

  useEffect(() => {
    const handleFocusChange = () => {
      setIsQuizFocusMode(window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true');
    };
    const handleAnsweringChange = () => {
      setQuizAnsweringActive(window.sessionStorage.getItem('ctrl_quiz_answering') === 'true');
    };
    handleFocusChange();
    handleAnsweringChange();
    window.addEventListener('ctrl_focus_mode_changed', handleFocusChange);
    window.addEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    return () => {
      window.removeEventListener('ctrl_focus_mode_changed', handleFocusChange);
      window.removeEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    };
  }, []);

  const isQuizAnswering = location.pathname === '/quiz' && quizAnsweringActive;
  const luniEnabled = studentState.preferences?.luniEnabled !== false;
  const prefersReducedMotion = luniState.prefersReducedMotion;

  const isAnySpritePlaying = luniState.isPlaying || Boolean(luniState.activeTapPose);
  const activeSpritePose = luniState.renderedPoseId;
  const totalReactions = luniState.playCount;

  useEffect(() => {
    if (isQuizAnswering) {
      setShowSpeechBubble(false);
      setShowFullPanel(false);
    }
  }, [isQuizAnswering]);

  // Dismiss open speech bubble cleanly if Luni drifts to sleep
  useEffect(() => {
    if (luniState.state === 'sleeping') {
      setShowSpeechBubble(false);
    }
  }, [luniState.state]);

  // Determine current contextual dialogue
  const getActiveDialogue = (): LuniDialogueItem => {
    const searchParams = new URLSearchParams(location.search);
    const trackParam = searchParams.get('track') as TrackCode | null;

    if (location.pathname === '/tracks' && trackParam && TRACK_SPECIFIC_DIALOGUES[trackParam]) {
      return TRACK_SPECIFIC_DIALOGUES[trackParam];
    }

    if (location.pathname.startsWith('/alumni')) {
      return {
        ...ROUTE_DIALOGUES['/alumni'],
        message: stories.length
          ? "Everyone's journey is different, Luminary! Let's learn from the experiences of those who came before us."
          : ROUTE_DIALOGUES['/alumni'].message,
      };
    }
    return ROUTE_DIALOGUES[location.pathname] || ROUTE_DIALOGUES['/'];
  };

  const activeDialogue = getActiveDialogue();

  // Auto-wave once (~500ms after mount) after fresh login when landing outside "/"
  useEffect(() => {
    if (typeof window === 'undefined' || isMinimized) return;

    const canGreet = shouldPlayLuniLoginGreet({
      pathname: location.pathname,
      component: 'widget',
      luniEnabled,
      isQuizFocusMode,
      isQuizAnswering,
      storage: window.sessionStorage,
    });

    if (!canGreet) return;

    const timerId = window.setTimeout(() => {
      const stillAllowed = shouldPlayLuniLoginGreet({
        pathname: location.pathname,
        component: 'widget',
        luniEnabled: studentState.preferences?.luniEnabled,
        isQuizFocusMode: window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true',
        isQuizAnswering:
          location.pathname === '/quiz' &&
          window.sessionStorage.getItem('ctrl_quiz_answering') === 'true',
        storage: window.sessionStorage,
      });
      if (!stillAllowed || isMinimized) return;
      if (consumeLuniLoginGreetPending(window.sessionStorage)) {
        luniState.notifySpecificTap(getLuniLoginGreetPoseId());
      }
    }, LUNI_GREET_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [
    location.pathname,
    luniEnabled,
    studentState.preferences?.luniEnabled,
    isQuizFocusMode,
    isQuizAnswering,
    isMinimized,
    luniState.notifySpecificTap,
  ]);

  // Play Luni's celebratory wink when achievement or quiz milestones occur
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMilestoneWink = () => {
      if (!luniEnabled || isQuizFocusMode || isQuizAnswering || isMinimized) {
        return;
      }
      luniState.notifySpecificTap('wink');
    };
    window.addEventListener(LUNI_WINK_MILESTONE_EVENT, onMilestoneWink);
    return () => window.removeEventListener(LUNI_WINK_MILESTONE_EVENT, onMilestoneWink);
  }, [
    luniEnabled,
    isQuizFocusMode,
    isQuizAnswering,
    isMinimized,
    luniState.notifySpecificTap,
  ]);

  // Route transition effect: update Luni's contextual dialogue mood
  useEffect(() => {
    const dialogue = getActiveDialogue();
    setCharacterState(dialogue.state);
    setShowSpeechBubble(false);
  }, [location.pathname, location.search, stories.length]);

  // Detect @media (hover: none) touch devices and mobile virtual keyboard state
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: none)');
    const syncHover = () => setIsTouchDevice(mq.matches);
    syncHover();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', syncHover);
      return () => mq.removeEventListener('change', syncHover);
    }
    mq.addListener(syncHover);
    return () => mq.removeListener(syncHover);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const updateKeyboardState = () => {
      if (window.innerWidth >= 768 || !vv) {
        setIsKeyboardOpen(false);
        return;
      }
      setIsKeyboardOpen(isKeyboardOpenFromViewport(vv.height, window.innerHeight));
    };
    updateKeyboardState();
    vv?.addEventListener('resize', updateKeyboardState);
    window.addEventListener('resize', updateKeyboardState);
    return () => {
      vv?.removeEventListener('resize', updateKeyboardState);
      window.removeEventListener('resize', updateKeyboardState);
    };
  }, []);

  const clearTouchPillTimer = useCallback(() => {
    if (touchPillTimerRef.current !== null) {
      window.clearTimeout(touchPillTimerRef.current);
      touchPillTimerRef.current = null;
    }
  }, []);

  const closeTouchPill = useCallback(() => {
    clearTouchPillTimer();
    setTouchPillOpen(false);
    if (
      isTouchDevice &&
      typeof document !== 'undefined' &&
      widgetRef.current &&
      document.activeElement instanceof HTMLElement &&
      widgetRef.current.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }
  }, [clearTouchPillTimer, isTouchDevice]);

  const scheduleTouchPillAutoClose = useCallback(() => {
    clearTouchPillTimer();
    touchPillTimerRef.current = window.setTimeout(() => {
      setTouchPillOpen(false);
      touchPillTimerRef.current = null;
    }, TOUCH_PILL_AUTO_CLOSE_MS);
  }, [clearTouchPillTimer]);

  useEffect(() => clearTouchPillTimer, [clearTouchPillTimer]);

  useEffect(() => {
    if (isKeyboardOpen) {
      setShowSpeechBubble(false);
      closeTouchPill();
    }
  }, [isKeyboardOpen, closeTouchPill]);

  // Dismiss touch quick-action pill on outside tap or Escape
  useEffect(() => {
    if (!touchPillOpen || typeof document === 'undefined') return;
    const handlePointerDown = (e: PointerEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        closeTouchPill();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTouchPill();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [touchPillOpen, closeTouchPill]);

  // Allow Escape to dismiss an open Luni speech bubble cleanly
  useEffect(() => {
    if (!showSpeechBubble || showFullPanel) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSpeechBubble(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showSpeechBubble, showFullPanel]);

  const handleClosePanel = useCallback(() => {
    setShowFullPanel(false);
  }, []);

  if (!luniEnabled || isQuizFocusMode || isQuizAnswering) {
    return null;
  }

  const toggleMinimize = (min: boolean) => {
    setShowSpeechBubble(false);
    closeTouchPill();
    updatePreferences({ luniMinimized: min });
  };

  const openAssistantPanel = () => {
    setShowSpeechBubble(false);
    closeTouchPill();
    setShowFullPanel(true);
    luniState.notifyChatOpened();
  };

  const handleWidgetTap = () => {
    // Only triggers random pose when idle; tapping while sleeping wakes her.
    luniState.notifyTap();

    // On touch devices (@media (hover: none)), first tap also reveals the quick-action pill
    // for 4s (or until outside tap / Esc / blur) while preserving speech-bubble -> panel flow.
    if (showSpeechBubble) {
      openAssistantPanel();
    } else {
      setShowSpeechBubble(true);
      if (isTouchDevice) {
        setTouchPillOpen(true);
        scheduleTouchPillAutoClose();
      }
    }
  };

  const handleWidgetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      luniState.notifyTap();
      openAssistantPanel();
    }
  };

  const floatingEnabled =
    !prefersReducedMotion &&
    !luniState.isPaused &&
    (studentState.preferences?.luniFloatingAnimation ?? true) &&
    luniState.state !== 'sleeping';

  const showUnifiedSprite = Boolean(luniState.renderedSheet);

  const widgetSpriteSize = isKeyboardOpen ? 52 : 76;

  return (
    <>
      <div
        ref={widgetRef}
        data-luni-animated={studentState.preferences.luniFloatingAnimation !== false}
        onBlur={(e) => {
          if (touchPillOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
            closeTouchPill();
          }
        }}
        className={
          docked
            ? 'relative z-30 flex flex-col items-end px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl w-full mx-auto select-none'
            : 'luni-floating-widget fixed flex flex-col items-end select-none'
        }
      >
        {/* Floating Speech Bubble */}
        {showSpeechBubble && !isMinimized && !showFullPanel && !isKeyboardOpen && (
          <div className="mb-2.5">
            <LuniDialogueBubble
              dialogue={activeDialogue}
              onDismiss={() => setShowSpeechBubble(false)}
              onOpenPanel={openAssistantPanel}
            />
          </div>
        )}

        {/* Character & Quick Launcher */}
        <div className="flex items-end gap-2">
          {isMinimized ? (
            /* Minimized Sleek Pill */
            <button
              onClick={() => toggleMinimize(false)}
              className="min-h-11 md:min-h-0 flex items-center gap-2.5 px-3.5 py-2 bg-[var(--surface-95)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] dark:bg-[#0f172a]/95 dark:hover:bg-[#16223e] dark:border-[#1e293b] dark:text-slate-100 rounded-full shadow-lg shadow-indigo-950/10 transition-all md:hover:scale-105 active:scale-95 group cursor-pointer"
              aria-label="Wake Luni Companion"
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <LuniCharacter state="waving" size={28} animate={false} showParticles={false} />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-[var(--text)] dark:text-slate-100 leading-none">Ask Luni!</div>
                <div className="text-[10px] text-[var(--accent-ink)] dark:text-indigo-300 font-semibold leading-none mt-0.5">
                  AI Mentor
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
            </button>
          ) : (
            <div className="flex flex-col items-end group">
              {/* Quick Action Floating Pill (Hover/Focus on desktop, 4s tap-reveal on touch devices) */}
              {!isKeyboardOpen && (
                <div
                  data-testid="luni-quick-action-pill"
                  className={`relative z-10 transition-all duration-200 -mb-1 flex items-center gap-2 md:gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-white shadow-lg text-[11px] font-semibold ${
                    isTouchDevice
                      ? touchPillOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                      : touchPillOpen
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpeechBubble((prev) => !prev);
                      if (isTouchDevice) scheduleTouchPillAutoClose();
                    }}
                    className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                    aria-label={showSpeechBubble ? 'Hide Luni tip' : 'Show Luni tip'}
                    title={showSpeechBubble ? 'Hide tip' : 'Show tip'}
                  >
                    {showSpeechBubble ? <VolumeX className="w-3.5 h-3.5 md:w-3 md:h-3" /> : <Volume2 className="w-3.5 h-3.5 md:w-3 md:h-3" />}
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    type="button"
                    onClick={() => toggleMinimize(true)}
                    className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                    aria-label="Minimize Luni"
                    title="Minimize Luni"
                  >
                    <Minus className="w-3.5 h-3.5 md:w-3 md:h-3" />
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    type="button"
                    onClick={openAssistantPanel}
                    className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 px-2 md:px-0 hover:text-amber-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-400" />
                    <span>Chat</span>
                  </button>
                </div>
              )}

              {/* Luni Sprite with Subtle Pedestal & Glowing Glow */}
              <button
                type="button"
                data-testid="luni-assistant-widget-button"
                data-luni-state={luniState.state}
                data-luni-overlay={luniState.overlayState ?? 'none'}
                data-waving={activeSpritePose !== 'idle' && isAnySpritePlaying ? 'true' : 'false'}
                data-sprite-pose={activeSpritePose}
                data-wave-count={totalReactions}
                className="relative touch-manipulation cursor-pointer transition-transform duration-200 md:hover:scale-105 active:scale-95 flex flex-col items-center bg-transparent border-0 p-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl"
                onClick={handleWidgetTap}
                onKeyDown={handleWidgetKeyDown}
                aria-label="Luni, Moonstone Companion. Click to chat and ask questions."
              >
                {/* Soft Celestial Glow Aura */}
                <div className="absolute inset-0 bg-radial from-indigo-400/25 to-transparent rounded-full blur-md -z-10 scale-90" />

                {/* Soft ground shadow */}
                <div className="absolute bottom-0 w-12 h-2.5 bg-indigo-950/15 rounded-full blur-xs" />

                <div
                  className={`relative flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(99,102,241,0.2)] ${
                    isKeyboardOpen ? 'w-[52px] h-[52px]' : 'w-[76px] h-[76px]'
                  }`}
                >
                  {!showUnifiedSprite && (
                    <LuniCharacter
                      state={luniState.state === 'sleeping' ? 'sleeping' : characterState}
                      size={widgetSpriteSize}
                      animate={!prefersReducedMotion && luniState.state !== 'sleeping'}
                      showParticles={false}
                      interactive={false}
                    />
                  )}

                  {/* Preloaded CSS steps() multi-pose & state-machine sprite */}
                  <div
                    aria-hidden={!showUnifiedSprite}
                    className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                      floatingEnabled ? 'animate-float-gentle' : ''
                    } ${showUnifiedSprite ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <LuniSprite
                      mode="wave-sheet"
                      size={widgetSpriteSize}
                      activePoseId={luniState.renderedPoseId}
                      sheetUrl={luniState.renderedPoseConfig.src}
                      frameCount={luniState.renderedPoseConfig.frames}
                      sheetData={luniState.renderedSheet}
                      isPlaying={luniState.isPlaying}
                      isPaused={luniState.isPaused}
                      playbackMode={luniState.playbackMode}
                      playCount={luniState.playCount}
                      durationMs={luniState.durationMs}
                      activeEffect={luniState.activeEffect}
                      overlayState={luniState.overlayState}
                      spriteHidden={!showUnifiedSprite}
                      onWaveAnimationEnd={() => luniState.notifyOncePoseEnded(luniState.playCount)}
                      onLoopIteration={() => luniState.notifyLoopBoundary(luniState.renderedPoseId)}
                    />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Assistant Panel */}
      <LuniAssistantPanel
        isOpen={showFullPanel}
        onClose={handleClosePanel}
        currentState={characterState}
      />
    </>
  );
};
