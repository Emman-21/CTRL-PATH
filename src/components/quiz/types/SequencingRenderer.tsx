import React from 'react';
import { SequencingQuestion } from '../../../types/quiz';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

export interface SequencingRendererProps {
  question: SequencingQuestion;
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export const SequencingRenderer: React.FC<SequencingRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  // If no student order is recorded yet, initialize with the question steps
  const currentSteps =
    value && value.length === question.steps.length ? value : question.steps;

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (disabled || toIndex < 0 || toIndex >= currentSteps.length) return;
    const updated = [...currentSteps];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleReset = () => {
    if (disabled) return;
    onChange([...question.steps]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Arrange steps from first (1) to last ({currentSteps.length}):</span>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Order</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {currentSteps.map((step, idx) => (
          <div
            key={step}
            className="p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                {idx + 1}
              </span>
              <span className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                {step}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={disabled || idx === 0}
                onClick={() => moveStep(idx, idx - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center justify-center font-bold text-xs disabled:opacity-25 transition-colors cursor-pointer"
                aria-label={`Move Step ${idx + 1} Up`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={disabled || idx === currentSteps.length - 1}
                onClick={() => moveStep(idx, idx + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center justify-center font-bold text-xs disabled:opacity-25 transition-colors cursor-pointer"
                aria-label={`Move Step ${idx + 1} Down`}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
