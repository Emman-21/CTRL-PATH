import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompareToolbar } from '../src/components/compare/CompareToolbar';

import { MemoryRouter } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { PathComparePage } from '../src/pages/PathComparePage';
import { LUNI_POSES } from '../src/assets/manifest';

test('CompareToolbar renders track SVG logos inside each of the three track buttons', () => {
  const html = renderToStaticMarkup(
    <CompareToolbar
      selectedTracks={['NT', 'BA']}
      onToggleTrack={() => {}}
    />,
  );

  const svgMatches = html.match(/<svg /g) || [];
  assert.equal(svgMatches.length, 3);
  assert.ok(html.includes('Networking Technology'));
  assert.ok(html.includes('Business Analytics'));
  assert.ok(html.includes('Service Management'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('aria-pressed="false"'));
});

test('PathComparePage renders Compare Your Academic Pathways header with path_compare Luni pose', () => {
  const prevStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };

  try {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/compare']}>
        <StudentProvider>
          <PathComparePage />
        </StudentProvider>
      </MemoryRouter>,
    );

    assert.ok(html.includes('Compare Your Academic Pathways'));
    assert.ok(html.includes(LUNI_POSES.path_compare.url));
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
});
