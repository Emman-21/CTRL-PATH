import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { LuniCharacter } from '../luni/LuniCharacter';
import { QUIZ_LEVELS } from '../../data/quiz/quizLevels';
import { Sparkles, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

export interface QuizPreparationProps {
  levelNumber: number;
  onBeginLevel: () => void;
}

export const QuizPreparation: React.FC<QuizPreparationProps> = ({
  levelNumber,
  onBeginLevel,
}) => {
  const levelMeta = QUIZ_LEVELS[levelNumber - 1] || QUIZ_LEVELS[0];

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      <Card padding="lg" className="border-indigo-100 dark:border-indigo-950/80 shadow-xl relative overflow-hidden">
        {/* Soft Background Tint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-blue-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/70 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
              <span>Chapter {levelMeta.level} Preparation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {levelMeta.name}
            </h2>
            <div className="text-xs font-bold text-blue-600 dark:text-sky-300 mt-0.5">
              Format: {levelMeta.typeTitle} · {levelMeta.questionCount} Questions ({levelMeta.estimatedTime})
            </div>
          </div>

          <div className="shrink-0 hidden sm:block">
            <LuniCharacter state="happy" pose="quiz_cheer" size={68} animate={false} hoverCircle />
          </div>
        </div>

        {/* Overview & Instructions */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{levelMeta.description}</p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
              <span>Instructions</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{levelMeta.instructions}</p>
          </div>

          {/* Topics Covered */}
          <div>
            <div className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2">
              Key Topic Areas in this Chapter:
            </div>
            <div className="space-y-1.5">
              {levelMeta.keyTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Luni's Tip */}
          <div className="p-3.5 rounded-2xl bg-linear-to-r from-blue-50/60 to-purple-50/60 dark:from-slate-800/95 dark:via-indigo-950/80 dark:to-slate-900/95 border border-indigo-100 dark:border-indigo-800/60 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <LuniCharacter state="encouraging" size={40} animate={false} showParticles={false} />
            </div>
            <div>
              <div className="text-xs font-black text-indigo-950 dark:text-indigo-200">Luni's Preparation Advice</div>
              <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed mt-0.5">{levelMeta.luniTip}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={onBeginLevel}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Start Chapter {levelMeta.level} Questions
          </Button>
        </div>
      </Card>
    </div>
  );
};
