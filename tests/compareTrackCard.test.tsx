import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CompareTrackCard } from '../src/components/compare/CompareTrackCard';
import { TRACKS_DATA } from '../src/data/tracks';

test('CompareTrackCard illustration backdrop matches Dashboard Explore Your Tracks styling for NT, BA, and SM', () => {
  const ntHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareTrackCard code="NT" track={TRACKS_DATA.NT} trackScore={null} />
    </MemoryRouter>,
  );
  assert.ok(ntHtml.includes('h-16 flex items-center justify-center rounded-xl overflow-hidden border'));
  assert.ok(ntHtml.includes('bg-[var(--accent-nt-tint)] dark:bg-linear-to-b dark:from-blue-950/50 dark:to-slate-900 border-[var(--accent-nt-border)] dark:border-blue-900/40'));
  assert.ok(ntHtml.includes('scale-85 origin-center'));
  assert.ok(!ntHtml.includes('bg-slate-50/70'));

  const baHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareTrackCard code="BA" track={TRACKS_DATA.BA} trackScore={88} />
    </MemoryRouter>,
  );
  assert.ok(baHtml.includes('bg-[var(--accent-ba-tint)] dark:bg-linear-to-b dark:from-purple-950/50 dark:to-slate-900 border-[var(--accent-ba-border)] dark:border-purple-900/40'));

  const smHtml = renderToStaticMarkup(
    <MemoryRouter>
      <CompareTrackCard code="SM" track={TRACKS_DATA.SM} trackScore={76} />
    </MemoryRouter>,
  );
  assert.ok(smHtml.includes('bg-[var(--accent-sm-tint)] dark:bg-linear-to-b dark:from-emerald-950/50 dark:to-slate-900 border-[var(--accent-sm-border)] dark:border-emerald-900/40'));
});
