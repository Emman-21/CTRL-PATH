import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GEMSTONE_ASSETS } from '../src/assets/manifest';
import { INITIAL_STATE } from '../src/context/StudentContext';
import { AchievementCard } from '../src/components/achievements/AchievementCard';

test('AchievementCard renders the matching track or special SVG logo inside .gem-category-label', () => {
  const cases = [
    { index: 0, code: 'NT', name: 'Networking Technology' },
    { index: 5, code: 'BA', name: 'Business Analytics' },
    { index: 10, code: 'SM', name: 'Service Management' },
    { index: 15, code: 'SP', name: 'Special Achievements' },
  ] as const;

  for (const c of cases) {
    const html = renderToStaticMarkup(
      <AchievementCard gem={GEMSTONE_ASSETS[c.index]} state={INITIAL_STATE} onSelect={() => {}} />,
    );
    const labelMatch = html.match(/<span class="gem-category-label">([\s\S]*?)<\/span><span class="gem-description">/);
    assert.ok(labelMatch, `Expected .gem-category-label in ${c.name} card`);
    assert.ok(labelMatch[1].includes(`>${c.code}</text>`), `Expected ${c.code} SVG logo inside .gem-category-label`);
    assert.ok(labelMatch[1].includes(c.name), `Expected category label ${c.name}`);
  }
});
