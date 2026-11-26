import { GEMSTONE_ASSETS } from '../assets/manifest';
import { isCompareTopicId } from '../data/compareTopics';
import { TRACKS_DATA } from '../data/tracks';
import { supabase } from '../lib/supabase';
import type { StudentState } from '../types';
import type { AchievementRecord } from '../types/achievements';
import { evaluateAchievements, withAchievementRecords } from './achievementRules';
import { normalizeAvatarStyle } from './avatarOptions';
import { loadStreakState, saveStreakState, type StreakState } from './streakManager';

export const STUDENT_STORAGE_KEY = 'ctrl_path_student_data_v1';
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const date = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(Date.parse(v));
const stableJSON = (value: unknown) => JSON.stringify(value, (_key, item) =>
  object(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);

export function migrateStudentData(raw: unknown, defaults: StudentState): StudentState {
  if (!object(raw)) return defaults;
  const state = { ...defaults, ...raw } as StudentState;
  state.profileSchemaVersion=1;
  state.section=typeof raw.section==='string'?raw.section:'';
  state.biography=typeof raw.biography==='string'?raw.biography:'';
  state.avatarStyle=normalizeAvatarStyle(raw.avatarStyle);
  state.avatarUrl=typeof raw.avatarUrl==='string'?raw.avatarUrl:'';
  state.explorationDates=object(raw.explorationDates)?Object.fromEntries(Object.entries(raw.explorationDates).filter(([key,value])=>['NT','BA','SM'].includes(key)&&date(value))):{};
  state.moduleCompletions=Array.isArray(raw.moduleCompletions)?raw.moduleCompletions.filter((m:unknown)=>object(m)&&typeof m.moduleId==='string'&&['NT','BA','SM'].includes(m.track)&&date(m.completedAt)).filter((m: {moduleId:string},i:number,all:{moduleId:string}[])=>all.findIndex(x=>x.moduleId===m.moduleId)===i):[];
  state.moduleCompletions=state.moduleCompletions.filter(m=>TRACKS_DATA[m.track].modules.some(module=>module.id===m.moduleId&&module.status==='available'));
  state.readAlumniStories=Array.isArray(raw.readAlumniStories)?[...new Set(raw.readAlumniStories.filter((id:unknown):id is string=>typeof id==='string'&&id.trim().length>0))]:[];
  state.maxStreakDays=typeof raw.maxStreakDays==='number'&&Number.isFinite(raw.maxStreakDays)&&raw.maxStreakDays>=0?Math.floor(raw.maxStreakDays):0;
  for (const key of ['name', 'university', 'program', 'yearLevel'] as const) {
    state[key] = typeof raw[key] === 'string' ? raw[key] : defaults[key];
  }
  for (const key of ['exploredTracks', 'trackProgress', 'preferences', 'currentQuizProgress'] as const) {
    (state as any)[key] = { ...defaults[key], ...(object(raw[key]) ? raw[key] : {}) };
  }
  const explicitTheme = object(raw.preferences) && raw.preferences.themeExplicit === true;
  state.preferences.themeExplicit = explicitTheme;
  state.preferences.theme =
    explicitTheme && state.preferences.theme === 'light' ? 'light' : 'dark';
  state.reflections = { ...defaults.reflections };
  for (const track of ['NT', 'BA', 'SM'] as const) {
    state.exploredTracks[track] = state.exploredTracks[track] === true;
    const progress = state.trackProgress[track];
    state.trackProgress[track] = typeof progress === 'number' && Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
    state.reflections[track] = { ...defaults.reflections[track], ...(object(raw.reflections?.[track]) ? raw.reflections[track] : {}) };
    for(const field of ['interests','topicsToLearn','questions'] as const) if(typeof state.reflections[track][field]!=='string') state.reflections[track][field]='';
  }
  for (const key of ['quizAttempts', 'savedComparisons', 'attemptComparisons'] as const) {
    (state as any)[key] = Array.isArray(raw[key])
      ? raw[key].filter((v: unknown) =>
          object(v) &&
          typeof v.id === 'string' &&
          (key !== 'savedComparisons' || Array.isArray(v.tracks)) &&
          (key !== 'attemptComparisons' ||
            (Array.isArray(v.attemptIds) && v.attemptIds.length === 2 && v.attemptIds[0] !== v.attemptIds[1]))
        )
      : [];
  }
  state.savedComparisons=state.savedComparisons.map(c=>({...c,title:typeof c.title==='string'?c.title:'Saved comparison',tracks:[...new Set(c.tracks.filter(t=>['NT','BA','SM'].includes(t)))],...(isCompareTopicId(c.selectedTopic)?{selectedTopic:c.selectedTopic}:{})}));
  state.comparisonSelection = Array.isArray(raw.comparisonSelection) ? [...new Set(raw.comparisonSelection.filter((t: string) => ['NT', 'BA', 'SM'].includes(t)))] as StudentState['comparisonSelection'] : [];
  const records = new Map<string, AchievementRecord>();
  const inputs = Array.isArray(raw.achievementRecords) ? raw.achievementRecords : [];
  for (const item of inputs) {
    if (!object(item) || !GEMSTONE_ASSETS.some(g => g.achievementId === item.id)) continue;
    const previous = records.get(item.id);
    const unlockedAt = date(item.unlockedAt) ? new Date(item.unlockedAt).toISOString() : null;
    records.set(item.id, { id: item.id,
      unlockedAt: previous?.unlockedAt && (!unlockedAt || previous.unlockedAt < unlockedAt) ? previous.unlockedAt : unlockedAt,
      eventRef: previous?.eventRef || (typeof item.eventRef === 'string' ? item.eventRef : undefined),
      celebrationAcknowledged: previous?.celebrationAcknowledged || item.celebrationAcknowledged !== false });
  }
  // Numeric IDs are a read-only migration input, never a second source of truth.
  if (raw.achievementSchemaVersion !== 2 && Array.isArray(raw.unlockedGemstones)) {
    for (const old of raw.unlockedGemstones) {
      const gem = GEMSTONE_ASSETS.find(g => g.id === old || g.achievementId === old);
      if (gem && !records.has(gem.achievementId)) records.set(gem.achievementId, {
        id: gem.achievementId, unlockedAt: null, eventRef: 'legacy:preserved', celebrationAcknowledged: true,
      });
    }
  }
  let migrated = withAchievementRecords(state, [...records.values()]);
  if (raw.achievementSchemaVersion !== 2) {
    // Repair derived dependencies on migration only. Never replay historical celebrations.
    migrated = evaluateAchievements(migrated);
    migrated = withAchievementRecords(migrated, migrated.achievementRecords.map(r => ({ ...r,
      unlockedAt: records.has(r.id) ? r.unlockedAt : null, celebrationAcknowledged: true })));
  }
  return migrated;
}

export function loadStudentData(storage: Storage, defaults: StudentState) {
  let raw: string | null;
  try { raw = storage.getItem(STUDENT_STORAGE_KEY); }
  catch { return { state: defaults, canPersist: false, warning: 'Browser storage is unavailable. Progress can only be kept for this session.' }; }
  if (!raw) return { state: defaults, canPersist: true, warning: '' };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }
  const state = migrateStudentData(parsed, defaults);
  // Preserve the exact original before rewriting a legacy, malformed, or normalized payload.
  const normalized = stableJSON(serializeStudent(state));
  if (normalized !== stableJSON(parsed)) {
    try {
      const key = `${STUDENT_STORAGE_KEY}_backup_${Date.now()}`;
      storage.setItem(key, raw);
    } catch {
      return { state, canPersist: false, warning: 'Your saved data could not be backed up. It has been left untouched; new progress is session-only.' };
    }
  }
  return { state, canPersist: true, warning: object(parsed) ? '' : 'Saved data could not be read. The original has been backed up in this browser.' };
}

export function serializeStudent(state: StudentState) {
  const { unlockedGemstones: _compatibilityProjection, ...persisted } = state;
  return persisted;
}
export async function syncStudentDataToSupabase(state: StudentState): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not authenticated' };

    const persisted = serializeStudent(state);
    const currentStreak = loadStreakState();

    const { error } = await supabase
      .from('student_profiles')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        state_payload: persisted,
        streak_data: currentStreak,
        updated_at: new Date().toISOString(),
      });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Unknown sync error' };
  }
}

export async function loadStudentDataFromSupabase(defaults: StudentState): Promise<StudentState | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('student_profiles')
      .select('state_payload, streak_data')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data?.state_payload) return null;

    // Kung may saved streak_data sa Supabase, i-merge at i-restore sa localStorage
    if (data.streak_data && typeof data.streak_data === 'object') {
      const cloudStreak = data.streak_data as Partial<StreakState>;
      const localStreak = loadStreakState();

      // Pagsamahin ang activeDates mula sa local at cloud para walang mawawalang araw
      const mergedDates = Array.from(
        new Set([
          ...(Array.isArray(localStreak.activeDates) ? localStreak.activeDates : []),
          ...(Array.isArray(cloudStreak.activeDates) ? cloudStreak.activeDates : []),
        ])
      ).sort().slice(-365);

      const useCloud =
        (cloudStreak.lastActivityDate || '') >= (localStreak.lastActivityDate || '');

      const mergedStreak: StreakState = {
        streakCount: useCloud
          ? (typeof cloudStreak.streakCount === 'number' ? cloudStreak.streakCount : localStreak.streakCount)
          : localStreak.streakCount,
        lastActivityDate: useCloud
          ? (cloudStreak.lastActivityDate ?? localStreak.lastActivityDate)
          : localStreak.lastActivityDate,
        lastCelebratedDate: useCloud
          ? (cloudStreak.lastCelebratedDate ?? localStreak.lastCelebratedDate)
          : localStreak.lastCelebratedDate,
        activeDates: mergedDates,
      };

      saveStreakState(mergedStreak);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ctrl_streak_updated', { detail: { streakCount: mergedStreak.streakCount } })
        );
      }
    }

    return migrateStudentData(data.state_payload, defaults);
  } catch {
    return null;
  }
}