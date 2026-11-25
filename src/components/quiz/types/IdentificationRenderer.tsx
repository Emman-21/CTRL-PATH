import React, { useEffect, useRef } from 'react';
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (disabled) return;
    const timer = window.setTimeout(() => {
      inputRefs.current[0]?.focus({ preventScroll: true });
    }, 30);
    return () => window.clearTimeout(timer);
  }, [question.id, disabled]);

  // If this question is an enumeration with multiple subfields
  if (question.isEnumeration && question.enumerationFields) {
    const listValues = Array.isArray(value) ? value : ['', '', ''];

    const handleFieldChange = (index: number, text: string) => {
      if (disabled) return;
      const updated = [...listValues];
      updated[index] = text;
      onChange(updated);
    };

    const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (e.key !== 'Enter') return;
      const fields = question.enumerationFields || [];
      const nextEmptyIdx = fields.findIndex(
        (_, fIdx) => fIdx > idx && !(listValues[fIdx] || '').trim()
      );
      if (nextEmptyIdx !== -1) {
        e.preventDefault();
        e.stopPropagation();
        inputRefs.current[nextEmptyIdx]?.focus();
        return;
      }
      const anyEmptyIdx = fields.findIndex((_, fIdx) => !(listValues[fIdx] || '').trim());
      if (anyEmptyIdx !== -1) {
        e.preventDefault();
        e.stopPropagation();
        inputRefs.current[anyEmptyIdx]?.focus();
      }
    };

    return (
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter each element into its corresponding field below:
        </p>
        {question.enumerationFields.map((field, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor={`id-field-${question.id}-${idx}`}
              className="sm:w-1/3 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              {field.label}:
            </label>
            <input
              id={`id-field-${question.id}-${idx}`}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              disabled={disabled}
              value={listValues[idx] || ''}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              onKeyDown={(e) => handleFieldKeyDown(e, idx)}
              placeholder="Type your answer here..."
              className="flex-1 p-3 bg-[var(--surface)] dark:bg-[#0a0f1d] border-2 border-[var(--border)] dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[var(--text)] dark:text-slate-100 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
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
      <label htmlFor={`id-single-${question.id}`} className="block text-xs text-slate-500 dark:text-slate-400">
        Type the exact term or concept:
      </label>
      <div className="relative">
        <input
          id={`id-single-${question.id}`}
          ref={(el) => {
            inputRefs.current[0] = el;
          }}
          type="text"
          disabled={disabled}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer here...'}
          className="w-full p-4 pl-4 bg-[var(--surface)] dark:bg-[#0a0f1d] border-2 border-[var(--border)] dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-[var(--text)] dark:text-slate-100 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 font-semibold"
        />
      </div>
      <p className="text-[11px] text-slate-400">
        Grading is case-insensitive. Press Enter once answered to go to the next question.
      </p>
    </div>
  );
};
