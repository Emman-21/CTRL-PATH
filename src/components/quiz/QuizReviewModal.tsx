import React from 'react';
import { QuizSessionState } from '../../types/quiz';
import { QUIZ_LEVELS } from '../../data/quiz/quizLevels';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../shared/Button';

export interface QuizReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: QuizSessionState;
  onJumpToQuestion: (level: number, questionIndex: number) => void;
  onConfirmSubmit: () => void;
}

export const QuizReviewModal: React.FC<QuizReviewModalProps> = ({
  isOpen,
  onClose,
  session,
  onJumpToQuestion,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  // Compute answered counts per level
  const levelStats = QUIZ_LEVELS.map((lvl) => {
    const questionIds = session.shuffledQuestionsByLevel[lvl.level] || [];
    let answered = 0;
    questionIds.forEach((id) => {
      const val = session.answers[id];
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object' && !Array.isArray(val)) {
          if (Object.keys(val).length > 0) answered++;
        } else if (Array.isArray(val)) {
          if (val.some(Boolean)) answered++;
        } else {
          answered++;
        }
      }
    });

    return {
      level: lvl.level,
      name: lvl.name,
      typeTitle: lvl.typeTitle,
      total: questionIds.length,
      answered,
      unanswered: questionIds.length - answered,
      questionIds,
    };
  });

  const totalAnswered = levelStats.reduce((acc, l) => acc + l.answered, 0);
  const totalQuestions = levelStats.reduce((acc, l) => acc + l.total, 0);
  const totalUnanswered = totalQuestions - totalAnswered;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Assessment Review Summary"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="text-[11px] font-black uppercase text-blue-600 tracking-wider">
              Assessment Summary
            </div>
            <h3 className="text-lg font-black text-slate-900">Review Your Responses</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50"
            aria-label="Close review"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {totalUnanswered === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="text-xs font-black text-slate-900">
                {totalAnswered} of {totalQuestions} Questions Answered
              </div>
              <div className="text-[11px] text-slate-500">
                {totalUnanswered === 0
                  ? 'All questions completed! You are ready for final submission.'
                  : `${totalUnanswered} question(s) remain unanswered. You may still submit or revise.`}
              </div>
            </div>
          </div>
        </div>

        {/* Levels Breakdown List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {levelStats.map((stat) => (
            <div
              key={stat.level}
              className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    Chapter {stat.level}: {stat.typeTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">{stat.name}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      stat.unanswered === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {stat.answered} / {stat.total} Answered
                  </span>
                </div>
              </div>

              {/* Question Badges / Jump Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {stat.questionIds.map((qId, qIdx) => {
                  const val = session.answers[qId];
                  const hasAnswer = val !== undefined && val !== null && val !== '';

                  return (
                    <button
                      key={qId}
                      onClick={() => {
                        onClose();
                        onJumpToQuestion(stat.level, qIdx);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        hasAnswer
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                          : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                      }`}
                      title={`Question ${qIdx + 1} (${hasAnswer ? 'Answered' : 'Unanswered'})`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Return to Questions
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmSubmit}
            icon={<CheckCircle2 className="w-4 h-4" />}
            iconPosition="right"
            className="w-full sm:w-auto"
          >
            Confirm & Submit Final Attempt
          </Button>
        </div>
      </div>
    </div>
  );
};
