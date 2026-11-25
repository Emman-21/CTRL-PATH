import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStreakContributionGrid,
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

test('buildStreakContributionGrid builds GitHub-style Mon-Sun matrix with active and future flags', () => {
  // 2026-11-23 is a Monday
  const grid = buildStreakContributionGrid(
    ['2026-11-23', '2026-11-21', '2026-11-01', '2026-11-25'], // 2026-11-25 is future -> excluded
    26,
    '2026-11-23'
  );

  assert.equal(grid.weeks.length, 26);
  for (const week of grid.weeks) {
    assert.equal(week.days.length, 7);
  }

  const lastWeek = grid.weeks[grid.weeks.length - 1];
  // Monday 2026-11-23 should be row 0, active, and today
  assert.equal(lastWeek.days[0].dateStr, '2026-11-23');
  assert.equal(lastWeek.days[0].isToday, true);
  assert.equal(lastWeek.days[0].isActive, true);
  assert.equal(lastWeek.days[0].isFuture, false);

  // Tuesday..Sunday in the same week should be marked future and inactive
  for (let r = 1; r < 7; r++) {
    assert.equal(lastWeek.days[r].isFuture, true);
    assert.equal(lastWeek.days[r].isActive, false);
  }

  assert.equal(grid.activeDaysInRange, 3);
  assert.equal(grid.totalActiveDays, 3);
  assert.ok(grid.weeks.some((w) => w.monthLabel === 'Nov'));
});

