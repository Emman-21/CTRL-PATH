import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudentProvider } from '../src/context/StudentContext';
import { QuizIntro } from '../src/components/quiz/QuizIntro';

test('QuizIntro renders NT, BA, and SM track SVG logos inside the three intro track highlights', () => {
  const prevStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  try {
    const html = renderToStaticMarkup(
      <StudentProvider>
        <QuizIntro
          attemptNumber={1}
          maxAttempts={3}
          hasActiveSession={false}
          onStart={() => {}}
          onResume={() => {}}
        />
      </StudentProvider>,
    );

    const strongMatches = html.match(/<strong[\s\S]*?<\/strong>/g) || [];
    assert.equal(strongMatches.length, 3);
    assert.ok(strongMatches[0].includes('<svg ') && strongMatches[0].includes('Networking Technology (33)'));
    assert.ok(strongMatches[1].includes('<svg ') && strongMatches[1].includes('Business Analytics (33)'));
    assert.ok(strongMatches[2].includes('<svg ') && strongMatches[2].includes('Service Management (33)'));
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
});
