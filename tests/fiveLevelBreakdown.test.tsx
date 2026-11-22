import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  analyzeQuizAttempt,
  getFiveLevelInsight,
  getScoreBand,
  SAMPLE_DEMO_ATTEMPT,
  type LevelPerformance,
} from '../src/utils/resultsAnalytics';
import { FiveLevelBreakdown } from '../src/components/results/FiveLevelBreakdown';
import { ResultsAnswerReview } from '../src/components/results/ResultsAnswerReview';

const MOCK_LEVELS: LevelPerformance[] = [
  {
    level: 1,
    name: 'Level 1: Core Fundamentals',
    questionType: 'True / False',
    correct: 8,
    total: 9,
    percentage: 89,
    leadingTrack: 'NT',
    weakestTrack: 'SM',
  },
  {
    level: 2,
    name: 'Level 2: Applied Scenarios',
    questionType: 'Multiple Choice',
    correct: 14,
    total: 18,
    percentage: 75,
    leadingTrack: 'BA',
    weakestTrack: 'NT',
  },
  {
    level: 3,
    name: 'Level 3: Terminology & Tools',
    questionType: 'Matching Pairs',
    correct: 4,
    total: 6,
    percentage: 67,
    leadingTrack: 'NT',
    weakestTrack: 'BA',
  },
  {
    level: 4,
    name: 'Level 4: Operational Processes',
    questionType: 'Sequencing Steps',
    correct: 2,
    total: 6,
    percentage: 33,
    leadingTrack: 'SM',
    weakestTrack: 'NT',
  },
  {
    level: 5,
    name: 'Level 5: Domain Technical Mastery',
    questionType: 'Identification & Enumeration',
    correct: 8,
    total: 15,
    percentage: 50,
    leadingTrack: 'BA',
    weakestTrack: 'SM',
  },
];

test('getScoreBand maps percentages to green >=75, blue 50-74, orange <50 boundaries', () => {
  assert.equal(getScoreBand(100), 'high');
  assert.equal(getScoreBand(75), 'high');
  assert.equal(getScoreBand(74), 'moderate');
  assert.equal(getScoreBand(50), 'moderate');
  assert.equal(getScoreBand(49), 'low');
  assert.equal(getScoreBand(0), 'low');
});

test('getFiveLevelInsight always returns strictly one sentence across all score patterns', () => {
  const cases: LevelPerformance[][] = [
    [],
    MOCK_LEVELS,
    MOCK_LEVELS.map((l) => ({ ...l, percentage: 70 })),
    MOCK_LEVELS.map((l) => (l.percentage < 50 ? { ...l, percentage: 60 } : l)),
    MOCK_LEVELS.map((l) => (l.level >= 3 ? { ...l, percentage: 40 } : l)),
  ];

  for (const levels of cases) {
    const insight = getFiveLevelInsight(levels);
    assert.ok(insight.length > 20);
    assert.ok(insight.endsWith('.'));
    const sentenceCount = insight.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    assert.equal(sentenceCount, 1, `Expected 1 sentence, got: ${insight}`);
  }
});

test('analyzeQuizAttempt computes weakestTrack per level and demo preview includes <50% tier', () => {
  const analysis = analyzeQuizAttempt(SAMPLE_DEMO_ATTEMPT);
  assert.equal(analysis.levelPerformances.length, 5);
  for (const lvl of analysis.levelPerformances) {
    assert.ok(['NT', 'BA', 'SM'].includes(lvl.leadingTrack));
    assert.ok(['NT', 'BA', 'SM'].includes(lvl.weakestTrack));
    assert.notEqual(lvl.leadingTrack, lvl.weakestTrack);
  }
  assert.ok(analysis.levelPerformances.some((l) => l.percentage >= 75));
  assert.ok(analysis.levelPerformances.some((l) => l.percentage >= 50 && l.percentage < 75));
  assert.ok(analysis.levelPerformances.some((l) => l.percentage < 50));
});

test('FiveLevelBreakdown renders radar chart, one-sentence insight, fixed CSS grid, score-colored bars, Weakest In chip, and Review button only below 50%', () => {
  const html = renderToStaticMarkup(<FiveLevelBreakdown levelPerformances={MOCK_LEVELS} />);

  // Radar chart + 5 vertices + insight
  assert.ok(html.includes('data-testid="five-level-radar"'));
  assert.ok(html.includes('data-testid="radar-data-polygon"'));
  assert.equal((html.match(/<circle /g) ?? []).length, 5);
  assert.ok(html.includes('data-testid="five-level-insight"'));
  assert.ok(html.includes('dark:fill-sky-300'));
  assert.ok(html.includes('<strong class="font-extrabold text-slate-950 dark:text-white">Level 1: Core Fundamentals (89%)</strong>'));
  assert.ok(html.includes('<strong class="font-extrabold text-slate-950 dark:text-white">Level 4: Operational Processes (33%)</strong>'));

  const multiLowHtml = renderToStaticMarkup(
    <FiveLevelBreakdown
      levelPerformances={[
        { ...MOCK_LEVELS[0], percentage: 60 },
        { ...MOCK_LEVELS[1], percentage: 65 },
        { ...MOCK_LEVELS[2], percentage: 83 },
        { ...MOCK_LEVELS[3], percentage: 33 },
        { ...MOCK_LEVELS[4], percentage: 40 },
      ]}
    />,
  );
  assert.ok(multiLowHtml.includes('You performed strongest in <strong class="font-extrabold text-slate-950 dark:text-white">Level 3: Terminology &amp; Tools (83%)</strong>, while <strong class="font-extrabold text-slate-950 dark:text-white">Level 4: Operational Processes (33%)</strong> and <strong class="font-extrabold text-slate-950 dark:text-white">Level 5: Domain Technical Mastery (40%)</strong> scored below 50% and are the top priorities to visit.'));

  // Fixed CSS grid columns on every row
  assert.ok(html.includes('xl:grid-cols-[260px_minmax(150px,1fr)_136px_142px]'));

  // Score-band bar colors: green >=75%, blue 50-74%, orange <50%
  assert.equal((html.match(/data-variant="score-high"/g) ?? []).length, 2); // L1 (89%), L2 (75%)
  assert.equal((html.match(/data-variant="score-mid"/g) ?? []).length, 2);  // L3 (67%), L5 (50%)
  assert.equal((html.match(/data-variant="score-low"/g) ?? []).length, 1);  // L4 (33%)
  assert.ok(html.includes('bg-emerald-500'));
  assert.ok(html.includes('bg-blue-600'));
  assert.ok(html.includes('bg-orange-500'));

  // Strongest In & Weakest In chips on all 5 rows
  assert.equal((html.match(/Strongest In/g) ?? []).length, 5);
  assert.equal((html.match(/Weakest In/g) ?? []).length, 5);

  // "Review this level" button ONLY on rows <50% (L4 = 33%)
  assert.equal((html.match(/Review this level<\/span>/g) ?? []).length, 1);
  assert.ok(html.includes('aria-label="Review this level: Level 4: Operational Processes"'));
});

test('ResultsAnswerReview removes All Levels, orders Levels before Tracks, and filters to selectedLevel', () => {
  const analysis = analyzeQuizAttempt(SAMPLE_DEMO_ATTEMPT);
  const defaultHtml = renderToStaticMarkup(<ResultsAnswerReview analysis={analysis} />);
  assert.ok(defaultHtml.includes('Level 1 ·'));
  assert.ok(!defaultHtml.includes('Level 2 ·'));
  assert.match(defaultHtml, /<button[^>]*aria-pressed="true"[^>]*>L1<\/button>/);
  assert.ok(defaultHtml.includes('All Tracks'));

  const html = renderToStaticMarkup(
    <ResultsAnswerReview analysis={analysis} selectedLevel={4} />,
  );

  assert.ok(html.includes('id="answer-review-section"'));
  assert.ok(!html.includes('All Levels'));
  assert.ok(html.includes('>L1</button>'));
  assert.ok(html.includes('>L5</button>'));
  const levelIdx = html.indexOf('Filter answer review by level');
  const trackIdx = html.indexOf('All Tracks');
  assert.ok(levelIdx !== -1 && trackIdx !== -1 && levelIdx < trackIdx);
  assert.ok(html.includes('Level 4 ·'));
  assert.ok(!html.includes('Level 1 ·'));
  assert.ok(!html.includes('Level 2 ·'));
});
