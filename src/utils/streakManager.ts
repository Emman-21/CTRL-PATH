/**
 * CTRL+PATH Streak Management System
 * Manages daily student learning streaks using Asia/Manila calendar boundaries.
 */

export interface StreakState {
  streakCount: number;
  lastActivityDate: string | null; // YYYY-MM-DD in Asia/Manila
  lastCelebratedDate: string | null; // YYYY-MM-DD in Asia/Manila
  activeDates: string[]; // List of YYYY-MM-DD
}

export interface StreakCelebrationDetail {
  streakCount: number;
  previousCount: number;
  isMilestone: boolean;
  isFreshStart: boolean;
  headline: string;
  subtext: string;
}

export const STREAK_STORAGE_KEY = 'ctrl_streak_profile_v1';
export const STREAK_MILESTONES = [3, 7, 14, 30] as const;

/**
 * Gets the current date string in Asia/Manila timezone (YYYY-MM-DD)
 */
export const getManilaDateString = (date = new Date()): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Calculates calendar day difference between two YYYY-MM-DD strings in Manila time.
 */
export const getCalendarDayDifference = (earlierStr: string, laterStr: string): number => {
  const [y1, m1, d1] = earlierStr.split('-').map(Number);
  const [y2, m2, d2] = laterStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Loads current streak state from localStorage
 */
export const loadStreakState = (): StreakState => {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      return {
        streakCount: 0,
        lastActivityDate: null,
        lastCelebratedDate: null,
        activeDates: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      streakCount: typeof parsed.streakCount === 'number' ? parsed.streakCount : 0,
      lastActivityDate: typeof parsed.lastActivityDate === 'string' ? parsed.lastActivityDate : null,
      lastCelebratedDate: typeof parsed.lastCelebratedDate === 'string' ? parsed.lastCelebratedDate : null,
      activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
    };
  } catch {
    return {
      streakCount: 0,
      lastActivityDate: null,
      lastCelebratedDate: null,
      activeDates: [],
    };
  }
};

/**
 * Saves streak state to localStorage
 */
export const saveStreakState = (state: StreakState): void => {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful fallback if storage quota exceeded
  }
};

/**
 * Returns effective current streak count.
 * If more than 1 calendar day has passed since last activity, streak is considered broken (0)
 * until next qualifying activity is performed.
 */
export const getEffectiveStreak = (progressPercent = 1): { streakCount: number; isActiveToday: boolean } => {
  if (progressPercent <= 0) {
    return { streakCount: 0, isActiveToday: false };
  }
  const state = loadStreakState();
  if (!state.lastActivityDate || state.streakCount <= 0) {
    return { streakCount: 0, isActiveToday: false };
  }
  const todayStr = getManilaDateString();
  const diff = getCalendarDayDifference(state.lastActivityDate, todayStr);

  if (diff === 0) {
    return { streakCount: state.streakCount, isActiveToday: true };
  } else if (diff === 1) {
    // Yesterday was active, today is still open to extend streak!
    return { streakCount: state.streakCount, isActiveToday: false };
  } else {
    // Missed at least one full calendar day
    return { streakCount: 0, isActiveToday: false };
  }
};

/**
 * Generates copy for the celebration modal
 */
export const getCelebrationCopy = (
  streakCount: number,
  isFreshStart: boolean
): { headline: string; subtext: string; isMilestone: boolean } => {
  const isMilestone = (STREAK_MILESTONES as readonly number[]).includes(streakCount);

  if (isMilestone) {
    if (streakCount === 3) {
      return {
        headline: '3-Day Streak! The Spark Begins!',
        subtext: 'Three days strong! Your momentum is lighting up your academic path.',
        isMilestone: true,
      };
    }
    if (streakCount === 7) {
      return {
        headline: '7-Day Streak! One Whole Week!',
        subtext: 'A full week of dedicated learning at BatStateU! You are unstoppable.',
        isMilestone: true,
      };
    }
    if (streakCount === 14) {
      return {
        headline: '14-Day Streak! Luminary Trailblazer!',
        subtext: 'Two whole weeks! Your consistency is turning into real mastery.',
        isMilestone: true,
      };
    }
    if (streakCount === 30) {
      return {
        headline: '30-Day Streak! Celestial Mastery!',
        subtext: 'An entire month of continuous exploration. Truly inspiring dedication!',
        isMilestone: true,
      };
    }
  }

  if (isFreshStart) {
    return {
      headline: 'Fresh start! Day 1.',
      subtext: 'You showed up today! Every great luminary builds one day at a time.',
      isMilestone: false,
    };
  }

  if (streakCount === 1) {
    return {
      headline: '1-Day Streak! Spark Ignited!',
      subtext: 'Your journey starts today. Explore tomorrow to keep the flame burning!',
      isMilestone: false,
    };
  }

  return {
    headline: `${streakCount}-Day Streak!`,
    subtext: 'You showed up again. Keep the flame burning bright!',
    isMilestone: false,
  };
};

/**
 * Qualifying activity recorder.
 * Call this whenever a student performs a qualifying action:
 * - finishing a quiz chapter
 * - marking a track as explored
 * - completing a learning module
 * - viewing a track detail page
 */
export const recordActivity = (actionDescription?: string): {
  recorded: boolean;
  celebrated: boolean;
  streakCount: number;
} => {
  const todayStr = getManilaDateString();
  const current = loadStreakState();

  // If already celebrated today, do not trigger celebration again today
  if (current.lastCelebratedDate === todayStr) {
    return { recorded: true, celebrated: false, streakCount: current.streakCount };
  }

  let newCount = 1;
  let previousCount = current.streakCount;
  let isFreshStart = false;

  if (current.lastActivityDate) {
    const diff = getCalendarDayDifference(current.lastActivityDate, todayStr);
    if (diff === 0) {
      // Same day, update if needed
      newCount = current.streakCount;
    } else if (diff === 1) {
      // Consecutive calendar day
      newCount = current.streakCount + 1;
    } else {
      // Missed at least one full day -> reset gently to 1
      isFreshStart = current.streakCount > 0;
      previousCount = 0;
      newCount = 1;
    }
  }

  const updatedActiveDates = Array.from(new Set([...current.activeDates, todayStr])).slice(-60);

  const nextState: StreakState = {
    streakCount: newCount,
    lastActivityDate: todayStr,
    lastCelebratedDate: todayStr,
    activeDates: updatedActiveDates,
  };

  saveStreakState(nextState);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ctrl_streak_synced'));
  }

  const copy = getCelebrationCopy(newCount, isFreshStart);

  const detail: StreakCelebrationDetail = {
    streakCount: newCount,
    previousCount,
    isMilestone: copy.isMilestone,
    isFreshStart,
    headline: copy.headline,
    subtext: copy.subtext,
  };

  // Dispatch events for UI reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ctrl_streak_celebrate', { detail }));
    window.dispatchEvent(new CustomEvent('ctrl_streak_updated', { detail: { streakCount: newCount } }));
  }

  return { recorded: true, celebrated: true, streakCount: newCount };
};

/**
 * Returns weekly status (Monday to Sunday) for the current week in Manila
 */
export interface WeekDayStatus {
  dayLetter: string;
  dayName: string;
  dateStr: string;
  isActive: boolean;
  isToday: boolean;
  isPast: boolean;
}

export const getCurrentWeekDays = (activeDates: string[] = []): WeekDayStatus[] => {
  const todayStr = getManilaDateString();
  const [year, month, day] = todayStr.split('-').map(Number);
  const now = new Date(year, month - 1, day);

  // JavaScript getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  const jsDay = now.getDay();
  // We want Monday = 0, ..., Sunday = 6
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;

  const weekDays: WeekDayStatus[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + mondayOffset + i);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');

    const isActive = activeDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    const isPast = getCalendarDayDifference(dateStr, todayStr) > 0;

    weekDays.push({
      dayLetter: dayLetters[i],
      dayName: dayNames[i],
      dateStr,
      isActive,
      isToday,
      isPast,
    });
  }

  return weekDays;
};

export interface StreakContributionDay {
  dateStr: string;
  formattedDate: string;
  isActive: boolean;
  isToday: boolean;
  isFuture: boolean;
  monthIndex: number;
  dayOfMonth: number;
}

export interface StreakContributionWeek {
  weekIndex: number;
  monthLabel: string | null;
  days: StreakContributionDay[];
}

export interface StreakContributionGrid {
  weeks: StreakContributionWeek[];
  activeDaysInRange: number;
  totalActiveDays: number;
  todayStr: string;
}

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const UTC_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const formatUtcDateString = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Builds a GitHub-style contribution grid covering the most recent `weekCount` weeks (Mon-Sun).
 */
export const buildStreakContributionGrid = (
  activeDates: string[] = [],
  weekCount = 26,
  todayStr = getManilaDateString()
): StreakContributionGrid => {
  const safeWeeks = Math.max(1, Math.min(52, Math.floor(weekCount)));
  const activeSet = new Set(activeDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= todayStr));

  const [ty, tm, td] = todayStr.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(ty, tm - 1, td));
  const jsDay = todayUtc.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const currentWeekMondayMs = Date.UTC(ty, tm - 1, td + mondayOffset);
  const startMondayMs = currentWeekMondayMs - (safeWeeks - 1) * 7 * 86_400_000;

  const weeks: StreakContributionWeek[] = [];
  let activeDaysInRange = 0;

  for (let w = 0; w < safeWeeks; w++) {
    const days: StreakContributionDay[] = [];
    let monthLabel: string | null = null;

    for (let row = 0; row < 7; row++) {
      const cellDate = new Date(startMondayMs + (w * 7 + row) * 86_400_000);
      const dateStr = formatUtcDateString(cellDate);
      const isFuture = dateStr > todayStr;
      const isActive = !isFuture && activeSet.has(dateStr);
      if (isActive) activeDaysInRange += 1;

      const monthIndex = cellDate.getUTCMonth();
      const dayOfMonth = cellDate.getUTCDate();

      if (dayOfMonth === 1 && !isFuture) {
        monthLabel = MONTH_SHORT_NAMES[monthIndex];
      }

      days.push({
        dateStr,
        formattedDate: UTC_DATE_FORMATTER.format(cellDate),
        isActive,
        isToday: dateStr === todayStr,
        isFuture,
        monthIndex,
        dayOfMonth,
      });
    }

    if (w === 0 && !monthLabel) {
      // Label the very first column unless the second column already starts a new month cleanly.
      const firstDay = days[0];
      const nextWeekHasFirst = new Date(startMondayMs + 7 * 86_400_000);
      const nextWeekEnds = new Date(startMondayMs + 13 * 86_400_000);
      const nextStartsNewMonth = nextWeekHasFirst.getUTCMonth() !== nextWeekEnds.getUTCMonth() || nextWeekHasFirst.getUTCDate() === 1;
      if (!nextStartsNewMonth || firstDay.dayOfMonth <= 15) {
        monthLabel = MONTH_SHORT_NAMES[firstDay.monthIndex];
      }
    }

    weeks.push({
      weekIndex: w,
      monthLabel,
      days,
    });
  }

  return {
    weeks,
    activeDaysInRange,
    totalActiveDays: activeSet.size,
    todayStr,
  };
};

