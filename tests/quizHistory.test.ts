import test from 'node:test';
import assert from 'node:assert/strict';
import type { QuizAttempt } from '../src/types';
import { formatQuizHistoryDate, summarizeQuizAttemptCard } from '../src/utils/quizHistorySummary';

function makeAttempt(overrides: Partial<QuizAttempt>): QuizAttempt {
  return {
    id: 'attempt-1',
    attemptNumber: 1,
    date: '2026-11-21T10:00:00.000Z',
    submittedAt: '2026-11-21T10:00:00.000Z',
    ntScore: 70,
    baScore: 85,
    smScore: 55,
    totalAnswered: 60,
    totalQuestions: 60,
    durationMinutes: 18,
    ...overrides,
  };
}

test('single leading track highlights that track color and sorts descending', () => {
  const summary = summarizeQuizAttemptCard(
    makeAttempt({ ntScore: 70, baScore: 88, smScore: 62 }),
  );
  assert.equal(summary.isBalanced, false);
  assert.equal(summary.tone, 'ba');
  assert.equal(summary.headerLabel, 'BA');
  assert.deepEqual(summary.topTracks, ['BA']);
  assert.deepEqual(summary.rankedTracks, [
    { track: 'BA', score: 88, isTop: true },
    { track: 'NT', score: 70, isTop: false },
    { track: 'SM', score: 62, isTop: false },
  ]);
});

test('two-way top tie marks attempt balanced (yellow) with combined header', () => {
  const summary = summarizeQuizAttemptCard(
    makeAttempt({ id: 'attempt-2', attemptNumber: 2, ntScore: 60, baScore: 82, smScore: 82 }),
  );
  assert.equal(summary.isBalanced, true);
  assert.equal(summary.tone, 'balanced');
  assert.equal(summary.headerLabel, 'BA/SM');
  assert.deepEqual(summary.topTracks, ['BA', 'SM']);
  assert.deepEqual(summary.rankedTracks, [
    { track: 'BA', score: 82, isTop: true },
    { track: 'SM', score: 82, isTop: true },
    { track: 'NT', score: 60, isTop: false },
  ]);
});

test('three-way tie marks all three tracks balanced (yellow)', () => {
  const summary = summarizeQuizAttemptCard(
    makeAttempt({ id: 'attempt-3', attemptNumber: 3, ntScore: 75, baScore: 75, smScore: 75 }),
  );
  assert.equal(summary.isBalanced, true);
  assert.equal(summary.tone, 'balanced');
  assert.equal(summary.headerLabel, 'NT/BA/SM');
  assert.deepEqual(summary.topTracks, ['NT', 'BA', 'SM']);
  assert.equal(summary.rankedTracks.every((row) => row.isTop), true);
});

test('NT and SM single leaders select their respective tones', () => {
  const ntSummary = summarizeQuizAttemptCard(makeAttempt({ ntScore: 92, baScore: 71, smScore: 64 }));
  assert.equal(ntSummary.tone, 'nt');
  assert.equal(ntSummary.headerLabel, 'NT');

  const smSummary = summarizeQuizAttemptCard(makeAttempt({ ntScore: 54, baScore: 68, smScore: 91 }));
  assert.equal(smSummary.tone, 'sm');
  assert.equal(smSummary.headerLabel, 'SM');
});

test('formatQuizHistoryDate formats ISO dates concisely and handles missing dates', () => {
  assert.equal(formatQuizHistoryDate('2026-11-21T10:00:00.000Z'), 'Nov 21, 2026');
  assert.equal(formatQuizHistoryDate(undefined), 'Date unavailable');
  assert.equal(formatQuizHistoryDate(''), 'Date unavailable');
});
