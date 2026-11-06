import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Search,
  XCircle,
} from 'lucide-react';
import type { DetailedResultsAnalysis } from '../../utils/resultsAnalytics';
import { Card } from '../shared/Card';
import { TrackBadge } from '../shared/Badge';

interface ResultsAnswerReviewProps {
  analysis: Pick<DetailedResultsAnalysis, 'answerReviewAvailable' | 'evaluatedQuestions'>;
}

export const ResultsAnswerReview: React.FC<ResultsAnswerReviewProps> = ({ analysis }) => {
  const [reviewTrackFilter, setReviewTrackFilter] = useState('ALL');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const filteredQuestions = useMemo(
    () =>
      analysis.evaluatedQuestions.filter((item) => {
        if (reviewTrackFilter !== 'ALL' && item.question.track !== reviewTrackFilter) {
          return false;
        }
        if (reviewStatusFilter === 'CORRECT' && !item.isCorrect) {
          return false;
        }
        if (reviewStatusFilter === 'INCORRECT' && item.isCorrect) {
          return false;
        }
        if (reviewSearchQuery.trim()) {
          const query = reviewSearchQuery.toLowerCase();
          const promptMatch = item.question.prompt.toLowerCase().includes(query);
          const explMatch = item.question.explanation?.toLowerCase().includes(query) ?? false;
          if (!promptMatch && !explMatch) return false;
        }
        return true;
      }),
    [analysis.evaluatedQuestions, reviewTrackFilter, reviewStatusFilter, reviewSearchQuery],
  );

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Interactive Answer Review & Study Guide
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect curriculum explanations for all questions to transform your assessment into lasting mastery.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          {analysis.answerReviewAvailable
            ? `Showing ${filteredQuestions.length} of ${analysis.evaluatedQuestions.length} Questions`
            : 'Detailed review unavailable for this attempt'}
        </div>
      </div>

      {!analysis.answerReviewAvailable ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed">
          <strong className="block mb-1">Answer review unavailable.</strong>
          This attempt was submitted before detailed answer tracking was introduced. You can still see your track-level scores and spotlight analysis above, but per-question review is not available for this attempt.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative min-w-[200px] flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search concepts, keywords..."
                value={reviewSearchQuery}
                onChange={(event) => setReviewSearchQuery(event.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {['ALL', 'NT', 'BA', 'SM'].map((track) => (
                <button
                  key={track}
                  onClick={() => setReviewTrackFilter(track)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    reviewTrackFilter === track
                      ? 'bg-white shadow-xs text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {track === 'ALL' ? 'All Tracks' : track}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setReviewStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  reviewStatusFilter === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setReviewStatusFilter('CORRECT')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  reviewStatusFilter === 'CORRECT'
                    ? 'bg-white shadow-xs text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Correct</span>
              </button>
              <button
                onClick={() => setReviewStatusFilter('INCORRECT')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  reviewStatusFilter === 'INCORRECT'
                    ? 'bg-white shadow-xs text-rose-700'
                    : 'text-slate-600'
                }`}
              >
                <XCircle className="w-3 h-3 text-rose-500" />
                <span>Needs Review</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No questions found matching your filter selections. Try clearing your search query.
              </div>
            ) : (
              filteredQuestions.slice(0, 30).map((item) => {
                const isExpanded = expandedQuestionId === item.question.id;
                return (
                  <div
                    key={item.question.id}
                    className={`rounded-2xl border transition-all ${
                      item.isCorrect
                        ? 'border-slate-200 bg-white'
                        : 'border-amber-200 bg-amber-50/20'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : item.question.id)}
                      className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-slate-50/50 rounded-2xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {item.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <TrackBadge code={item.question.track} size="sm" />
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              Level {item.question.level} · {item.question.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.question.prompt}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-slate-400 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                              Your Answer:
                            </div>
                            <div className={`font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {item.studentDisplay}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                              Correct Concept:
                            </div>
                            <div className="font-semibold text-slate-900">{item.correctDisplay}</div>
                          </div>
                        </div>

                        {item.question.explanation && (
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <strong>Curriculum Insight:</strong> {item.question.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {filteredQuestions.length > 30 && (
              <div className="text-center pt-2 text-xs text-slate-500 font-medium">
                Showing top 30 filtered results. Use the search box or level tabs to narrow down specific questions.
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
