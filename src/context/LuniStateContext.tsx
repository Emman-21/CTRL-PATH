import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  LUNI_POSES,
  type LuniSpritePoseConfig,
  getLuniPoseById,
  getPoseDurationMs,
  getPoseEffectDelayMs,
  getRandomTapLuniPoses,
  isOptionalLuniPose,
  pickRandomLuniPose,
} from '../data/luniSpritePoses';
import {
  type LoadedLuniWaveSheet,
  preloadAllLuniPoseSheets,
} from '../utils/luniWaveSprite';
import {
  LUNI_ACTIVITY_THROTTLE_MS,
  LUNI_CHAT_GREETED_SESSION_KEY,
  LUNI_SLEEP_MS,
  LUNI_TYPING_IDLE_TIMEOUT_MS,
  LUNI_WAKING_BANG_MS,
  type LuniMachineContext,
  type LuniMachineStateName,
  type LuniOverlayState,
  createInitialLuniMachineState,
  getOverlayStateForMachine,
  getTargetPoseIdForMachine,
  isLoopPoseId,
  isOncePoseId,
  luniStateReducer,
} from '../utils/luniStateMachine';
import {
  type ActiveLuniPoseEffect,
  LUNI_SPARKLE_LIFETIME_MS,
  useOsReducedMotion,
} from '../components/luni/useLuniSprite';
import { useStudent } from './StudentContext';

export interface LuniStateContextValue {
  machine: LuniMachineContext;
  state: LuniMachineStateName;
  activeTapPose: string | null;
  renderedPoseId: string;
  renderedPoseConfig: LuniSpritePoseConfig;
  renderedSheet: LoadedLuniWaveSheet | null;
  sheetsById: Record<string, LoadedLuniWaveSheet>;
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  playbackMode: 'loop' | 'once';
  playCount: number;
  durationMs: number;
  overlayState: LuniOverlayState;
  activeEffect: ActiveLuniPoseEffect | null;
  prefersReducedMotion: boolean;
  notifyChatOpened: () => void;
  notifyTyping: (text: string) => void;
  notifyInputBlur: () => void;
  notifyMessageSent: () => void;
  notifyReplyStarted: () => void;
  notifyReplyChunk: () => void;
  notifyReplyDone: (reply: string) => void;
  notifyError: () => void;
  notifyTap: () => boolean;
  notifySpecificTap: (poseId: string) => boolean;
  notifyOncePoseEnded: (playId?: number) => void;
  notifyLoopBoundary: (poseId?: string) => void;
}

const DEFAULT_POSE_CONFIG = getLuniPoseById('idle') ?? getLuniPoseById('wave') ?? LUNI_POSES[0];

const FALLBACK_LUNI_STATE: LuniStateContextValue = {
  machine: createInitialLuniMachineState(false),
  state: 'idle',
  activeTapPose: null,
  renderedPoseId: 'idle',
  renderedPoseConfig: DEFAULT_POSE_CONFIG,
  renderedSheet: null,
  sheetsById: {},
  isLoaded: false,
  isPlaying: false,
  isPaused: false,
  playbackMode: 'loop',
  playCount: 0,
  durationMs: getPoseDurationMs(DEFAULT_POSE_CONFIG),
  overlayState: null,
  activeEffect: null,
  prefersReducedMotion: false,
  notifyChatOpened: () => {},
  notifyTyping: () => {},
  notifyInputBlur: () => {},
  notifyMessageSent: () => {},
  notifyReplyStarted: () => {},
  notifyReplyChunk: () => {},
  notifyReplyDone: () => {},
  notifyError: () => {},
  notifyTap: () => false,
  notifySpecificTap: () => false,
  notifyOncePoseEnded: () => {},
  notifyLoopBoundary: () => {},
};

const LuniStateContext = createContext<LuniStateContextValue | null>(null);

function readGreetedSessionFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(LUNI_CHAT_GREETED_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeGreetedSessionFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(LUNI_CHAT_GREETED_SESSION_KEY, '1');
  } catch {
    // Ignore storage quota errors
  }
}

export const LuniStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: studentState } = useStudent();
  const osReducedMotion = useOsReducedMotion();
  const prefersReducedMotion = Boolean(studentState.preferences?.reducedMotion || osReducedMotion);
  const luniEnabled = studentState.preferences?.luniEnabled !== false;

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
    if (typeof window === 'undefined') return;
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

  const isQuizAnswering =
    quizAnsweringActive &&
    typeof window !== 'undefined' &&
    window.location?.pathname === '/quiz';
  const isSuppressed = !luniEnabled || isQuizFocusMode || isQuizAnswering;

  const [machine, dispatch] = useReducer(
    luniStateReducer,
    undefined,
    () => createInitialLuniMachineState(readGreetedSessionFlag()),
  );

  const [sheetsById, setSheetsById] = useState<Record<string, LoadedLuniWaveSheet>>({});
  const [renderedPoseId, setRenderedPoseId] = useState<string>('idle');
  const [playCount, setPlayCount] = useState<number>(0);
  const [activeEffect, setActiveEffect] = useState<ActiveLuniPoseEffect | null>(null);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.hidden : false,
  );

  const machineRef = useRef(machine);
  machineRef.current = machine;

  const renderedPoseRef = useRef(renderedPoseId);
  renderedPoseRef.current = renderedPoseId;

  const playCountRef = useRef(playCount);
  playCountRef.current = playCount;

  const isTabHiddenRef = useRef(isTabHidden);
  isTabHiddenRef.current = isTabHidden;

  // Timer refs & remaining-ms pause tracking
  const sleepTimerRef = useRef<number | null>(null);
  const sleepRemainingRef = useRef<number>(LUNI_SLEEP_MS);
  const sleepStartedAtRef = useRef<number | null>(null);

  const typingTimerRef = useRef<number | null>(null);
  const typingRemainingRef = useRef<number>(LUNI_TYPING_IDLE_TIMEOUT_MS);
  const typingStartedAtRef = useRef<number | null>(null);

  const speakTimerRef = useRef<number | null>(null);
  const speakRemainingRef = useRef<number>(0);
  const speakTimerStartedAtRef = useRef<number | null>(null);

  const wakingBangTimerRef = useRef<number | null>(null);
  const onceFallbackTimerRef = useRef<number | null>(null);
  const loopFallbackTimerRef = useRef<number | null>(null);
  const frameSwitchRafRef = useRef<number | null>(null);
  const effectStartTimerRef = useRef<number | null>(null);
  const effectClearTimerRef = useRef<number | null>(null);
  const lastActivityHandledAtRef = useRef<number>(0);
  const handledOncePlayCountRef = useRef<number>(-1);

  // Preload all sprite sheets (shared bounding box across all poses)
  useEffect(() => {
    let active = true;
    preloadAllLuniPoseSheets(LUNI_POSES)
      .then((loadedMap) => {
        if (active) setSheetsById(loadedMap);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Persist sessionStorage "greeted this session" flag once set
  useEffect(() => {
    if (machine.hasGreetedThisSession) {
      writeGreetedSessionFlag();
    }
  }, [machine.hasGreetedThisSession]);

  // Reset to static idle when Luni is disabled or quiz focus/answering suppresses companion
  useEffect(() => {
    if (isSuppressed) {
      dispatch({ type: 'RESET_DISABLED' });
      setRenderedPoseId('idle');
      setActiveEffect(null);
    }
  }, [isSuppressed]);

  const clearEffectTimers = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (effectStartTimerRef.current !== null) {
      window.clearTimeout(effectStartTimerRef.current);
      effectStartTimerRef.current = null;
    }
    if (effectClearTimerRef.current !== null) {
      window.clearTimeout(effectClearTimerRef.current);
      effectClearTimerRef.current = null;
    }
  }, []);

  const triggerWandEffectIfNeeded = useCallback(
    (poseId: string) => {
      clearEffectTimers();
      setActiveEffect(null);
      if (poseId !== 'wand' || prefersReducedMotion || typeof window === 'undefined') {
        return;
      }
      const wandPose = getLuniPoseById('wand');
      if (!wandPose || wandPose.effect !== 'castSparkles') return;
      const delayMs = getPoseEffectDelayMs(wandPose);
      effectStartTimerRef.current = window.setTimeout(() => {
        effectStartTimerRef.current = null;
        setActiveEffect({
          effect: 'castSparkles',
          tipX: wandPose.tipX ?? 91,
          tipY: wandPose.tipY ?? 40,
          key: Date.now(),
        });
        effectClearTimerRef.current = window.setTimeout(() => {
          effectClearTimerRef.current = null;
          setActiveEffect(null);
        }, LUNI_SPARKLE_LIFETIME_MS);
      }, delayMs);
    },
    [clearEffectTimers, prefersReducedMotion],
  );

  const wakingSheetAvailable = Boolean(sheetsById['waking']);
  const targetPoseId = getTargetPoseIdForMachine(machine, wakingSheetAvailable);

  const commitPoseChange = useCallback(
    (nextPoseId: string) => {
      if (frameSwitchRafRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(frameSwitchRafRef.current);
        frameSwitchRafRef.current = null;
      }
      if (loopFallbackTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(loopFallbackTimerRef.current);
        loopFallbackTimerRef.current = null;
      }

      if (renderedPoseRef.current === nextPoseId) return;
      renderedPoseRef.current = nextPoseId;
      setRenderedPoseId(nextPoseId);
      setPlayCount((c) => {
        const next = c + 1;
        playCountRef.current = next;
        return next;
      });
      triggerWandEffectIfNeeded(nextPoseId);
    },
    [triggerWandEffectIfNeeded],
  );

  // Smooth pose transition scheduler
  useEffect(() => {
    if (targetPoseId === renderedPoseId) {
      if (loopFallbackTimerRef.current !== null) {
        window.clearTimeout(loopFallbackTimerRef.current);
        loopFallbackTimerRef.current = null;
      }
      return;
    }

    // Under reduced motion, suppression, or SSR, switch immediately without waiting for animation cycles
    if (prefersReducedMotion || isSuppressed || typeof window === 'undefined') {
      commitPoseChange(targetPoseId);
      return;
    }

    const currentIsLoop = isLoopPoseId(renderedPoseId);
    const shouldBreakAtNextFrame =
      !currentIsLoop ||
      targetPoseId === 'thinking' ||
      machine.state === 'waking';

    if (shouldBreakAtNextFrame) {
      if (frameSwitchRafRef.current !== null) {
        window.cancelAnimationFrame(frameSwitchRafRef.current);
      }
      frameSwitchRafRef.current = window.requestAnimationFrame(() => {
        frameSwitchRafRef.current = null;
        commitPoseChange(targetPoseId);
      });
      return () => {
        if (frameSwitchRafRef.current !== null) {
          window.cancelAnimationFrame(frameSwitchRafRef.current);
          frameSwitchRafRef.current = null;
        }
      };
    }

    // If tab is hidden, CSS animation is paused; wait until visible/loop iteration instead of timing out early
    if (isTabHidden) {
      return;
    }

    // Otherwise we are switching out of an active loop pose -> wait for loop boundary!
    const currentPoseCfg = getLuniPoseById(renderedPoseId);
    const cycleMs = currentPoseCfg ? getPoseDurationMs(currentPoseCfg) : 750;
    if (loopFallbackTimerRef.current !== null) {
      window.clearTimeout(loopFallbackTimerRef.current);
    }
    loopFallbackTimerRef.current = window.setTimeout(() => {
      loopFallbackTimerRef.current = null;
      commitPoseChange(targetPoseId);
    }, cycleMs + 90);

    return () => {
      if (loopFallbackTimerRef.current !== null) {
        window.clearTimeout(loopFallbackTimerRef.current);
        loopFallbackTimerRef.current = null;
      }
    };
  }, [targetPoseId, renderedPoseId, machine.state, prefersReducedMotion, isSuppressed, isTabHidden, commitPoseChange]);

  // Safety timeout for `once` poses so an in-flight once-pose always concludes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (onceFallbackTimerRef.current !== null) {
      window.clearTimeout(onceFallbackTimerRef.current);
      onceFallbackTimerRef.current = null;
    }

    const activeOnce =
      machine.activeTapPose !== null ||
      machine.state === 'greeting' ||
      machine.state === 'waking';

    if (!activeOnce || isSuppressed) return;

    // Wait until the loop boundary has actually committed the once-pose before counting its duration
    const waitingForLoopBoundary =
      renderedPoseId !== targetPoseId &&
      !(machine.state === 'waking' && !wakingSheetAvailable);
    if (waitingForLoopBoundary) return;

    let waitMs = 600;
    if (machine.state === 'waking' && !wakingSheetAvailable) {
      waitMs = LUNI_WAKING_BANG_MS;
    } else {
      const oncePoseId =
        machine.activeTapPose ??
        (machine.state === 'greeting' ? 'wave' : 'waking');
      const cfg = getLuniPoseById(oncePoseId);
      waitMs = cfg ? getPoseDurationMs(cfg) + 90 : 690;
    }

    if (prefersReducedMotion) {
      waitMs = machine.state === 'waking' ? LUNI_WAKING_BANG_MS : 600;
    }

    const scheduledPlayCount = playCountRef.current;
    onceFallbackTimerRef.current = window.setTimeout(() => {
      onceFallbackTimerRef.current = null;
      if (handledOncePlayCountRef.current === scheduledPlayCount) {
        return;
      }
      handledOncePlayCountRef.current = scheduledPlayCount;
      dispatch({ type: 'ONCE_POSE_ENDED', now: Date.now() });
    }, waitMs);

    return () => {
      if (onceFallbackTimerRef.current !== null) {
        window.clearTimeout(onceFallbackTimerRef.current);
        onceFallbackTimerRef.current = null;
      }
    };
  }, [
    machine.activeTapPose,
    machine.state,
    renderedPoseId,
    targetPoseId,
    playCount,
    wakingSheetAvailable,
    prefersReducedMotion,
    isSuppressed,
  ]);

  // 400ms `!` bang overlay timer for waking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (wakingBangTimerRef.current !== null) {
      window.clearTimeout(wakingBangTimerRef.current);
      wakingBangTimerRef.current = null;
    }
    if (machine.state !== 'waking' || !machine.wakingBangActive || isTabHidden) {
      return;
    }
    wakingBangTimerRef.current = window.setTimeout(() => {
      wakingBangTimerRef.current = null;
      dispatch({ type: 'WAKING_BANG_DONE' });
    }, LUNI_WAKING_BANG_MS);

    return () => {
      if (wakingBangTimerRef.current !== null) {
        window.clearTimeout(wakingBangTimerRef.current);
        wakingBangTimerRef.current = null;
      }
    };
  }, [machine.state, machine.wakingBangActive, isTabHidden]);

  // Sleep timer (30s inactivity -> sleeping; pauses when tab hidden; never during thinking/speaking/typing)
  const scheduleSleepTimer = useCallback((durationMs: number) => {
    if (typeof window === 'undefined') return;
    if (sleepTimerRef.current !== null) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    const m = machineRef.current;
    if (
      !luniEnabled ||
      isTabHiddenRef.current ||
      m.state !== 'idle' ||
      m.isTyping ||
      m.activeTapPose !== null
    ) {
      return;
    }
    const safeMs = Math.max(0, durationMs);
    sleepRemainingRef.current = safeMs;
    sleepStartedAtRef.current = Date.now();
    sleepTimerRef.current = window.setTimeout(() => {
      sleepTimerRef.current = null;
      sleepStartedAtRef.current = null;
      sleepRemainingRef.current = 0;
      dispatch({ type: 'SLEEP_TIMEOUT' });
    }, safeMs);
  }, [luniEnabled]);

  useEffect(() => {
    if (
      !luniEnabled ||
      isTabHidden ||
      machine.state !== 'idle' ||
      machine.isTyping ||
      machine.activeTapPose !== null
    ) {
      if (sleepTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      if (!machine.isTyping && machine.state !== 'idle') {
        sleepRemainingRef.current = LUNI_SLEEP_MS;
      }
      return;
    }

    scheduleSleepTimer(sleepRemainingRef.current || LUNI_SLEEP_MS);

    return () => {
      if (sleepTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [
    luniEnabled,
    isTabHidden,
    machine.state,
    machine.isTyping,
    machine.activeTapPose,
    scheduleSleepTimer,
  ]);

  // Typing 2.5s inactivity timer (pauses when hidden)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (!luniEnabled || !machine.isTyping || isTabHidden) {
      return;
    }
    const waitMs = typingRemainingRef.current > 0 ? typingRemainingRef.current : LUNI_TYPING_IDLE_TIMEOUT_MS;
    typingStartedAtRef.current = Date.now();
    typingTimerRef.current = window.setTimeout(() => {
      typingTimerRef.current = null;
      typingStartedAtRef.current = null;
      typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
      dispatch({ type: 'TYPING_TIMEOUT' });
    }, waitMs);

    return () => {
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [luniEnabled, machine.isTyping, isTabHidden]);

  // Speaking timer (pauses when hidden)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (speakTimerRef.current !== null) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (
      !luniEnabled ||
      machine.state !== 'speaking' ||
      machine.isStreamingReply ||
      machine.speakDurationMs === null ||
      isTabHidden
    ) {
      return;
    }
    const waitMs =
      speakRemainingRef.current > 0
        ? speakRemainingRef.current
        : machine.speakDurationMs;
    speakRemainingRef.current = waitMs;
    speakTimerStartedAtRef.current = Date.now();
    speakTimerRef.current = window.setTimeout(() => {
      speakTimerRef.current = null;
      speakTimerStartedAtRef.current = null;
      speakRemainingRef.current = 0;
      dispatch({ type: 'SPEAK_DONE' });
    }, waitMs);

    return () => {
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
    };
  }, [
    luniEnabled,
    machine.state,
    machine.isStreamingReply,
    machine.speakDurationMs,
    isTabHidden,
  ]);

  // Window activity listeners (throttled ~250ms) + visibilitychange pause/resume
  useEffect(() => {
    if (typeof window === 'undefined' || !luniEnabled) return;

    const handleActivity = () => {
      const now = Date.now();
      const currentlySleeping = machineRef.current.state === 'sleeping';
      if (!currentlySleeping && now - lastActivityHandledAtRef.current < LUNI_ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivityHandledAtRef.current = now;

      if (currentlySleeping) {
        sleepRemainingRef.current = LUNI_SLEEP_MS;
        dispatch({ type: 'ACTIVITY' });
        return;
      }

      if (
        machineRef.current.state === 'idle' &&
        !machineRef.current.isTyping &&
        machineRef.current.activeTapPose === null &&
        !isTabHiddenRef.current
      ) {
        sleepRemainingRef.current = LUNI_SLEEP_MS;
        scheduleSleepTimer(LUNI_SLEEP_MS);
      }
    };

    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      isTabHiddenRef.current = hidden;
      setIsTabHidden(hidden);

      if (hidden) {
        const now = Date.now();
        if (sleepStartedAtRef.current !== null) {
          sleepRemainingRef.current = Math.max(
            0,
            sleepRemainingRef.current - (now - sleepStartedAtRef.current),
          );
          sleepStartedAtRef.current = null;
        }
        if (typingStartedAtRef.current !== null) {
          typingRemainingRef.current = Math.max(
            0,
            typingRemainingRef.current - (now - typingStartedAtRef.current),
          );
          typingStartedAtRef.current = null;
        }
        if (speakTimerStartedAtRef.current !== null) {
          speakRemainingRef.current = Math.max(
            0,
            speakRemainingRef.current - (now - speakTimerStartedAtRef.current),
          );
          speakTimerStartedAtRef.current = null;
        }
      } else {
        // Tab visible again -> treat as activity
        sleepRemainingRef.current = LUNI_SLEEP_MS;
        lastActivityHandledAtRef.current = 0;
        if (machineRef.current.state === 'sleeping') {
          dispatch({ type: 'ACTIVITY' });
        } else {
          handleActivity();
        }
      }
    };

    const events: Array<keyof WindowEventMap> = [
      'pointermove',
      'pointerdown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ];

    for (const evt of events) {
      window.addEventListener(evt, handleActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, handleActivity);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [luniEnabled, scheduleSleepTimer]);

  useEffect(() => {
    return () => {
      clearEffectTimers();
      if (typeof window === 'undefined') return;
      if (sleepTimerRef.current !== null) window.clearTimeout(sleepTimerRef.current);
      if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
      if (speakTimerRef.current !== null) window.clearTimeout(speakTimerRef.current);
      if (wakingBangTimerRef.current !== null) window.clearTimeout(wakingBangTimerRef.current);
      if (onceFallbackTimerRef.current !== null) window.clearTimeout(onceFallbackTimerRef.current);
      if (loopFallbackTimerRef.current !== null) window.clearTimeout(loopFallbackTimerRef.current);
      if (frameSwitchRafRef.current !== null) window.cancelAnimationFrame(frameSwitchRafRef.current);
    };
  }, [clearEffectTimers]);

  const notifyChatOpened = useCallback(() => {
    sleepRemainingRef.current = LUNI_SLEEP_MS;
    dispatch({ type: 'CHAT_OPENED' });
  }, []);

  const notifyTyping = useCallback((text: string) => {
    const now = Date.now();
    sleepRemainingRef.current = LUNI_SLEEP_MS;
    if (text.trim().length > 0) {
      typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
      typingStartedAtRef.current = now;
      if (typingTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = window.setTimeout(() => {
          typingTimerRef.current = null;
          typingStartedAtRef.current = null;
          typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
          dispatch({ type: 'TYPING_TIMEOUT' });
        }, LUNI_TYPING_IDLE_TIMEOUT_MS);
      }
    } else {
      typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
      typingStartedAtRef.current = null;
    }
    dispatch({ type: 'TYPING', text, now });
  }, []);

  const notifyInputBlur = useCallback(() => {
    typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
    typingStartedAtRef.current = null;
    dispatch({ type: 'INPUT_BLUR' });
  }, []);

  const notifyMessageSent = useCallback(() => {
    typingRemainingRef.current = LUNI_TYPING_IDLE_TIMEOUT_MS;
    typingStartedAtRef.current = null;
    speakRemainingRef.current = 0;
    dispatch({ type: 'MESSAGE_SENT', now: Date.now() });
  }, []);

  const notifyReplyStarted = useCallback(() => {
    speakRemainingRef.current = 0;
    dispatch({ type: 'REPLY_STARTED', now: Date.now() });
  }, []);

  const notifyReplyChunk = useCallback(() => {
    dispatch({ type: 'REPLY_CHUNK', now: Date.now() });
  }, []);

  const notifyReplyDone = useCallback((reply: string) => {
    speakRemainingRef.current = 0;
    dispatch({ type: 'REPLY_DONE', reply, now: Date.now() });
  }, []);

  const notifyError = useCallback(() => {
    speakRemainingRef.current = 0;
    dispatch({ type: 'ERROR' });
  }, []);

  const notifyTap = useCallback((): boolean => {
    sleepRemainingRef.current = LUNI_SLEEP_MS;
    const m = machineRef.current;
    if (m.state === 'sleeping') {
      dispatch({ type: 'ACTIVITY' });
      return false;
    }
    if (m.state !== 'idle' || m.activeTapPose !== null) {
      return false;
    }
    const tapPool = getRandomTapLuniPoses(LUNI_POSES);
    const picked = pickRandomLuniPose(tapPool, m.lastTapPoseId);
    dispatch({ type: 'TAP', poseId: picked.id });
    return true;
  }, []);

  const notifySpecificTap = useCallback((poseId: string): boolean => {
    const m = machineRef.current;
    if (m.state !== 'idle' || m.activeTapPose !== null) {
      return false;
    }
    const cfg = getLuniPoseById(poseId);
    if (!cfg || cfg.state) {
      return false;
    }
    dispatch({ type: 'TRIGGER_SPECIFIC_TAP', poseId });
    return true;
  }, []);

  const notifyOncePoseEnded = useCallback((playId?: number) => {
    const targetPlayId = playId ?? playCountRef.current;
    if (playId !== undefined && playId !== playCountRef.current) {
      return;
    }
    if (handledOncePlayCountRef.current === targetPlayId) {
      return;
    }
    if (
      machineRef.current.activeTapPose === null &&
      machineRef.current.state !== 'greeting' &&
      machineRef.current.state !== 'waking'
    ) {
      return;
    }
    handledOncePlayCountRef.current = targetPlayId;
    dispatch({ type: 'ONCE_POSE_ENDED', now: Date.now() });
  }, []);

  const notifyLoopBoundary = useCallback(
    (poseId?: string) => {
      if (poseId !== undefined && poseId !== renderedPoseRef.current) {
        return;
      }
      const m = machineRef.current;
      // Switch out of speaking into listening if user started typing during speaking
      if (m.state === 'speaking' && m.queuedState === 'listening') {
        dispatch({ type: 'LOOP_BOUNDARY' });
        commitPoseChange('listening');
        return;
      }
      const nextTarget = getTargetPoseIdForMachine(m, Boolean(sheetsById['waking']));
      if (nextTarget !== renderedPoseRef.current) {
        commitPoseChange(nextTarget);
      }
    },
    [commitPoseChange, sheetsById],
  );

  // Resolve visual sprite sheet props for `renderedPoseId`
  const effectivePoseId = useMemo(() => {
    if (isSuppressed) return 'idle';
    if (
      prefersReducedMotion &&
      isOncePoseId(targetPoseId) &&
      machine.state === 'idle' &&
      !machine.activeTapPose
    ) {
      return 'idle';
    }
    return renderedPoseId;
  }, [isSuppressed, prefersReducedMotion, targetPoseId, machine.state, machine.activeTapPose, renderedPoseId]);

  const resolvedPoseConfig = useMemo(() => {
    return getLuniPoseById(effectivePoseId) ?? DEFAULT_POSE_CONFIG;
  }, [effectivePoseId]);

  const renderedSheet = useMemo(() => {
    return sheetsById[effectivePoseId] ?? null;
  }, [effectivePoseId, sheetsById]);

  const isPlaying = !prefersReducedMotion && !isSuppressed;
  const isPaused = isTabHidden;
  const playbackMode: 'loop' | 'once' = isLoopPoseId(effectivePoseId) ? 'loop' : 'once';
  const durationMs = getPoseDurationMs(resolvedPoseConfig);
  const overlayState = isSuppressed ? null : getOverlayStateForMachine(machine);
  const requiredPoseCount = useMemo(
    () => LUNI_POSES.filter((pose) => !isOptionalLuniPose(pose)).length,
    [],
  );
  const isLoaded = useMemo(
    () =>
      LUNI_POSES.filter((pose) => !isOptionalLuniPose(pose) && Boolean(sheetsById[pose.id]))
        .length >= requiredPoseCount,
    [sheetsById, requiredPoseCount],
  );

  const value = useMemo<LuniStateContextValue>(
    () => ({
      machine,
      state: machine.state,
      activeTapPose: machine.activeTapPose,
      renderedPoseId: effectivePoseId,
      renderedPoseConfig: resolvedPoseConfig,
      renderedSheet,
      sheetsById,
      isLoaded,
      isPlaying,
      isPaused,
      playbackMode,
      playCount,
      durationMs,
      overlayState,
      activeEffect,
      prefersReducedMotion,
      notifyChatOpened,
      notifyTyping,
      notifyInputBlur,
      notifyMessageSent,
      notifyReplyStarted,
      notifyReplyChunk,
      notifyReplyDone,
      notifyError,
      notifyTap,
      notifySpecificTap,
      notifyOncePoseEnded,
      notifyLoopBoundary,
    }),
    [
      machine,
      effectivePoseId,
      resolvedPoseConfig,
      renderedSheet,
      sheetsById,
      isLoaded,
      isPlaying,
      isPaused,
      playbackMode,
      playCount,
      durationMs,
      overlayState,
      activeEffect,
      prefersReducedMotion,
      notifyChatOpened,
      notifyTyping,
      notifyInputBlur,
      notifyMessageSent,
      notifyReplyStarted,
      notifyReplyChunk,
      notifyReplyDone,
      notifyError,
      notifyTap,
      notifySpecificTap,
      notifyOncePoseEnded,
      notifyLoopBoundary,
    ],
  );

  return <LuniStateContext.Provider value={value}>{children}</LuniStateContext.Provider>;
};

export function useLuniState(): LuniStateContextValue {
  const ctx = useContext(LuniStateContext);
  return ctx ?? FALLBACK_LUNI_STATE;
}
