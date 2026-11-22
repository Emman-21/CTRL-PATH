import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import type { QuizAttempt } from '../src/types';
import {
  computeAttemptShift,
  getAttemptTopTrack,
  SHIFT_REFLECTION_REASONS,
} from '../src/utils/attemptShiftAnalytics';
import { ResultsShiftViewContent } from '../src/components/results/ResultsShiftView';

function makeAttempt(
  attemptNumber: number,
  scores: { NT: number; BA: number; SM: number },
  overrides: Partial<QuizAttempt> = {},
): QuizAttempt {
  return {
    id: `attempt-${attemptNumber}`,
    attemptNumber,
    date: `Nov ${18 + attemptNumber}, 2026`,
    ntScore: scores.NT,
    baScore: scores.BA,
    smScore: scores.SM,
    totalAnswered: 54,
    totalQuestions: 54,
    durationMinutes: 20 + attemptNumber * 2,
    ...overrides,
  };
}

test('getAttemptTopTrack identifies clear leader and multi-track ties', () => {
  const clear = getAttemptTopTrack(makeAttempt(1, { NT: 84, BA: 72, SM: 61 }));
  assert.deepEqual(clear.topTracks, ['NT']);
  assert.equal(clear.label, 'NT');
  assert.equal(clear.topScore, 84);
  assert.equal(clear.isTie, false);

  const tie = getAttemptTopTrack(makeAttempt(2, { NT: 78, BA: 64, SM: 78 }));
  assert.deepEqual(tie.topTracks, ['NT', 'SM']);
  assert.equal(tie.label, 'NT / SM (tie)');
  assert.equal(tie.topScore, 78);
  assert.equal(tie.isTie, true);
});

test('computeAttemptShift generates plain-language top-track shift insight, biggest gain/drop, and normalizes chronological order', () => {
  const a1 = makeAttempt(1, { NT: 61, BA: 56, SM: 76 });
  const a2 = makeAttempt(2, { NT: 82, BA: 68, SM: 64 });

  // Passing (a2, a1) out of order must still treat a1 as earlier and a2 as later
  const shift = computeAttemptShift(a2, a1);
  assert.equal(shift.earlier.id, 'attempt-1');
  assert.equal(shift.later.id, 'attempt-2');
  assert.equal(
    shift.insightSentence,
    'Your top track moved from SM to NT between Attempt 1 and Attempt 2.',
  );
  assert.equal(shift.biggestGain?.track, 'NT');
  assert.equal(shift.biggestGain?.delta, 21);
  assert.equal(shift.biggestGain?.deltaLabel, '+21 pts');
  assert.equal(shift.biggestDrop?.track, 'SM');
  assert.equal(shift.biggestDrop?.delta, -12);
  assert.equal(shift.biggestDrop?.deltaLabel, '-12 pts');

  const sentenceCount = shift.insightSentence
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  assert.equal(sentenceCount, 1);
});

test('computeAttemptShift handles steady scores and no-drop scenarios encouragingly', () => {
  const a1 = makeAttempt(1, { NT: 70, BA: 60, SM: 55 });
  const a2 = makeAttempt(2, { NT: 70, BA: 60, SM: 55 });
  const steady = computeAttemptShift(a1, a2);
  assert.equal(steady.biggestGain, null);
  assert.equal(steady.biggestDrop, null);
  assert.ok(steady.insightSentence.includes('held steady'));

  const a3 = makeAttempt(3, { NT: 80, BA: 65, SM: 60 });
  const allUp = computeAttemptShift(a1, a3);
  assert.equal(allUp.biggestGain?.track, 'NT');
  assert.equal(allUp.biggestDrop, null);
  assert.ok(allUp.insightSentence.includes('stayed NT and rose from 70% to 80%'));
});

test('ResultsShiftViewContent renders merged view with grouped vertical bar chart, 4 reason chips, compact history, and Retake (3/3)', () => {
  const a1 = makeAttempt(1, { NT: 58, BA: 62, SM: 76 });
  const a2 = makeAttempt(2, { NT: 81, BA: 62, SM: 67 });

  const html = renderToStaticMarkup(
    <ResultsShiftViewContent
      attempts={[a2, a1]}
      selectedAttemptId={a2.id}
      onSelectAttempt={() => {}}
      attemptComparisons={[]}
      onSaveReflection={() => {}}
      onOpenPathCompare={() => {}}
      onOpenRetake={() => {}}
      reducedMotion={false}
    />,
  );

  // Merged title & non-judgmental tone
  assert.ok(html.includes('How your results have shifted'));
  assert.ok(html.includes('pathway is always your choice'));

  // Removed lead insight paragraph & attempt selector dropdowns
  assert.ok(!html.includes('data-testid="shift-insight"'));
  assert.ok(!html.includes('First attempt to compare'));
  assert.ok(!html.includes('Second attempt to compare'));

  // Biggest gain/drop
  assert.ok(html.includes('data-testid="shift-biggest-gain"'));
  assert.ok(html.includes('+23 pts'));
  assert.ok(html.includes('data-testid="shift-biggest-drop"'));
  assert.ok(html.includes('-9 pts'));

  // Grouped vertical bar chart: percentage on y-axis, NT/BA/SM & Attempt 1/Attempt 2 on bottom x-axis, no top legend
  assert.ok(html.includes('data-testid="attempt-bar-chart"'));
  assert.ok(html.includes('100%'));
  assert.ok(html.includes('0%'));
  assert.ok(!html.includes('Earlier (Attempt 1)'));
  assert.ok(!html.includes('Later (Attempt 2)'));
  assert.ok(html.includes('Attempt 1'));
  assert.ok(html.includes('Attempt 2'));
  assert.ok(html.includes('data-testid="bar-group-NT"'));
  assert.ok(html.includes('data-testid="bar-group-BA"'));
  assert.ok(html.includes('data-testid="bar-group-SM"'));
  assert.ok(html.includes('data-testid="bar-earlier-NT"'));
  assert.ok(html.includes('data-testid="bar-later-NT"'));
  assert.ok(html.includes('data-testid="bar-track-NT"'));
  assert.ok(html.includes('data-testid="bar-track-BA"'));
  assert.ok(html.includes('data-testid="bar-track-SM"'));
  assert.ok(html.includes('data-testid="bar-delta-NT"'));
  assert.ok(html.includes('data-testid="bar-trend-NT"'));
  assert.ok(html.includes('data-trend="up"'));
  assert.ok(html.includes('text-green-400 dark:text-green-300'));
  assert.ok(html.includes('data-testid="bar-trend-BA"'));
  assert.ok(html.includes('data-trend="flat"'));
  assert.ok(html.includes('data-testid="bar-trend-SM"'));
  assert.ok(html.includes('data-trend="down"'));
  assert.ok(html.includes('text-red-500 dark:text-red-400'));
  assert.ok(html.includes('bg-blue-600 dark:bg-blue-500'));
  assert.ok(html.includes('bg-violet-600 dark:bg-violet-500'));
  assert.ok(html.includes('bg-emerald-600 dark:bg-emerald-500'));
  assert.ok(html.includes('0 pts'));

  // Reflection section removed
  assert.ok(!html.includes('What do you think shifted between these attempts?'));
  assert.ok(!html.includes('Optional reflection note'));
  assert.ok(!html.includes('Save reflection'));
  for (const reason of SHIFT_REFLECTION_REASONS) {
    assert.ok(!html.includes(reason), `Removed reflection chip should not render: ${reason}`);
  }

  // Compact attempt history + Path Compare & Retake (3/3) actions
  assert.ok(html.includes('22 min'));
  assert.ok(html.includes('24 min'));
  assert.ok(html.includes('Top: SM (76%)'));
  assert.ok(html.includes('Top: NT (81%)'));
  assert.ok(html.includes('Path Compare'));
  assert.ok(html.includes('Retake (3/3)'));

  // Visible focus rings & reduced-motion support
  assert.ok(html.includes('focus-visible:outline-2'));
  assert.ok(html.includes('motion-safe:transition-all'));
});

test('ResultsShiftViewContent returns null with fewer than 2 attempts and omits transition classes when reducedMotion is true', () => {
  const single = renderToStaticMarkup(
    <ResultsShiftViewContent
      attempts={[makeAttempt(1, { NT: 70, BA: 60, SM: 50 })]}
      onSelectAttempt={() => {}}
      attemptComparisons={[]}
      onSaveReflection={() => {}}
      onOpenPathCompare={() => {}}
    />,
  );
  assert.equal(single, '');

  const reduced = renderToStaticMarkup(
    <ResultsShiftViewContent
      attempts={[
        makeAttempt(1, { NT: 60, BA: 70, SM: 80 }),
        makeAttempt(2, { NT: 85, BA: 72, SM: 68 }),
        makeAttempt(3, { NT: 88, BA: 75, SM: 70 }),
      ]}
      onSelectAttempt={() => {}}
      onOpenPathCompare={() => {}}
      reducedMotion={true}
    />,
  );
  assert.ok(!reduced.includes('motion-safe:transition-all'));
  assert.ok(reduced.includes('all 3 of 3 quiz attempts'));
  assert.ok(reduced.includes('disabled=""'));
});

test('ResultsShiftViewContent colors Top summary yellow when attempt is balanced (tie) and track-colored otherwise', () => {
  const balancedAttempt = makeAttempt(1, { NT: 75, BA: 75, SM: 60 });
  const clearAttempt = makeAttempt(2, { NT: 60, BA: 82, SM: 70 });

  const html = renderToStaticMarkup(
    <ResultsShiftViewContent
      attempts={[balancedAttempt, clearAttempt]}
      selectedAttemptId={clearAttempt.id}
      onSelectAttempt={() => {}}
      onOpenPathCompare={() => {}}
    />,
  );

  assert.ok(
    html.includes('text-yellow-600 dark:text-yellow-400">Top: NT / BA (tie) (75%)'),
  );
  assert.ok(
    html.includes('text-violet-600 dark:text-violet-400">Top: BA (82%)'),
  );
});

