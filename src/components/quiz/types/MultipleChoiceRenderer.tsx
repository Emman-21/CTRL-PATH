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
    <div className="space-y-2.5">
      {question.options.map((option) => {
        const isSelected = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.key)}
            className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              isSelected
                ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-xs ring-2 ring-blue-300'
                : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {option.key}
              </span>
              <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};
