import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  acquireBodyScrollLock,
  getBodyScrollLockCount,
  resetBodyScrollLockForTests,
} from '../src/hooks/useBodyScrollLock';
import { syncVisualViewportHeight } from '../src/hooks/useVisualViewportHeight';

function createMockDocument(initialOverflow = '') {
  const styleProps = new Map<string, string>();
  const doc = {
    body: {
      style: {
        overflow: initialOverflow,
      },
    },
    documentElement: {
      style: {
        setProperty(name: string, value: string) {
          styleProps.set(name, value);
        },
        removeProperty(name: string) {
          styleProps.delete(name);
        },
        getPropertyValue(name: string) {
          return styleProps.get(name) ?? '';
        },
      },
    },
  };
  return { doc: doc as unknown as Document, styleProps };
}

test('acquireBodyScrollLock locks body overflow, handles nested locks, is idempotent, and restores original overflow', () => {
  const { doc } = createMockDocument('auto');
  resetBodyScrollLockForTests(doc);
  doc.body.style.overflow = 'auto';

  const release1 = acquireBodyScrollLock(doc);
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(doc.body.style.overflow, 'hidden');

  const release2 = acquireBodyScrollLock(doc);
  assert.equal(getBodyScrollLockCount(), 2);
  assert.equal(doc.body.style.overflow, 'hidden');

  // Releasing first lock keeps body locked while second is held
  release1();
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(doc.body.style.overflow, 'hidden');

  // Re-calling release1 is idempotent and does not decrement lock count twice
  release1();
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(doc.body.style.overflow, 'hidden');

  // Final release restores original overflow
  release2();
  assert.equal(getBodyScrollLockCount(), 0);
  assert.equal(doc.body.style.overflow, 'auto');
});

test('syncVisualViewportHeight sets --vvh on resize/scroll and cleans up on unmount', () => {
  const { doc, styleProps } = createMockDocument();
  const listeners = new Map<'resize' | 'scroll', Set<() => void>>([
    ['resize', new Set()],
    ['scroll', new Set()],
  ]);

  const visualViewport = {
    height: 780,
    addEventListener(type: 'resize' | 'scroll', fn: () => void) {
      listeners.get(type)?.add(fn);
    },
    removeEventListener(type: 'resize' | 'scroll', fn: () => void) {
      listeners.get(type)?.delete(fn);
    },
  };

  const cleanup = syncVisualViewportHeight({ visualViewport }, doc);
  assert.equal(styleProps.get('--vvh'), '780px');

  visualViewport.height = 492.4;
  for (const fn of listeners.get('resize') ?? []) fn();
  assert.equal(styleProps.get('--vvh'), '492px');

  visualViewport.height = 510;
  for (const fn of listeners.get('scroll') ?? []) fn();
  assert.equal(styleProps.get('--vvh'), '510px');

  cleanup();
  assert.equal(styleProps.has('--vvh'), false);
  assert.equal(listeners.get('resize')?.size, 0);
  assert.equal(listeners.get('scroll')?.size, 0);
});

test('syncVisualViewportHeight falls back cleanly when visualViewport is unavailable', () => {
  const { doc, styleProps } = createMockDocument();
  const cleanup = syncVisualViewportHeight({ visualViewport: null }, doc);
  assert.equal(styleProps.has('--vvh'), false);
  cleanup();
  assert.equal(styleProps.has('--vvh'), false);
});

test('Sidebar keeps h-screen while AppShell, ErrorBoundary, and CtrlQuizPage use dvh', () => {
  const root = process.cwd();
  const sidebar = fs.readFileSync(path.join(root, 'src/components/layout/Sidebar.tsx'), 'utf8');
  const appShell = fs.readFileSync(path.join(root, 'src/components/layout/AppShell.tsx'), 'utf8');
  const errorBoundary = fs.readFileSync(path.join(root, 'src/components/shared/ErrorBoundary.tsx'), 'utf8');
  const ctrlQuiz = fs.readFileSync(path.join(root, 'src/pages/CtrlQuizPage.tsx'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const indexCss = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

  assert.ok(sidebar.includes('h-screen'), 'Sidebar desktop h-screen must remain untouched');
  assert.ok(appShell.includes('min-h-dvh'));
  assert.ok(errorBoundary.includes('min-h-dvh'));
  assert.ok(ctrlQuiz.includes('min-h-[82dvh]'));
  assert.ok(
    indexHtml.includes(
      'content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content"',
    ),
  );
  assert.ok(indexCss.includes('--safe-bottom: env(safe-area-inset-bottom, 0px);'));
  assert.ok(indexCss.includes('min-height: 100dvh;'));
  assert.ok(indexCss.includes('max-height: min(88dvh, var(--vvh, 100dvh));'));
});
