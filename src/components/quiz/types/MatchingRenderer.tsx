import React from 'react';
import { MatchingQuestion } from '../../../types/quiz';
import { RotateCcw } from 'lucide-react';

export interface MatchingRendererProps {
  question: MatchingQuestion;
  value: Record<string, string> | undefined;
  onChange: (val: Record<string, string>) => void;
  disabled?: boolean;
}

export const MatchingRenderer: React.FC<MatchingRendererProps> = ({
  question,
  value = {},
  onChange,
  disabled = false,
}) => {
  // All possible definitions from the question pairs
  const allDefinitions = question.pairs.map((p) => p.definition);

  // List of already assigned definitions
  const assignedDefinitions = Object.values(value).filter(Boolean);

  const handleSelect = (term: string, definition: string) => {
    if (disabled) return;
    const updated = { ...value, [term]: definition };
    onChange(updated);
  };

  const handleReset = () => {
    if (disabled) return;
    onChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Select the exact matching definition for each IT term:</span>
        {Object.keys(value).length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Matches</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {question.pairs.map((pair, idx) => {
          const currentMatch = value[pair.term] || '';
          const isMatched = Boolean(currentMatch);

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isMatched ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="sm:w-1/3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                  {pair.term}
                </span>
              </div>

              <div className="sm:w-2/3">
                <select
                  disabled={disabled}
                  value={currentMatch}
                  onChange={(e) => handleSelect(pair.term, e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  aria-label={`Match definition for ${pair.term}`}
                >
                  <option value="">-- Choose matching definition --</option>
                  {allDefinitions.map((def, dIdx) => {
                    const isAlreadyChosen =
                      assignedDefinitions.includes(def) && currentMatch !== def;

                    return (
                      <option key={dIdx} value={def} disabled={isAlreadyChosen}>
                        {def} {isAlreadyChosen ? '(Assigned)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
