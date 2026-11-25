import React from 'react';
import { Trash2 } from 'lucide-react';
import type { SavedComparison } from '../../types';

interface SavedViewsBarProps {
  comparisons: SavedComparison[];
  onLoad: (comparison: SavedComparison) => void;
  onRemove: (id: string) => void;
}

export const SavedViewsBar: React.FC<SavedViewsBarProps> = ({
  comparisons,
  onLoad,
  onRemove,
}) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
    <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
      Saved Views:
    </span>
    {comparisons.map((comparison) => (
      <div
        key={comparison.id}
        className="flex items-center gap-2 md:gap-1.5 px-3 py-1 bg-slate-100 dark:bg-[#131d33] hover:bg-slate-200 dark:hover:bg-[#1a2744] border border-transparent dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 font-medium shrink-0 transition-colors"
      >
        <button
          onClick={() => onLoad(comparison)}
          className="min-h-11 md:min-h-0 hover:underline font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
        >
          {comparison.title}
        </button>
        <button
          onClick={() => onRemove(comparison.id)}
          title="Remove saved comparison"
          className="w-11 h-11 md:w-auto md:h-auto flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-0 md:ml-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    ))}
  </div>
);
