import React from 'react';
import { QuizQuestion } from '../../types/quiz';
import { TrueFalseRenderer } from './types/TrueFalseRenderer';
import { MultipleChoiceRenderer } from './types/MultipleChoiceRenderer';
import { MatchingRenderer } from './types/MatchingRenderer';
import { SequencingRenderer } from './types/SequencingRenderer';
import { IdentificationRenderer } from './types/IdentificationRenderer';
import { LuniCharacter } from '../luni/LuniCharacter';

export interface QuizQuestionRendererProps {
  question: QuizQuestion;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const QuizQuestionRenderer: React.FC<QuizQuestionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Question Header & Prompt */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.prompt}
        </h3>
        <div className="shrink-0 hidden sm:block">
          <LuniCharacter state="thinking" size={54} animate showParticles={false} />
        </div>
      </div>

      {/* Question Specific Interface */}
      <div>
        {question.type === 'true_false' && (
          <TrueFalseRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {question.type === 'multiple_choice' && (
          <MultipleChoiceRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {question.type === 'matching' && (
          <MatchingRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {question.type === 'sequencing' && (
          <SequencingRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}

        {question.type === 'identification' && (
          <IdentificationRenderer
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
