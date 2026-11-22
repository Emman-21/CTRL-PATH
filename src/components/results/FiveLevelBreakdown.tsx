import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import type { TrackCode } from '../../types';
import {
  type LevelPerformance,
  type ScoreBand,
  getFiveLevelInsightSegments,
  getScoreBand,
} from '../../utils/resultsAnalytics';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';

interface FiveLevelBreakdownProps {
  levelPerformances: LevelPerformance[];
  onReviewLevel?: (level: number) => void;
}

const SHORT_RADAR_NAMES: Record<number, string> = {
  1: 'L1 Fundamentals',
  2: 'L2 Applied',
  3: 'L3 Terminology',
  4: 'L4 Processes',
  5: 'L5 Mastery',
};

const TRACK_FULL_NAMES: Record<TrackCode, string> = {
  NT: 'Networking Technology',
  BA: 'Business Analytics',
  SM: 'Service Management',
};

const TRACK_CHIP_STYLES: Record<TrackCode, string> = {
  NT: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-[#111e3b] dark:text-blue-300 dark:border-blue-800/70',
  BA: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-[#1e1338] dark:text-[#c4b5fd] dark:border-purple-800/70',
  SM: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-[#0c2419] dark:text-emerald-300 dark:border-emerald-800/70',
};

const SCORE_BAND_CONFIG: Record<
  ScoreBand,
  {
    barVariant: 'score-high' | 'score-mid' | 'score-low';
    textClass: string;
    badgeBgClass: string;
    radarFillClass: string;
    label: string;
  }
> = {
  high: {
    barVariant: 'score-high',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    badgeBgClass: 'bg-emerald-600 text-white',
    radarFillClass: 'fill-emerald-600 dark:fill-emerald-400',
    label: 'Strong',
  },
  moderate: {
    barVariant: 'score-mid',
    textClass: 'text-blue-700 dark:text-blue-300',
    badgeBgClass: 'bg-blue-600 text-white',
    radarFillClass: 'fill-blue-600 dark:fill-sky-300',
    label: 'Moderate',
  },
  low: {
    barVariant: 'score-low',
    textClass: 'text-orange-700 dark:text-orange-300',
    badgeBgClass: 'bg-orange-500 text-white',
    radarFillClass: 'fill-orange-600 dark:fill-orange-400',
    label: 'Needs Review',
  },
};

function radarPoint(cx: number, cy: number, radius: number, index: number, total = 5) {
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  return {
    x: Number((cx + radius * Math.cos(angle)).toFixed(2)),
    y: Number((cy + radius * Math.sin(angle)).toFixed(2)),
  };
}

export const FiveLevelBreakdown: React.FC<FiveLevelBreakdownProps> = ({
  levelPerformances,
  onReviewLevel,
}) => {
  const insightSegments = getFiveLevelInsightSegments(levelPerformances);

  const orderedLevels = [1, 2, 3, 4, 5]
    .map((lvlNum) => levelPerformances.find((l) => l.level === lvlNum))
    .filter((l): l is LevelPerformance => Boolean(l));

  const averagePct =
    orderedLevels.length > 0
      ? Math.round(orderedLevels.reduce((sum, l) => sum + l.percentage, 0) / orderedLevels.length)
      : 0;

  const cx = 230;
  const cy = 152;
  const maxRadius = 82;
  const ringSteps = [0.25, 0.5, 0.75, 1];

  const dataPoints = orderedLevels.map((lvl, idx) =>
    radarPoint(cx, cy, (Math.max(0, Math.min(100, lvl.percentage)) / 100) * maxRadius, idx, 5)
  );
  const polygonPoints = dataPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');

  return (
    <Card id="five-level-breakdown">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Five-Level Assessment Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review how your understanding evolved across different question formats and cognitive tiers.
          </p>
        </div>
        {orderedLevels.length > 0 && (
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            5-Level Avg: <span className="font-extrabold text-slate-900 dark:text-slate-100">{averagePct}%</span>
          </div>
        )}
      </div>

      {orderedLevels.length === 0 ? (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-[#241c08] border border-amber-200 dark:border-amber-800/60 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="block mb-1">Level breakdown unavailable.</strong>
          This attempt was submitted before detailed answer tracking was introduced. Only track-level scores and the spotlight analysis above are available for this attempt.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Radar Chart + One-Sentence Insight Top Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,390px)_1fr] gap-6 items-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/80 dark:bg-[#10192d] border border-slate-200/80 dark:border-slate-800 p-3">
              <svg
                viewBox="0 0 460 300"
                className="w-full max-w-[380px] h-auto"
                role="img"
                aria-label="Five-level assessment performance radar chart"
                data-testid="five-level-radar"
              >
                {/* Concentric guide pentagons */}
                {ringSteps.map((scale) => {
                  const pts = [0, 1, 2, 3, 4]
                    .map((i) => {
                      const p = radarPoint(cx, cy, maxRadius * scale, i, 5);
                      return `${p.x},${p.y}`;
                    })
                    .join(' ');
                  const isHalf = scale === 0.5;
                  return (
                    <polygon
                      key={scale}
                      points={pts}
                      fill="none"
                      className={
                        isHalf
                          ? 'stroke-orange-400/70 dark:stroke-orange-400/50'
                          : 'stroke-slate-300/80 dark:stroke-slate-700/80'
                      }
                      strokeWidth={isHalf ? 1.25 : 1}
                      strokeDasharray={isHalf ? '3 3' : undefined}
                    />
                  );
                })}

                {/* Axis spokes */}
                {[0, 1, 2, 3, 4].map((idx) => {
                  const outer = radarPoint(cx, cy, maxRadius, idx, 5);
                  return (
                    <line
                      key={idx}
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      className="stroke-slate-300/70 dark:stroke-slate-700/70"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Ring threshold labels */}
                <text
                  x={cx + 4}
                  y={cy - maxRadius * 0.5 - 3}
                  className="fill-orange-600 dark:fill-orange-300 text-[9px] font-bold tabular-nums"
                >
                  50%
                </text>
                <text
                  x={cx + 4}
                  y={cy - maxRadius + 10}
                  className="fill-slate-400 dark:fill-slate-500 text-[9px] font-semibold tabular-nums"
                >
                  100%
                </text>

                {/* Filled score polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(37, 99, 235, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth={2.25}
                  strokeLinejoin="round"
                  data-testid="radar-data-polygon"
                />

                {/* Vertex markers colored by score tier */}
                {orderedLevels.map((lvl, idx) => {
                  const pt = dataPoints[idx];
                  const band = getScoreBand(lvl.percentage);
                  const cfg = SCORE_BAND_CONFIG[band];
                  return (
                    <circle
                      key={lvl.level}
                      cx={pt.x}
                      cy={pt.y}
                      r={4.75}
                      className={`${cfg.radarFillClass} stroke-white dark:stroke-[#0f172a]`}
                      strokeWidth={1.75}
                    />
                  );
                })}

                {/* Outer axis labels */}
                {orderedLevels.map((lvl, idx) => {
                  const pos = radarPoint(cx, cy, maxRadius + 22, idx, 5);
                  const textAnchor =
                    idx === 0 ? 'middle' : idx === 1 || idx === 2 ? 'start' : 'end';
                  const yAdjust = idx === 0 ? -8 : idx === 2 || idx === 3 ? 10 : 2;
                  const band = getScoreBand(lvl.percentage);
                  return (
                    <text
                      key={lvl.level}
                      x={pos.x}
                      y={pos.y + yAdjust}
                      textAnchor={textAnchor}
                      className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200 tabular-nums"
                    >
                      <tspan>{SHORT_RADAR_NAMES[lvl.level] ?? `Level ${lvl.level}`}</tspan>
                      <tspan
                        x={pos.x}
                        dy="13"
                        className={`text-[11px] font-extrabold ${SCORE_BAND_CONFIG[band].radarFillClass}`}
                      >
                        {lvl.percentage}%
                      </tspan>
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                  Five-Level Pattern Insight
                </div>
                <p
                  data-testid="five-level-insight"
                  className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed"
                >
                  {insightSegments.map((segment, idx) =>
                    segment.bold ? (
                      <strong key={idx} className="font-extrabold text-slate-950 dark:text-white">
                        {segment.text}
                      </strong>
                    ) : (
                      <React.Fragment key={idx}>{segment.text}</React.Fragment>
                    ),
                  )}
                </p>
              </div>

              {/* Explicit color + label legend */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" aria-hidden="true" />
                  <span>Strong (&ge;75%)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-blue-600 shrink-0" aria-hidden="true" />
                  <span>Moderate (50–74%)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-orange-500 shrink-0" aria-hidden="true" />
                  <span>Below 50% (&lt;50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed CSS Grid Five-Level Rows */}
          <div>
            <div
              className="hidden xl:grid xl:grid-cols-[260px_minmax(150px,1fr)_136px_142px] xl:gap-3 xl:items-center px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            >
              <div>Level &amp; Format</div>
              <div>Score &amp; Mastery Bar</div>
              <div>Track Signals</div>
              <div className="text-right">Action</div>
            </div>

            <div className="space-y-3" data-testid="five-level-grid">
              {orderedLevels.map((lvl) => {
                const band = getScoreBand(lvl.percentage);
                const bandCfg = SCORE_BAND_CONFIG[band];
                const needsReview = lvl.percentage < 50;

                return (
                  <div
                    key={lvl.level}
                    data-testid={`level-row-${lvl.level}`}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#131d33] grid grid-cols-1 md:grid-cols-[240px_1fr] xl:grid-cols-[260px_minmax(150px,1fr)_136px_142px] items-center gap-3"
                  >
                    {/* Column 1: Level & Format */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className={`w-6 h-6 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 ${bandCfg.badgeBgClass}`}
                        >
                          {lvl.level}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                          {lvl.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                        Format: {lvl.questionType}
                      </div>
                    </div>

                    {/* Column 2: Aligned Score & Progress Bar */}
                    <div className="min-w-0 w-full" data-testid={`level-bar-col-${lvl.level}`}>
                      <div className="flex items-center justify-between text-xs mb-1.5 font-semibold gap-2">
                        <span className="text-slate-600 dark:text-slate-300 tabular-nums">
                          {lvl.correct} of {lvl.total} correct
                        </span>
                        <span className={`font-black tabular-nums ${bandCfg.textClass}`}>
                          {lvl.percentage}% · {bandCfg.label}
                        </span>
                      </div>
                      <ProgressBar value={lvl.percentage} variant={bandCfg.barVariant} size="sm" />
                    </div>

                    {/* Column 3: Strongest In & Weakest In Chips */}
                    <div className="flex flex-wrap xl:flex-col gap-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          Strongest In
                        </span>
                        <span
                          title={`Strongest in ${TRACK_FULL_NAMES[lvl.leadingTrack]}`}
                          aria-label={`Strongest in ${TRACK_FULL_NAMES[lvl.leadingTrack]}`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-extrabold whitespace-nowrap ${TRACK_CHIP_STYLES[lvl.leadingTrack]}`}
                        >
                          {lvl.leadingTrack}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          Weakest In
                        </span>
                        <span
                          title={`Weakest in ${TRACK_FULL_NAMES[lvl.weakestTrack]}`}
                          aria-label={`Weakest in ${TRACK_FULL_NAMES[lvl.weakestTrack]}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-extrabold whitespace-nowrap bg-amber-50/90 text-amber-800 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70"
                        >
                          {lvl.weakestTrack}
                        </span>
                      </div>
                    </div>

                    {/* Column 4: Conditional Review Action */}
                    <div className="flex md:justify-end xl:justify-end">
                      {needsReview ? (
                        <button
                          type="button"
                          onClick={() => onReviewLevel?.(lvl.level)}
                          aria-label={`Review this level: ${lvl.name}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 dark:text-orange-300 dark:border-orange-800/70 transition-colors cursor-pointer"
                        >
                          <span>Review this level</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden xl:inline">
                          On track
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
