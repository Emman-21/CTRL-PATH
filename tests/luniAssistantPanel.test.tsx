import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { LuniAssistantPanel } from '../src/components/luni/LuniAssistantPanel';
import { SCRIPTED_TOPICS } from '../src/data/luniDialogues';

test('LuniAssistantPanel tab bar and quick prompt chips include dark mode surfaces, borders, and contrast while preserving light mode', () => {
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
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <LuniAssistantPanel isOpen={true} onClose={() => {}} />
        </StudentProvider>
      </MemoryRouter>,
    );

    // Tab navigation bar & active/inactive tab styles
    assert.ok(html.includes('bg-slate-50/80 dark:bg-[#0b1222]'));
    assert.ok(html.includes('border-slate-100 dark:border-slate-800'));
    assert.ok(
      html.includes(
        'bg-[var(--surface)] dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30',
      ),
    );
    assert.ok(html.includes('dark:text-slate-400 dark:hover:text-slate-100'));

    // Quick prompt chips
    assert.ok(html.includes('Which track fits me best?'));
    assert.ok(
      html.includes(
        'dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 dark:text-indigo-200! dark:border-indigo-700/50',
      ),
    );

    // Live chat thread & Luni message bubble
    assert.ok(
      html.includes(
        'dark:bg-[#090e1c]/70 dark:border dark:border-slate-800/80 dark:rounded-2xl dark:p-3',
      ),
    );
    assert.ok(
      html.includes(
        'dark:bg-[#131d33]! text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/80!',
      ),
    );
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});

test('SCRIPTED_TOPICS omits the removed quiz Focus Mode topic', () => {
  assert.equal(SCRIPTED_TOPICS.some((t) => t.id === 'focus-mode'), false);
  assert.equal(
    SCRIPTED_TOPICS.some((t) => t.question.toLowerCase().includes('focus mode')),
    false,
  );
  assert.equal(SCRIPTED_TOPICS.length, 7);
});
