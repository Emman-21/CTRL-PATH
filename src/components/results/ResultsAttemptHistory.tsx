import React from 'react';
import { History } from 'lucide-react';
import type { QuizAttempt } from '../../types';
import { Card } from '../shared/Card';

interface ResultsAttemptHistoryProps {
  attempts: QuizAttempt[];
  selectedAttemptIndex: number;
  onSelectAttempt: (index: number) => void;
}

export const ResultsAttemptHistory: React.FC<ResultsAttemptHistoryProps> = ({
  attempts,
  selectedAttemptIndex,
  onSelectAttempt,
}) => (
  <Card>
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-blue-600" />
        <h3 className="font-extrabold text-slate-900 text-base">Attempt History & Progression</h3>
      </div>
      <div className="text-xs text-slate-500">{attempts.length} of 3 attempts completed</div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <th className="py-2.5 px-3">Attempt</th>
            <th className="py-2.5 px-3">Date</th>
            <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400">NT Score</th>
            <th className="py-2.5 px-3 text-violet-600 dark:text-violet-400">BA Score</th>
            <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">SM Score</th>
            <th className="py-2.5 px-3">Duration</th>
            <th className="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {attempts.map((attempt, index) => (
            <tr
              key={attempt.id || index}
              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                selectedAttemptIndex === index ? 'bg-blue-50/40 dark:bg-blue-950/40 font-bold' : ''
              }`}
            >
              <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-slate-100">Attempt #{attempt.attemptNumber}</td>
              <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{attempt.date}</td>
              <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">{attempt.ntScore}%</td>
              <td className="py-3 px-3 text-violet-600 dark:text-violet-400 font-bold">{attempt.baScore}%</td>
              <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{attempt.smScore}%</td>
              <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{attempt.durationMinutes || 25} min</td>
              <td className="py-3 px-3 text-right">
                <button
                  onClick={() => onSelectAttempt(index)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {selectedAttemptIndex === index ? 'Active View' : 'Inspect'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
