import React, { useEffect, useRef } from 'react';
import { playUiSound } from '../../utils/soundEffects';
import { LUNI_POSES as STATIC_LUNI_POSES, LUNI_WAVE_V2_SHEET, LuniPoseKey } from '../../assets/manifest';
import { LuniState } from '../../types/luni';
import { LUNI_STATE_CONFIGS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';
import {
  LUNI_WAVE_DURATION_MS,
  LUNI_WAVE_FRAME_COUNT,
  type LoadedLuniWaveSheet,
  computeLuniDisplayDimensions,
} from '../../utils/luniWaveSprite';
import {
  type ActiveLuniPoseEffect,
  useLuniSprite,
  useOsReducedMotion,
} from './useLuniSprite';
import { getLuniBounceMetrics, getLuniPoseById } from '../../data/luniSpritePoses';
import type { LuniOverlayState } from '../../utils/luniStateMachine';

export { useLuniSprite } from './useLuniSprite';

interface SparkleParticleSpec {
  dx: number;
  dy: number;
  size: number;
  delayMs: number;
  color: string;
}

const CAST_SPARKLE_PARTICLES: readonly SparkleParticleSpec[] = [
  { dx: -14, dy: -18, size: 9, delayMs: 0, color: '#fef08a' },
  { dx: 12, dy: -22, size: 11, delayMs: 30, color: '#fde047' },
  { dx: 20, dy: -4, size: 8, delayMs: 50, color: '#e0f2fe' },
  { dx: 8, dy: 14, size: 9, delayMs: 70, color: '#c4b5fd' },
  { dx: -16, dy: 6, size: 7, delayMs: 40, color: '#fef9c3' },
];

const LuniCastSparkleOverlay: React.FC<{
  effect: ActiveLuniPoseEffect;
  scaleRatio: number;
}> = ({ effect, scaleRatio }) => {
  const starScale = Math.max(0.65, Math.min(1.6, scaleRatio));

  return (
    <span
      key={effect.key}
      data-testid="luni-cast-sparkles"
      aria-hidden="true"
      className="luni-cast-sparkle-layer"
    >
      <span
        className="absolute"
        style={{
          left: `${effect.tipX}%`,
          top: `${effect.tipY}%`,
          width: 0,
          height: 0,
        }}
      >
        {CAST_SPARKLE_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="luni-cast-star"
            style={
              {
                '--sx': `${Math.round(p.dx * starScale)}px`,
                '--sy': `${Math.round(p.dy * starScale)}px`,
                '--star-size': `${Math.max(5, Math.round(p.size * starScale))}px`,
                '--star-delay': `${p.delayMs}ms`,
                '--star-color': p.color,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </span>
  );
};

const DEFAULT_OVERLAY_OFFSETS: Record<Exclude<LuniOverlayState, null>, { x: number; y: number }> = {
  thinking: { x: 84, y: 12 },
  speaking: { x: 86, y: 52 },
  sleeping: { x: 80, y: 14 },
  waking: { x: 84, y: 10 },
};

const LuniStatePixelOverlay: React.FC<{
  overlayState: Exclude<LuniOverlayState, null>;
  scaleRatio: number;
}> = ({ overlayState, scaleRatio }) => {
  const poseCfg = getLuniPoseById(overlayState);
  const anchor = poseCfg?.overlayOffset ?? DEFAULT_OVERLAY_OFFSETS[overlayState];
  const clampedScale = Math.max(0.65, Math.min(1.5, scaleRatio));
  const commonStyle = {
    left: `${anchor.x}%`,
    top: `${anchor.y}%`,
    '--ov-scale': `${clampedScale}`,
  } as React.CSSProperties;

  if (overlayState === 'thinking') {
    return (
      <span
        aria-hidden="true"
        data-testid="luni-state-overlay"
        data-luni-overlay="thinking"
        className="luni-state-overlay luni-overlay-thinking"
        style={commonStyle}
      >
        <span className="luni-thinking-bubble">?</span>
        <span className="luni-thinking-dots">
          <span className="luni-thinking-dot" />
          <span className="luni-thinking-dot" />
          <span className="luni-thinking-dot" />
        </span>
      </span>
    );
  }

  if (overlayState === 'speaking') {
    return (
      <span
        aria-hidden="true"
        data-testid="luni-state-overlay"
        data-luni-overlay="speaking"
        className="luni-state-overlay luni-overlay-speaking"
        style={commonStyle}
      >
        <span className="luni-speak-arc luni-speak-arc--inner" />
        <span className="luni-speak-arc luni-speak-arc--outer" />
      </span>
    );
  }

  if (overlayState === 'sleeping') {
    return (
      <span
        aria-hidden="true"
        data-testid="luni-state-overlay"
        data-luni-overlay="sleeping"
        className="luni-state-overlay luni-overlay-sleeping"
        style={commonStyle}
      >
        <span className="luni-sleep-z luni-sleep-z--1">z</span>
        <span className="luni-sleep-z luni-sleep-z--2">z</span>
        <span className="luni-sleep-z luni-sleep-z--3">Z</span>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-testid="luni-state-overlay"
      data-luni-overlay="waking"
      className="luni-state-overlay luni-overlay-waking"
      style={commonStyle}
    >
      !
    </span>
  );
};

export interface LuniSpriteProps {
  pose?: LuniPoseKey;
  state?: LuniState;
  size?: number;
  scale?: number;
  className?: string;
  animate?: boolean;
  alt?: string;
  glow?: boolean;
  staticCircle?: boolean;
  pixelated?: boolean;
  /** Enables horizontal CSS steps(N) sprite-sheet mode */
  mode?: 'pose' | 'wave-sheet';
  activePoseId?: string;
  sheetUrl?: string;
  frameCount?: number;
  sheetData?: LoadedLuniWaveSheet | null;
  isPlaying?: boolean;
  isPaused?: boolean;
  playbackMode?: 'loop' | 'once';
  playCount?: number;
  durationMs?: number;
  activeEffect?: ActiveLuniPoseEffect | null;
  overlayState?: LuniOverlayState;
  bounce?: boolean;
  bounceFrames?: readonly number[];
  showBounceShadow?: boolean;
  spriteHidden?: boolean;
  onWaveAnimationEnd?: () => void;
  onLoopIteration?: () => void;
}

export const LuniSprite: React.FC<LuniSpriteProps> = ({
  pose,
  state = 'idle',
  size = 80,
  scale,
  className = '',
  animate = true,
  alt,
  glow = false,
  staticCircle = false,
  pixelated = true,
  mode = 'pose',
  activePoseId,
  sheetUrl = LUNI_WAVE_V2_SHEET,
  frameCount: frameCountProp,
  sheetData,
  isPlaying: controlledPlaying,
  isPaused = false,
  playbackMode: playbackModeProp,
  playCount: controlledPlayCount,
  durationMs: durationMsProp,
  activeEffect: controlledEffect,
  overlayState = null,
  bounce: bounceProp,
  bounceFrames: bounceFramesProp,
  showBounceShadow = true,
  spriteHidden = false,
  onWaveAnimationEnd,
  onLoopIteration,
}) => {
  const { state: studentState } = useStudent();
  const osReducedMotion = useOsReducedMotion();
  const prefersReducedMotion = Boolean(studentState.preferences?.reducedMotion || osReducedMotion);

  const internalSprite = useLuniSprite({
    defaultPoseId: activePoseId || 'wave',
    prefersReducedMotion,
    onWaveComplete: onWaveAnimationEnd,
  });

  const activeSheet = sheetData !== undefined ? sheetData : internalSprite.sheet;
  const activePlaying = controlledPlaying ?? internalSprite.isPlaying;
  const activePlayCount = controlledPlayCount ?? internalSprite.playCount;
  const resolvedPoseId = activePoseId ?? internalSprite.activePose.id;
  const resolvedDurationMs = durationMsProp ?? internalSprite.durationMs ?? LUNI_WAVE_DURATION_MS;
  const resolvedEffect =
    controlledEffect !== undefined ? controlledEffect : internalSprite.activeEffect;

  const animationsEnabled =
    animate && !prefersReducedMotion && (studentState.preferences?.luniFloatingAnimation ?? true);

  const lastWandSoundAtRef = useRef(0);

  useEffect(() => {
    if (spriteHidden || isPaused) return;
    const poseLower = String(resolvedPoseId || '').toLowerCase();
    const isWandPose =
      (activePlaying && poseLower.includes('wand')) ||
      resolvedEffect?.effect === 'castSparkles';

    if (!isWandPose) return;

    const now = Date.now();
    if (now - lastWandSoundAtRef.current < 350) return;
    lastWandSoundAtRef.current = now;

    playUiSound('wand');
  }, [resolvedPoseId, activePlayCount, activePlaying, isPaused, spriteHidden, resolvedEffect]);

  if (mode === 'wave-sheet') {
    const cropW = activeSheet?.cropWidth ?? 175;
    const cropH = activeSheet?.cropHeight ?? 217;
    const frames = frameCountProp ?? activeSheet?.frameCount ?? LUNI_WAVE_FRAME_COUNT;
    const displayDims = computeLuniDisplayDimensions(cropW, cropH, { size, scale });
    const totalSheetW = displayDims.width * frames;
    const poseMeta = getLuniPoseById(resolvedPoseId);
    const unsafeRawSheet =
      !activeSheet && ((poseMeta?.rows ?? 1) > 1 || Boolean(poseMeta?.cleanWhiteBg));
    const activeUrl = unsafeRawSheet ? '' : (activeSheet?.sheetUrl ?? sheetUrl);
    const playingAnim = activePlaying && !prefersReducedMotion;
    const isAnimPaused = playingAnim && isPaused;
    const showCastSparkles =
      !prefersReducedMotion &&
      !isAnimPaused &&
      resolvedEffect?.effect === 'castSparkles';
    const sparkleScaleRatio = displayDims.height / 140;
    const overlayScaleRatio = displayDims.height / 76;

    const resolvedPlaybackMode = playbackModeProp ?? poseMeta?.mode ?? 'once';
    const bounceMetrics = getLuniBounceMetrics(
      {
        bounce: bounceProp ?? poseMeta?.bounce,
        bounceFrames: bounceFramesProp ?? poseMeta?.bounceFrames,
      },
      displayDims.height,
      prefersReducedMotion,
    );
    const bounceActive = playingAnim && bounceMetrics.enabled;

    return (
      <span
        className={`relative inline-block shrink-0 select-none pointer-events-none ${
          isAnimPaused ? 'luni-sprite-paused' : ''
        }`}
        style={{
          width: `${displayDims.width}px`,
          height: `${displayDims.height}px`,
        }}
      >
        {bounceActive && showBounceShadow && (
          <span
            key={`shadow-${resolvedPoseId}-${activePlayCount}`}
            aria-hidden="true"
            data-testid="luni-bounce-shadow"
            className="luni-happy-shadow"
            style={
              {
                '--luni-wave-duration': `${resolvedDurationMs}ms`,
              } as React.CSSProperties
            }
          />
        )}
        <span
          key={bounceActive ? `bounce-${resolvedPoseId}-${activePlayCount}` : 'bounce-rest'}
          data-testid="luni-bounce-wrapper"
          data-bounce-active={bounceActive ? 'true' : 'false'}
          className={`relative block w-full h-full ${
            bounceActive ? 'luni-happy-bounce-playing' : ''
          }`}
          style={
            {
              '--luni-wave-duration': `${resolvedDurationMs}ms`,
              '--luni-bounce-half-y': `${bounceMetrics.halfOffsetPx}px`,
              '--luni-bounce-peak-y': `${bounceMetrics.peakOffsetPx}px`,
            } as React.CSSProperties
          }
        >
          <div
            key={playingAnim ? `${resolvedPoseId}-${activePlayCount}` : `${resolvedPoseId}-idle`}
            role="img"
            aria-label={alt || 'Luni Moonstone Guide'}
            data-testid="luni-wave-sprite"
            data-sprite-pose={playingAnim ? resolvedPoseId : (resolvedPoseId || 'idle')}
            data-wave-playing={playingAnim ? 'true' : 'false'}
            data-animation-paused={isAnimPaused ? 'true' : 'false'}
            data-playback-mode={resolvedPlaybackMode}
            onAnimationEnd={(e) => {
              if (e.animationName === 'luniWaveSteps') {
                (onWaveAnimationEnd ?? internalSprite.handleAnimationEnd)();
              }
            }}
            onAnimationIteration={(e) => {
              if (e.animationName === 'luniWaveSteps') {
                onLoopIteration?.();
              }
            }}
            className={`relative w-full h-full drop-shadow-sm ${
              pixelated ? 'pixelated' : ''
            } ${playingAnim ? 'luni-wave-sprite-playing' : 'luni-wave-sprite-idle'} ${
              spriteHidden ? 'opacity-0' : 'opacity-100'
            } ${className}`}
            style={
              {
                ...(activeUrl ? { backgroundImage: `url("${activeUrl}")` } : {}),
                backgroundSize: `${totalSheetW}px ${displayDims.height}px`,
                ...(playingAnim
                  ? { animationPlayState: isAnimPaused ? 'paused' : 'running' }
                  : {}),
                '--luni-wave-end-x': `-${totalSheetW}px`,
                '--luni-wave-duration': `${resolvedDurationMs}ms`,
                '--luni-wave-frames': `${frames}`,
                '--luni-wave-iterations': resolvedPlaybackMode === 'loop' ? 'infinite' : '1',
              } as React.CSSProperties
            }
          />
          {showCastSparkles && resolvedEffect && (
            <LuniCastSparkleOverlay effect={resolvedEffect} scaleRatio={sparkleScaleRatio} />
          )}
          {overlayState && !spriteHidden && (
            <LuniStatePixelOverlay overlayState={overlayState} scaleRatio={overlayScaleRatio} />
          )}
        </span>
      </span>
    );
  }

  const stateConfig = LUNI_STATE_CONFIGS[state] || LUNI_STATE_CONFIGS.idle;
  const activePoseKey: LuniPoseKey = pose || stateConfig.pose;
  const poseData = STATIC_LUNI_POSES[activePoseKey] || STATIC_LUNI_POSES.idle;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animationsEnabled ? 'animate-float-gentle' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {staticCircle && (
        <div
          aria-hidden="true"
          data-testid="luni-violet-circle"
          className="absolute -inset-2 rounded-full bg-violet-500/20 dark:bg-violet-400/25 border border-violet-400/35 dark:border-violet-400/30 pointer-events-none"
        />
      )}
      {glow && animationsEnabled && (
        <div
          className="absolute inset-0 rounded-full bg-blue-300/30 blur-md -z-10 animate-soft-glow"
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      <img
        src={poseData.url}
        alt={alt || `Luni in ${poseData.name} pose: ${poseData.description}`}
        className={`relative z-10 w-full h-full object-contain ${pixelated ? 'pixelated' : ''} pointer-events-none drop-shadow-sm`}
        loading="lazy"
      />
    </div>
  );
};