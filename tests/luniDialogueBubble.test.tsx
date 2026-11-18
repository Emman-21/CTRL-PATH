import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LuniDialogueBubble } from '../src/components/luni/LuniDialogueBubble';
import { ROUTE_DIALOGUES } from '../src/data/luniDialogues';

test('LuniDialogueBubble quick action pills include dark mode colors and borders for dashboard and tracks variants while preserving light mode', () => {
  const dashboardHtml = renderToStaticMarkup(
    <MemoryRouter>
      <LuniDialogueBubble
        dialogue={ROUTE_DIALOGUES['/']}
        onDismiss={() => {}}
        onOpenPanel={() => {}}
      />
    </MemoryRouter>,
  );

  // Quick action container divider supports dark mode alongside light mode
  assert.ok(dashboardHtml.includes('border-indigo-50/80 dark:border-slate-800/90'));

  // Secondary/default pills (Explore Tracks, Open CTRL Quiz -> button:nth-of-type(2) & 3 on /)
  assert.ok(dashboardHtml.includes('Explore Tracks'));
  assert.ok(dashboardHtml.includes('Open CTRL Quiz'));
  assert.ok(
    dashboardHtml.includes(
      'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#131d33]! dark:hover:bg-[#1a2744]! dark:text-slate-100! dark:border-slate-700/80!',
    ),
  );
  assert.ok(dashboardHtml.includes('<span class="text-inherit">Explore Tracks</span>'));
  assert.ok(dashboardHtml.includes('<span class="text-inherit">Open CTRL Quiz</span>'));

  const tracksHtml = renderToStaticMarkup(
    <MemoryRouter>
      <LuniDialogueBubble
        dialogue={ROUTE_DIALOGUES['/tracks']}
        onDismiss={() => {}}
        onOpenPanel={() => {}}
      />
    </MemoryRouter>,
  );

  // Track-colored pills (NT, BA -> button:nth-of-type(2), SM -> button:nth-of-type(3) on /tracks)
  assert.ok(
    tracksHtml.includes(
      'bg-blue-50/80 hover:bg-blue-100 text-blue-700 border-blue-200/80 dark:bg-blue-950/75! dark:hover:bg-blue-900/85! dark:text-blue-200! dark:border-blue-800/70!',
    ),
  );
  assert.ok(
    tracksHtml.includes(
      'bg-purple-50/80 hover:bg-purple-100 text-purple-700 border-purple-200/80 dark:bg-purple-950/75! dark:hover:bg-purple-900/85! dark:text-purple-200! dark:border-purple-800/70!',
    ),
  );
  assert.ok(
    tracksHtml.includes(
      'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/75! dark:hover:bg-emerald-900/85! dark:text-emerald-200! dark:border-emerald-800/70!',
    ),
  );
});
