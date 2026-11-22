import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { studentProgress } from '../../utils/studentControls';
import {
  summarizeQuizAttemptCard,
  type QuizHistoryTone,
} from '../../utils/quizHistorySummary';
import type { LevelPerformance } from '../../utils/resultsAnalytics';
import type { TrackCode } from '../../types';
import { ControlCard } from './ControlShared';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../shared/PixelArt';
import { LuniSprite } from '../luni/LuniSprite';

function TrackLogo({ track, size = 20 }: { track: TrackCode; size?: number }) {
  if (track === 'NT') return <NtTrackBadge size={size} className="shrink-0 rounded-md" />;
  if (track === 'BA') return <BaTrackBadge size={size} className="shrink-0 rounded-md" />;
  return <SmTrackBadge size={size} className="shrink-0 rounded-md" />;
}

const TONE_RADAR_STYLE: Record<QuizHistoryTone, { fill: string; stroke: string; dot: string }> = {
  nt: {
    fill: 'rgba(37, 99, 235, 0.24)',
    stroke: '#3b82f6',
    dot: '#2563eb',
  },
  ba: {
    fill: 'rgba(124, 58, 237, 0.24)',
    stroke: '#8b5cf6',
    dot: '#7c3aed',
  },
  sm: {
    fill: 'rgba(5, 150, 105, 0.24)',
    stroke: '#10b981',
    dot: '#059669',
  },
  balanced: {
    fill: 'rgba(234, 179, 8, 0.26)',
    stroke: '#eab308',
    dot: '#ca8a04',
  },
};

function radarVertex(cx: number, cy: number, radius: number, index: number, total = 5) {
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  return {
    x: Number((cx + radius * Math.cos(angle)).toFixed(2)),
    y: Number((cy + radius * Math.sin(angle)).toFixed(2)),
  };
}

function CompactLevelRadar({
  levels,
  tone,
  attemptNumber,
}: {
  levels: LevelPerformance[];
  tone: QuizHistoryTone;
  attemptNumber: number;
}) {
  const cx = 105;
  const cy = 90;
  const maxRadius = 52;
  const ringSteps = [0.25, 0.5, 0.75, 1];
  const ordered = [1, 2, 3, 4, 5].map(
    (num) => levels.find((lvl) => lvl.level === num) ?? null,
  );
  const hasLevels = ordered.every((lvl) => lvl !== null);
  const colors = TONE_RADAR_STYLE[tone];

  const dataPoints = hasLevels
    ? ordered.map((lvl, idx) =>
        radarVertex(cx, cy, (Math.max(0, Math.min(100, lvl!.percentage)) / 100) * maxRadius, idx, 5),
      )
    : [];
  const polygonPoints = dataPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');

  const ariaSummary = hasLevels
    ? `Attempt ${attemptNumber} five-level scores: ${ordered
        .map((lvl) => `L${lvl!.level} ${lvl!.percentage}%`)
        .join(', ')}`
    : `Attempt ${attemptNumber} five-level chart unavailable`;

  return (
    <div className="quiz-hist-radar">
      <svg
        viewBox="0 0 210 174"
        className="quiz-hist-radar-svg"
        role="img"
        aria-label={ariaSummary}
      >
        {ringSteps.map((scale) => {
          const pts = [0, 1, 2, 3, 4]
            .map((i) => {
              const p = radarVertex(cx, cy, maxRadius * scale, i, 5);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={scale}
              points={pts}
              fill="none"
              className="quiz-hist-radar-ring"
              strokeWidth={scale === 1 ? 1.2 : 0.9}
              strokeDasharray={scale === 0.5 ? '2.5 2.5' : undefined}
            />
          );
        })}

        {[0, 1, 2, 3, 4].map((idx) => {
          const outer = radarVertex(cx, cy, maxRadius, idx, 5);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              className="quiz-hist-radar-spoke"
              strokeWidth={0.9}
            />
          );
        })}

        {hasLevels ? (
          <>
            <polygon
              points={polygonPoints}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {dataPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill={colors.dot}
                className="quiz-hist-radar-dot"
                strokeWidth={1.25}
              >
                <title>{`L${idx + 1}: ${ordered[idx]!.percentage}%`}</title>
              </circle>
            ))}
          </>
        ) : (
          <text x={cx} y={cy + 3} textAnchor="middle" className="quiz-hist-radar-empty">
            Level data N/A
          </text>
        )}

        {[0, 1, 2, 3, 4].map((idx) => {
          const pos = radarVertex(cx, cy, maxRadius + 15, idx, 5);
          const anchor = idx === 0 ? 'middle' : idx === 1 || idx === 2 ? 'start' : 'end';
          const dy = idx === 0 ? -2 : idx === 2 || idx === 3 ? 6 : 2;
          return (
            <text
              key={idx}
              x={pos.x}
              y={pos.y + dy}
              textAnchor={anchor}
              className="quiz-hist-radar-label"
            >
              {`L${idx + 1}`}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function CtrlQuizHistoryPanel() {
  const { state } = useStudent();
  const progress = studentProgress(state);
  const validAttempts = [...progress.attempts]
    .sort((a, b) => a.attemptNumber - b.attemptNumber)
    .slice(0, 3);
  const summaries = validAttempts.map(summarizeQuizAttemptCard);
  const remainingSlots = Math.max(0, 3 - summaries.length);

  return (
    <ControlCard>
      {summaries.length === 0 ? (
        <div className="community-small-empty">
          <div className="flex justify-center mb-1">
            <LuniSprite pose="curious" size={120} animate glow />
          </div>
          <h3>No submitted CTRL Quiz attempts yet</h3>
          <p className="max-w-md">
            Complete an assessment in CTRL Quiz to compare your track rankings and level shape across attempts.
          </p>
          <Link to="/quiz" className="vault-primary-button quiz-hist-cta">
            Open CTRL Quiz
          </Link>
        </div>
      ) : (
        <div className="quiz-hist-grid" data-testid="ctrl-quiz-history-grid">
          {summaries.map((summary) => (
            <article
              key={summary.attempt.id}
              data-testid={`quiz-history-card-${summary.attemptNumber}`}
              data-tone={summary.tone}
              className={`quiz-hist-card tone-${summary.tone}`}
            >
              <div className="quiz-hist-top">
                <header className="quiz-hist-head">
                  <div className="quiz-hist-logos" aria-hidden="true">
                    {summary.topTracks.map((track) => (
                      <TrackLogo
                        key={track}
                        track={track}
                        size={summary.topTracks.length > 1 ? 22 : 28}
                      />
                    ))}
                  </div>
                  <div className="quiz-hist-title-block">
                    <div className="quiz-hist-title-row">
                      <h3 className="quiz-hist-track-code">{summary.headerLabel}</h3>
                      <span className="quiz-hist-attempt-num">Attempt {summary.attemptNumber}</span>
                    </div>
                    <time className="quiz-hist-date">{summary.dateLabel}</time>
                  </div>
                </header>

                <CompactLevelRadar
                  levels={summary.levels}
                  tone={summary.tone}
                  attemptNumber={summary.attemptNumber}
                />

                <div className="quiz-hist-open-row">
                  <Link
                    to={`/results?attempt=${encodeURIComponent(summary.attempt.id)}`}
                    className="quiz-hist-open"
                    aria-label={`Open results for Attempt ${summary.attemptNumber}`}
                  >
                    <span>Open results</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="quiz-hist-rankings" aria-label={`Attempt ${summary.attemptNumber} track rankings`}>
                {summary.rankedTracks.map((row) => (
                  <div
                    key={row.track}
                    data-testid={`quiz-rank-row-${summary.attemptNumber}-${row.track}`}
                    className={`quiz-hist-rank-row ${
                      row.isTop ? `is-top tone-${summary.tone}` : ''
                    }`}
                  >
                    <span className="quiz-hist-rank-left">
                      <TrackLogo track={row.track} size={18} />
                      <span className="quiz-hist-rank-code">{row.track}</span>
                    </span>
                    <strong className="quiz-hist-rank-pct">{row.score}%</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}

          {Array.from({ length: remainingSlots }, (_, idx) => {
            const slotNumber = summaries.length + idx + 1;
            return (
              <article key={`slot-${slotNumber}`} className="quiz-hist-card is-empty-slot">
                <div className="quiz-hist-empty-inner">
                  <span className="quiz-hist-empty-num">Attempt {slotNumber}</span>
                  <p>This attempt slot is available whenever you are ready to retake or explore further.</p>
                  <Link to="/quiz" className="community-text-link quiz-hist-empty-link">
                    <PlusCircle size={14} aria-hidden="true" />
                    <span>Start Attempt {slotNumber}</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {summaries.length > 0 && (
        <div className="control-actions">
          {progress.fullyAnswered >= 2 && (
            <Link className="community-secondary-button" to="/results#attempt-comparison">
              Compare completed attempts
            </Link>
          )}
          <Link className="community-text-link" to="/quiz">
            {summaries.length >= 3 ? 'Review assessment availability' : 'Take another attempt'}
          </Link>
        </div>
      )}
    </ControlCard>
  );
}
