import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GEMSTONE_ASSETS, BACKGROUNDS, LUNI_POSES } from '../src/assets/manifest';
import { INITIAL_STATE } from '../src/context/StudentContext';
import { TRACKS_DATA } from '../src/data/tracks';
import {
  achievementCategoryColumns,
  achievementStats,
  achievementProgress,
  evaluateAchievements,
  filterAchievements,
  isCompletedAttempt,
  withAchievementRecords,
} from '../src/utils/achievementRules';
import { completeLearningModule } from '../src/utils/studentControls';
import { loadStudentData, migrateStudentData, serializeStudent, STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';
import type { QuizAttempt, StudentState } from '../src/types';

const fresh = (): StudentState => structuredClone(INITIAL_STATE);
const now = '2026-11-03T09:00:00.000Z';
const id = (n: number) => GEMSTONE_ASSETS.find(g => g.id === n)!.achievementId;

function completedAttempt(
  n: number,
  scores: { ntScore?: number; baScore?: number; smScore?: number } = {},
): QuizAttempt {
  const answers = Object.fromEntries(
    QUIZ_QUESTIONS.map(q => [
      q.id,
      q.type === 'true_false' || q.type === 'multiple_choice'
        ? q.correctAnswer
        : q.type === 'matching'
        ? Object.fromEntries(q.pairs.map(p => [p.term, p.definition]))
        : q.type === 'sequencing'
        ? q.steps
        : q.isEnumeration && q.enumerationFields
        ? q.enumerationFields.map(f => f.acceptedAnswers[0])
        : q.acceptedAnswers[0],
    ]),
  );
  return {
    id: `attempt-${n}`,
    date: now,
    submittedAt: now,
    attemptNumber: n,
    ntScore: scores.ntScore ?? 60,
    baScore: scores.baScore ?? 55,
    smScore: scores.smScore ?? 50,
    totalAnswered: QUIZ_QUESTIONS.length,
    totalQuestions: QUIZ_QUESTIONS.length,
    durationMinutes: 20,
    answers,
  };
}

const earned = (state: StudentState, numbers: number[]) =>
  withAchievementRecords(
    state,
    numbers.map(n => ({ id: id(n), unlockedAt: now, celebrationAcknowledged: true, eventRef: 'test:prerequisite' })),
  );

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

test('exactly 25 canonical IDs, Special rarity, categories (5/5/5/10), and valid PNG artwork', () => {
  assert.equal(GEMSTONE_ASSETS.length, 25);
  assert.equal(new Set(GEMSTONE_ASSETS.map(g => g.achievementId)).size, 25);
  assert.deepEqual(
    GEMSTONE_ASSETS.slice(0, 15).map(g => g.rarity),
    Array(3).fill(['Rare', 'Rare', 'Special', 'Special', 'Epic']).flat(),
  );
  assert.deepEqual(
    GEMSTONE_ASSETS.filter(g => g.category === 'Special').map(g => [g.name, g.rarity]),
    [
      ['First Spark', 'Rare'],
      ['Crystal Collector', 'Epic'],
      ['Fusion Theory', 'Special'],
      ['Beyond the Surface', 'Rare'],
      ['Your Own Universe', 'Legendary'],
      ['Command Ready', 'Common'],
      ['Story Seeker', 'Common'],
      ['Steady Flame', 'Rare'],
      ['Inner Glow', 'Rare'],
      ['Learning Genius', 'Legendary'],
    ],
  );
  assert.equal(GEMSTONE_ASSETS[0].name, "Sapphire's Protocol");
  assert.equal(GEMSTONE_ASSETS[5].name, "Amethyst's Foresight");
  assert.equal(GEMSTONE_ASSETS[10].name, "Emerald's Precision");
  assert.equal(GEMSTONE_ASSETS.filter(g => g.category === 'NT').length, 5);
  assert.equal(GEMSTONE_ASSETS.filter(g => g.category === 'BA').length, 5);
  assert.equal(GEMSTONE_ASSETS.filter(g => g.category === 'SM').length, 5);
  assert.equal(GEMSTONE_ASSETS.filter(g => g.category === 'Special').length, 10);

  for (const path of [...GEMSTONE_ASSETS.map(g => g.url), BACKGROUNDS.achievementsCrystalGarden, ...Object.values(LUNI_POSES).map(p => p.url)]) {
    const png = readFileSync(`public${path}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0);
  }
});

test('new student and vault-only evaluation have zero achievements', () => {
  assert.equal(achievementStats(fresh()).unlocked, 0);
  assert.equal(achievementStats(fresh()).totalCount, 25);
  assert.deepEqual(evaluateAchievements(fresh()).achievementRecords, []);
  assert.equal(achievementStats(fresh()).locked, 25);
});

test('NT, BA, SM subject completions and all-3-tracks Learning Genius unlock accurately', () => {
  let state = fresh();
  // Complete NTT 401 (14 modules) -> unlocks #2 Packet Pathfinder only
  for (const m of TRACKS_DATA.NT.subjects![0].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'NT', m.id, now);
  }
  assert.deepEqual(state.unlockedGemstones, [2]);
  assert.equal(achievementProgress(GEMSTONE_ASSETS.find(g => g.id === 3)!, state).status, 'In Progress');

  // Complete NTT 402 (2 modules) -> unlocks #1 Sapphire's Protocol and #3 Signal Keeper
  for (const m of TRACKS_DATA.NT.subjects![1].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'NT', m.id, now);
  }
  assert.deepEqual(state.unlockedGemstones, [1, 2, 3]);
  assert.equal(achievementProgress(GEMSTONE_ASSETS.find(g => g.id === 5)!, state).current, 3);

  // Complete BAT 401 & BAT 402 -> unlocks #6 Amethyst's Foresight, #7 Pattern Seeker, #8 Data Detective
  for (const m of TRACKS_DATA.BA.subjects![0].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'BA', m.id, now);
  }
  assert.equal(state.unlockedGemstones.includes(6), true);
  assert.equal(state.unlockedGemstones.includes(8), false);
  for (const m of TRACKS_DATA.BA.subjects![1].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'BA', m.id, now);
  }
  assert.equal(state.unlockedGemstones.includes(7), true);
  assert.equal(state.unlockedGemstones.includes(8), true);

  // Complete SMT 401 & SMT 402 -> unlocks #11, #12, #13 and #25 Learning Genius (3 tracks complete)
  for (const m of TRACKS_DATA.SM.subjects![0].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'SM', m.id, now);
  }
  assert.equal(state.unlockedGemstones.includes(11), true);
  assert.equal(state.unlockedGemstones.includes(25), false);
  for (const m of TRACKS_DATA.SM.subjects![1].modules.filter(x => x.status === 'available')) {
    state = completeLearningModule(state, 'SM', m.id, now);
  }
  assert.equal(state.unlockedGemstones.includes(12), true);
  assert.equal(state.unlockedGemstones.includes(13), true);
  assert.equal(state.unlockedGemstones.includes(25), true);
  // Also reaches >=10 gems so Crystal Collector (#17) cascades!
  assert.equal(state.unlockedGemstones.includes(17), true);
});

test('CTRL Quiz unlocks First Spark, >=70% track gems, Fusion Theory on 2/3-way ties, and Beyond the Surface on retake', () => {
  const state = fresh();
  assert.equal(evaluateAchievements(state, { type: 'quiz-submitted', attemptId: 'missing' }).achievementRecords.length, 0);

  // Malformed answers do not unlock anything
  const emptyAttempt = { ...completedAttempt(1), answers: {} };
  state.quizAttempts = [emptyAttempt];
  assert.equal(evaluateAchievements(state, { type: 'quiz-submitted', attemptId: emptyAttempt.id }).achievementRecords.length, 0);

  // Attempt 1: NT=70, BA=70, SM=55 -> First Spark (16), Guardian (4), Oracle (9), Fusion Theory (18, 2-way tie)
  const a1 = completedAttempt(1, { ntScore: 70, baScore: 70, smScore: 55 });
  state.quizAttempts = [a1];
  const r1 = evaluateAchievements(state, { type: 'quiz-submitted', attemptId: a1.id }, now);
  assert.deepEqual(r1.unlockedGemstones.sort((x, y) => x - y), [4, 9, 16, 18]);

  // Attempt 2: SM=75 (and balanced 3-way test checked separately) -> unlocks Keeper of Standards (14) and Beyond the Surface (19)
  const a2 = completedAttempt(2, { ntScore: 50, baScore: 60, smScore: 75 });
  const r2 = evaluateAchievements({ ...r1, quizAttempts: [a2, a1] }, { type: 'quiz-submitted', attemptId: a2.id }, now);
  assert.deepEqual(r2.unlockedGemstones.sort((x, y) => x - y), [4, 9, 14, 16, 18, 19]);

  // Balanced 3-way tie on single attempt unlocks Fusion Theory (18)
  const s3 = fresh();
  const a3 = completedAttempt(1, { ntScore: 80, baScore: 80, smScore: 80 });
  s3.quizAttempts = [a3];
  const r3 = evaluateAchievements(s3, { type: 'quiz-submitted', attemptId: a3.id }, now);
  assert.equal(r3.unlockedGemstones.includes(18), true);
  assert.equal(r3.unlockedGemstones.includes(4), true);
  assert.equal(r3.unlockedGemstones.includes(9), true);
  assert.equal(r3.unlockedGemstones.includes(14), true);
});

test('Special personal/activity milestones: Command Ready, Story Seeker, Steady Flame, Inner Glow', () => {
  // 1. Command Ready (#21) requires all 5 profile fields completed (non-default name + program + yearLevel + section + biography)
  let s = fresh();
  s = evaluateAchievements({ ...s, name: 'Ana Cruz', program: 'BSIT' }, { type: 'profile-updated' }, now);
  assert.equal(s.unlockedGemstones.includes(21), false);
  assert.equal(achievementProgress(GEMSTONE_ASSETS.find(g => g.id === 21)!, s).current, 2);
  s = evaluateAchievements(
    { ...s, yearLevel: '2nd Year', section: 'IT-2101', biography: 'Interested in analytics and networking.' },
    { type: 'profile-updated' },
    now,
  );
  assert.equal(s.unlockedGemstones.includes(21), true);

  // 2. Story Seeker (#22)
  let storyState = fresh();
  storyState = evaluateAchievements(
    { ...storyState, readAlumniStories: ['lance-edward-dela-rosa'] },
    { type: 'story-read', storyId: 'lance-edward-dela-rosa' },
    now,
  );
  assert.equal(storyState.unlockedGemstones.includes(22), true);

  // 3. Steady Flame (#23)
  let streakState = fresh();
  streakState = evaluateAchievements(
    { ...streakState, maxStreakDays: 2 },
    { type: 'streak-updated', streakCount: 2 },
    now,
  );
  assert.equal(streakState.unlockedGemstones.includes(23), false);
  assert.equal(achievementProgress(GEMSTONE_ASSETS.find(g => g.id === 23)!, streakState).current, 2);
  streakState = evaluateAchievements(
    { ...streakState, maxStreakDays: 3 },
    { type: 'streak-updated', streakCount: 3 },
    now,
  );
  assert.equal(streakState.unlockedGemstones.includes(23), true);

  // 4. Inner Glow (#24) requires non-empty reflection thought
  let reflState = fresh();
  reflState = evaluateAchievements(reflState, { type: 'reflection-saved', track: 'NT' }, now);
  assert.equal(reflState.unlockedGemstones.includes(24), false);
  reflState.reflections.NT.interests = 'Packet routing and cloud defense';
  reflState = evaluateAchievements(reflState, { type: 'reflection-saved', track: 'NT' }, now);
  assert.equal(reflState.unlockedGemstones.includes(24), true);
});

test('all three epic dependencies, collector threshold and universe cascade without duplicates', () => {
  for (const start of [1, 6, 11]) {
    const incomplete = evaluateAchievements(earned(fresh(), [start, start + 1, start + 2]));
    assert.equal(incomplete.unlockedGemstones.includes(start + 4), false);
    const complete = evaluateAchievements(earned(fresh(), [start, start + 1, start + 2, start + 3]));
    assert.equal(complete.unlockedGemstones.includes(start + 4), true);
  }
  const nine = [1, 2, 3, 6, 7, 8, 11, 12, 13];
  assert.equal(evaluateAchievements(earned(fresh(), nine)).unlockedGemstones.includes(17), false);
  assert.equal(evaluateAchievements(earned(fresh(), [...nine, 16])).unlockedGemstones.includes(17), true);
  const result = evaluateAchievements(earned(fresh(), [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14]));
  assert.equal(result.unlockedGemstones.includes(20), true);
  assert.equal(result.unlockedGemstones.length, 17);
  assert.deepEqual(evaluateAchievements(result).achievementRecords, result.achievementRecords);
  assert.equal(achievementStats(result).percent, 68);
});

test('migration preserves earned legacy IDs, user progress, unknown-date honesty and backup', () => {
  const storage = new MemoryStorage();
  const raw = JSON.stringify({ name: 'Existing student', unlockedGemstones: [1, 1, 2, 6, 7, 16, 999], exploredTracks: { NT: true }, trackProgress: { NT: 67 }, quizAttempts: [completedAttempt(1)] });
  storage.setItem(STUDENT_STORAGE_KEY, raw);
  const loaded = loadStudentData(storage, fresh());
  assert.equal(loaded.canPersist, true);
  assert.equal(loaded.state.name, 'Existing student');
  assert.equal(loaded.state.trackProgress.NT, 67);
  assert.deepEqual(loaded.state.unlockedGemstones, [1, 2, 6, 7, 16]);
  assert.ok(loaded.state.achievementRecords.every(r => r.unlockedAt === null && r.celebrationAcknowledged));
  assert.ok([...storage.values].some(([key, value]) => key.includes('_backup_') && value === raw));
  assert.equal(loaded.state.quizAttempts.length, 1);
  assert.equal('unlockedGemstones' in serializeStudent(loaded.state), false);
});

test('reload preserves timestamp and acknowledgement, with no new awards from page load', () => {
  const state = earned(fresh(), [1, 16]);
  const storage = new MemoryStorage();
  storage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(serializeStudent(state)));
  const loaded = loadStudentData(storage, fresh());
  assert.deepEqual(loaded.state.achievementRecords, state.achievementRecords);
  assert.equal(loaded.state.achievementRecords.some(r => !r.celebrationAcknowledged), false);
  assert.equal(storage.length, 1);
});

test('malformed storage is backed up; backup failure never authorizes overwriting original', () => {
  const storage = new MemoryStorage();
  storage.setItem(STUDENT_STORAGE_KEY, '{broken');
  const loaded = loadStudentData(storage, fresh());
  assert.equal(loaded.state.achievementRecords.length, 0);
  assert.ok(loaded.warning);
  assert.ok([...storage.values.values()].includes('{broken'));
  storage.setItem = () => { throw new Error('quota'); };
  assert.equal(loadStudentData(storage, fresh()).canPersist, false);
  assert.equal(storage.getItem(STUDENT_STORAGE_KEY), '{broken');
  assert.equal(
    migrateStudentData(
      { exploredTracks: null, achievementRecords: [null, { id: 'unknown' }], unlockedGemstones: [null], reflections: null, quizAttempts: null },
      fresh(),
    ).achievementRecords.length,
    0,
  );
});

test('duplicate canonical records preserve oldest timestamp and acknowledgement; unknown IDs excluded', () => {
  const result = migrateStudentData({
    ...serializeStudent(fresh()),
    achievementRecords: [
      { id: id(1), unlockedAt: now, celebrationAcknowledged: true },
      { id: id(1), unlockedAt: '2026-11-04T09:00:00.000Z', celebrationAcknowledged: false },
      { id: 'unknown', unlockedAt: now },
    ],
  }, fresh());
  assert.equal(result.achievementRecords.length, 1);
  assert.equal(result.achievementRecords[0].unlockedAt, now);
  assert.equal(result.achievementRecords[0].celebrationAcknowledged, true);
});

test('category/status/rarity filters, empty states, sortOrder collection ordering, and shared stats', () => {
  const state = earned(fresh(), [1, 6, 16]);
  assert.equal(filterAchievements(state, 'All', 'All', 'Collection order').length, 25);
  // Special achievements follow requested display order 1..10 via sortOrder
  assert.deepEqual(
    filterAchievements(state, 'Special', 'All', 'Collection order').map(g => g.name),
    [
      'Command Ready',
      'Story Seeker',
      'Beyond the Surface',
      'Steady Flame',
      'First Spark',
      'Inner Glow',
      'Fusion Theory',
      'Crystal Collector',
      'Learning Genius',
      'Your Own Universe',
    ],
  );
  assert.equal(filterAchievements(state, 'SM', 'Unlocked', 'Name').length, 0);
  assert.equal(filterAchievements(state, 'NT', 'In Progress', 'Name')[0].id, 5);
  assert.deepEqual(filterAchievements(state, 'All', 'Unlocked', 'Name').map(g => g.id), [6, 16, 1]);
  assert.equal(filterAchievements(state, 'All', 'All', 'Rarity')[0].rarity, 'Legendary');
  assert.equal(filterAchievements(state, 'All', 'All', 'Recently Unlocked').slice(0, 3).every(g => [1, 6, 16].includes(g.id)), true);
  assert.equal(filterAchievements(state, 'All', 'All', 'Collection order', 'Common').length, 2);
  assert.equal(filterAchievements(state, 'All', 'All', 'Collection order', 'Rare').length, 10);
  assert.equal(filterAchievements(state, 'All', 'All', 'Collection order', 'Special').length, 7);
  assert.equal(filterAchievements(state, 'All', 'All', 'Collection order', 'Epic').length, 4);
  assert.deepEqual(filterAchievements(state, 'All', 'All', 'Collection order', 'Legendary').map(g => g.id), [25, 20]);
  assert.deepEqual(filterAchievements(state, 'All', 'Unlocked', 'Name', 'Rare').map(g => g.id), [6, 16, 1]);
  assert.equal(filterAchievements(state, 'All', 'Unlocked', 'Collection order', 'Common').length, 0);
  const stats = achievementStats(state);
  assert.equal(stats.unlocked, 3);
  assert.equal(stats.percent, 12);
  assert.equal(stats.categories.NT, 1);
  assert.equal(stats.categories.Special, 1);
  assert.equal(stats.categoryTotals.Special, 10);
  assert.equal(stats.locked + stats.inProgress + stats.unlocked, 25);
});

test('achievementCategoryColumns groups unlocked gemstones into NT (5), BA (5), SM (5), Special (10) in order', () => {
  const emptyCols = achievementCategoryColumns(fresh());
  assert.deepEqual(emptyCols.map(c => c.category), ['NT', 'BA', 'SM', 'Special']);
  assert.deepEqual(emptyCols.map(c => [c.unlockedCount, c.totalCount]), [[0, 5], [0, 5], [0, 5], [0, 10]]);
  const state = earned(fresh(), [1, 16, 18]);
  const cols = achievementCategoryColumns(state);
  assert.equal(cols[0].unlockedCount, 1);
  assert.deepEqual(cols[0].unlockedGems.map(x => x.gem.name), ["Sapphire's Protocol"]);
  assert.equal(cols[1].unlockedCount, 0);
  assert.equal(cols[2].unlockedCount, 0);
  assert.equal(cols[3].unlockedCount, 2);
  assert.deepEqual(cols[3].unlockedGems.map(x => x.gem.name), ['First Spark', 'Fusion Theory']);
});


