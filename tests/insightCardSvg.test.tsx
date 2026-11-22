import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { InsightCardSvg } from '../src/components/results/InsightCardSvg';
import { SmartResultsSummary } from '../src/components/control/JourneyPanels';
import { SmartResultsPage } from '../src/pages/SmartResultsPage';
import { StudentProvider } from '../src/context/StudentContext';
import { SAMPLE_DEMO_ATTEMPT } from '../src/utils/resultsAnalytics';
import { STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';

function withMockStorage(seed: Record<string, string>, fn: () => void) {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>(Object.entries(seed));
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
    fn();
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
}

test('InsightCardSvg renders unique inline SVG artwork for all strength and growth variants', () => {
  const cases = [
    { kind: 'strength' as const, title: 'Protocol & Architectural Reasoning', track: 'NT' as const },
    { kind: 'strength' as const, title: 'Quantitative Trend Patterning', track: 'BA' as const },
    { kind: 'strength' as const, title: 'Process Optimization & SLA Governance', track: 'SM' as const },
    { kind: 'strength' as const, title: 'Curious Exploratory Mindset', track: 'NT' as const },
    { kind: 'growth' as const, title: 'Subnetting & Network Configuration Practice', track: 'NT' as const },
    { kind: 'growth' as const, title: 'SQL Schema & Business Metric Interpretation', track: 'BA' as const },
    { kind: 'growth' as const, title: 'ITIL Framework & Incident Response Sequencing', track: 'SM' as const },
    { kind: 'growth' as const, title: 'Cross-Track Capstone Synthesis', track: 'BA' as const },
  ];

  for (const item of cases) {
    const html = renderToStaticMarkup(
      <InsightCardSvg kind={item.kind} title={item.title} track={item.track} />,
    );
    assert.ok(html.includes('<svg viewBox="0 0 40 40"'), `Expected SVG for ${item.title}`);
  }
});

test('SmartResultsPage renders SVG artwork inside every Strengths and Growth Opportunities card', () => {
  withMockStorage(
    {
      [STUDENT_STORAGE_KEY]: JSON.stringify({
        quizAttempts: [
          {
            ...SAMPLE_DEMO_ATTEMPT,
            id: 'attempt-svg-check',
            ntScore: 82,
            baScore: 45,
            smScore: 61,
          },
        ],
      }),
    },
    () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <StudentProvider>
            <SmartResultsPage />
          </StudentProvider>
        </MemoryRouter>,
      );

      // Strengths: Protocol (NT), Process (SM), Curious Exploratory Mindset -> each has <svg viewBox="0 0 40 40"
      // Growth: SQL Schema (BA), ITIL Framework (SM) -> each has <svg viewBox="0 0 40 40"
      const svgCount = (html.match(/<svg viewBox="0 0 40 40"/g) ?? []).length;
      assert.equal(svgCount, 5);
    },
  );
});

test('SmartResultsSummary renders NT, BA, and SM track logo SVGs instead of gemstone images', () => {
  withMockStorage(
    {
      [STUDENT_STORAGE_KEY]: JSON.stringify({
        quizAttempts: [
          {
            ...SAMPLE_DEMO_ATTEMPT,
            id: 'attempt-summary-logos',
            ntScore: 82,
            baScore: 73,
            smScore: 61,
          },
        ],
      }),
    },
    () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <StudentProvider>
            <SmartResultsSummary />
          </StudentProvider>
        </MemoryRouter>,
      );

      assert.ok(html.includes('control-result-gems'));
      assert.ok(!html.includes('<img'), 'Expected track SVG logos instead of gemstone <img>');
      assert.ok(html.includes('fill="#2563EB"'));
      assert.ok(html.includes('fill="#7C3AED"'));
      assert.ok(html.includes('fill="#059669"'));
      assert.ok(html.includes('>NT</text>'));
      assert.ok(html.includes('>BA</text>'));
      assert.ok(html.includes('>SM</text>'));
    },
  );
});
