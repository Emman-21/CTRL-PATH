import React, { useState } from 'react';
import { LuniPoseKey, LUNI_POSES } from '../../assets/manifest';
import { LuniState, LuniParticleType } from '../../types/luni';
import { LUNI_STATE_CONFIGS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';

export interface LuniCharacterProps {
  state?: LuniState;
  pose?: LuniPoseKey;
  size?: number;
  animate?: boolean;
  showParticles?: boolean;
  particleOverride?: LuniParticleType;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
  alt?: string;
  glow?: boolean;
}

export const LuniCharacter: React.FC<LuniCharacterProps> = ({
  state = 'idle',
  pose,
  size = 84,
  animate = true,
  showParticles = true,
  particleOverride,
  onClick,
  className = '',
  interactive = false,
  alt,
  glow = false,
}) => {
  const { state: studentState } = useStudent();
  const [isHovered, setIsHovered] = useState(false);

  // Check user preferences & reduced motion
  const prefersReducedMotion =
    studentState.preferences?.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const animationsEnabled =
    animate && !prefersReducedMotion && (studentState.preferences?.luniFloatingAnimation ?? true);

  const config = LUNI_STATE_CONFIGS[state] || LUNI_STATE_CONFIGS.idle;
  const activePoseKey: LuniPoseKey = pose || config.pose;
  const poseData = LUNI_POSES[activePoseKey] || LUNI_POSES.idle;
  const activeParticle: LuniParticleType = particleOverride || config.particle;

  // Determine motion class
  let motionClass = '';
  if (animationsEnabled) {
    switch (config.motion) {
      case 'bounce':
        motionClass = 'animate-bounce duration-1000';
        break;
      case 'tilt':
        motionClass = 'animate-pulse duration-1000';
        break;
      case 'float':
        motionClass = 'animate-float-gentle';
        break;
      case 'rest':
      default:
        motionClass = '';
        break;
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={interactive ? `Luni Moonstone Guide: ${config.label}. Click to interact.` : undefined}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl' : ''
      } ${motionClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft Ambient Aura Glow */}
      {(activeParticle === 'glow' || isHovered || glow) && animationsEnabled && (
        <div
          className="absolute inset-0 rounded-full bg-blue-300/35 blur-md -z-10 animate-soft-glow"
          style={{ transform: 'scale(1.25)' }}
        />
      )}

      {/* Decorative Particles (Subtle, non-distracting, position around edges) */}
      {showParticles && animationsEnabled && (
        <>
          {/* Sparkles Particle */}
          {activeParticle === 'sparkles' && (
            <div className="absolute -top-2 -right-1 text-amber-400 animate-sparkle-spin pointer-events-none text-xs">
              ✦
            </div>
          )}

          {/* Stars / Thinking Particle */}
          {activeParticle === 'stars' && (
            <div className="absolute -top-2.5 right-1 flex gap-1 pointer-events-none text-violet-400 animate-pulse text-[11px]">
              <span>★</span>
              <span className="text-[8px] text-amber-300 animate-sparkle-spin">✦</span>
            </div>
          )}

          {/* Question / Curious Particle */}
          {activeParticle === 'question' && (
            <div className="absolute -top-3.5 right-2 font-black text-xs text-blue-500 animate-bounce pointer-events-none bg-blue-50/90 rounded-full w-4 h-4 flex items-center justify-center border border-blue-200">
              ?
            </div>
          )}

          {/* Hearts / Warmth Particle */}
          {activeParticle === 'hearts' && (
            <div className="absolute -top-2.5 right-1 text-rose-400 animate-pulse pointer-events-none text-xs">
              ♥
            </div>
          )}

          {/* Sleepy Zs */}
          {activeParticle === 'sleepy_zs' && (
            <div className="absolute -top-3 right-0 font-bold text-[10px] text-indigo-400 tracking-tighter animate-pulse pointer-events-none">
              Zzz
            </div>
          )}
        </>
      )}

      {/* The Authentic Luni Pixel Art Sprite - preserving natural silhouette */}
      <img
        src={poseData.url}
        alt={alt || `Luni in ${poseData.name} pose: ${poseData.description}`}
        className="w-full h-full object-contain pixelated pointer-events-none drop-shadow-sm transition-transform duration-200"
        style={{
          transform: isHovered && interactive ? 'scale(1.06)' : 'scale(1)',
        }}
        loading="lazy"
      />
    </div>
  );
};
