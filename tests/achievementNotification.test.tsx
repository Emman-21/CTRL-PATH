import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GEMSTONE_ASSETS } from '../src/assets/manifest';
import { StudentProvider } from '../src/context/StudentContext';
import {
  getAchievementNotificationContent,
  getNextPendingAchievementId,
  shouldOffsetForFloatingLuni,
} from '../src/utils/achievementNotification';
import { AchievementNotificationBox } from '../src/components/shared/AchievementUnlockCelebration';

test('getNextPendingAchievementId returns the first unacknowledged achievement in queue order', () => {
  assert.equal(getNextPendingAchievementId([]), undefined);
  assert.equal(
    getNextPendingAchievementId([
      { id: 'nt-peridots-protocol', unlockedAt: '2026-11-03T09:00:00.000Z', celebrationAcknowledged: true },
      { id: 'special-first-spark', unlockedAt: '2026-11-03T09:05:00.000Z', celebrationAcknowledged: false },
      { id: 'special-fusion-theory', unlockedAt: '2026-11-03T09:06:00.000Z', celebrationAcknowledged: false },
    ]),
    'special-first-spark',
  );
  assert.equal(
    getNextPendingAchievementId([
      { id: 'nt-peridots-protocol', unlockedAt: '2026-11-03T09:00:00.000Z', celebrationAcknowledged: true },
    ]),
    undefined,
  );
});

test('shouldOffsetForFloatingLuni offsets above Luni only when floating widget is active', () => {
  assert.equal(shouldOffsetForFloatingLuni({ pathname: '/tracks', luniEnabled: true }), true);
  assert.equal(shouldOffsetForFloatingLuni({ pathname: '/results', luniEnabled: true }), false);
  assert.equal(shouldOffsetForFloatingLuni({ pathname: '/tracks', luniEnabled: false }), false);
  assert.equal(
    shouldOffsetForFloatingLuni({ pathname: '/quiz', luniEnabled: true, isQuizFocusMode: true }),
    false,
  );
  assert.equal(
    shouldOffsetForFloatingLuni({ pathname: '/quiz', luniEnabled: true, isQuizAnswering: true }),
    false,
  );
  assert.equal(
    shouldOffsetForFloatingLuni({ pathname: '/quiz', luniEnabled: true, isQuizAnswering: false }),
    true,
  );
});

test('getAchievementNotificationContent tailors copy for standard and capstone achievements', () => {
  const firstGem = GEMSTONE_ASSETS[0];
  const universeGem = GEMSTONE_ASSETS[19];

  const standard = getAchievementNotificationContent(firstGem);
  assert.equal(standard.eyebrow, 'Achievement unlocked');
  assert.equal(standard.title, firstGem.name);
  assert.equal(standard.rarity, firstGem.rarity);
  assert.equal(standard.ctaLabel, 'View in Vault');
  assert.equal(standard.message, 'Added to your Gemstone Vault.');

  const capstone = getAchievementNotificationContent(universeGem);
  assert.equal(capstone.rarity, 'Legendary');
  assert.ok(capstone.message.includes('every pathway gemstone'));
});

test('AchievementNotificationBox renders a non-modal side toast instead of a blocking dialog', () => {
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
    const gem = GEMSTONE_ASSETS[0];
    const fakeWinkSprite = {
      activePose: { id: 'wink' as const, src: '/assets/aistudio/luni_wink_sheet.png', frames: 4, label: 'Wink' },
      sheet: null,
      sheetsById: {},
      isPlaying: false,
      playCount: 0,
      durationMs: 1200,
      activeEffect: null,
      triggerPose: () => {},
      triggerRandomPose: () => {},
      handleAnimationEnd: () => {},
    };

    const normalHtml = renderToStaticMarkup(
      <StudentProvider>
        <AchievementNotificationBox
          gem={gem}
          prefersReducedMotion={false}
          offsetForLuni={true}
          isPaused={false}
          onPauseChange={() => {}}
          onDismiss={() => {}}
          onViewVault={() => {}}
          winkSprite={fakeWinkSprite as never}
        />
      </StudentProvider>,
    );

    assert.ok(normalHtml.includes('<aside'));
    assert.ok(!normalHtml.includes('<dialog'));
    assert.ok(normalHtml.includes('data-testid="achievement-toast"'));
    assert.ok(normalHtml.includes('role="status"'));
    assert.ok(normalHtml.includes('has-floating-luni'));
    assert.ok(normalHtml.includes("Sapphire&#x27;s Protocol"));
    assert.ok(normalHtml.includes('View in Vault'));
    assert.ok(normalHtml.includes('Dismiss achievement notification'));
    assert.ok(normalHtml.includes('achievement-toast-timer'));

    const reducedHtml = renderToStaticMarkup(
      <StudentProvider>
        <AchievementNotificationBox
          gem={gem}
          prefersReducedMotion={true}
          offsetForLuni={false}
          isPaused={false}
          onPauseChange={() => {}}
          onDismiss={() => {}}
          onViewVault={() => {}}
          winkSprite={fakeWinkSprite as never}
        />
      </StudentProvider>,
    );

    assert.ok(reducedHtml.includes('data-reduced-motion="true"'));
    assert.ok(!reducedHtml.includes('has-floating-luni'));
    assert.ok(!reducedHtml.includes('achievement-toast-timer'));
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
});
