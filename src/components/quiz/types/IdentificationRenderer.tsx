import React from 'react';
import { IdentificationQuestion } from '../../../types/quiz';


export interface IdentificationRendererProps {
  question: IdentificationQuestion;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const IdentificationRenderer: React.FC<IdentificationRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  // If this question is an enumeration with multiple subfields
  if (question.isEnumeration && question.enumerationFields) {
    const listValues = Array.isArray(value) ? value : ['', '', ''];

    const handleFieldChange = (index: number, text: string) => {
      if (disabled) return;
      const updated = [...listValues];
      updated[index] = text;
      onChange(updated);
    };

    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Enter each element into its corresponding field below:
        </p>
        {question.enumerationFields.map((field, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="sm:w-1/3 text-xs font-bold text-slate-600">
              {field.label}:
            </span>
            <input
              type="text"
              disabled={disabled}
              value={listValues[idx] || ''}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 p-3 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        ))}
      </div>
    );
  }

  // Single Identification Question
  const stringValue = typeof value === 'string' ? value : '';

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Type the exact term or concept:</p>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer here...'}
          className="w-full p-4 pl-4 bg-white border-2 border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold"
        />
      </div>
      <p className="text-[11px] text-slate-400">
        Grading is case-insensitive. Standard industry acronyms (e.g. OSI, SLA, SQL) are recognized.
      </p>
    </div>
  );
};
