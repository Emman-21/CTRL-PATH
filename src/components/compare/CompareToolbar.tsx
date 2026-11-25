import React from 'react';
import { Card } from '../shared/Card';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../shared/PixelArt';
import { TRACKS_DATA } from '../../data/tracks';
import type { TrackCode } from '../../types';

interface CompareToolbarProps {
  selectedTracks: TrackCode[];
  onToggleTrack: (code: TrackCode) => void;
}

export const CompareToolbar: React.FC<CompareToolbarProps> = ({
  selectedTracks,
  onToggleTrack,
}) => (
  <Card className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--surface-95)] dark:bg-[#0f172a] dark:border-slate-800">
    <div>
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <span>Select 2 or 3 Tracks to Compare:</span>
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          ({selectedTracks.length} selected · min 2)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {(['NT', 'BA', 'SM'] as TrackCode[]).map((code) => {
          const active = selectedTracks.includes(code);
          const track = TRACKS_DATA[code];

          const activeStyles = {
            NT: 'bg-blue-600 text-white border-blue-600 shadow-xs',
            BA: 'bg-violet-600 text-white border-violet-600 shadow-xs',
            SM: 'bg-emerald-700 text-white border-emerald-700 shadow-xs',
          };

          return (
            <button
              key={code}
              onClick={() => onToggleTrack(code)}
              aria-pressed={active}
              className={`pl-2 pr-3.5 py-1.5 min-h-11 md:min-h-0 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                active
                  ? activeStyles[code]
                  : 'bg-[var(--surface)] dark:bg-[#131d33] border-[var(--border)] dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-[var(--surface-raised)] dark:hover:bg-[#1a2744]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 overflow-hidden transition-all ${
                  active ? 'ring-1 ring-white/75 shadow-2xs' : 'ring-1 ring-slate-200/80 dark:ring-slate-700/70'
                }`}
              >
                {code === 'NT' ? (
                  <NtTrackBadge size={24} className="shrink-0" />
                ) : code === 'BA' ? (
                  <BaTrackBadge size={24} className="shrink-0" />
                ) : (
                  <SmTrackBadge size={24} className="shrink-0" />
                )}
              </span>
              <span>{track.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  </Card>
);
