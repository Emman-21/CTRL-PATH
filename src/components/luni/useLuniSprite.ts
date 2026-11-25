import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LUNI_POSES,
  type LuniPoseEffect,
  type LuniSpritePoseConfig,
  type LuniSpritePoseId,
  getLuniPoseById,
  getPoseDurationMs,
  getPoseEffectDelayMs,
  isOptionalLuniPose,
  pickRandomLuniPose,
} from '../../data/luniSpritePoses';
import {
  type LoadedLuniWaveSheet,
  preloadAllLuniPoseSheets,
} from '../../utils/luniWaveSprite';

export interface ActiveLuniPoseEffect {
  effect: LuniPoseEffect;
  tipX: number;
  tipY: number;
  key: number;
}

export interface UseLuniSpriteOptions {
  poses?: readonly LuniSpritePoseConfig[];
  defaultPoseId?: LuniSpritePoseId | string;
  prefersReducedMotion?: boolean;
  onWaveComplete?: () => void;
}

export interface UseLuniSpriteResult {
  sheet: LoadedLuniWaveSheet | null;
  sheetsById: Record<string, LoadedLuniWaveSheet>;
  activePose: LuniSpritePoseConfig;
  activeEffect: ActiveLuniPoseEffect | null;
  isLoaded: boolean;
  isPlaying: boolean;
  playCount: number;
  durationMs: number;
  prefersReducedMotion: boolean;
  triggerPose: (poseId: string) => boolean;
  triggerRandomPose: () => string | null;
  triggerWave: () => boolean;
  handleAnimationEnd: () => void;
}

export function useOsReducedMotion(): boolean {
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setOsReducedMotion(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return osReducedMotion;
}

export const LUNI_SPARKLE_LIFETIME_MS = 430;

export function useLuniSprite(options: UseLuniSpriteOptions = {}): UseLuniSpriteResult {
  const {
    poses = LUNI_POSES,
    defaultPoseId = 'wave',
    prefersReducedMotion: prefReducedProp = false,
    onWaveComplete,
  } = options;

  const osReducedMotion = useOsReducedMotion();
  const prefersReducedMotion = prefReducedProp || osReducedMotion;

  const initialPose = getLuniPoseById(defaultPoseId, poses) ?? poses[0];

  const [sheetsById, setSheetsById] = useState<Record<string, LoadedLuniWaveSheet>>({});
  const [activePose, setActivePose] = useState<LuniSpritePoseConfig>(initialPose);
  const [activeEffect, setActiveEffect] = useState<ActiveLuniPoseEffect | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const isPlayingRef = useRef(false);
  const lastPoseIdRef = useRef<string | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const effectStartTimerRef = useRef<number | null>(null);
  const effectClearTimerRef = useRef<number | null>(null);
  const onWaveCompleteRef = useRef(onWaveComplete);
  onWaveCompleteRef.current = onWaveComplete;

  useEffect(() => {
    let active = true;
    preloadAllLuniPoseSheets(poses)
      .then((loadedMap) => {
        if (active) setSheetsById(loadedMap);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [poses]);

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

  const stopPose = useCallback(() => {
    if (fallbackTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;
    setIsPlaying(false);
    onWaveCompleteRef.current?.();
  }, []);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      clearEffectTimers();
    };
  }, [clearEffectTimers]);

  const startPose = useCallback(
    (targetPose: LuniSpritePoseConfig): boolean => {
      // Ignore taps while any pose animation is currently playing
      if (isPlayingRef.current) return false;
      // Respect prefers-reduced-motion: skip animation & effects and stay idle
      if (prefersReducedMotion) return false;

      clearEffectTimers();
      setActiveEffect(null);

      lastPoseIdRef.current = targetPose.id;
      const durationMs = getPoseDurationMs(targetPose);

      isPlayingRef.current = true;
      setActivePose(targetPose);
      setIsPlaying(true);
      setPlayCount((c) => c + 1);

      if (typeof window !== 'undefined') {
        if (fallbackTimerRef.current !== null) {
          window.clearTimeout(fallbackTimerRef.current);
        }
        fallbackTimerRef.current = window.setTimeout(() => {
          stopPose();
        }, durationMs + 90);

        if (targetPose.effect === 'castSparkles') {
          const delayMs = getPoseEffectDelayMs(targetPose);
          const tipX = targetPose.tipX ?? 91;
          const tipY = targetPose.tipY ?? 40;

          effectStartTimerRef.current = window.setTimeout(() => {
            effectStartTimerRef.current = null;
            setActiveEffect({
              effect: 'castSparkles',
              tipX,
              tipY,
              key: Date.now(),
            });
            effectClearTimerRef.current = window.setTimeout(() => {
              effectClearTimerRef.current = null;
              setActiveEffect(null);
            }, LUNI_SPARKLE_LIFETIME_MS);
          }, delayMs);
        }
      }

      return true;
    },
    [prefersReducedMotion, clearEffectTimers, stopPose],
  );

  const triggerPose = useCallback(
    (poseId: string): boolean => {
      const target = getLuniPoseById(poseId, poses);
      if (!target) return false;
      return startPose(target);
    },
    [poses, startPose],
  );

  const triggerRandomPose = useCallback((): string | null => {
    if (isPlayingRef.current || prefersReducedMotion) return null;
    const picked = pickRandomLuniPose(poses, lastPoseIdRef.current);
    const started = startPose(picked);
    return started ? picked.id : null;
  }, [poses, prefersReducedMotion, startPose]);

  const triggerWave = useCallback((): boolean => {
    return triggerPose('wave');
  }, [triggerPose]);

  const handleAnimationEnd = useCallback(() => {
    stopPose();
  }, [stopPose]);

  const currentSheet = sheetsById[activePose.id] ?? null;
  const durationMs = getPoseDurationMs(activePose);

  const requiredPoseCount = poses.filter((pose) => !isOptionalLuniPose(pose)).length;

  return {
    sheet: currentSheet,
    sheetsById,
    activePose,
    activeEffect,
    isLoaded:
      poses.filter((pose) => !isOptionalLuniPose(pose) && Boolean(sheetsById[pose.id])).length >=
      requiredPoseCount,
    isPlaying,
    playCount,
    durationMs,
    prefersReducedMotion,
    triggerPose,
    triggerRandomPose,
    triggerWave,
    handleAnimationEnd,
  };
}
