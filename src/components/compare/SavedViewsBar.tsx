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
    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
      Saved Views:
    </span>
    {comparisons.map((comparison) => (
      <div
        key={comparison.id}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium shrink-0 transition-colors"
      >
        <button
          onClick={() => onLoad(comparison)}
          className="hover:underline font-bold text-slate-800"
        >
          {comparison.title}
        </button>
        <button
          onClick={() => onRemove(comparison.id)}
          title="Remove saved comparison"
          className="text-slate-400 hover:text-rose-600 ml-1"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    ))}
  </div>
);
