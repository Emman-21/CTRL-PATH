import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { ProgressBar } from '../shared/ProgressBar';
import { LuniCharacter } from '../luni/LuniCharacter';
import { QUIZ_LEVELS } from '../../data/quiz/quizLevels';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface QuizLevelCompletionProps {
  completedLevel: number;
  onContinue: () => void;
}

export const QuizLevelCompletion: React.FC<QuizLevelCompletionProps> = ({
  completedLevel,
  onContinue,
}) => {
  const currentMeta = QUIZ_LEVELS[completedLevel - 1];

  const progressPercent = Math.round((completedLevel / 5) * 100);

  return (
    <div className="max-w-xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-200">
      <Card padding="lg" className="border-indigo-100 dark:border-indigo-950/80 shadow-xl text-center relative overflow-hidden">
        <div className="flex justify-center mb-4">
          <LuniCharacter state="celebrating" pose="quiz_celebration" size={96} animate glow motionOverride="slow-jump" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Chapter {completedLevel} Completed!</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Splendid Progress, Luminary!
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          You've successfully finished{' '}
          <strong className="inline px-1.5 py-[1px] rounded-md box-decoration-clone bg-slate-800 text-yellow-300 ring-1 ring-slate-600/50 dark:bg-[#172554] dark:text-yellow-300 dark:ring-blue-500/40 font-extrabold">
            {currentMeta?.name}
          </strong>{' '}
          ({currentMeta?.typeTitle}). Your answers have been safely recorded.
        </p>

        {/* Progress Across 5 Chapters */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/80 dark:border-slate-800 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span>Overall Assessment Journey</span>
            <span>{completedLevel} of 5 Chapters ({progressPercent}%)</span>
          </div>
          <ProgressBar value={progressPercent} variant="primary" size="md" />
        </div>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={onContinue}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {completedLevel < 5 ? `Prepare for Chapter ${completedLevel + 1}` : 'Submit Assessment'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
