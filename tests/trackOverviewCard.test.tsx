import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrackOverviewCard } from '../src/components/tracks/TrackOverviewCard';
import { TRACKS_DATA } from '../src/data/tracks';

test('TrackOverviewCard compare button provides dark-mode surface, border, and contrast in unselected and selected states', () => {
  const unselectedHtml = renderToStaticMarkup(
    <TrackOverviewCard
      code="BA"
      track={TRACKS_DATA.BA}
      isExplored={false}
      isCompared={false}
      progress={0}
      onExplore={() => {}}
      onToggleCompare={() => {}}
    />,
  );
  assert.ok(unselectedHtml.includes('Compare Track'));
  assert.ok(unselectedHtml.includes('dark:bg-[#131d33]!'));
  assert.ok(unselectedHtml.includes('dark:text-slate-200!'));
  assert.ok(unselectedHtml.includes('dark:border-slate-700!'));

  const selectedHtml = renderToStaticMarkup(
    <TrackOverviewCard
      code="SM"
      track={TRACKS_DATA.SM}
      isExplored={false}
      isCompared={true}
      progress={40}
      onExplore={() => {}}
      onToggleCompare={() => {}}
    />,
  );
  assert.ok(selectedHtml.includes('Added to Comparison'));
  assert.ok(selectedHtml.includes('dark:bg-indigo-950/80!'));
  assert.ok(selectedHtml.includes('dark:text-indigo-200!'));
  assert.ok(selectedHtml.includes('dark:border-indigo-500/70!'));
  assert.ok(selectedHtml.includes('dark:text-indigo-300!'));
});
