import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { LuniCharacter } from '../luni/LuniCharacter';
import { QUIZ_LEVELS } from '../../data/quiz/quizLevels';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export interface QuizIntroProps {
  attemptNumber: number;
  maxAttempts: number;
  hasActiveSession: boolean;
  onStart: () => void;
  onResume: () => void;
}

export const QuizIntro: React.FC<QuizIntroProps> = ({
  attemptNumber,
  maxAttempts = 3,
  hasActiveSession,
  onStart,
  onResume,
}) => {
  const isMaxAttemptsReached = attemptNumber > maxAttempts;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      <Card padding="lg" className="border-indigo-100 shadow-xl text-center relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-linear-to-b from-blue-400/15 via-purple-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Luni Star Eyes Avatar */}
        <div className="relative z-10 flex justify-center mb-3">
          <LuniCharacter state="excited" size={104} animate glow />
        </div>

        {/* Chapter Header Pill */}
        <div className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
          <span>Interactive BSIT Learning Adventure</span>
        </div>

        <h1 className="relative z-10 text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          CTRL Quiz Assessment
        </h1>

        <p className="relative z-10 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Welcome, Luminary! This assessment is calibrated with an equal balance of{' '}
          <strong className="text-blue-700">Networking Technology (33)</strong>,{' '}
          <strong className="text-purple-700">Business Analytics (33)</strong>, and{' '}
          <strong className="text-emerald-700">Service Management (33)</strong> questions to objectively
          illuminate your aptitudes and interests.
        </p>

        {/* Luni's Little Reminder */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-linear-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-indigo-100/80 text-left flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <LuniCharacter state="waving" size={48} animate showParticles={false} />
          </div>
          <div>
            <div className="text-xs font-black text-indigo-900 flex items-center gap-1.5 mb-0.5">
              <span>Luni's Little Reminder</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track classifications are hidden during the test so you can answer naturally based on what you
              know and enjoy. Take your time—this test does not choose your track for you!
            </p>
          </div>
        </div>

        {/* 5-Level Journey Preview */}
        <div className="relative z-10 mt-8 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span>Five Progressive Chapters:</span>
            <span className="text-[11px] text-slate-400">99 Total Questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {QUIZ_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className="p-3 rounded-2xl border border-slate-200 bg-white/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-indigo-600">
                      Level {lvl.level}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{lvl.difficulty}</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {lvl.typeTitle}
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{lvl.questionCount} Qs</span>
                  <span>{lvl.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attempts & Actions */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <RotateCcw className="w-4 h-4 text-blue-600" />
            <span>
              Attempt {Math.min(maxAttempts, attemptNumber)} of {maxAttempts} Maximum Allowed
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {hasActiveSession ? (
              <Button
                variant="primary"
                size="md"
                onClick={onResume}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Resume Saved Attempt
              </Button>
            ) : isMaxAttemptsReached ? (
              <Button variant="outline" size="md" disabled className="w-full sm:w-auto">
                Maximum Attempts Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={onStart}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Begin Assessment (Level 1)
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
