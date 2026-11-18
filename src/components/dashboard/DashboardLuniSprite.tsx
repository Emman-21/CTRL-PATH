import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { LUNI_POSES } from '../../assets/manifest';
import {
  DASHBOARD_LUNI_IDLE_FRAME,
  DASHBOARD_LUNI_REDUCED_MOTION_WAVE_FRAME,
  DASHBOARD_LUNI_SPRITESHEET_URL,
  DASHBOARD_LUNI_WAVE_SEQUENCE,
  SpriteBounds,
  computeAlignedPlacement,
  computeSpriteBounds,
  getSpriteCellRects,
  removeExteriorWhiteBackground,
} from '../../utils/dashboardLuniAnimation';

interface ProcessedSpriteFrame {
  canvas: HTMLCanvasElement;
  bounds: SpriteBounds;
}

interface ProcessedSpriteSheet {
  frames: ProcessedSpriteFrame[];
  maxBodySpan: number;
}

let cachedSheetPromise: Promise<ProcessedSpriteSheet> | null = null;

function loadAndProcessDashboardSpriteSheet(): Promise<ProcessedSpriteSheet> {
  if (cachedSheetPromise) return cachedSheetPromise;

  cachedSheetPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      try {
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = img.naturalWidth;
        sheetCanvas.height = img.naturalHeight;
        const sheetCtx = sheetCanvas.getContext('2d', { willReadFrequently: true });
        if (!sheetCtx) {
          reject(new Error('Could not initialize 2D context for Luni sprite sheet'));
          return;
        }
        sheetCtx.drawImage(img, 0, 0);

        const rects = getSpriteCellRects(img.naturalWidth, img.naturalHeight);
        const frames: ProcessedSpriteFrame[] = [];
        let maxBodySpan = 1;

        for (const rect of rects) {
          const cellImageData = sheetCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
          removeExteriorWhiteBackground(cellImageData.data, rect.width, rect.height);
          const bounds = computeSpriteBounds(cellImageData.data, rect.width, rect.height);

          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = bounds.width;
          frameCanvas.height = bounds.height;
          const frameCtx = frameCanvas.getContext('2d');
          if (!frameCtx) {
            reject(new Error('Could not initialize frame canvas for Luni sprite'));
            return;
          }

          // Put cleaned cell data on a temp canvas to crop cleanly to bounds
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
              bounds.height
            );
          }

          maxBodySpan = Math.max(maxBodySpan, bounds.height, bounds.width * 0.92);
          frames.push({ canvas: frameCanvas, bounds });
        }

        resolve({ frames, maxBodySpan });
      } catch (err) {
        cachedSheetPromise = null;
        reject(err);
      }
    };

    img.onerror = () => {
      cachedSheetPromise = null;
      reject(new Error(`Failed to load ${DASHBOARD_LUNI_SPRITESHEET_URL}`));
    };

    img.src = DASHBOARD_LUNI_SPRITESHEET_URL;
  });

  return cachedSheetPromise;
}

export interface DashboardLuniSpriteProps {
  size?: number;
  animate?: boolean;
  glow?: boolean;
  className?: string;
}

export const DashboardLuniSprite: React.FC<DashboardLuniSpriteProps> = ({
  size = 148,
  animate = true,
  glow = true,
  className = '',
}) => {
  const { state: studentState } = useStudent();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveTimerRef = useRef<number | null>(null);
  const tapBounceTimerRef = useRef<number | null>(null);
  const hasPlayedInitialWaveRef = useRef(false);

  const [sheet, setSheet] = useState<ProcessedSpriteSheet | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(DASHBOARD_LUNI_IDLE_FRAME);
  const [isWaving, setIsWaving] = useState(false);
  const [waveCount, setWaveCount] = useState(0);
  const [isTapPopped, setIsTapPopped] = useState(false);

  const prefersReducedMotion =
    studentState.preferences?.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const animationsEnabled =
    animate && !prefersReducedMotion && (studentState.preferences?.luniFloatingAnimation ?? true);

  const clearWaveTimer = useCallback(() => {
    if (waveTimerRef.current !== null) {
      window.clearTimeout(waveTimerRef.current);
      waveTimerRef.current = null;
    }
  }, []);

  const triggerWave = useCallback(
    (startStep = 0) => {
      clearWaveTimer();
      setWaveCount((c) => c + 1);

      if (prefersReducedMotion) {
        setIsWaving(true);
        setActiveFrameIndex(DASHBOARD_LUNI_REDUCED_MOTION_WAVE_FRAME);
        waveTimerRef.current = window.setTimeout(() => {
          setIsWaving(false);
          setActiveFrameIndex(DASHBOARD_LUNI_IDLE_FRAME);
        }, 1200);
        return;
      }

      setIsWaving(true);
      let stepIndex = Math.min(startStep, DASHBOARD_LUNI_WAVE_SEQUENCE.length - 1);

      const advance = () => {
        if (stepIndex >= DASHBOARD_LUNI_WAVE_SEQUENCE.length) {
          setActiveFrameIndex(DASHBOARD_LUNI_IDLE_FRAME);
          setIsWaving(false);
          waveTimerRef.current = null;
          return;
        }

        const keyframe = DASHBOARD_LUNI_WAVE_SEQUENCE[stepIndex];
        setActiveFrameIndex(keyframe.frameIndex);
        stepIndex += 1;
        waveTimerRef.current = window.setTimeout(advance, keyframe.durationMs);
      };

      advance();
    },
    [clearWaveTimer, prefersReducedMotion]
  );

  // Load and process the 3x2 sprite sheet once
  useEffect(() => {
    let active = true;
    loadAndProcessDashboardSpriteSheet()
      .then((processed) => {
        if (!active) return;
        setSheet(processed);
      })
      .catch(() => {
        if (!active) return;
        setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Perform the wave pose animation automatically when the user opens the dashboard
  useEffect(() => {
    if (!sheet || hasPlayedInitialWaveRef.current) return;
    hasPlayedInitialWaveRef.current = true;
    triggerWave(0);
  }, [sheet, triggerWave]);

  useEffect(() => {
    return () => {
      clearWaveTimer();
      if (tapBounceTimerRef.current !== null) {
        window.clearTimeout(tapBounceTimerRef.current);
      }
    };
  }, [clearWaveTimer]);

  // Draw the current frame cleanly on the retina canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet) return;

    const frame = sheet.frames[activeFrameIndex] || sheet.frames[DASHBOARD_LUNI_IDLE_FRAME];
    if (!frame) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const pixelSize = Math.round(size * dpr);

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const placement = computeAlignedPlacement(frame.bounds, sheet.maxBodySpan, size, 0.04);
    ctx.drawImage(frame.canvas, placement.dx, placement.dy, placement.dw, placement.dh);
    ctx.restore();
  }, [sheet, activeFrameIndex, size]);

  const handleTapLuni = () => {
    setIsTapPopped(true);
    if (tapBounceTimerRef.current !== null) {
      window.clearTimeout(tapBounceTimerRef.current);
    }
    tapBounceTimerRef.current = window.setTimeout(() => setIsTapPopped(false), 260);
    triggerWave(1);
  };

  return (
    <button
      type="button"
      onClick={handleTapLuni}
      data-testid="dashboard-luni-sprite"
      data-wave-state={isWaving ? 'waving' : 'idle'}
      data-frame-index={activeFrameIndex}
      data-wave-count={waveCount}
      aria-label="Luni Moonstone Guide — tap to make Luni wave"
      title="Tap Luni to wave!"
      className={`group relative inline-flex items-center justify-center select-none cursor-pointer rounded-2xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-400 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`relative inline-flex items-center justify-center w-full h-full transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-[0.96] ${
          animationsEnabled ? 'animate-float-gentle' : ''
        } ${isTapPopped && animationsEnabled ? 'scale-105' : ''}`}
      >
        {glow && animationsEnabled && (
          <span
            className="absolute inset-1 rounded-full bg-indigo-300/30 dark:bg-indigo-400/20 blur-lg -z-10 animate-soft-glow pointer-events-none"
            style={{ transform: 'scale(1.12)' }}
          />
        )}

        {loadFailed ? (
          <img
            src={LUNI_POSES.wave.url}
            alt="Luni in Wave pose"
            className="w-full h-full object-contain pixelated pointer-events-none drop-shadow-sm"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: size, height: size }}
            className="pointer-events-none drop-shadow-[0_6px_14px_rgba(67,56,202,0.22)]"
          />
        )}
      </span>
    </button>
  );
};
