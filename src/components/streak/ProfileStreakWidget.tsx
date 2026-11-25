import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Flame } from 'lucide-react';
import {
  buildStreakContributionGrid,
  type StreakContributionDay,
} from '../../utils/streakManager';

export interface ProfileStreakSummaryProps {
  streakCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProfileStreakSummary: React.FC<ProfileStreakSummaryProps> = ({
  streakCount,
  isExpanded,
  onToggle,
}) => {
  const isActive = streakCount > 0;

  return (
    <div className="control-profile-streak-summary">
      {/* Glowing Flame Icon matching StreakCelebrationModal */}
      <div
        className="relative flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] select-none"
        aria-label={`${streakCount}-day learning streak`}
      >
        <div
          className={`absolute inset-1 rounded-full blur-xl pointer-events-none transition-opacity duration-300 ${
            isActive
              ? 'bg-orange-400 dark:bg-orange-500 opacity-65 scale-110'
              : 'bg-orange-400/50 dark:bg-orange-500/40 opacity-35 scale-95'
          }`}
        />

        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full drop-shadow-sm select-none"
          style={{
            filter: isActive
              ? 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.55))'
              : 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.28))',
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="profileBannerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="profileBannerFlameInnerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <path
            d="M50 5 C50 5 62 25 62 38 C62 46 58 52 58 52 C58 52 68 44 68 35 C68 35 84 55 84 72 C84 87 71 96 50 96 C29 96 16 87 16 72 C16 52 35 32 35 32 C35 32 32 45 38 52 C38 52 42 22 50 5 Z"
            fill="url(#profileBannerFlameGrad)"
          />
          <path
            d="M50 35 C50 35 56 46 56 55 C56 61 52 65 52 65 C52 65 60 58 60 52 C60 52 70 66 70 77 C70 86 61 92 50 92 C39 92 30 86 30 77 C30 64 42 50 42 50 C42 50 40 58 44 63 C44 63 45 44 50 35 Z"
            fill="url(#profileBannerFlameInnerGrad)"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 gap-0.5 pointer-events-none">
          <span
            className="text-lg sm:text-xl font-black leading-none tracking-tight"
            style={{ color: '#0f172a' }}
          >
            {streakCount}
          </span>
          <span
            className="text-[8px] font-extrabold uppercase tracking-wider leading-none"
            style={{ color: '#451a03' }}
          >
            {streakCount === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      {/* Toggle Button directly below the streak fire icon */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls="profile-streak-heatmap"
        className="control-profile-streak-toggle"
      >
        <CalendarDays size={14} aria-hidden="true" />
        <span>Streak Activity</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};

export interface ProfileStreakHeatmapBoxProps {
  activeDates: string[];
  streakCount: number;
  isActiveToday: boolean;
}

const WEEKDAY_ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''] as const;

export const ProfileStreakHeatmapBox: React.FC<ProfileStreakHeatmapBoxProps> = ({
  activeDates,
  streakCount,
  isActiveToday,
}) => {
  const grid = useMemo(
    () => buildStreakContributionGrid(activeDates, 38),
    [activeDates]
  );

  const [hoveredDay, setHoveredDay] = useState<StreakContributionDay | null>(null);

  const inspectLabel = hoveredDay
    ? hoveredDay.isFuture
      ? `${hoveredDay.formattedDate} · Upcoming`
      : `${hoveredDay.formattedDate} · ${hoveredDay.isActive ? 'Active learning day' : 'No activity'}`
    : isActiveToday
    ? 'Active today · Tap or hover any square to inspect dates'
    : 'Explore a module or quiz today to light up today’s square';

  return (
    <div
      id="profile-streak-heatmap"
      role="region"
      aria-label="Streak activity contribution box"
      className="control-streak-box"
    >
      {/* Box Header */}
      <div className="control-streak-box-head">
        <div className="control-streak-box-title">
          <span className="control-streak-box-count">
            {grid.activeDaysInRange} {grid.activeDaysInRange === 1 ? 'day' : 'days'} active
          </span>
          <span className="control-streak-box-period">in the last 38 weeks</span>
        </div>
        <div className="control-streak-box-badge">
          <Flame size={13} className="text-orange-500 fill-orange-500 shrink-0" aria-hidden="true" />
          <span>
            {streakCount > 0 ? `${streakCount}-day streak` : 'No active streak yet'}
          </span>
        </div>
      </div>

      {/* GitHub-style Contribution Matrix */}
      <div className="control-streak-grid-scroll">
        <div className="control-streak-grid-inner">
          {/* Month Labels Row */}
          <div className="control-streak-months-row" aria-hidden="true">
            <span className="control-streak-weekday-spacer" />
            <div className="control-streak-months-cols">
              {grid.weeks.map((week) => (
                <span key={week.weekIndex} className="control-streak-month-cell">
                  {week.monthLabel ?? ''}
                </span>
              ))}
            </div>
          </div>

          {/* Weekday Labels + 26x7 Square Grid */}
          <div className="control-streak-matrix-wrap">
            <div className="control-streak-weekdays" aria-hidden="true">
              {WEEKDAY_ROW_LABELS.map((label, idx) => (
                <span key={idx} className="control-streak-weekday-label">
                  {label}
                </span>
              ))}
            </div>

            <div className="control-streak-weeks" role="grid" aria-label="26-week learning activity calendar">
              {grid.weeks.map((week) => (
                <div key={week.weekIndex} className="control-streak-week-col" role="row">
                  {week.days.map((day) => {
                    const statusText = day.isFuture
                      ? 'Upcoming'
                      : day.isActive
                      ? 'Active learning day'
                      : 'No activity';

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={day.isFuture}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onFocus={() => setHoveredDay(day)}
                        onBlur={() => setHoveredDay(null)}
                        onClick={() => setHoveredDay(day)}
                        title={`${day.formattedDate}: ${statusText}`}
                        aria-label={`${day.formattedDate}: ${statusText}`}
                        className={`control-streak-cell${
                          day.isFuture
                            ? ' is-future'
                            : day.isActive
                            ? ' is-active'
                            : ' is-empty'
                        }${day.isToday ? ' is-today' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Box Footer: Hovered/Tapped date + GitHub Less/More Legend */}
      <div className="control-streak-box-foot">
        <span className="control-streak-inspect" aria-live="polite">
          {inspectLabel}
        </span>
        <div className="control-streak-legend" aria-hidden="true">
          <span>Less</span>
          <span className="control-streak-legend-cell is-empty" />
          <span className="control-streak-legend-cell is-mid" />
          <span className="control-streak-legend-cell is-active" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
