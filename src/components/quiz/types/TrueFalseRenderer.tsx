import React from 'react';
import { TrueFalseQuestion } from '../../../types/quiz';
import { Check } from 'lucide-react';

export interface TrueFalseRendererProps {
  question: TrueFalseQuestion;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export const TrueFalseRenderer: React.FC<TrueFalseRendererProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`p-5 rounded-2xl border-2 text-left font-extrabold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${
            value === true
              ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-300'
              : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="True"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center ${
                value === true ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              T
            </span>
            <span>Factually True</span>
          </div>
          {value === true && <Check className="w-5 h-5 text-blue-600" />}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`p-5 rounded-2xl border-2 text-left font-extrabold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${
            value === false
              ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-300'
              : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="False"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center ${
                value === false ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              F
            </span>
            <span>Factually False</span>
          </div>
          {value === false && <Check className="w-5 h-5 text-blue-600" />}
        </button>
      </div>
    </div>
  );
};
