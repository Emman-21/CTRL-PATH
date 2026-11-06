import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GEMSTONE_ASSETS, BACKGROUNDS } from '../src/assets/manifest';
import { INITIAL_STATE } from '../src/context/StudentContext';
import { achievementStats, achievementProgress, evaluateAchievements, filterAchievements, isCompletedAttempt, withAchievementRecords } from '../src/utils/achievementRules';
import { loadStudentData, migrateStudentData, serializeStudent, STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';
import type { QuizAttempt, StudentState } from '../src/types';

const fresh = (): StudentState => structuredClone(INITIAL_STATE);
const now = '2026-11-03T09:00:00.000Z';
const id = (n: number) => GEMSTONE_ASSETS[n - 1].achievementId;
function completedAttempt(n: number): QuizAttempt {
  const answers = Object.fromEntries(QUIZ_QUESTIONS.map(q => [q.id, q.type === 'true_false' || q.type === 'multiple_choice' ? q.correctAnswer : q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.term, p.definition])) : q.type === 'sequencing' ? q.steps : q.isEnumeration && q.enumerationFields ? q.enumerationFields.map(f => f.acceptedAnswers[0]) : q.acceptedAnswers[0]]));
  return { id: `attempt-${n}`, date: now, submittedAt: now, attemptNumber: n, ntScore: 100, baScore: 100, smScore: 100, totalAnswered: QUIZ_QUESTIONS.length, totalQuestions: QUIZ_QUESTIONS.length, durationMinutes: 20, answers };
}
const earned = (state: StudentState, numbers: number[]) => withAchievementRecords(state, numbers.map(n => ({ id: id(n), unlockedAt: now, celebrationAcknowledged: true, eventRef: 'test:prerequisite' })));
class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

test('exactly 20 stable canonical IDs, rarities, categories and original PNG mappings', () => {
  assert.equal(GEMSTONE_ASSETS.length, 20);
  assert.equal(new Set(GEMSTONE_ASSETS.map(g => g.achievementId)).size, 20);
  assert.deepEqual(GEMSTONE_ASSETS.map(g => g.rarity), [...Array(3).fill(['Common','Common','Uncommon','Rare','Epic']).flat(), 'Common','Rare','Uncommon','Epic','Legendary']);
  assert.deepEqual(GEMSTONE_ASSETS.map(g => g.achievementId), ['nt-peridots-protocol','nt-packet-pathfinder','nt-signal-keeper','nt-guardian-of-the-grid','nt-techno-gem','ba-garnets-foresight','ba-pattern-seeker','ba-data-detective','ba-oracle-of-numbers','ba-crystal-vision','sm-pearls-precision','sm-customer-champion','sm-workflow-weaver','sm-keeper-of-standards','sm-perfect-coordination','special-first-spark','special-crystal-collector','special-fusion-theory','special-beyond-the-surface','special-your-own-universe']);
  for (const category of ['NT','BA','SM','Special']) assert.equal(GEMSTONE_ASSETS.filter(g => g.category === category).length, 5);
  for (const path of [...GEMSTONE_ASSETS.map(g => g.url), BACKGROUNDS.achievementsCrystalGarden]) {
    const png = readFileSync(`public${path}`);
    assert.equal(png.subarray(1,4).toString(), 'PNG');
    assert.ok(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0);
  }
});
test('new student and vault-only evaluation have zero achievements', () => {
  assert.equal(achievementStats(fresh()).unlocked, 0);
  assert.deepEqual(evaluateAchievements(fresh()).achievementRecords, []);
  assert.equal(achievementStats(fresh()).locked, 20);
});
for (const [track, gem] of [['NT',1],['BA',6],['SM',11]] as const) test(`${track} exploration unlocks only its intro once and persists timestamp`, () => {
  let state = fresh();
  assert.equal(evaluateAchievements(state, { type: 'track-explored', track }).achievementRecords.length, 0);
  state.exploredTracks[track] = true;
  state = evaluateAchievements(state, { type: 'track-explored', track }, now);
  state = evaluateAchievements(state, { type: 'track-explored', track });
  assert.deepEqual(state.unlockedGemstones, [gem]);
  assert.equal(state.achievementRecords[0].unlockedAt, now);
  assert.equal(state.achievementRecords[0].celebrationAcknowledged, false);
  assert.equal(achievementProgress(GEMSTONE_ASSETS[gem+3], state).status, 'In Progress');
});
test('first completed quiz unlocks First Spark; absent, skipped and malformed answers do not', () => {
  const state = fresh();
  assert.equal(evaluateAchievements(state, { type: 'quiz-submitted', attemptId: 'missing' }).achievementRecords.length, 0);
  const attempt = completedAttempt(1);
  assert.equal(isCompletedAttempt(attempt), true);
  state.quizAttempts = [{ ...attempt, answers: {} }];
  assert.equal(evaluateAchievements(state, { type: 'quiz-submitted', attemptId: attempt.id }).achievementRecords.length, 0);
  state.quizAttempts = [attempt];
  const result = evaluateAchievements(state, { type: 'quiz-submitted', attemptId: attempt.id }, now);
  assert.deepEqual(result.unlockedGemstones, [16]);
  assert.deepEqual(evaluateAchievements(result, { type: 'quiz-submitted', attemptId: attempt.id }).achievementRecords, result.achievementRecords);
});
test('meaningful path comparison requires distinct tracks and a saved review', () => {
  const state = fresh();
  state.savedComparisons = [{ id: 'c', tracks: ['NT','NT'], title: 'Compare', date: now, reviewedAt: now }];
  assert.equal(evaluateAchievements(state, { type: 'paths-compared', comparisonId: 'c' }).achievementRecords.length, 0);
  state.savedComparisons[0].tracks = ['NT','BA'];
  delete state.savedComparisons[0].reviewedAt;
  assert.equal(evaluateAchievements(state, { type: 'paths-compared', comparisonId: 'c' }).achievementRecords.length, 0);
  state.savedComparisons[0].reviewedAt = now;
  const result = evaluateAchievements(state, { type: 'paths-compared', comparisonId: 'c' }, now);
  assert.deepEqual(result.unlockedGemstones, [18]);
  assert.equal(evaluateAchievements(result, { type: 'paths-compared', comparisonId: 'c' }).achievementRecords.length, 1);
});
test('Beyond the Surface requires an eligible completed retake AND recorded comparison', () => {
  const state = fresh();
  state.quizAttempts = [completedAttempt(2), completedAttempt(1)];
  assert.equal(evaluateAchievements(state).unlockedGemstones.includes(19), false);
  assert.equal(evaluateAchievements(state, { type: 'quiz-submitted', attemptId: 'attempt-2' }).unlockedGemstones.includes(19), false);
  assert.equal(achievementProgress(GEMSTONE_ASSETS[18], state).current, 1);
  state.attemptComparisons = [{ id: 'ac', attemptIds: ['attempt-1','attempt-2'], completedAt: now }];
  assert.deepEqual(evaluateAchievements(state, { type: 'attempts-compared', comparisonId: 'ac' }).unlockedGemstones, [19]);
  state.attemptComparisons[0].attemptIds = ['attempt-1','attempt-1'];
  assert.equal(evaluateAchievements(state, { type: 'attempts-compared', comparisonId: 'ac' }).achievementRecords.length, 0);
  state.quizAttempts[0] = completedAttempt(4);
  state.attemptComparisons[0].attemptIds = ['attempt-1','attempt-4'];
  assert.equal(evaluateAchievements(state, { type: 'attempts-compared', comparisonId: 'ac' }).achievementRecords.length, 0);
});
test('all three epic dependencies, collector threshold and universe cascade without duplicates', () => {
  for (const start of [1,6,11]) {
    const incomplete = evaluateAchievements(earned(fresh(), [start,start+1,start+2]));
    assert.equal(incomplete.unlockedGemstones.includes(start+4), false);
    const complete = evaluateAchievements(earned(fresh(), [start,start+1,start+2,start+3]));
    assert.equal(complete.unlockedGemstones.includes(start+4), true);
  }
  const nine = [1,2,3,6,7,8,11,12,13];
  assert.equal(evaluateAchievements(earned(fresh(), nine)).unlockedGemstones.includes(17), false);
  assert.equal(evaluateAchievements(earned(fresh(), [...nine,16])).unlockedGemstones.includes(17), true);
  const result = evaluateAchievements(earned(fresh(), [1,2,3,4,6,7,8,9,11,12,13,14]));
  assert.equal(result.unlockedGemstones.includes(20), true);
  assert.equal(result.unlockedGemstones.length, 17);
  assert.deepEqual(evaluateAchievements(result).achievementRecords, result.achievementRecords);
  assert.equal(achievementStats(result).percent, 85);
});
test('unavailable activities stay locked despite track progress or quiz scores', () => {
  const state = fresh(); state.trackProgress = { NT:100,BA:100,SM:100 }; state.quizAttempts = [completedAttempt(1)];
  const result = evaluateAchievements(state, { type: 'quiz-submitted', attemptId: 'attempt-1' });
  for (const n of [2,3,4,7,8,9,12,13,14]) {
    assert.equal(achievementProgress(GEMSTONE_ASSETS[n-1], result).status, 'Locked');
    assert.equal(achievementProgress(GEMSTONE_ASSETS[n-1], result).hint, 'Awaiting activity availability');
  }
});
test('migration preserves earned legacy IDs, user progress, unknown-date honesty and backup', () => {
  const storage = new MemoryStorage();
  const raw = JSON.stringify({ name:'Existing student', unlockedGemstones:[1,1,2,6,7,16,999], exploredTracks:{ NT:true }, trackProgress:{ NT:67 }, quizAttempts:[completedAttempt(1)] });
  storage.setItem(STUDENT_STORAGE_KEY, raw);
  const loaded = loadStudentData(storage, fresh());
  assert.equal(loaded.canPersist, true);
  assert.equal(loaded.state.name, 'Existing student');
  assert.equal(loaded.state.trackProgress.NT, 67);
  assert.deepEqual(loaded.state.unlockedGemstones, [1,2,6,7,16]);
  assert.ok(loaded.state.achievementRecords.every(r => r.unlockedAt === null && r.celebrationAcknowledged));
  assert.ok([...storage.values].some(([key,value]) => key.includes('_backup_') && value === raw));
  assert.equal(loaded.state.quizAttempts.length, 1);
  assert.equal('unlockedGemstones' in serializeStudent(loaded.state), false);
});
test('reload preserves timestamp and acknowledgement, with no new awards from page load', () => {
  let state = earned(fresh(), [1,16]);
  const storage = new MemoryStorage(); storage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(serializeStudent(state)));
  const loaded = loadStudentData(storage, fresh());
  assert.deepEqual(loaded.state.achievementRecords, state.achievementRecords);
  assert.equal(loaded.state.achievementRecords.some(r => !r.celebrationAcknowledged), false);
  assert.equal(storage.length, 1);
});
test('malformed storage is backed up; backup failure never authorizes overwriting original', () => {
  const storage = new MemoryStorage(); storage.setItem(STUDENT_STORAGE_KEY, '{broken');
  const loaded = loadStudentData(storage, fresh());
  assert.equal(loaded.state.achievementRecords.length, 0);
  assert.ok(loaded.warning);
  assert.ok([...storage.values.values()].includes('{broken'));
  storage.setItem = () => { throw new Error('quota'); };
  assert.equal(loadStudentData(storage, fresh()).canPersist, false);
  assert.equal(storage.getItem(STUDENT_STORAGE_KEY), '{broken');
  assert.equal(migrateStudentData({ exploredTracks:null, achievementRecords:[null,{ id:'unknown' }], unlockedGemstones:[null], reflections:null, quizAttempts:null }, fresh()).achievementRecords.length, 0);
});
test('duplicate canonical records preserve oldest timestamp and acknowledgement; unknown IDs excluded', () => {
  const result = migrateStudentData({ ...serializeStudent(fresh()), achievementRecords:[
    { id:id(1), unlockedAt:now, celebrationAcknowledged:true },
    { id:id(1), unlockedAt:'2026-11-04T09:00:00.000Z', celebrationAcknowledged:false },
    { id:'unknown', unlockedAt:now },
  ] }, fresh());
  assert.equal(result.achievementRecords.length, 1);
  assert.equal(result.achievementRecords[0].unlockedAt, now);
  assert.equal(result.achievementRecords[0].celebrationAcknowledged, true);
});
test('category/status filters, empty states, name/rarity/recent sorting and shared stats', () => {
  const state = earned(fresh(), [1,6,16]);
  assert.equal(filterAchievements(state,'All','All','Collection order').length, 20);
  assert.equal(filterAchievements(state,'SM','Unlocked','Name').length, 0);
  assert.equal(filterAchievements(state,'NT','In Progress','Name')[0].id, 5);
  assert.deepEqual(filterAchievements(state,'All','Unlocked','Name').map(g => g.id), [16,6,1]);
  assert.equal(filterAchievements(state,'All','All','Rarity')[0].id, 20);
  assert.equal(filterAchievements(state,'All','All','Recently Unlocked').slice(0,3).every(g => [1,6,16].includes(g.id)), true);
  const stats = achievementStats(state); assert.equal(stats.unlocked,3); assert.equal(stats.percent,15); assert.equal(stats.categories.NT,1); assert.equal(stats.categories.Special,1);
  assert.equal(stats.locked + stats.inProgress + stats.unlocked, 20);
});
