import type { QuizAttempt, TrackCode } from '../types';
import { analyzeQuizAttempt, type LevelPerformance } from './resultsAnalytics';

export type QuizHistoryTone = 'nt' | 'ba' | 'sm' | 'balanced';

export interface RankedTrackScore {
  track: TrackCode;
  score: number;
  isTop: boolean;
}

export interface QuizHistoryCardSummary {
  attempt: QuizAttempt;
  attemptNumber: number;
  dateLabel: string;
  rankedTracks: RankedTrackScore[];
  topTracks: TrackCode[];
  isBalanced: boolean;
  tone: QuizHistoryTone;
  headerLabel: string;
  levels: LevelPerformance[];
}

const TRACK_TIE_ORDER: Record<TrackCode, number> = {
  NT: 0,
  BA: 1,
  SM: 2,
};

export function formatQuizHistoryDate(value?: string | null): string {
  if (!value) return 'Date unavailable';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.trim() || 'Date unavailable';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function summarizeQuizAttemptCard(attempt: QuizAttempt): QuizHistoryCardSummary {
  const scores: { track: TrackCode; score: number }[] = [
    { track: 'NT', score: Math.round(attempt.ntScore) },
    { track: 'BA', score: Math.round(attempt.baScore) },
    { track: 'SM', score: Math.round(attempt.smScore) },
  ];

  scores.sort(
    (a, b) => b.score - a.score || TRACK_TIE_ORDER[a.track] - TRACK_TIE_ORDER[b.track],
  );

  const highestScore = scores[0].score;
  const topTracks = scores
    .filter((entry) => entry.score === highestScore)
    .map((entry) => entry.track);

  const isBalanced = topTracks.length > 1;
  const tone: QuizHistoryTone = isBalanced
    ? 'balanced'
    : (topTracks[0].toLowerCase() as 'nt' | 'ba' | 'sm');

  const rankedTracks: RankedTrackScore[] = scores.map((entry) => ({
    track: entry.track,
    score: entry.score,
    isTop: entry.score === highestScore,
  }));

  const hasAnswers = !!attempt.answers && Object.keys(attempt.answers).length > 0;
  const levels = hasAnswers ? analyzeQuizAttempt(attempt).levelPerformances : [];

  return {
    attempt,
    attemptNumber: attempt.attemptNumber,
    dateLabel: formatQuizHistoryDate(attempt.submittedAt || attempt.date),
    rankedTracks,
    topTracks,
    isBalanced,
    tone,
    headerLabel: topTracks.join('/'),
    levels,
  };
}
