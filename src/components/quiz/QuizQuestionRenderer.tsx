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
    <div className="space-y-4">
      {/* Question Header & Prompt */}
      <div className="flex items-center justify-between gap-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {question.prompt}
        </h3>
        <div className="shrink-0 hidden sm:flex items-center justify-center p-2.5">
          <LuniCharacter
            state="curious"
            pose="curious"
            motionOverride="float"
            size={60}
            animate
            showParticles={false}
            hoverGlow={false}
            staticCircle
          />
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
