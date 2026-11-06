import React from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { BaPixelArt, NtPixelArt, SmPixelArt } from '../shared/PixelArt';
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
      border: 'border-blue-200 hover:border-blue-500',
      accentBg: 'bg-blue-50/50',
      badge: 'bg-blue-600 text-white',
      btn: 'primary' as const,
      art: <NtPixelArt size="md" />,
    },
    BA: {
      border: 'border-purple-200 hover:border-purple-500',
      accentBg: 'bg-purple-50/50',
      badge: 'bg-violet-600 text-white',
      btn: 'ba' as const,
      art: <BaPixelArt size="md" />,
    },
    SM: {
      border: 'border-emerald-200 hover:border-emerald-500',
      accentBg: 'bg-emerald-50/50',
      badge: 'bg-emerald-600 text-white',
      btn: 'sm' as const,
      art: <SmPixelArt size="md" />,
    },
  };
  const cTheme = cardColors[code];

  return (
    <Card
      hoverable
      className={`flex flex-col justify-between p-6 transition-all duration-200 relative ${cTheme.border} shadow-xs hover:shadow-md`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${cTheme.badge}`}
            >
              {code}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                {track.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">
                BSIT Specialization
              </span>
            </div>
          </div>

          {isExplored ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Explored</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
              Unexplored
            </span>
          )}
        </div>

        <div className={`flex items-center justify-center py-2.5 rounded-2xl mb-4 ${cTheme.accentBg}`}>
          {cTheme.art}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[36px]">
          {track.shortDescription}
        </p>

        <div className="mb-4">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Core Competencies
          </div>
          <div className="flex flex-wrap gap-1.5">
            {track.coreSkills.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
              >
                {item.category}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{track.modules.length} Learning Modules</span>
          </span>
          <span className="font-bold text-slate-700">{progress}% Progress</span>
        </div>

        <div className="py-2">
          <ProgressBar
            value={progress}
            variant={code.toLowerCase() as any}
            size="sm"
          />
        </div>
      </div>

      <div className="pt-4 space-y-2">
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
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            isCompared
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isCompared ? (
            <>
              <Check className="w-3.5 h-3.5 text-indigo-600" />
              <span>Added to Comparison</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Compare Track</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
