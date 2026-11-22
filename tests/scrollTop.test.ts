import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrollViewportToTop } from '../src/utils/scrollTop';

test('scrollViewportToTop resets window and document scroll offsets to zero', () => {
  const calls: Array<{ top?: number; left?: number; behavior?: string }> = [];
  const docEl = { scrollTop: 420 };
  const body = { scrollTop: 310 };

  (globalThis as Record<string, unknown>).window = {
    scrollTo: (opts: { top?: number; left?: number; behavior?: string }) => {
      calls.push(opts);
    },
  };
  (globalThis as Record<string, unknown>).document = {
    documentElement: docEl,
    body,
  };

  try {
    scrollViewportToTop();
    assert.deepEqual(calls, [{ top: 0, left: 0, behavior: 'auto' }]);
    assert.equal(docEl.scrollTop, 0);
    assert.equal(body.scrollTop, 0);
  } finally {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
  }
});
