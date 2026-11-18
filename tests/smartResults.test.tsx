import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  analyzeQuizAttempt,
  formatTrackScorecardDisplay,
  SAMPLE_DEMO_ATTEMPT,
} from '../src/utils/resultsAnalytics';
import { ResultsScorecards } from '../src/components/results/ResultsScorecards';
import { ResultsSpotlight } from '../src/components/results/ResultsSpotlight';
import { ResultsAnswerReview } from '../src/components/results/ResultsAnswerReview';
import { TrackBadge } from '../src/components/shared/Badge';
import { StudentProvider } from '../src/context/StudentContext';
import { SmartResultsPage } from '../src/pages/SmartResultsPage';
import { STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';

test('formatTrackScorecardDisplay returns --% and zero progress when no breakdown exists', () => {
  const empty = formatTrackScorecardDisplay(null);
  assert.equal(empty.percentageText, '--%');
  assert.equal(empty.rawText, '--/33 pts');
  assert.equal(empty.levelLabel, 'Quiz Not Taken');
  assert.equal(empty.progressValue, 0);

  const scored = formatTrackScorecardDisplay({
    raw: 27,
    total: 33,
    percentage: 82,
    level: 'High Alignment',
  });
  assert.equal(scored.percentageText, '82%');
  assert.equal(scored.rawText, '27/33 pts');
  assert.equal(scored.levelLabel, 'High Alignment');
  assert.equal(scored.progressValue, 82);
});

test('ResultsScorecards renders --% across all three tracks and zero gemstone images before quiz completion', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <ResultsScorecards analysis={null} />
    </MemoryRouter>,
  );

  const dashMatches = html.match(/--%/g) ?? [];
  assert.equal(dashMatches.length, 3);
  const rawMatches = html.match(/--\/33 pts/g) ?? [];
  assert.equal(rawMatches.length, 3);
  assert.ok(html.includes('Quiz Not Taken'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('gemstone'));
});

test('ResultsScorecards renders percentages and dark-mode classes for BA violet badge when scored', () => {
  const analysis = analyzeQuizAttempt(SAMPLE_DEMO_ATTEMPT);
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <ResultsScorecards analysis={analysis} />
    </MemoryRouter>,
  );

  assert.ok(html.includes('82%'));
  assert.ok(html.includes('73%'));
  assert.ok(html.includes('61%'));
  assert.ok(html.includes('dark:bg-[#1e1338]'));
  assert.ok(html.includes('dark:border-purple-800/70'));
});

test('TrackBadge and ResultsSpotlight include dark mode backgrounds and borders without white/grey bleed', () => {
  const baBadgeHtml = renderToStaticMarkup(<TrackBadge code="BA" size="sm" />);
  assert.ok(baBadgeHtml.includes('dark:bg-[#1e1338]'));
  assert.ok(baBadgeHtml.includes('dark:text-[#c4b5fd]'));
  assert.ok(baBadgeHtml.includes('dark:border-purple-800/70'));

  const analysis = analyzeQuizAttempt(SAMPLE_DEMO_ATTEMPT);
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    const spotlightHtml = renderToStaticMarkup(
      <StudentProvider>
        <ResultsSpotlight analysis={analysis} />
      </StudentProvider>,
    );
    assert.ok(spotlightHtml.includes('dark:from-[#0c1a38]'));
    assert.ok(spotlightHtml.includes('dark:to-[#0f172a]'));
    assert.ok(spotlightHtml.includes('dark:bg-[#0b1222]/90!'));
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});

test('ResultsAnswerReview includes dark mode styling for filter tabs and incorrect review rows', () => {
  const analysis = analyzeQuizAttempt(SAMPLE_DEMO_ATTEMPT);
  const html = renderToStaticMarkup(<ResultsAnswerReview analysis={analysis} />);

  assert.ok(html.includes('dark:bg-[#131d33]'));
  assert.ok(html.includes('dark:bg-[#1e2d4d]!'));
  assert.ok(html.includes('dark:bg-[#1a1509]'));
  assert.ok(html.includes('dark:border-amber-800/50'));
});

test('SmartResultsPage Ready for the Next Chapter card styles cleanly for Light Mode while keeping Dark Mode overrides', () => {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  store.set(
    STUDENT_STORAGE_KEY,
    JSON.stringify({
      quizAttempts: [SAMPLE_DEMO_ATTEMPT],
      preferences: { theme: 'light', themeExplicit: true },
    }),
  );

  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <SmartResultsPage />
        </StudentProvider>
      </MemoryRouter>,
    );

    assert.ok(html.includes('Ready for the Next Chapter?'));
    assert.ok(html.includes('from-blue-50 via-indigo-50/90 to-violet-50'));
    assert.ok(html.includes('dark:from-slate-900 dark:via-[#111b36] dark:to-indigo-950'));
    assert.ok(html.includes('bg-white! hover:bg-blue-50/80! text-slate-800!'));
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});
