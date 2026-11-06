import { GEMSTONE_ASSETS, type GemstoneAsset } from '../assets/manifest';
import type { StudentState, QuizAttempt } from '../types';
import type { AchievementEvent, AchievementRecord } from '../types/achievements';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';

// The existing manifest remains the single source of metadata and artwork.
export const achievementAssetMap = Object.fromEntries(GEMSTONE_ASSETS.map(g => [g.achievementId, g.url]));
export const CATEGORY_NAMES = { NT: 'Networking Technology', BA: 'Business Analytics', SM: 'Service Management', Special: 'Special Achievements' };
export const ACTIVITY_GEMS = new Set([2, 3, 4, 7, 8, 9, 12, 13, 14]);
export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const canonicalId = (id: number) => GEMSTONE_ASSETS.find(g => g.id === id)!.achievementId;
const prerequisites: Record<number, number[]> = {
  5: [1, 2, 3, 4], 10: [6, 7, 8, 9], 15: [11, 12, 13, 14],
  20: Array.from({ length: 15 }, (_, i) => i + 1),
};

// Check actual answer shapes, rather than trusting reported completion counters.
export function isCompletedAttempt(attempt: QuizAttempt | undefined): boolean {
  if (!attempt || !attempt.id || !Number.isInteger(attempt.attemptNumber) || attempt.attemptNumber < 1 ||
      attempt.totalQuestions !== QUIZ_QUESTIONS.length || !attempt.answers) return false;
  return QUIZ_QUESTIONS.every(q => {
    const a = attempt.answers![q.id];
    if (q.type === 'true_false') return typeof a === 'boolean';
    if (q.type === 'multiple_choice') return q.options.some(o => o.key === a);
    if (q.type === 'matching') return a && typeof a === 'object' && q.pairs.every(p => typeof a[p.term] === 'string' && a[p.term].trim());
    if (q.type === 'sequencing') return Array.isArray(a) && a.length === q.steps.length && new Set(a).size === q.steps.length && a.every(s => q.steps.includes(s));
    if (q.isEnumeration && q.enumerationFields) return Array.isArray(a) && q.enumerationFields.every((_, i) => typeof a[i] === 'string' && a[i].trim());
    return typeof a === 'string' && a.trim().length > 0;
  });
}

export function eligibleAttemptPair(state: StudentState, ids: string[]): boolean {
  if (ids.length !== 2 || ids[0] === ids[1]) return false;
  const attempts = ids.map(id => state.quizAttempts.find(a => a.id === id));
  if (!attempts.every(isCompletedAttempt)) return false;
  const [older, newer] = (attempts as QuizAttempt[]).sort((a, b) => a.attemptNumber - b.attemptNumber);
  return newer.attemptNumber > older.attemptNumber && newer.attemptNumber <= 3;
}

export function withAchievementRecords(state: StudentState, records: AchievementRecord[]): StudentState {
  const ids = new Set(records.map(r => r.id));
  return { ...state, achievementSchemaVersion: 2, achievementRecords: records,
    unlockedGemstones: GEMSTONE_ASSETS.filter(g => ids.has(g.achievementId)).map(g => g.id) };
}

// Pure transition boundary: a future server verifier can supply the checked milestone here.
// No generic award event exists; unavailable learning activities cannot grant gems.
export function evaluateAchievements(state: StudentState, event?: AchievementEvent, now = new Date().toISOString()): StudentState {
  const records = [...state.achievementRecords];
  const has = (id: number) => records.some(r => r.id === canonicalId(id));
  const award = (id: number, eventRef: string) => {
    if (!has(id)) records.push({ id: canonicalId(id), unlockedAt: now, eventRef, celebrationAcknowledged: false });
  };
  if (event?.type === 'track-explored' && state.exploredTracks[event.track]) {
    award({ NT: 1, BA: 6, SM: 11 }[event.track], `track-explored:${event.track}`);
  }
  if (event?.type === 'quiz-submitted' && isCompletedAttempt(state.quizAttempts.find(a => a.id === event.attemptId))) {
    award(16, `quiz-submitted:${event.attemptId}`);
  }
  if (event?.type === 'paths-compared') {
    const comparison = state.savedComparisons.find(c => c.id === event.comparisonId);
    if (comparison && comparison.reviewedAt && Number.isFinite(Date.parse(comparison.reviewedAt)) && new Set(comparison.tracks.filter(t => ['NT', 'BA', 'SM'].includes(t))).size >= 2) award(18, `paths-compared:${comparison.id}`);
  }
  if (event?.type === 'attempts-compared') {
    const comparison = state.attemptComparisons.find(c => c.id === event.comparisonId);
    if (comparison && eligibleAttemptPair(state, comparison.attemptIds)) award(19, `attempts-compared:${comparison.id}`);
  }
  // Topological order: track epics, collector, universe. Collector excludes itself.
  for (const id of [5, 10, 15]) if (prerequisites[id].every(has)) award(id, `dependencies:${prerequisites[id].map(canonicalId).join(',')}`);
  if (new Set(records.filter(r => r.id !== canonicalId(17)).map(r => r.id)).size >= 10) award(17, 'collection:10');
  if (prerequisites[20].every(has)) award(20, 'collection:all-track-achievements');
  return withAchievementRecords(state, records);
}

export function achievementProgress(gem: GemstoneAsset, state: StudentState) {
  const record = state.achievementRecords.find(r => r.id === gem.achievementId);
  let current = 0;
  let total = 1;
  if (prerequisites[gem.id]) {
    total = prerequisites[gem.id].length;
    current = prerequisites[gem.id].filter(id => state.unlockedGemstones.includes(id)).length;
  } else if (gem.id === 17) {
    total = 10;
    current = state.achievementRecords.filter(r => r.id !== gem.achievementId).length;
  } else if (gem.id === 19) {
    total = 2;
    const completed = state.quizAttempts.filter(isCompletedAttempt);
    current = completed.some(a => completed.some(b => eligibleAttemptPair(state, [a.id, b.id]))) ? 1 : 0;
  }
  current = record ? total : Math.min(current, total);
  const status = record ? 'Unlocked' : current > 0 ? 'In Progress' : 'Locked';
  return { record, current, total, status, percent: Math.round(current / total * 100),
    hint: !record && ACTIVITY_GEMS.has(gem.id) ? 'Awaiting activity availability' :
      gem.id === 19 && !record ? (current ? 'Retake complete. Compare your completed attempts in Smart Results.' : 'Complete an eligible retake, then compare your results.') :
      record ? 'A milestone in your own journey.' : current ? 'Every small step counts. Keep exploring!' : 'Your next discovery is waiting.' };
}

export function achievementStats(state: StudentState) {
  const gems = GEMSTONE_ASSETS.map(gem => ({ gem, ...achievementProgress(gem, state) }));
  const unlocked = gems.filter(g => g.record).length;
  return { unlocked, percent: Math.round(unlocked / 20 * 100),
    locked: gems.filter(g => g.status === 'Locked').length,
    inProgress: gems.filter(g => g.status === 'In Progress').length,
    categories: Object.fromEntries(Object.keys(CATEGORY_NAMES).map(c => [c, gems.filter(g => g.gem.category === c && g.record).length])),
    recent: gems.filter(g => g.record).sort((a, b) => (b.record!.unlockedAt || '').localeCompare(a.record!.unlockedAt || '')) };
}

/**
 * Canonical CTA mapping for gems that have a direct action destination.
 * Avoids scattered magic-number checks like `gem.id === 16`.
 */
export const GEM_ACTIONS: Record<number, { route: string; label: string }> = {
  16: { route: '/quiz', label: 'Go to CTRL Quiz' },
  18: { route: '/compare', label: 'Explore Path Compare' },
  19: { route: '/results', label: 'Compare completed attempts' },
};

export const DEFAULT_GEM_ACTION = { route: '/tracks', label: 'Explore the pathways' };

export function gemAction(gemId: number) {
  return GEM_ACTIONS[gemId] ?? DEFAULT_GEM_ACTION;
}

export function filterAchievements(state: StudentState, category: string, status: string, sort: string) {
  return GEMSTONE_ASSETS.filter(g => (category === 'All' || g.category === category) &&
    (status === 'All' || achievementProgress(g, state).status === status)).sort((a, b) => {
    if (sort === 'Name') return a.name.localeCompare(b.name);
    if (sort === 'Rarity') return RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || a.id - b.id;
    if (sort === 'Recently Unlocked') return (achievementProgress(b, state).record?.unlockedAt || '').localeCompare(achievementProgress(a, state).record?.unlockedAt || '');
    return a.id - b.id;
  });
}
