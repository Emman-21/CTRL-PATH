import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { GEMSTONE_ASSETS } from '../src/assets/manifest';
import { INITIAL_STATE, StudentProvider } from '../src/context/StudentContext';
import { CommunityProvider } from '../src/context/CommunityContext';
import { AchievementCard } from '../src/components/achievements/AchievementCard';
import { DashboardPage } from '../src/pages/DashboardPage';

test('AchievementCard renders RaritySparkles exclusively for Epic and Legendary achievements', () => {
  const commonGem = GEMSTONE_ASSETS.find((g) => g.rarity === 'Common')!;
  const rareGem = GEMSTONE_ASSETS.find((g) => g.rarity === 'Rare')!;
  const specialGem = GEMSTONE_ASSETS.find((g) => g.rarity === 'Special')!;
  const epicGem = GEMSTONE_ASSETS.find((g) => g.rarity === 'Epic')!;
  const legendaryGem = GEMSTONE_ASSETS.find((g) => g.rarity === 'Legendary')!;

  const commonHtml = renderToStaticMarkup(
    <AchievementCard gem={commonGem} state={INITIAL_STATE} onSelect={() => {}} />,
  );
  const rareHtml = renderToStaticMarkup(
    <AchievementCard gem={rareGem} state={INITIAL_STATE} onSelect={() => {}} />,
  );
  const specialHtml = renderToStaticMarkup(
    <AchievementCard gem={specialGem} state={INITIAL_STATE} onSelect={() => {}} />,
  );
  const epicHtml = renderToStaticMarkup(
    <AchievementCard gem={epicGem} state={INITIAL_STATE} onSelect={() => {}} />,
  );
  const legendaryHtml = renderToStaticMarkup(
    <AchievementCard gem={legendaryGem} state={INITIAL_STATE} onSelect={() => {}} />,
  );

  assert.equal(commonHtml.includes('gem-rarity-sparkles'), false);
  assert.equal(rareHtml.includes('gem-rarity-sparkles'), false);
  assert.equal(specialHtml.includes('gem-rarity-sparkles'), false);

  assert.ok(epicHtml.includes('gem-rarity-sparkles is-epic'));
  assert.ok(epicHtml.includes('is-rarity-epic'));
  assert.ok(legendaryHtml.includes('gem-rarity-sparkles is-legendary'));
  assert.ok(legendaryHtml.includes('is-rarity-legendary'));
});

test('DashboardPage styles unlocked Special Achievements yellow and renders sparkles for Epic and Legendary gems', () => {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  const seeded = {
    ...INITIAL_STATE,
    achievementRecords: [
      {
        id: 'special-story-seeker',
        unlockedAt: '2026-11-24T01:00:00.000Z',
        eventRef: 'story:joeren-aguila',
        celebrationAcknowledged: true,
      },
      {
        id: 'special-crystal-collector',
        unlockedAt: '2026-11-24T01:05:00.000Z',
        eventRef: 'collector:10',
        celebrationAcknowledged: true,
      },
      {
        id: 'special-your-own-universe',
        unlockedAt: '2026-11-24T01:10:00.000Z',
        eventRef: 'tracks:15',
        celebrationAcknowledged: true,
      },
    ],
  };
  store.set('ctrl_path_student_data_v1', JSON.stringify(seeded));

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
          <CommunityProvider>
            <DashboardPage />
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );

    assert.ok(html.includes('from-yellow-50/90'), 'Expected yellow gradient on unlocked Special achievement card');
    assert.ok(html.includes('text-yellow-800'), 'Expected yellow Earned badge on unlocked Special achievement card');
    assert.ok(html.includes('gem-rarity-sparkles is-epic'), 'Expected Epic sparkles on Dashboard recent gemstones');
    assert.ok(html.includes('gem-rarity-sparkles is-legendary'), 'Expected Legendary sparkles on Dashboard recent gemstones');
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});
