import type { QuizAttempt, TrackCode } from '../types';

export interface ShiftTrackMeta {
  code: TrackCode;
  name: string;
  shortLabel: string;
  dotStrokeLight: string;
  dotFillLight: string;
  textClass: string;
  bgBarClass: string;
  strokeHex: string;
}

export const SHIFT_TRACK_META: Record<TrackCode, ShiftTrackMeta> = {
  NT: {
    code: 'NT',
    name: 'Networking Technology',
    shortLabel: 'NT',
    dotStrokeLight: '#2563eb',
    dotFillLight: '#2563eb',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgBarClass: 'bg-blue-600 dark:bg-blue-400',
    strokeHex: '#2563eb',
  },
  BA: {
    code: 'BA',
    name: 'Business Analytics',
    shortLabel: 'BA',
    dotStrokeLight: '#7c3aed',
    dotFillLight: '#7c3aed',
    textClass: 'text-violet-600 dark:text-violet-400',
    bgBarClass: 'bg-violet-600 dark:bg-violet-400',
    strokeHex: '#7c3aed',
  },
  SM: {
    code: 'SM',
    name: 'Service Management',
    shortLabel: 'SM',
    dotStrokeLight: '#059669',
    dotFillLight: '#059669',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgBarClass: 'bg-emerald-600 dark:bg-emerald-400',
    strokeHex: '#059669',
  },
};

export const SHIFT_REFLECTION_REASONS = [
  'Reviewed track modules',
  'Felt more confident / less rushed',
  'My interests shifted',
  'Just exploring different options',
] as const;

export const MAX_SHIFT_NOTE_LENGTH = 500;

export interface TopTrackSummary {
  topTracks: TrackCode[];
  label: string;
  topScore: number;
  isTie: boolean;
}

export interface AttemptTrackShift {
  track: TrackCode;
  name: string;
  earlierScore: number;
  laterScore: number;
  delta: number;
  deltaLabel: string;
}

export interface AttemptShiftSummary {
  earlier: QuizAttempt;
  later: QuizAttempt;
  insightSentence: string;
  earlierTop: TopTrackSummary;
  laterTop: TopTrackSummary;
  rows: AttemptTrackShift[];
  biggestGain: AttemptTrackShift | null;
  biggestDrop: AttemptTrackShift | null;
}

function scoreForTrack(attempt: QuizAttempt, track: TrackCode): number {
  const raw =
    track === 'NT'
      ? attempt.ntScore
      : track === 'BA'
      ? attempt.baScore
      : attempt.smScore;
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(raw) ? raw : 0)));
}

export function formatDeltaPoints(delta: number): string {
  if (delta > 0) return `+${delta} pts`;
  if (delta < 0) return `${delta} pts`;
  return '0 pts';
}

export function getAttemptTopTrack(attempt: QuizAttempt): TopTrackSummary {
  const scores: { track: TrackCode; score: number }[] = (['NT', 'BA', 'SM'] as const).map(
    (track) => ({
      track,
      score: scoreForTrack(attempt, track),
    }),
  );
  const topScore = Math.max(...scores.map((item) => item.score));
  const topTracks = scores.filter((item) => item.score === topScore).map((item) => item.track);
  const isTie = topTracks.length > 1;
  const label = isTie ? `${topTracks.join(' / ')} (tie)` : topTracks[0];

  return {
    topTracks,
    label,
    topScore,
    isTie,
  };
}

export function sortAttemptsChronologically(attempts: QuizAttempt[]): QuizAttempt[] {
  return [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
}

export function getChronologicalPair(
  first: QuizAttempt,
  second: QuizAttempt,
): { earlier: QuizAttempt; later: QuizAttempt } {
  return first.attemptNumber <= second.attemptNumber
    ? { earlier: first, later: second }
    : { earlier: second, later: first };
}

export function computeAttemptShift(
  first: QuizAttempt,
  second: QuizAttempt,
): AttemptShiftSummary {
  const { earlier, later } = getChronologicalPair(first, second);
  const earlierTop = getAttemptTopTrack(earlier);
  const laterTop = getAttemptTopTrack(later);

  const rows: AttemptTrackShift[] = (['NT', 'BA', 'SM'] as const).map((track) => {
    const earlierScore = scoreForTrack(earlier, track);
    const laterScore = scoreForTrack(later, track);
    const delta = laterScore - earlierScore;
    return {
      track,
      name: SHIFT_TRACK_META[track].name,
      earlierScore,
      laterScore,
      delta,
      deltaLabel: formatDeltaPoints(delta),
    };
  });

  const gains = rows
    .filter((row) => row.delta > 0)
    .sort((a, b) => b.delta - a.delta);
  const drops = rows
    .filter((row) => row.delta < 0)
    .sort((a, b) => a.delta - b.delta);

  const biggestGain = gains[0] ?? null;
  const biggestDrop = drops[0] ?? null;

  const insightSentence = buildShiftInsightSentence(
    earlier,
    later,
    earlierTop,
    laterTop,
    rows,
  );

  return {
    earlier,
    later,
    insightSentence,
    earlierTop,
    laterTop,
    rows,
    biggestGain,
    biggestDrop,
  };
}

function buildShiftInsightSentence(
  earlier: QuizAttempt,
  later: QuizAttempt,
  earlierTop: TopTrackSummary,
  laterTop: TopTrackSummary,
  rows: AttemptTrackShift[],
): string {
  const spanLabel = `between Attempt ${earlier.attemptNumber} and Attempt ${later.attemptNumber}`;
  const allUnchanged = rows.every((row) => row.delta === 0);

  if (allUnchanged) {
    return `Your scores held steady ${spanLabel}, with ${laterTop.label} leading at ${laterTop.topScore}%.`;
  }

  if (!earlierTop.isTie && !laterTop.isTie && earlierTop.topTracks[0] !== laterTop.topTracks[0]) {
    return `Your top track moved from ${earlierTop.topTracks[0]} to ${laterTop.topTracks[0]} ${spanLabel}.`;
  }

  if (!earlierTop.isTie && !laterTop.isTie && earlierTop.topTracks[0] === laterTop.topTracks[0]) {
    const leadRow = rows.find((row) => row.track === laterTop.topTracks[0])!;
    if (leadRow.delta > 0) {
      return `Your top track stayed ${laterTop.topTracks[0]} and rose from ${leadRow.earlierScore}% to ${leadRow.laterScore}% ${spanLabel}.`;
    }
    return `Your top track stayed ${laterTop.topTracks[0]} (${leadRow.laterScore}%) ${spanLabel} while your scores across tracks rebalanced.`;
  }

  return `Your top alignment shifted from ${earlierTop.label} to ${laterTop.label} ${spanLabel}.`;
}
