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
          <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
            <th className="py-2.5 px-3">Attempt</th>
            <th className="py-2.5 px-3">Date</th>
            <th className="py-2.5 px-3 text-blue-600">NT Score</th>
            <th className="py-2.5 px-3 text-violet-600">BA Score</th>
            <th className="py-2.5 px-3 text-emerald-600">SM Score</th>
            <th className="py-2.5 px-3">Duration</th>
            <th className="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {attempts.map((attempt, index) => (
            <tr
              key={attempt.id || index}
              className={`hover:bg-slate-50 transition-colors ${
                selectedAttemptIndex === index ? 'bg-blue-50/40 font-bold' : ''
              }`}
            >
              <td className="py-3 px-3 font-extrabold text-slate-900">Attempt #{attempt.attemptNumber}</td>
              <td className="py-3 px-3 text-slate-600">{attempt.date}</td>
              <td className="py-3 px-3 text-blue-600 font-bold">{attempt.ntScore}%</td>
              <td className="py-3 px-3 text-violet-600 font-bold">{attempt.baScore}%</td>
              <td className="py-3 px-3 text-emerald-600 font-bold">{attempt.smScore}%</td>
              <td className="py-3 px-3 text-slate-500">{attempt.durationMinutes || 25} min</td>
              <td className="py-3 px-3 text-right">
                <button
                  onClick={() => onSelectAttempt(index)}
                  className="text-xs font-bold text-blue-600 hover:underline"
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
