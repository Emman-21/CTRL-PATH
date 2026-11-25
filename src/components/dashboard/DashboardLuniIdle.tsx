import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { LUNI_POSES } from '../../assets/manifest';
import { getLuniLoginGreetPoseId } from '../../data/luniSpritePoses';
import {
  DASHBOARD_LUNI_IDLE_SEQUENCE,
  DASHBOARD_LUNI_POSE_SHEETS,
  type DashboardLuniPoseAction,
  type DashboardLuniSheetSpec,
  type SpriteBounds,
  computeAlignedPlacement,
  computeSpriteBounds,
  getIdleCellRects,
  removeCrescentAndSparkleAura,
  removeExteriorWhiteBackground,
} from '../../utils/dashboardLuniIdle';
import {
  LUNI_GREET_DELAY_MS,
  consumeLuniLoginGreetPending,
  shouldPlayLuniLoginGreet,
} from '../../utils/luniLoginGreet';
import { LUNI_WINK_MILESTONE_EVENT } from '../../utils/luniWaveSprite';
import { LuniSprite, useLuniSprite } from '../luni/LuniSprite';
import { useOsReducedMotion } from '../luni/useLuniSprite';

interface ProcessedFrame {
  canvas: HTMLCanvasElement;
  bounds: SpriteBounds;
}

interface ProcessedSheet {
  frames: ProcessedFrame[];
  maxBodySpan: number;
}

const cachedSheetPromises: Partial<Record<DashboardLuniPoseAction, Promise<ProcessedSheet>>> = {};

function loadPoseSpriteSheet(spec: DashboardLuniSheetSpec): Promise<ProcessedSheet> {
  const existing = cachedSheetPromises[spec.action];
  if (existing) return existing;

  const promise = new Promise<ProcessedSheet>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      try {
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = img.naturalWidth;
        sheetCanvas.height = img.naturalHeight;
        const sheetCtx = sheetCanvas.getContext('2d', { willReadFrequently: true });
        if (!sheetCtx) {
          reject(new Error(`Could not initialize 2D context for Luni ${spec.action} sprite sheet`));
          return;
        }
        sheetCtx.drawImage(img, 0, 0);

        const rects = getIdleCellRects(img.naturalWidth, img.naturalHeight, spec.cols, spec.rows);
        const frames: ProcessedFrame[] = [];
        let maxBodySpan = 1;

        for (const rect of rects) {
          const cellImageData = sheetCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
          if (spec.cleanWhiteBg) {
            removeExteriorWhiteBackground(cellImageData.data, rect.width, rect.height);
          }
          if (spec.cleanAura) {
            removeCrescentAndSparkleAura(cellImageData.data, rect.width, rect.height);
          }
          const bounds = computeSpriteBounds(cellImageData.data, rect.width, rect.height);

          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = bounds.width;
          frameCanvas.height = bounds.height;
          const frameCtx = frameCanvas.getContext('2d');
          if (!frameCtx) {
            reject(new Error(`Could not initialize frame canvas for Luni ${spec.action} sprite`));
            return;
          }

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = rect.width;
          tempCanvas.height = rect.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.putImageData(cellImageData, 0, 0);
            frameCtx.drawImage(
              tempCanvas,
              bounds.minX,
              bounds.minY,
              bounds.width,
              bounds.height,
              0,
              0,
              bounds.width,
              bounds.height,
            );
          }

          maxBodySpan = Math.max(maxBodySpan, bounds.height, bounds.width * 0.92);
          frames.push({ canvas: frameCanvas, bounds });
        }

        resolve({ frames, maxBodySpan });
      } catch (err) {
        delete cachedSheetPromises[spec.action];
        reject(err);
      }
    };

    img.onerror = () => {
      delete cachedSheetPromises[spec.action];
      reject(new Error(`Failed to load ${spec.url}`));
    };

    img.src = spec.url;
  });

  cachedSheetPromises[spec.action] = promise;
  return promise;
}

export interface DashboardLuniIdleProps {
  size?: number;
  animate?: boolean;
  glow?: boolean;
  className?: string;
}

interface RenderedPoseSnapshot {
  action: DashboardLuniPoseAction;
  frameIndex: number;
}

type ActiveSpritePose = 'wave' | 'wink';

export const DashboardLuniIdle: React.FC<DashboardLuniIdleProps> = ({
  size = 148,
  animate = true,
  glow = true,
  className = '',
}) => {
  const { state: studentState } = useStudent();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevSnapshotRef = useRef<RenderedPoseSnapshot | null>(null);
  const crossfadeRafRef = useRef<number | null>(null);
  const tapSpringTimerRef = useRef<number | null>(null);

  const [idleSheet, setIdleSheet] = useState<ProcessedSheet | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [tapSpringActive, setTapSpringActive] = useState(false);

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
    window.addEventListener('ctrl_focus_mode_changed', handleFocusChange);
    window.addEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    return () => {
      window.removeEventListener('ctrl_focus_mode_changed', handleFocusChange);
      window.removeEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    };
  }, []);

  const osReducedMotion = useOsReducedMotion();
  const prefersReducedMotion = Boolean(studentState.preferences?.reducedMotion || osReducedMotion);

  const animationsEnabled =
    animate && !prefersReducedMotion && (studentState.preferences?.luniFloatingAnimation ?? true);

  const luniSprite = useLuniSprite({
    prefersReducedMotion,
  });

  const isAnySpritePlaying = luniSprite.isPlaying;
  const activeSpritePose = luniSprite.activePose.id;
  const totalReactions = luniSprite.playCount;

  // Auto-wave once (~500ms after mount) right after a fresh login when landing on "/"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isQuizAnswering = location.pathname === '/quiz' && quizAnsweringActive;

    const canGreet = shouldPlayLuniLoginGreet({
      pathname: location.pathname,
      component: 'dashboard',
      luniEnabled: studentState.preferences?.luniEnabled,
      isQuizFocusMode,
      isQuizAnswering,
      storage: window.sessionStorage,
    });

    if (!canGreet) return;

    const timerId = window.setTimeout(() => {
      const stillAllowed = shouldPlayLuniLoginGreet({
        pathname: location.pathname,
        component: 'dashboard',
        luniEnabled: studentState.preferences?.luniEnabled,
        isQuizFocusMode: window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true',
        isQuizAnswering:
          location.pathname === '/quiz' &&
          window.sessionStorage.getItem('ctrl_quiz_answering') === 'true',
        storage: window.sessionStorage,
      });
      if (!stillAllowed) return;
      if (consumeLuniLoginGreetPending(window.sessionStorage)) {
        luniSprite.triggerPose(getLuniLoginGreetPoseId());
      }
    }, LUNI_GREET_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [
    location.pathname,
    studentState.preferences?.luniEnabled,
    isQuizFocusMode,
    quizAnsweringActive,
    luniSprite.triggerPose,
  ]);

  // Play Luni's wink animation when milestone events (achievement unlock / quiz finish) occur
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMilestoneWink = () => {
      const isQuizAnswering = location.pathname === '/quiz' && quizAnsweringActive;
      if (
        studentState.preferences?.luniEnabled === false ||
        isQuizFocusMode ||
        isQuizAnswering ||
        luniSprite.isPlaying
      ) {
        return;
      }
      luniSprite.triggerPose('wink');
    };
    window.addEventListener(LUNI_WINK_MILESTONE_EVENT, onMilestoneWink);
    return () => window.removeEventListener(LUNI_WINK_MILESTONE_EVENT, onMilestoneWink);
  }, [
    location.pathname,
    studentState.preferences?.luniEnabled,
    isQuizFocusMode,
    quizAnsweringActive,
    luniSprite.isPlaying,
    luniSprite.triggerPose,
  ]);

  useEffect(() => {
    let active = true;
    loadPoseSpriteSheet(DASHBOARD_LUNI_POSE_SHEETS.idle)
      .then((processed) => {
        if (!active) return;
        setIdleSheet(processed);
      })
      .catch(() => {
        if (!active) return;
        setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Existing idle blinking/breathing timeline
  useEffect(() => {
    if (!idleSheet) return;
    if (!animationsEnabled) {
      setFrameIndex(0);
      return;
    }

    let cancelled = false;
    let timerId: number | null = null;
    let stepIndex = 0;

    const step = () => {
      if (cancelled) return;
      const keyframe = DASHBOARD_LUNI_IDLE_SEQUENCE[stepIndex % DASHBOARD_LUNI_IDLE_SEQUENCE.length];
      setFrameIndex(keyframe.frameIndex);
      stepIndex += 1;
      timerId = window.setTimeout(step, keyframe.durationMs);
    };

    step();

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, [animationsEnabled, idleSheet]);

  useEffect(() => {
    return () => {
      if (crossfadeRafRef.current !== null) window.cancelAnimationFrame(crossfadeRafRef.current);
      if (tapSpringTimerRef.current !== null) window.clearTimeout(tapSpringTimerRef.current);
    };
  }, []);

  const handleTapLuni = () => {
    // Ignore taps while any pose animation is actively playing (no spam-clicking)
    if (isAnySpritePlaying) return;

    const pickedPose = luniSprite.triggerRandomPose();
    if (pickedPose || prefersReducedMotion) {
      setTapSpringActive(true);
      if (tapSpringTimerRef.current !== null) {
        window.clearTimeout(tapSpringTimerRef.current);
      }
      tapSpringTimerRef.current = window.setTimeout(() => setTapSpringActive(false), 480);
    }
  };

  // Smoothly cross-fade idle frames on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !idleSheet) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const pixelSize = Math.round(size * dpr);

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (crossfadeRafRef.current !== null) {
      window.cancelAnimationFrame(crossfadeRafRef.current);
      crossfadeRafRef.current = null;
    }

    const drawSnapshot = (snapshot: RenderedPoseSnapshot, alpha: number) => {
      const frame = idleSheet.frames[snapshot.frameIndex] || idleSheet.frames[0];
      if (!frame) return;
      const placement = computeAlignedPlacement(frame.bounds, idleSheet.maxBodySpan, size, 0.04);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(frame.canvas, placement.dx, placement.dy, placement.dw, placement.dh);
      ctx.restore();
    };

    const prevSnapshot = prevSnapshotRef.current;
    const nextSnapshot: RenderedPoseSnapshot = { action: 'idle', frameIndex };
    prevSnapshotRef.current = nextSnapshot;

    const shouldCrossfade =
      animationsEnabled &&
      prevSnapshot !== null &&
      prevSnapshot.frameIndex !== nextSnapshot.frameIndex;

    if (!shouldCrossfade) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawSnapshot(nextSnapshot, 1);
      ctx.restore();
      return;
    }

    const fadeDurationMs = 140;
    const startTime = performance.now();

    const animateBlend = (now: number) => {
      const rawT = Math.min(1, (now - startTime) / fadeDurationMs);
      const eased = rawT * rawT * (3 - 2 * rawT);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (eased < 1) {
        drawSnapshot(prevSnapshot, 1 - eased);
      }
      drawSnapshot(nextSnapshot, eased);
      ctx.restore();

      if (rawT < 1) {
        crossfadeRafRef.current = window.requestAnimationFrame(animateBlend);
      } else {
        crossfadeRafRef.current = null;
      }
    };

    crossfadeRafRef.current = window.requestAnimationFrame(animateBlend);

    return () => {
      if (crossfadeRafRef.current !== null) {
        window.cancelAnimationFrame(crossfadeRafRef.current);
        crossfadeRafRef.current = null;
      }
    };
  }, [idleSheet, frameIndex, size, animationsEnabled]);

  const activeAction = isAnySpritePlaying ? activeSpritePose : 'idle';
  const waveSpriteSize = Math.round(size * 0.92);
  const waveBottomOffset = Math.round(size * 0.04);
  const showOverlayContainer = isAnySpritePlaying || Boolean(luniSprite.activeEffect);

  return (
    <button
      type="button"
      onClick={handleTapLuni}
      data-testid="dashboard-luni-idle"
      data-action={activeAction}
      data-waving={isAnySpritePlaying ? 'true' : 'false'}
      data-sprite-pose={isAnySpritePlaying ? activeSpritePose : 'idle'}
      data-frame-index={frameIndex}
      data-wave-count={totalReactions}
      aria-label="Luni Moonstone Guide — tap for a surprise pose"
      title="Tap Luni!"
      className={`group relative inline-flex items-center justify-center select-none touch-manipulation cursor-pointer rounded-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-400 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`relative inline-flex items-center justify-center w-full h-full ${
          animationsEnabled ? 'animate-float-gentle' : ''
        }`}
        style={animationsEnabled ? { animationDuration: '5.5s' } : undefined}
      >
        {glow && animationsEnabled && (
          <span
            className="absolute inset-0 rounded-full bg-blue-300/30 blur-md -z-10 animate-soft-glow pointer-events-none"
            style={{ transform: 'scale(1.2)', animationDuration: '5s' }}
          />
        )}

        <span
          className={`relative inline-flex items-center justify-center w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.03] group-active:scale-[0.94] ${
            tapSpringActive && animationsEnabled ? '-translate-y-1.5 scale-[1.06]' : ''
          }`}
        >
          {loadFailed ? (
            <img
              src={LUNI_POSES.idle.url}
              alt="Luni in Idle pose: Calm and steady moonstone presence"
              className={`w-full h-full object-contain pixelated pointer-events-none drop-shadow-sm ${
                isAnySpritePlaying ? 'opacity-0' : 'opacity-100'
              }`}
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              style={{ width: size, height: size }}
              className={`pointer-events-none drop-shadow-sm ${
                isAnySpritePlaying ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}

          {/* Preloaded 6-frame CSS steps() multi-pose sprite aligned to unified baseline */}
          <span
            aria-hidden={!showOverlayContainer}
            className={`absolute left-1/2 -translate-x-1/2 inline-flex items-end justify-center pointer-events-none ${
              showOverlayContainer ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ bottom: `${waveBottomOffset}px` }}
          >
            <LuniSprite
              mode="wave-sheet"
              size={waveSpriteSize}
              activePoseId={luniSprite.activePose.id}
              sheetUrl={luniSprite.activePose.src}
              frameCount={luniSprite.activePose.frames}
              sheetData={luniSprite.sheet}
              isPlaying={luniSprite.isPlaying}
              playCount={luniSprite.playCount}
              durationMs={luniSprite.durationMs}
              activeEffect={luniSprite.activeEffect}
              spriteHidden={!isAnySpritePlaying}
              onWaveAnimationEnd={luniSprite.handleAnimationEnd}
            />
          </span>
        </span>
      </span>
    </button>
  );
};
