import React from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import {
  BaPixelArt,
  NtPixelArt,
  SmPixelArt,
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
} from '../shared/PixelArt';
import type { TrackCode, TrackInfo } from '../../types';

interface TrackOverviewCardProps {
  code: TrackCode;
  track: TrackInfo;
  isExplored: boolean;
  isCompared: boolean;
  progress: number;
  onExplore: () => void;
  onToggleCompare: () => void;
}

export const TrackOverviewCard: React.FC<TrackOverviewCardProps> = ({
  code,
  track,
  isExplored,
  isCompared,
  progress,
  onExplore,
  onToggleCompare,
}) => {
  const cardColors = {
    NT: {
      border: 'border-blue-200 hover:border-blue-500 dark:border-blue-900/60 dark:hover:border-blue-500/70',
      accentBg: 'bg-blue-50/50 dark:bg-blue-950/35',
      badge: 'bg-blue-600 text-white',
      btn: 'primary' as const,
      art: <NtPixelArt size="md" />,
    },
    BA: {
      border: 'border-purple-200 hover:border-purple-500 dark:border-purple-900/60 dark:hover:border-purple-500/70',
      accentBg: 'bg-purple-50/50 dark:bg-purple-950/35',
      badge: 'bg-violet-600 text-white',
      btn: 'ba' as const,
      art: <BaPixelArt size="md" />,
    },
    SM: {
      border: 'border-emerald-200 hover:border-emerald-500 dark:border-emerald-900/60 dark:hover:border-emerald-500/70',
      accentBg: 'bg-emerald-50/50 dark:bg-emerald-950/35',
      badge: 'bg-emerald-600 text-white',
      btn: 'sm' as const,
      art: <SmPixelArt size="md" />,
    },
  };
  const cTheme = cardColors[code];

  return (
    <Card
      hoverable
      className={`flex flex-col p-5 transition-all duration-200 relative ${cTheme.border} shadow-xs hover:shadow-md`}
    >
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {code === 'NT' ? (
              <NtTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
            ) : code === 'BA' ? (
              <BaTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
            ) : (
              <SmTrackBadge size={36} className="shrink-0 rounded-xl shadow-xs" />
            )}
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-[15px] leading-tight truncate">
                {track.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold block">
                BSIT Specialization
              </span>
            </div>
          </div>

          {isExplored ? (
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#0c2419] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/70">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Explored</span>
            </span>
          ) : (
            <span className="shrink-0 text-[11px] text-slate-400 font-medium bg-slate-50 dark:bg-[#131d33] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/80">
              Unexplored
            </span>
          )}
        </div>

        <div className={`flex items-center justify-center py-2 rounded-xl mb-3 ${cTheme.accentBg}`}>
          {cTheme.art}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {track.shortDescription}
        </p>

        <div className="mb-3">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Core Competencies
          </div>
          <div className="flex flex-wrap gap-1">
            {(code === 'NT' && track.coreSkills[4]
              ? [...track.coreSkills.slice(0, 3), track.coreSkills[4]]
              : track.coreSkills.slice(0, 3)
            ).map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#131d33] text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700/70 text-[11px] font-semibold"
              >
                {item.category.replace(/\s*\([^)]*\)/g, '').trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{track.modules.length} Learning Modules</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{progress}% Progress</span>
          </div>

          <div className="pt-2">
            <ProgressBar
              value={progress}
              variant={code.toLowerCase() as any}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-3 space-y-2 md:space-y-1.5">
        <Button
          variant={cTheme.btn}
          size="md"
          onClick={onExplore}
          className="w-full"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Explore Track
        </Button>

        <button
          onClick={onToggleCompare}
          className={`w-full min-h-11 md:min-h-0 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            isCompared
              ? 'bg-indigo-50 dark:bg-indigo-950/80! text-indigo-700 dark:text-indigo-200! border-indigo-300 dark:border-indigo-500/70! hover:bg-indigo-100/70 dark:hover:bg-indigo-900/80! font-extrabold shadow-2xs'
              : 'bg-[var(--surface)] dark:bg-[#131d33]! text-slate-600 dark:text-slate-200! border-[var(--border)] dark:border-slate-700! hover:bg-[var(--surface-raised)] dark:hover:bg-[#1c2b4a]! dark:hover:border-slate-500!'
          }`}
        >
          {isCompared ? (
            <>
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300!" />
              <span>Added to Comparison</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300!" />
              <span>Compare Track</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
