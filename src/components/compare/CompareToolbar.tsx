import React from 'react';
import { Bookmark, BookmarkCheck, Printer } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { TRACKS_DATA } from '../../data/tracks';
import type { TrackCode } from '../../types';

interface CompareToolbarProps {
  selectedTracks: TrackCode[];
  reviewedTracks: boolean;
  isSaved: boolean;
  onToggleTrack: (code: TrackCode) => void;
  onReviewChange: (reviewed: boolean) => void;
  onPrint: () => void;
  onSave: () => void;
}

export const CompareToolbar: React.FC<CompareToolbarProps> = ({
  selectedTracks,
  reviewedTracks,
  isSaved,
  onToggleTrack,
  onReviewChange,
  onPrint,
  onSave,
}) => (
  <Card className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/95">
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <span>Select 2 or 3 Tracks to Compare:</span>
        <span className="text-slate-400 font-normal">
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
            SM: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
          };

          return (
            <button
              key={code}
              onClick={() => onToggleTrack(code)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-2 ${
                active
                  ? activeStyles[code]
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black">
                {code}
              </span>
              <span>{track.name}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2.5">
      <label className="w-full flex items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={reviewedTracks}
          onChange={(e) => onReviewChange(e.target.checked)}
          className="mt-0.5 w-4 h-4"
        />
        I reviewed the curriculum, skills, and career differences for these tracks.
      </label>
      <Button
        variant="outline"
        size="md"
        onClick={onPrint}
        icon={<Printer className="w-4 h-4 text-slate-600" />}
      >
        Print Comparison
      </Button>

      <Button
        variant="primary"
        size="md"
        onClick={onSave}
        disabled={!reviewedTracks}
        icon={
          isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-emerald-300" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )
        }
      >
        {isSaved ? 'Saved to Comparisons! 💎' : 'Save Comparison'}
      </Button>
    </div>
  </Card>
);
