import React from 'react';
import { LuniSprite } from '../luni/LuniSprite';
import { LuniPoseKey } from '../../assets/manifest';
import { Sparkles } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  luniPose?: LuniPoseKey;
  luniQuote?: string;
  luniTitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backgroundImage,
  badge,
  actions,
  luniPose = 'wave',
  luniQuote = 'Keep exploring and you’ll discover amazing possibilities for your future! ✨',
  luniTitle = 'Hi there, Luminary!',
  titleClassName = 'text-3xl sm:text-4xl font-black',
  subtitleClassName = 'text-xs sm:text-[13px]',
}) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs mb-8">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover object-center pixelated"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-blue-100/90 via-indigo-50/80 to-purple-100/90" />
        )}
        {/* Soft overlay gradient for perfect text legibility */}
        <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/85 to-white/60 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-8 flex flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="max-w-2xl min-w-0 flex-1">
          {badge && <div className="mb-2.5">{badge}</div>}

          <div className="flex items-center gap-2">
            <h1 className={`${titleClassName} text-slate-900 tracking-tight flex items-center gap-2`}>
              <span>{title}</span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-sparkle-spin shrink-0" />
            </h1>
          </div>

          <p className={`mt-2 ${subtitleClassName} text-slate-600 leading-relaxed font-normal`}>
            {subtitle}
          </p>

          {actions && <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>

        {/* Luni Guide Card with Speech Bubble */}
        <div className="shrink-0 flex items-start justify-end gap-3 self-start">
          <div className="bg-white/95 backdrop-blur-md border border-blue-200/90 dark:border-blue-800/70 rounded-2xl p-3.5 shadow-sm max-w-[240px] relative hidden lg:block">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">{luniTitle}</div>
            <p className="text-xs text-slate-600 leading-snug">{luniQuote}</p>
            {/* Speech bubble arrow pointer */}
            <div className="absolute -right-2 top-9 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white/95" />
          </div>

          <div className="relative">
            <LuniSprite pose={luniPose} size={88} animate glow />
          </div>
        </div>
      </div>
    </div>
  );
};
