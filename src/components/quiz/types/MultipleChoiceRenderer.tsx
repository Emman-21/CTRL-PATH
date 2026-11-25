import React from 'react';
import { MultipleChoiceQuestion } from '../../../types/quiz';
import { Check } from 'lucide-react';

export interface MultipleChoiceRendererProps {
  question: MultipleChoiceQuestion;
  value: string | undefined;
  onChange: (val: 'A' | 'B' | 'C' | 'D') => void;
  disabled?: boolean;
}

export const MultipleChoiceRenderer: React.FC<MultipleChoiceRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const isSelected = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            data-quiz-option-selected={isSelected ? 'true' : 'false'}
            onClick={() => onChange(option.key)}
            className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isSelected
                ? 'border-blue-600 bg-blue-50/80 text-blue-950 dark:border-blue-400 dark:bg-[#112247] dark:text-blue-100 font-bold shadow-xs ring-2 ring-blue-300 dark:ring-blue-500/40'
                : 'border-[var(--border)] bg-[var(--surface)] hover:border-blue-300 text-[var(--text)] hover:bg-[var(--surface-raised)] dark:border-slate-700/90 dark:bg-slate-900/90 dark:hover:border-sky-400/70 dark:text-slate-200 dark:hover:bg-[#162344]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {option.key}
              </span>
              <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};
