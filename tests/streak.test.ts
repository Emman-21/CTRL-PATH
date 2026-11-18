import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCalendarDayDifference,
  getCelebrationCopy,
  getCurrentWeekDays,
  STREAK_MILESTONES,
} from '../src/utils/streakManager';

test('calendar day difference calculates consecutive and missed days', () => {
  assert.equal(getCalendarDayDifference('2026-11-10', '2026-11-10'), 0);
  assert.equal(getCalendarDayDifference('2026-11-09', '2026-11-10'), 1);
  assert.equal(getCalendarDayDifference('2026-11-08', '2026-11-10'), 2);
  assert.equal(getCalendarDayDifference('2026-10-31', '2026-11-01'), 1);
});

test('celebration copy handles milestones and fresh starts', () => {
  const fresh = getCelebrationCopy(1, true);
  assert.equal(fresh.headline, 'Fresh start! Day 1.');
  assert.equal(fresh.isMilestone, false);

  const m3 = getCelebrationCopy(3, false);
  assert.equal(m3.isMilestone, true);
  assert.match(m3.headline, /3-Day Streak/);

  const m7 = getCelebrationCopy(7, false);
  assert.equal(m7.isMilestone, true);
  assert.match(m7.headline, /One Whole Week/i);

  const m14 = getCelebrationCopy(14, false);
  assert.equal(m14.isMilestone, true);

  const m30 = getCelebrationCopy(30, false);
  assert.equal(m30.isMilestone, true);

  const normal5 = getCelebrationCopy(5, false);
  assert.equal(normal5.isMilestone, false);
  assert.equal(normal5.headline, '5-Day Streak!');
});

test('week days returns 7 days from Mon to Sun', () => {
  const days = getCurrentWeekDays(['2026-11-10']);
  assert.equal(days.length, 7);
  assert.deepEqual(days.map(d => d.dayLetter), ['M', 'T', 'W', 'T', 'F', 'S', 'S']);
});
