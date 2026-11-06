import React from 'react';
import { LUNI_POSES, LuniPoseKey } from '../../assets/manifest';
import { LuniState } from '../../types/luni';
import { LUNI_STATE_CONFIGS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';

export interface LuniSpriteProps {
  pose?: LuniPoseKey;
  state?: LuniState;
  size?: number;
  className?: string;
  animate?: boolean;
  alt?: string;
  glow?: boolean;
}

export const LuniSprite: React.FC<LuniSpriteProps> = ({
  pose,
  state = 'idle',
  size = 80,
  className = '',
  animate = true,
  alt,
  glow = false,
}) => {
  const { state: studentState } = useStudent();
  const prefersReducedMotion =
    studentState.preferences?.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const animationsEnabled =
    animate && !prefersReducedMotion && (studentState.preferences?.luniFloatingAnimation ?? true);

  const stateConfig = LUNI_STATE_CONFIGS[state] || LUNI_STATE_CONFIGS.idle;
  const activePoseKey: LuniPoseKey = pose || stateConfig.pose;
  const poseData = LUNI_POSES[activePoseKey] || LUNI_POSES.idle;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animationsEnabled ? 'animate-float-gentle' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && animationsEnabled && (
        <div
          className="absolute inset-0 rounded-full bg-blue-300/30 blur-md -z-10 animate-soft-glow"
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      <img
        src={poseData.url}
        alt={alt || `Luni in ${poseData.name} pose: ${poseData.description}`}
        className="w-full h-full object-contain pixelated pointer-events-none drop-shadow-sm"
        loading="lazy"
      />
    </div>
  );
};
