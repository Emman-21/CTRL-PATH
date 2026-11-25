import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { CommunityProvider } from '../src/context/CommunityContext';
import { PageHeader, FEATURE_HEADER_LUNI_SIZE } from '../src/components/shared/PageHeader';
import { SmartResultsPage } from '../src/pages/SmartResultsPage';
import { PathComparePage } from '../src/pages/PathComparePage';
import { AlumniStoriesPage } from '../src/pages/AlumniStoriesPage';
import { AchievementsPage } from '../src/pages/AchievementsPage';
import { ControlCenterPage } from '../src/pages/ControlCenterPage';

function withMockLocalStorage(fn: () => void) {
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
    fn();
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
}

function renderWithRouter(element: React.ReactElement, initialEntry = '/') {
  const router = createMemoryRouter([{ path: '*', element }], {
    initialEntries: [initialEntry],
  });
  return renderToStaticMarkup(
    <StudentProvider>
      <CommunityProvider>
        <RouterProvider router={router} />
      </CommunityProvider>
    </StudentProvider>,
  );
}

test('PageHeader renders uniform 88px Luni with the violet circle backdrop by default', () => {
  assert.equal(FEATURE_HEADER_LUNI_SIZE, 88);
  withMockLocalStorage(() => {
    const html = renderWithRouter(
      <PageHeader title="Sample Feature" subtitle="Feature description" luniPose="shock" />,
    );

    assert.ok(html.includes('style="width:88px;height:88px"'));
    assert.ok(html.includes('data-testid="luni-violet-circle"'));
    assert.ok(html.includes('bg-violet-500/20'));
    assert.ok(!html.includes('width:144px'));
  });
});

test('Feature hero boxes across SmartResults, PathCompare, AlumniStories, ControlCenter, and TrackExplorer share uniform 88px Luni, while Achievements retains 150px with violet circle', () => {
  withMockLocalStorage(() => {
    const uniformPages: Array<[string, React.ReactElement, string]> = [
      ['SmartResultsPage', <SmartResultsPage />, '/results'],
      ['PathComparePage', <PathComparePage />, '/compare'],
      ['AlumniStoriesPage', <AlumniStoriesPage />, '/alumni'],
      ['ControlCenterPage', <ControlCenterPage />, '/control-center'],
    ];

    for (const [name, element, routePath] of uniformPages) {
      const html = renderWithRouter(element, routePath);
      assert.ok(
        html.includes(`style="width:${FEATURE_HEADER_LUNI_SIZE}px;height:${FEATURE_HEADER_LUNI_SIZE}px"`),
        `${name} should render Luni at ${FEATURE_HEADER_LUNI_SIZE}px`,
      );
      assert.ok(
        html.includes('data-testid="luni-violet-circle"'),
        `${name} should render Luni with the violet circle`,
      );
      assert.ok(!html.includes('width:144px'), `${name} must not render oversized 144px Luni`);
      assert.ok(!html.includes('width:150px'), `${name} must not render oversized 150px Luni`);
      assert.ok(!html.includes('width:112px'), `${name} must not render uneven 112px Luni`);
      assert.ok(!html.includes('width:104px'), `${name} must not render uneven 104px Luni`);
    }

    const achievementsHtml = renderWithRouter(<AchievementsPage />, '/achievements');
    assert.ok(
      achievementsHtml.includes('style="width:150px;height:150px"'),
      'AchievementsPage should retain its original 150px Luni size',
    );
    assert.ok(
      achievementsHtml.includes('data-testid="luni-violet-circle"'),
      'AchievementsPage should render Luni with the violet circle',
    );

    const trackExplorerSource = fs.readFileSync(
      path.join(process.cwd(), 'src/pages/TrackExplorerPage.tsx'),
      'utf8',
    );
    assert.ok(trackExplorerSource.includes('size={FEATURE_HEADER_LUNI_SIZE}'));
    assert.ok(trackExplorerSource.includes('staticCircle'));
    assert.ok(!trackExplorerSource.includes('size={112}'));
  });
});
