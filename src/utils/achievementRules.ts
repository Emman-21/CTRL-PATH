import { GEMSTONE_ASSETS, type GemstoneAsset } from '../assets/manifest';
import { TRACKS_DATA } from '../data/tracks';
import type { StudentState, QuizAttempt, TrackCode } from '../types';
import type { AchievementEvent, AchievementRecord } from '../types/achievements';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';

// The existing manifest remains the single source of metadata and artwork.
export const achievementAssetMap = Object.fromEntries(GEMSTONE_ASSETS.map(g => [g.achievementId, g.url]));
export const CATEGORY_NAMES = { NT: 'Networking Technology', BA: 'Business Analytics', SM: 'Service Management', Special: 'Special Achievements' };
export const ACTIVITY_GEMS = new Set<number>();
export const RARITIES = ['Common', 'Rare', 'Special', 'Epic', 'Legendary'] as const;

const TRACK_SUBJECT_GEM: Record<string, { track: TrackCode; subjectId: string; gemId: number }> = {
  'nt-iot': { track: 'NT', subjectId: 'nt-iot', gemId: 1 },
  'nt-compnet-3': { track: 'NT', subjectId: 'nt-compnet-3', gemId: 2 },
  'ba-bat-401': { track: 'BA', subjectId: 'ba-bat-401', gemId: 6 },
  'ba-bat-402': { track: 'BA', subjectId: 'ba-bat-402', gemId: 7 },
  'sm-smt-401': { track: 'SM', subjectId: 'sm-smt-401', gemId: 11 },
  'sm-smt-402': { track: 'SM', subjectId: 'sm-smt-402', gemId: 12 },
};

const GEM_TO_SUBJECT: Record<number, { track: TrackCode; subjectId: string }> = {
  1: { track: 'NT', subjectId: 'nt-iot' },
  2: { track: 'NT', subjectId: 'nt-compnet-3' },
  6: { track: 'BA', subjectId: 'ba-bat-401' },
  7: { track: 'BA', subjectId: 'ba-bat-402' },
  11: { track: 'SM', subjectId: 'sm-smt-401' },
  12: { track: 'SM', subjectId: 'sm-smt-402' },
};

const ALL_SUBJECTS_GEM: Record<TrackCode, number> = { NT: 3, BA: 8, SM: 13 };
const QUIZ_SCORE_GEM: Record<TrackCode, number> = { NT: 4, BA: 9, SM: 14 };

const canonicalId = (id: number) => GEMSTONE_ASSETS.find(g => g.id === id)!.achievementId;
const displayOrder = (gem: GemstoneAsset) => gem.sortOrder ?? gem.id;
const prerequisites: Record<number, number[]> = {
  5: [1, 2, 3, 4],
  10: [6, 7, 8, 9],
  15: [11, 12, 13, 14],
  20: Array.from({ length: 15 }, (_, i) => i + 1),
};

export function subjectModuleProgress(
  track: TrackCode,
  subjectId: string,
  completions: StudentState['moduleCompletions'],
): { completed: number; total: number; isComplete: boolean } {
  const subject = TRACKS_DATA[track]?.subjects?.find(s => s.id === subjectId);
  if (!subject) return { completed: 0, total: 1, isComplete: false };
  const available = subject.modules.filter(m => m.status === 'available');
  if (available.length === 0) return { completed: 0, total: 1, isComplete: false };
  const completedIds = new Set(completions.filter(c => c.track === track).map(c => c.moduleId));
  const completed = available.filter(m => completedIds.has(m.id)).length;
  return { completed, total: available.length, isComplete: completed === available.length };
}

export function trackSubjectCompletionCount(
  track: TrackCode,
  completions: StudentState['moduleCompletions'],
): { completed: number; total: number; isComplete: boolean } {
  const subjects = TRACKS_DATA[track]?.subjects || [];
  if (subjects.length === 0) return { completed: 0, total: 2, isComplete: false };
  const completed = subjects.filter(s => subjectModuleProgress(track, s.id, completions).isComplete).length;
  return { completed, total: subjects.length, isComplete: completed === subjects.length };
}

export function completedTracksCount(state: StudentState): number {
  return (['NT', 'BA', 'SM'] as const).filter(
    track => trackSubjectCompletionCount(track, state.moduleCompletions).isComplete || state.exploredTracks[track],
  ).length;
}

export function isBalancedQuizResult(attempt: Pick<QuizAttempt, 'ntScore' | 'baScore' | 'smScore'> | undefined): boolean {
  if (!attempt) return false;
  const scores = [Math.round(attempt.ntScore), Math.round(attempt.baScore), Math.round(attempt.smScore)];
  if (!scores.every(s => Number.isFinite(s))) return false;
  const maxScore = Math.max(...scores);
  return scores.filter(s => s === maxScore).length >= 2;
}

export function completedProfileFieldsCount(state: StudentState): number {
  let count = 0;
  if (typeof state.name === 'string' && state.name.trim().length > 0 && state.name.trim() !== 'Your Display Name') {
    count += 1;
  }
  for (const field of ['program', 'yearLevel', 'section', 'biography'] as const) {
    if (typeof state[field] === 'string' && state[field].trim().length > 0) {
      count += 1;
    }
  }
  return count;
}

export function isProfileCompletedInControlCenter(state: StudentState): boolean {
  return completedProfileFieldsCount(state) === 5;
}

export function hasSavedReflectionThoughts(state: StudentState): boolean {
  return (['NT', 'BA', 'SM'] as const).some(track => {
    const r = state.reflections?.[track];
    if (!r) return false;
    return [r.interests, r.topicsToLearn, r.questions].some(
      val => typeof val === 'string' && val.trim().length > 0,
    );
  });
}

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

// Pure transition boundary: awards only verified achievements tied to real student actions.
export function evaluateAchievements(state: StudentState, event?: AchievementEvent, now = new Date().toISOString()): StudentState {
  const records = [...state.achievementRecords];
  const has = (id: number) => records.some(r => r.id === canonicalId(id));
  const award = (id: number, eventRef: string) => {
    if (!has(id)) records.push({ id: canonicalId(id), unlockedAt: now, eventRef, celebrationAcknowledged: false });
  };

  if (event?.type === 'module-completed' || event?.type === 'track-explored') {
    for (const rule of Object.values(TRACK_SUBJECT_GEM)) {
      if (subjectModuleProgress(rule.track, rule.subjectId, state.moduleCompletions).isComplete) {
        award(rule.gemId, `subject-completed:${rule.subjectId}`);
      }
    }
    for (const track of ['NT', 'BA', 'SM'] as const) {
      if (trackSubjectCompletionCount(track, state.moduleCompletions).isComplete) {
        award(ALL_SUBJECTS_GEM[track], `track-modules-completed:${track}`);
      }
    }
    if (event.type === 'track-explored' && state.exploredTracks[event.track]) {
      for (const rule of Object.values(TRACK_SUBJECT_GEM)) {
        if (rule.track === event.track) award(rule.gemId, `track-explored:${event.track}`);
      }
      award(ALL_SUBJECTS_GEM[event.track], `track-explored:${event.track}`);
    }
    if (completedTracksCount(state) === 3) {
      award(25, 'all-tracks-completed');
    }
  }

  if (event?.type === 'quiz-submitted') {
    const attempt = state.quizAttempts.find(a => a.id === event.attemptId);
    if (isCompletedAttempt(attempt)) {
      award(16, `quiz-submitted:${attempt!.id}`);
      const completedAttempts = state.quizAttempts.filter(isCompletedAttempt);
      if (completedAttempts.length >= 2) {
        award(19, `quiz-retake:${attempt!.id}`);
      }
      if (Math.round(attempt!.ntScore) >= 70) {
        award(QUIZ_SCORE_GEM.NT, `quiz-score-70:NT:${attempt!.id}`);
      }
      if (Math.round(attempt!.baScore) >= 70) {
        award(QUIZ_SCORE_GEM.BA, `quiz-score-70:BA:${attempt!.id}`);
      }
      if (Math.round(attempt!.smScore) >= 70) {
        award(QUIZ_SCORE_GEM.SM, `quiz-score-70:SM:${attempt!.id}`);
      }
      if (isBalancedQuizResult(attempt)) {
        award(18, `quiz-balanced:${attempt!.id}`);
      }
    }
  }

  if (event?.type === 'profile-updated' && isProfileCompletedInControlCenter(state)) {
    award(21, 'profile-completed');
  }

  if (event?.type === 'story-read' && Array.isArray(state.readAlumniStories) && state.readAlumniStories.length >= 1) {
    award(22, `story-read:${event.storyId}`);
  }

  if (event?.type === 'streak-updated' && Math.max(state.maxStreakDays || 0, event.streakCount) >= 3) {
    award(23, `streak:${Math.max(state.maxStreakDays || 0, event.streakCount)}`);
  }

  if (event?.type === 'reflection-saved' && hasSavedReflectionThoughts(state)) {
    award(24, `reflection-saved:${event.track}`);
  }

  // Topological cascade: track epics (5, 10, 15), Crystal Collector (17, excludes itself), Your Own Universe (20).
  for (const id of [5, 10, 15]) {
    if (prerequisites[id].every(has)) award(id, `dependencies:${prerequisites[id].map(canonicalId).join(',')}`);
  }
  if (new Set(records.filter(r => r.id !== canonicalId(17)).map(r => r.id)).size >= 10) {
    award(17, 'collection:10');
  }
  if (prerequisites[20].every(has)) {
    award(20, 'collection:all-track-achievements');
  }
  return withAchievementRecords(state, records);
}

export function achievementProgress(gem: GemstoneAsset, state: StudentState) {
  const record = state.achievementRecords.find(r => r.id === gem.achievementId);
  let current = 0;
  let total = 1;

  if (GEM_TO_SUBJECT[gem.id]) {
    const { track, subjectId } = GEM_TO_SUBJECT[gem.id];
    const stats = subjectModuleProgress(track, subjectId, state.moduleCompletions);
    current = stats.completed;
    total = stats.total;
  } else if (gem.id === 3 || gem.id === 8 || gem.id === 13) {
    const track: TrackCode = gem.id === 3 ? 'NT' : gem.id === 8 ? 'BA' : 'SM';
    const stats = trackSubjectCompletionCount(track, state.moduleCompletions);
    current = stats.completed;
    total = stats.total;
  } else if (prerequisites[gem.id]) {
    total = prerequisites[gem.id].length;
    current = prerequisites[gem.id].filter(id => state.unlockedGemstones.includes(id)).length;
  } else if (gem.id === 17) {
    total = 10;
    current = state.achievementRecords.filter(r => r.id !== gem.achievementId).length;
  } else if (gem.id === 19) {
    total = 2;
    current = state.quizAttempts.filter(isCompletedAttempt).length;
  } else if (gem.id === 21) {
    total = 5;
    current = completedProfileFieldsCount(state);
  } else if (gem.id === 23) {
    total = 3;
    current = state.maxStreakDays || 0;
  } else if (gem.id === 25) {
    total = 3;
    current = completedTracksCount(state);
  }

  current = record ? total : Math.min(current, total);
  const status = record ? 'Unlocked' : current > 0 ? 'In Progress' : 'Locked';
  const hint = record
    ? 'A milestone in your own journey.'
    : gem.id === 19
    ? current >= 1
      ? 'First attempt done. Retake the CTRL Quiz once to unlock.'
      : 'Complete and retake the CTRL Quiz to unlock.'
    : gem.id === 21 && current > 0
    ? `${current} of 5 profile details completed in Control Center.`
    : gem.id === 23 && current > 0
    ? `${current} of 3 streak days reached. Keep showing up!`
    : current > 0
    ? 'Every small step counts. Keep exploring!'
    : 'Your next discovery is waiting.';

  return {
    record,
    current,
    total,
    status,
    percent: Math.round((current / total) * 100),
    hint,
  };
}

export function achievementStats(state: StudentState) {
  const gems = GEMSTONE_ASSETS.map(gem => ({ gem, ...achievementProgress(gem, state) }));
  const unlocked = gems.filter(g => g.record).length;
  const totalCount = GEMSTONE_ASSETS.length;
  return {
    unlocked,
    totalCount,
    percent: Math.round((unlocked / totalCount) * 100),
    locked: gems.filter(g => g.status === 'Locked').length,
    inProgress: gems.filter(g => g.status === 'In Progress').length,
    categories: Object.fromEntries(Object.keys(CATEGORY_NAMES).map(c => [c, gems.filter(g => g.gem.category === c && g.record).length])),
    categoryTotals: Object.fromEntries(Object.keys(CATEGORY_NAMES).map(c => [c, GEMSTONE_ASSETS.filter(g => g.category === c).length])),
    recent: gems.filter(g => g.record).sort((a, b) => (b.record!.unlockedAt || '').localeCompare(a.record!.unlockedAt || '')),
  };
}

export const CATEGORY_ORDER = ['NT', 'BA', 'SM', 'Special'] as const;
export type AchievementCategoryKey = typeof CATEGORY_ORDER[number];

export interface AchievementCategoryColumn {
  category: AchievementCategoryKey;
  name: string;
  unlockedCount: number;
  totalCount: number;
  unlockedGems: Array<{ gem: GemstoneAsset; record: AchievementRecord }>;
}

export function achievementCategoryColumns(state: StudentState): AchievementCategoryColumn[] {
  const recordById = new Map(state.achievementRecords.map(r => [r.id, r]));
  return CATEGORY_ORDER.map(category => {
    const categoryGems = GEMSTONE_ASSETS.filter(g => g.category === category).sort((a, b) => displayOrder(a) - displayOrder(b));
    const unlockedGems = categoryGems
      .map(gem => {
        const record = recordById.get(gem.achievementId);
        return record ? { gem, record } : null;
      })
      .filter((entry): entry is { gem: GemstoneAsset; record: AchievementRecord } => entry !== null);
    return {
      category,
      name: CATEGORY_NAMES[category],
      unlockedCount: unlockedGems.length,
      totalCount: categoryGems.length,
      unlockedGems,
    };
  });
}

/**
 * Canonical CTA mapping for gems that have a direct action destination.
 */
export const GEM_ACTIONS: Record<number, { route: string; label: string }> = {
  1: { route: '/tracks?track=NT', label: 'Explore NT Modules' },
  2: { route: '/tracks?track=NT', label: 'Explore NT Modules' },
  3: { route: '/tracks?track=NT', label: 'Explore NT Track' },
  4: { route: '/quiz', label: 'Go to CTRL Quiz' },
  5: { route: '/tracks?track=NT', label: 'Explore NT Track' },
  6: { route: '/tracks?track=BA', label: 'Explore BA Modules' },
  7: { route: '/tracks?track=BA', label: 'Explore BA Modules' },
  8: { route: '/tracks?track=BA', label: 'Explore BA Track' },
  9: { route: '/quiz', label: 'Go to CTRL Quiz' },
  10: { route: '/tracks?track=BA', label: 'Explore BA Track' },
  11: { route: '/tracks?track=SM', label: 'Explore SM Modules' },
  12: { route: '/tracks?track=SM', label: 'Explore SM Modules' },
  13: { route: '/tracks?track=SM', label: 'Explore SM Track' },
  14: { route: '/quiz', label: 'Go to CTRL Quiz' },
  15: { route: '/tracks?track=SM', label: 'Explore SM Track' },
  16: { route: '/quiz', label: 'Go to CTRL Quiz' },
  18: { route: '/quiz', label: 'Go to CTRL Quiz' },
  19: { route: '/quiz', label: 'Go to CTRL Quiz' },
  21: { route: '/control-center', label: 'Open Control Center' },
  22: { route: '/alumni', label: 'Read Alumni Stories' },
  23: { route: '/tracks', label: 'Build Daily Streak' },
  24: { route: '/control-center?section=reflections', label: 'Write a Reflection' },
  25: { route: '/tracks', label: 'Explore Track Modules' },
};

export const DEFAULT_GEM_ACTION = { route: '/tracks', label: 'Explore the pathways' };

export function gemAction(gemId: number) {
  return GEM_ACTIONS[gemId] ?? DEFAULT_GEM_ACTION;
}

export function filterAchievements(state: StudentState, category: string, status: string, sort: string, rarity = 'All') {
  return GEMSTONE_ASSETS.filter(g => (category === 'All' || g.category === category) &&
    (status === 'All' || achievementProgress(g, state).status === status) &&
    (rarity === 'All' || g.rarity === rarity)).sort((a, b) => {
    if (sort === 'Name') return a.name.localeCompare(b.name);
    if (sort === 'Rarity') return RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || displayOrder(a) - displayOrder(b);
    if (sort === 'Recently Unlocked') return (achievementProgress(b, state).record?.unlockedAt || '').localeCompare(achievementProgress(a, state).record?.unlockedAt || '') || displayOrder(a) - displayOrder(b);
    return displayOrder(a) - displayOrder(b);
  });
}
