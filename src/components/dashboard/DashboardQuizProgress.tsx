import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, FileQuestion, ChevronRight } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';

interface DashboardQuizProgressProps {
  activeQuiz: { currentLevel: number } | null;
  responseCount: number;
  totalQuestions: number;
  quizPercent: number;
  attemptsCount: number;
}

export const DashboardQuizProgress: React.FC<DashboardQuizProgressProps> = ({
  activeQuiz,
  responseCount,
  totalQuestions,
  quizPercent,
  attemptsCount,
}) => (
  <Card className="flex flex-col justify-between p-6">
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Current Quiz Progress</span>
        </div>
        <Link to="/quiz" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
          <span>Continue where you left off</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 font-black text-lg shadow-xs shrink-0">
          <FileQuestion className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="font-black text-slate-900 text-sm">
              {activeQuiz ? `Level ${activeQuiz.currentLevel}: saved assessment` : 'No active assessment'}
            </div>
            <span className="text-xs font-bold text-blue-700">{quizPercent}%</span>
          </div>
          <div className="text-xs text-slate-500">
            {responseCount} of {totalQuestions} responses saved
          </div>
          <div className="pt-1">
            <ProgressBar value={quizPercent} variant="primary" size="sm" />
          </div>
        </div>
      </div>
    </div>

    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
      <span className="text-xs text-slate-500 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Attempt {Math.min(3, attemptsCount + 1)} of 3</span>
      </span>

      <Link to="/quiz">
        <Button
          variant="primary"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          {activeQuiz ? 'Resume Quiz' : attemptsCount >= 3 ? 'Review Quiz' : 'Open Quiz'}
        </Button>
      </Link>
    </div>
  </Card>
);
