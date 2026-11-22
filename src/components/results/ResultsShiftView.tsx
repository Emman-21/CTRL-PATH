import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  GitCompare,
  History,
  Minus,
  RotateCcw,
} from 'lucide-react';
import type { QuizAttempt, TrackCode } from '../../types';
import type { AttemptComparison } from '../../types/achievements';
import { useStudent } from '../../context/StudentContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import {
  computeAttemptShift,
  getAttemptTopTrack,
  sortAttemptsChronologically,
} from '../../utils/attemptShiftAnalytics';
import { validSubmittedAttempt } from '../../utils/studentControls';

export interface ResultsShiftViewContentProps {
  attempts: QuizAttempt[];
  selectedAttemptId?: string;
  onSelectAttempt: (attemptId: string) => void;
  attemptComparisons?: AttemptComparison[];
  onSaveReflection?: (
    ids: [string, string],
    reflection: { reasons: string[]; note: string },
  ) => void;
  onOpenPathCompare: () => void;
  onOpenRetake?: () => void;
  reducedMotion?: boolean;
}

const SCALE_TICKS = [0, 25, 50, 75, 100] as const;

const TRACK_STYLES: Record<
  TrackCode,
  {
    text: string;
    barLater: string;
  }
> = {
  NT: {
    text: 'text-blue-600 dark:text-blue-400',
    barLater: 'bg-blue-600 dark:bg-blue-500',
  },
  BA: {
    text: 'text-violet-600 dark:text-violet-400',
    barLater: 'bg-violet-600 dark:bg-violet-500',
  },
  SM: {
    text: 'text-emerald-600 dark:text-emerald-400',
    barLater: 'bg-emerald-600 dark:bg-emerald-500',
  },
};

function renderTrendArrowSvg({
  track,
  width,
  height,
  x1,
  x2,
  earlierScore,
  laterScore,
  delta,
  className,
}: {
  track: TrackCode;
  width: number;
  height: number;
  x1: number;
  x2: number;
  earlierScore: number;
  laterScore: number;
  delta: number;
  className: string;
}) {
  const y1 = earlierScore === 0 ? height - 2 : height * (1 - earlierScore / 100);
  const y2 = laterScore === 0 ? height - 2 : height * (1 - laterScore / 100);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const isHigher = delta > 0;
  const isLower = delta < 0;
  const colorClass = isHigher
    ? 'text-green-400 dark:text-green-300'
    : isLower
    ? 'text-red-500 dark:text-red-400'
    : 'text-slate-400/75 dark:text-slate-500/75';
  const trendState = isHigher ? 'up' : isLower ? 'down' : 'flat';

  const headLen = 7.5;
  const headWidth = 4.2;
  const baseX = x2 - ux * headLen;
  const baseY = y2 - uy * headLen;
  const lineEndX = isHigher || isLower ? x2 - ux * (headLen - 1.5) : x2;
  const lineEndY = isHigher || isLower ? y2 - uy * (headLen - 1.5) : y2;

  const arrowPoints = `${x2.toFixed(1)},${y2.toFixed(1)} ${(baseX + px * headWidth).toFixed(1)},${(baseY + py * headWidth).toFixed(1)} ${(baseX - px * headWidth).toFixed(1)},${(baseY - py * headWidth).toFixed(1)}`;

  return (
    <svg
      aria-hidden="true"
      data-testid={`bar-trend-${track}`}
      data-trend={trendState}
      viewBox={`0 0 ${width} ${height}`}
      className={`pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 overflow-visible z-20 ${colorClass} ${className}`}
    >
      <circle cx={x1} cy={y1} r={2.5} fill="currentColor" />
      <line
        x1={x1}
        y1={y1}
        x2={lineEndX}
        y2={lineEndY}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={isHigher || isLower ? undefined : '3 3'}
      />
      {(isHigher || isLower) && (
        <polygon points={arrowPoints} fill="currentColor" />
      )}
    </svg>
  );
}

export const ResultsShiftViewContent: React.FC<ResultsShiftViewContentProps> = ({
  attempts,
  selectedAttemptId,
  onSelectAttempt,
  onOpenPathCompare,
  onOpenRetake,
  reducedMotion = false,
}) => {
  const orderedAttempts = useMemo(
    () => sortAttemptsChronologically(attempts.filter(validSubmittedAttempt)),
    [attempts],
  );

  const firstAttempt =
    orderedAttempts.length >= 2 ? orderedAttempts[orderedAttempts.length - 2] : undefined;
  const secondAttempt =
    orderedAttempts.length >= 2 ? orderedAttempts[orderedAttempts.length - 1] : undefined;

  const shift = useMemo(() => {
    if (!firstAttempt || !secondAttempt || firstAttempt.id === secondAttempt.id) return null;
    return computeAttemptShift(firstAttempt, secondAttempt);
  }, [firstAttempt, secondAttempt]);

  if (orderedAttempts.length < 2 || !shift) {
    return null;
  }

  const isMaxAttemptsReached = orderedAttempts.length >= 3;
  const nextRetakeLabel = isMaxAttemptsReached
    ? 'Retake (3/3)'
    : `Retake (${orderedAttempts.length + 1}/3)`;

  const motionClass = reducedMotion
    ? ''
    : 'motion-safe:transition-all motion-safe:duration-200';

  const focusRingClass =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-sky-400';

  return (
    <Card id="attempt-comparison" className="scroll-mt-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
            <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight">
              How your results have shifted
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Compare any two completed attempts side by side. Scores are helpful signals, and your BSIT pathway is always your choice.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
          {orderedAttempts.length} of 3 attempts completed
        </div>
      </div>

      {/* Biggest Gain & Drop */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Biggest gain:
                </span>
                {shift.biggestGain ? (
                  <span
                    data-testid="shift-biggest-gain"
                    className={`inline-flex items-center gap-1 font-extrabold tabular-nums ${TRACK_STYLES[shift.biggestGain.track].text}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {shift.biggestGain.track} · {shift.biggestGain.name} ({shift.biggestGain.deltaLabel})
                    </span>
                  </span>
                ) : (
                  <span
                    data-testid="shift-biggest-gain"
                    className="font-semibold text-slate-600 dark:text-slate-300"
                  >
                    No increase across tracks
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Biggest drop:
                </span>
                {shift.biggestDrop ? (
                  <span
                    data-testid="shift-biggest-drop"
                    className={`inline-flex items-center gap-1 font-extrabold tabular-nums ${TRACK_STYLES[shift.biggestDrop.track].text}`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {shift.biggestDrop.track} · {shift.biggestDrop.name} ({shift.biggestDrop.deltaLabel})
                    </span>
                  </span>
                ) : (
                  <span
                    data-testid="shift-biggest-drop"
                    className="font-semibold text-slate-600 dark:text-slate-300"
                  >
                    No drops across tracks
                  </span>
                )}
              </div>
      </div>

          {/* Grouped Vertical Bar Chart (Percentage on Y-axis, NT/BA/SM on X-axis) */}
          <section
            aria-label="Grouped vertical bar chart comparing earlier and later scores by track"
            data-testid="attempt-bar-chart"
            className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Score shift by track (0%–100%)
            </div>

            <div className="pt-5 pb-1">
              <div className="flex items-stretch">
                {/* Y-axis percentage labels (vertical: 100% top to 0% bottom) */}
                <div
                  aria-hidden="true"
                  className="relative w-9 sm:w-12 h-[220px] sm:h-[250px] shrink-0 select-none"
                >
                  {SCALE_TICKS.map((tick) => (
                    <span
                      key={tick}
                      className="absolute right-1.5 sm:right-2.5 -translate-y-1/2 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums"
                      style={{ top: `${100 - tick}%` }}
                    >
                      {tick}%
                    </span>
                  ))}
                </div>

                {/* Plot Area + Bottom X-axis Track Labels */}
                <div className="flex-1 min-w-0">
                  <div className="relative h-[220px] sm:h-[250px] border-l border-b border-slate-300 dark:border-slate-700">
                    {/* Horizontal percentage gridlines */}
                    {SCALE_TICKS.filter((tick) => tick > 0).map((tick) => (
                      <div
                        key={tick}
                        aria-hidden="true"
                        className="absolute inset-x-0 border-t border-dashed border-slate-200 dark:border-slate-800/90"
                        style={{ top: `${100 - tick}%` }}
                      />
                    ))}

                    {/* Grouped Bars per Track (NT, BA, SM) */}
                    <div className="relative z-10 grid grid-cols-3 h-full items-end gap-2.5 sm:gap-6 px-1 sm:px-6">
                      {shift.rows.map((row) => {
                        const style = TRACK_STYLES[row.track];
                        return (
                          <div
                            key={`bars-${row.track}`}
                            data-testid={`bar-group-${row.track}`}
                            className="relative h-full flex items-end justify-center gap-1 sm:gap-3"
                          >
                            {/* Earlier Attempt Bar */}
                            <div className="w-9 sm:w-14 h-full flex items-end justify-center">
                              <div
                                data-testid={`bar-earlier-${row.track}`}
                                title={`Attempt ${shift.earlier.attemptNumber} · ${row.track}: ${row.earlierScore}%`}
                                className={`relative w-7 sm:w-11 rounded-t-lg flex justify-center shadow-xs ${style.barLater} ${motionClass}`}
                                style={{
                                  height: row.earlierScore === 0 ? '2px' : `${row.earlierScore}%`,
                                }}
                              >
                                <span className="absolute bottom-full mb-1 px-0.5 rounded bg-[#ffffff]/90 dark:bg-[#0f172a]/90 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap pointer-events-none">
                                  {row.earlierScore}%
                                </span>
                              </div>
                            </div>

                            {/* Later Attempt Bar */}
                            <div className="w-9 sm:w-14 h-full flex items-end justify-center">
                              <div
                                data-testid={`bar-later-${row.track}`}
                                title={`Attempt ${shift.later.attemptNumber} · ${row.track}: ${row.laterScore}%`}
                                className={`relative w-7 sm:w-11 rounded-t-lg flex justify-center shadow-xs ${style.barLater} ${motionClass}`}
                                style={{
                                  height: row.laterScore === 0 ? '2px' : `${row.laterScore}%`,
                                }}
                              >
                                <span
                                  className={`absolute bottom-full mb-1 px-0.5 rounded bg-[#ffffff]/90 dark:bg-[#0f172a]/90 text-[10px] sm:text-[11px] font-extrabold tabular-nums whitespace-nowrap pointer-events-none ${style.text}`}
                                >
                                  {row.laterScore}%
                                </span>
                              </div>
                            </div>

                            {/* Directional shift line/arrow between Attempt 1 and Attempt 2 */}
                            {renderTrendArrowSvg({
                              track: row.track,
                              width: 76,
                              height: 220,
                              x1: 31,
                              x2: 45,
                              earlierScore: row.earlierScore,
                              laterScore: row.laterScore,
                              delta: row.delta,
                              className: 'w-[76px] h-[220px] sm:hidden',
                            })}
                            {renderTrendArrowSvg({
                              track: row.track,
                              width: 124,
                              height: 250,
                              x1: 46,
                              x2: 78,
                              earlierScore: row.earlierScore,
                              laterScore: row.laterScore,
                              delta: row.delta,
                              className: 'w-[124px] h-[250px] hidden sm:block',
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis bottom Attempt labels + Track columns (NT, BA, SM) */}
                  <div className="grid grid-cols-3 pt-2 gap-2.5 sm:gap-6 px-1 sm:px-6">
                    {shift.rows.map((row) => {
                      const style = TRACK_STYLES[row.track];
                      return (
                        <div
                          key={`xaxis-${row.track}`}
                          data-testid={`bar-track-${row.track}`}
                          aria-label={`${row.name}: Attempt ${shift.earlier.attemptNumber} ${row.earlierScore}%, Attempt ${shift.later.attemptNumber} ${row.laterScore}%, change ${row.deltaLabel}`}
                          className="flex flex-col items-center text-center min-w-0"
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-2">
                            <span className="w-9 sm:w-14 text-center text-[8px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap tracking-tight">
                              Attempt {shift.earlier.attemptNumber}
                            </span>
                            <span className="w-9 sm:w-14 text-center text-[8px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums whitespace-nowrap tracking-tight">
                              Attempt {shift.later.attemptNumber}
                            </span>
                          </div>
                          <span className={`text-xs sm:text-sm font-extrabold tracking-tight ${style.text}`}>
                            {row.track}
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                            {row.name}
                          </span>
                          <span
                            data-testid={`bar-delta-${row.track}`}
                            className={`mt-1 inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-extrabold tabular-nums whitespace-nowrap ${
                              row.delta === 0
                                ? 'text-slate-500 dark:text-slate-400'
                                : style.text
                            }`}
                          >
                            {row.delta > 0 ? (
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            ) : row.delta < 0 ? (
                              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            ) : (
                              <Minus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            )}
                            <span>{row.deltaLabel}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* Compact Attempt History */}
      <section
        aria-label="Compact attempt history"
        className="pt-5 border-t border-slate-200/80 dark:border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Attempt history
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {orderedAttempts.length} of 3 completed
          </span>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
          {orderedAttempts.map((attempt) => {
            const top = getAttemptTopTrack(attempt);
            const primaryTrack = top.topTracks[0];
            const isActiveView = selectedAttemptId === attempt.id;
            const roleNote =
              shift?.earlier.id === attempt.id
                ? 'Earlier'
                : shift?.later.id === attempt.id
                ? 'Later'
                : null;

            return (
              <div
                key={attempt.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                    Attempt #{attempt.attemptNumber}
                  </span>
                  {roleNote && (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-sky-300">
                      ({roleNote})
                    </span>
                  )}
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 tabular-nums">
                    {attempt.date}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                    {attempt.durationMinutes || 25} min
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span
                    className={`font-bold tabular-nums whitespace-nowrap ${
                      top.isTie
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : TRACK_STYLES[primaryTrack].text
                    }`}
                  >
                    Top: {top.label} ({top.topScore}%)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAttempt(attempt.id)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${motionClass} ${focusRingClass} ${
                    isActiveView
                      ? 'text-slate-900 dark:text-slate-100 bg-[#f1f5f9] dark:bg-[#1a2744]'
                      : 'text-blue-600 dark:text-blue-400 hover:underline'
                  }`}
                >
                  {isActiveView ? 'Viewing results' : 'Inspect'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Actions: Path Compare & Retake (3/3) */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Ready to explore curriculum subjects or reflect again? {isMaxAttemptsReached ? 'You have completed all 3 of 3 quiz attempts.' : 'You still have an assessment retake available.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenPathCompare}
            icon={<GitCompare className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
            className={`min-h-[44px] whitespace-nowrap ${focusRingClass}`}
          >
            Path Compare
          </Button>

          {isMaxAttemptsReached ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled
              icon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
              className="min-h-[44px] whitespace-nowrap opacity-60 cursor-not-allowed"
              title="All 3 quiz attempts have been completed"
            >
              {nextRetakeLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onOpenRetake}
              icon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
              className={`min-h-[44px] whitespace-nowrap shrink-0 ${focusRingClass}`}
            >
              {nextRetakeLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

interface ResultsShiftViewProps {
  selectedAttemptId?: string;
  onSelectAttempt: (attemptId: string) => void;
  onOpenPathCompare: () => void;
}

export const ResultsShiftView: React.FC<ResultsShiftViewProps> = ({
  selectedAttemptId,
  onSelectAttempt,
  onOpenPathCompare,
}) => {
  const { state } = useStudent();
  const navigate = useNavigate();

  return (
    <ResultsShiftViewContent
      attempts={state.quizAttempts}
      selectedAttemptId={selectedAttemptId}
      onSelectAttempt={onSelectAttempt}
      onOpenPathCompare={onOpenPathCompare}
      onOpenRetake={() => navigate('/quiz')}
      reducedMotion={state.preferences.reducedMotion}
    />
  );
};
