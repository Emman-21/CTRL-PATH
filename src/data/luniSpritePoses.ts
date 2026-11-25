import {
  LUNI_HAPPY_V2_SHEET,
  LUNI_LISTENING_V2_SHEET,
  LUNI_SLEEPING_V2_SHEET,
  LUNI_SPEAKING_V2_SHEET,
  LUNI_THINKING_V2_SHEET,
  LUNI_WAKING_V2_SHEET,
  LUNI_WAND_V2_SHEET,
  LUNI_WAVE_V2_SHEET,
  LUNI_WINK_V2_SHEET,
} from '../assets/manifest';
import {
  DASHBOARD_LUNI_IDLE_GRID,
  DASHBOARD_LUNI_IDLE_SHEET_URL,
} from '../utils/dashboardLuniIdle';

export type LuniPoseEffect = 'castSparkles';
export type LuniPosePlaybackMode = 'loop' | 'once';

export interface LuniSpritePoseConfig {
  id: string;
  src: string;
  frames: number;
  cols?: number;
  rows?: number;
  cleanWhiteBg?: boolean;
  fps: number;
  mode: LuniPosePlaybackMode;
  /** State-machine poses are excluded from random tap selection */
  state?: boolean;
  /** Optional pose sheets fall back gracefully if missing */
  optional?: boolean;
  bounce?: boolean;
  bounceFrames?: readonly number[];
  effect?: LuniPoseEffect;
  effectFrame?: number;
  /** Horizontal wand/effect anchor as a percentage (0-100) of the unified cropped sprite box */
  tipX?: number;
  /** Vertical wand/effect anchor as a percentage (0-100) of the unified cropped sprite box */
  tipY?: number;
  /** Overlay anchor as a percentage (0-100) of the unified cropped sprite box */
  overlayOffset?: {
    x: number;
    y: number;
  };
}

/**
 * Single data-driven sprite-sheet registry for Luni interactive & state poses.
 * Adding a new pose later only requires adding one entry here.
 */
export const LUNI_POSES = [
  {
    id: 'idle',
    src: DASHBOARD_LUNI_IDLE_SHEET_URL,
    cols: DASHBOARD_LUNI_IDLE_GRID.cols,
    rows: DASHBOARD_LUNI_IDLE_GRID.rows,
    frames: DASHBOARD_LUNI_IDLE_GRID.totalFrames,
    fps: 6,
    mode: 'loop',
    state: true,
    cleanWhiteBg: true,
  },
  { id: 'wave', src: LUNI_WAVE_V2_SHEET, frames: 6, fps: 10, mode: 'once' },
  { id: 'wink', src: LUNI_WINK_V2_SHEET, frames: 6, fps: 10, mode: 'once' },
  {
    id: 'wand',
    src: LUNI_WAND_V2_SHEET,
    frames: 6,
    fps: 10,
    mode: 'once',
    effect: 'castSparkles',
    effectFrame: 4,
    tipX: 91,
    tipY: 40,
  },
  {
    id: 'happy',
    src: LUNI_HAPPY_V2_SHEET,
    frames: 6,
    fps: 10,
    mode: 'once',
    bounce: true,
    bounceFrames: [3, 4, 5],
  },
  {
    id: 'listening',
    src: LUNI_LISTENING_V2_SHEET,
    frames: 6,
    fps: 8,
    mode: 'loop',
    state: true,
  },
  {
    id: 'thinking',
    src: LUNI_THINKING_V2_SHEET,
    frames: 6,
    fps: 8,
    mode: 'loop',
    state: true,
    overlayOffset: { x: 84, y: 12 },
  },
  {
    id: 'speaking',
    src: LUNI_SPEAKING_V2_SHEET,
    frames: 6,
    fps: 8,
    mode: 'loop',
    state: true,
    overlayOffset: { x: 86, y: 52 },
  },
  {
    id: 'sleeping',
    src: LUNI_SLEEPING_V2_SHEET,
    frames: 6,
    fps: 6,
    mode: 'loop',
    state: true,
    overlayOffset: { x: 80, y: 14 },
  },
  {
    id: 'waking',
    src: LUNI_WAKING_V2_SHEET,
    frames: 6,
    fps: 10,
    mode: 'once',
    state: true,
    optional: true,
    overlayOffset: { x: 84, y: 10 },
  },
] as const satisfies readonly LuniSpritePoseConfig[];

export type LuniSpritePoseId = (typeof LUNI_POSES)[number]['id'];

export function isStateLuniPose(pose: LuniSpritePoseConfig): boolean {
  return Boolean(pose.state);
}

export function isOptionalLuniPose(pose: LuniSpritePoseConfig): boolean {
  return Boolean(pose.optional);
}

export function getRandomTapLuniPoses<T extends LuniSpritePoseConfig>(
  poses: readonly T[] = LUNI_POSES as unknown as readonly T[],
): T[] {
  return poses.filter((pose) => !pose.state);
}

export function getLuniPoseById(
  id: string,
  poses: readonly LuniSpritePoseConfig[] = LUNI_POSES,
): LuniSpritePoseConfig | undefined {
  return poses.find((pose) => pose.id === id);
}

/**
 * Fresh login greeting ALWAYS plays Luni's wave pose specifically (never random).
 */
export function getLuniLoginGreetPoseId(): LuniSpritePoseId {
  return 'wave';
}

export function getPoseDurationMs(pose: Pick<LuniSpritePoseConfig, 'frames' | 'fps'>): number {
  const safeFrames = Math.max(1, pose.frames);
  const safeFps = Math.max(1, pose.fps);
  return Math.round((safeFrames / safeFps) * 1000);
}

export function getPoseEffectDelayMs(
  pose: Pick<LuniSpritePoseConfig, 'fps' | 'effectFrame'>,
): number {
  const safeFps = Math.max(1, pose.fps);
  const oneIndexedFrame = Math.max(1, pose.effectFrame ?? 1);
  return Math.max(0, Math.round(((oneIndexedFrame - 1) / safeFps) * 1000));
}

export interface LuniBounceMetrics {
  enabled: boolean;
  /** Negative whole-pixel CSS translateY offset at peak (~7% of sprite height) */
  peakOffsetPx: number;
  /** Negative whole-pixel CSS translateY offset on ascent/descent frames */
  halfOffsetPx: number;
  bounceFrames: readonly number[];
}

export function getLuniBounceMetrics(
  pose: { id?: string; bounce?: boolean; bounceFrames?: readonly number[] },
  displayHeight: number,
  prefersReducedMotion: boolean,
): LuniBounceMetrics {
  const bounceFrames = pose.bounceFrames ?? [];
  const enabled = Boolean(pose.bounce) && bounceFrames.length > 0 && !prefersReducedMotion;
  if (!enabled) {
    return {
      enabled: false,
      peakOffsetPx: 0,
      halfOffsetPx: 0,
      bounceFrames: [],
    };
  }

  const safeH = Math.max(16, Math.round(displayHeight));
  const peakAbs = Math.max(2, Math.round(safeH * 0.07));
  const halfAbs = Math.max(1, Math.round(peakAbs * 0.5));
  return {
    enabled: true,
    peakOffsetPx: -peakAbs,
    halfOffsetPx: -halfAbs,
    bounceFrames,
  };
}

/**
 * Picks a random pose from eligible tap poses (`!pose.state`), never repeating
 * `lastPoseId` twice in a row when more than one pose is available.
 */
export function pickRandomLuniPose<T extends LuniSpritePoseConfig>(
  poses: readonly T[],
  lastPoseId: string | null | undefined,
  rng: () => number = Math.random,
): T {
  const tapEligible = poses.filter((pose) => !pose.state);
  const sourcePool = tapEligible.length > 0 ? tapEligible : poses;

  if (sourcePool.length === 0) {
    throw new Error('LUNI_POSES must contain at least one pose');
  }
  if (sourcePool.length === 1) {
    return sourcePool[0];
  }

  const candidates =
    lastPoseId !== null && lastPoseId !== undefined
      ? sourcePool.filter((pose) => pose.id !== lastPoseId)
      : sourcePool;

  const pool = candidates.length > 0 ? candidates : sourcePool;
  const rawRoll = rng();
  const normalizedRoll = Number.isFinite(rawRoll) ? Math.min(0.9999999999, Math.max(0, rawRoll)) : 0;
  const index = Math.floor(normalizedRoll * pool.length);
  return pool[index];
}
