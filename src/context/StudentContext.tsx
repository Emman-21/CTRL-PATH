import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StudentState, TrackCode, QuizAttempt, SavedComparison, StudentPreferences } from '../types';
import type { CompareTopicId } from '../data/compareTopics';

import { validateProfile, studentProgress, completeLearningModule, areAllTrackSubjectsCompleted, clearStudentData, type ProfileValues, type SaveResult } from '../utils/studentControls';
import { evaluateAchievements, eligibleAttemptPair, withAchievementRecords } from '../utils/achievementRules';
import { loadStudentData, serializeStudent, STUDENT_STORAGE_KEY as STORAGE_KEY } from '../utils/achievementStorage';
import { recordActivity as recordStreakActivity } from '../utils/streakManager';
import { DEFAULT_AVATAR_STYLE } from '../utils/avatarOptions';
import {
  readAuthSession,
  saveAuthSession,
  clearAuthSession,
  readGuestSession,
  saveGuestSession,
  fallbackNameFromEmail,
  type AuthProvider,
  type AuthSession,
} from '../utils/authSession';
import { markLuniLoginGreetPending } from '../utils/luniLoginGreet';
import { dispatchLuniWinkMilestone } from '../utils/luniWaveSprite';
import { firebaseSignOut } from '../services/firebase';

export const INITIAL_STATE: StudentState = {
  profileSchemaVersion: 1,
  section: '',
  biography: '',
  avatarStyle: DEFAULT_AVATAR_STYLE,
  explorationDates: {},
  moduleCompletions: [],
  readAlumniStories: [],
  maxStreakDays: 0,
  achievementSchemaVersion: 2,
  achievementRecords: [],
  attemptComparisons: [],
  name: 'Your Display Name',
  university: '',
  program: '',
  yearLevel: '',
  exploredTracks: { NT: false, BA: false, SM: false },
  trackProgress: { NT: 0, BA: 0, SM: 0 },
  unlockedGemstones: [],
  currentQuizProgress: {
    level: 1,
    currentQuestionIndex: 0,
    answers: {},
    inProgress: false,
  },
  quizAttempts: [],
  savedComparisons: [],
  comparisonSelection: [],
  reflections: {
    NT: { interests: '', topicsToLearn: '', questions: '' },
    BA: { interests: '', topicsToLearn: '', questions: '' },
    SM: { interests: '', topicsToLearn: '', questions: '' },
  },
  preferences: {
    theme: 'dark',
    themeExplicit: false,
    reducedMotion: false,
    highContrast: false,
    textSize: 'normal',
    notifications: true,
    luniEnabled: true,
    luniFloatingAnimation: true,
    luniAutoTips: true,
    luniMinimized: false,
  },
};

interface StudentContextType {
  state: StudentState;
  overallJourneyProgress: number;
  modulesExploredCount: number;
  nextActivity: {
    title: string;
    description: string;
    route: string;
    trackCode?: TrackCode;
  };
  markTrackExplored: (track: TrackCode) => { newlyUnlocked: boolean; gemstoneName?: string; gemId?: number };
  updateTrackProgress: (track: TrackCode, progress: number) => void;
  toggleComparisonSelection: (track: TrackCode) => void;
  clearComparisonSelection: () => void;
  saveTrackReflection: (track: TrackCode, reflection: Partial<import('../types').TrackReflection>) => SaveResult;
  acknowledgeAchievement: (id: string) => void;
  completeAttemptComparison: (
    ids: [string, string],
    reflection?: { reasons?: string[]; note?: string },
  ) => void;
  storageWarning: string;
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'date'>) => void;
  saveComparison: (tracks: TrackCode[], title: string, reviewed: boolean, selectedTopic?: CompareTopicId) => void;
  removeComparison: (id: string) => void;
  updatePreferences: (prefs: Partial<StudentPreferences>) => SaveResult;
  updateProfile: (values: ProfileValues) => SaveResult;
  completeModule: (track: TrackCode, moduleId: string) => void;
  markAlumniStoryRead: (storyId: string) => void;
  recordActivity: (actionDescription?: string) => void;
  resetAllData: () => SaveResult;
  authSession: AuthSession | null;
  isGuest: boolean;
  enterGuestSession: () => void;
  completeAuthLogin: (params: {
    email: string;
    displayName?: string;
    program?: string;
    yearLevel?: string;
    section?: string;
    provider: AuthProvider;
    keepSignedIn: boolean;
    applyProfile?: boolean;
  }) => void;
  signOutSession: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded] = useState(() => loadStudentData(localStorage, INITIAL_STATE));
  const [state, setState] = useState<StudentState>(loaded.state);
  const [storageWarning, setStorageWarning] = useState(loaded.warning);
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    typeof window !== 'undefined' ? readAuthSession(localStorage, sessionStorage) : null,
  );
  const [isGuest, setIsGuest] = useState<boolean>(() =>
    typeof window !== 'undefined' ? readGuestSession(sessionStorage) : false,
  );
  // Flag to skip the sync-effect write when persistChange already wrote manually.
  const skipNextPersist = useRef(false);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    if (!loaded.canPersist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeStudent(state)));
    } catch {
      setStorageWarning('Progress could not be saved in this browser. Keep this tab open and free browser storage before refreshing.');
    }
  }, [state, loaded.canPersist]);

  const prevAchievementCountRef = useRef(state.achievementRecords.length);
  const prevQuizCountRef = useRef(state.quizAttempts.length);
  useEffect(() => {
    const newAchievement = state.achievementRecords.length > prevAchievementCountRef.current;
    const newQuiz = state.quizAttempts.length > prevQuizCountRef.current;
    prevAchievementCountRef.current = state.achievementRecords.length;
    prevQuizCountRef.current = state.quizAttempts.length;
    if (newAchievement || newQuiz) {
      dispatchLuniWinkMilestone();
    }
  }, [state.achievementRecords.length, state.quizAttempts.length]);

  const progress = studentProgress(state);
  const overallJourneyProgress = progress.journeyPercent;
  const modulesExploredCount = progress.moduleCount;

  const persistChange = (next: StudentState): SaveResult => {
    if (!loaded.canPersist) return {ok:false,message:'Browser storage is unavailable. Your edits have not been saved.'};
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeStudent(next)));
      skipNextPersist.current = true;
      setState(next);
      setStorageWarning('');
      return {ok:true,message:'Saved on this browser.'};
    } catch {
      return {ok:false,message:'Could not save in this browser. Your edits are still here; free browser storage and try again.'};
    }
  };
  const recordActivity = useCallback((actionDescription?: string) => {
    const res = recordStreakActivity(actionDescription);
    if (res.streakCount > 0) {
      setState((prev) => {
        const nextMax = Math.max(prev.maxStreakDays || 0, res.streakCount);
        const hasFlame = prev.achievementRecords.some((r) => r.id === 'special-steady-flame');
        if (nextMax === (prev.maxStreakDays || 0) && (res.streakCount < 3 || hasFlame)) {
          return prev;
        }
        const nextState = { ...prev, maxStreakDays: nextMax };
        return res.streakCount >= 3 || nextMax >= 3
          ? evaluateAchievements(nextState, { type: 'streak-updated', streakCount: res.streakCount })
          : nextState;
      });
    }
  }, []);

  useEffect(() => {
    const handleStreakUpdated = (e: Event) => {
      const streakCount = (e as CustomEvent<{ streakCount?: number }>).detail?.streakCount;
      if (typeof streakCount === 'number' && streakCount > 0) {
        setState((prev) => {
          const nextMax = Math.max(prev.maxStreakDays || 0, streakCount);
          const hasFlame = prev.achievementRecords.some((r) => r.id === 'special-steady-flame');
          if (nextMax === (prev.maxStreakDays || 0) && (streakCount < 3 || hasFlame)) {
            return prev;
          }
          const nextState = { ...prev, maxStreakDays: nextMax };
          return streakCount >= 3 || nextMax >= 3
            ? evaluateAchievements(nextState, { type: 'streak-updated', streakCount })
            : nextState;
        });
      }
    };
    window.addEventListener('ctrl_streak_updated', handleStreakUpdated);
    return () => window.removeEventListener('ctrl_streak_updated', handleStreakUpdated);
  }, []);

  const markAlumniStoryRead = useCallback((storyId: string) => {
    if (!storyId) return;
    setState((prev) => {
      const existing = prev.readAlumniStories || [];
      const hasStoryGem = prev.achievementRecords.some((r) => r.id === 'special-story-seeker');
      if (existing.includes(storyId) && hasStoryGem) {
        return prev;
      }
      const nextStories = existing.includes(storyId) ? existing : [...existing, storyId];
      return evaluateAchievements(
        { ...prev, readAlumniStories: nextStories },
        { type: 'story-read', storyId },
      );
    });
  }, []);

  const updateProfile = (values: ProfileValues): SaveResult => {
    if(Object.keys(validateProfile(values)).length) return {ok:false,message:'Please correct the profile fields.'};
    const clean=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()])) as ProfileValues;
    const nextState=evaluateAchievements({...state,...clean,profileSchemaVersion:1},{type:'profile-updated'});
    return persistChange(nextState);
  };
  const completeModule = (track: TrackCode, moduleId: string) => {
    recordActivity('module-completed');
    setState((prev) => completeLearningModule(prev, track, moduleId));
  };

  const nextActivity = !state.exploredTracks.SM
    ? {
        title: 'Explore Service Management Track',
        description: 'Discover how SM blends people, process workflows, and customer experiences.',
        route: '/tracks',
        trackCode: 'SM' as TrackCode,
      }
    : state.quizAttempts.length === 0
    ? {
        title: 'Take the CTRL Quiz Assessment',
        description: 'Test your understanding across all three BSIT specializations.',
        route: '/quiz',
      }
    : state.savedComparisons.length === 0
    ? {
        title: 'Compare Academic Tracks Side-by-Side',
        description: 'Examine detailed side-by-side matrices in Path Compare.',
        route: '/compare',
      }
    : {
        title: 'Explore career possibilities in Networking Technology',
        description: 'Discover real student stories and see how NT skills are used in the real world.',
        route: '/tracks',
        trackCode: 'NT' as TrackCode,
      };

  const markTrackExplored = (track: TrackCode) => {
    const gemId = { NT: 1, BA: 6, SM: 11 }[track];
    if (!areAllTrackSubjectsCompleted(track, state.moduleCompletions)) {
      return { newlyUnlocked: false, gemId };
    }
    recordActivity('track-explored');
    const newlyUnlocked = !state.unlockedGemstones.includes(gemId);
    setState(prev => {
      if (!areAllTrackSubjectsCompleted(track, prev.moduleCompletions)) return prev;
      return evaluateAchievements({ ...prev,
        exploredTracks: { ...prev.exploredTracks, [track]: true },
        explorationDates: { ...prev.explorationDates, [track]: prev.explorationDates[track] || new Date().toISOString() },
        trackProgress: { ...prev.trackProgress, [track]: 100 },
      }, { type: 'track-explored', track });
    });
    return { newlyUnlocked, gemId };
  };

  const toggleComparisonSelection = (track: TrackCode) => {
    setState((prev) => {
      const current = prev.comparisonSelection || [];
      if (current.includes(track)) {
        return {
          ...prev,
          comparisonSelection: current.filter((t) => t !== track),
        };
      } else {
        if (current.length >= 3) {
          // Max 3 tracks
          return {
            ...prev,
            comparisonSelection: [current[1], current[2], track],
          };
        }
        return {
          ...prev,
          comparisonSelection: [...current, track],
        };
      }
    });
  };

  const clearComparisonSelection = () => {
    setState((prev) => ({
      ...prev,
      comparisonSelection: [],
    }));
  };

  const saveTrackReflection = (track: TrackCode, reflection: Partial<import('../types').TrackReflection>): SaveResult => {
    if(Object.values(reflection).some(value=>typeof value!=='string'||value.length>5000)) return {ok:false,message:'Use 5,000 characters or fewer for each reflection.'};
    const nextState=evaluateAchievements({...state,reflections:{...state.reflections,[track]:{...state.reflections[track],...reflection,savedAt:new Date().toISOString()}}},{type:'reflection-saved',track});
    return persistChange(nextState);
  };

  const updateTrackProgress = (track: TrackCode, progress: number) => {
    setState((prev) => ({
      ...prev,
      trackProgress: {
        ...prev.trackProgress,
        [track]: Math.min(100, Math.max(0, progress)),
      },
    }));
  };

  const acknowledgeAchievement = (id: string) => {
    setState(prev => withAchievementRecords(prev, prev.achievementRecords.map(r =>
      r.id === id ? { ...r, celebrationAcknowledged: true } : r)));
  };

  const saveQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'date'>) => {
    recordActivity('quiz-submitted');
    const now = new Date().toISOString();
    const newAttempt: QuizAttempt = { ...attemptData,
      id: attemptData.submissionId || crypto.randomUUID(), submittedAt: now,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setState(prev => {
      if (prev.quizAttempts.some(a => a.id === newAttempt.id)) return prev;
      return evaluateAchievements({ ...prev, quizAttempts: [newAttempt, ...prev.quizAttempts] },
        { type: 'quiz-submitted', attemptId: newAttempt.id }, now);
    });
  };

  const saveComparison = (tracks: TrackCode[], title: string, reviewed: boolean, selectedTopic?: CompareTopicId) => {
    // Normalize: deduplicate and sort so {NT,BA} matches {BA,NT}.
    const distinct = [...new Set(tracks.filter(t => ['NT', 'BA', 'SM'].includes(t)))].sort();
    if (!reviewed || distinct.length < 2) return;

    const comparison: SavedComparison = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      tracks: distinct,
      title,
      ...(selectedTopic ? { selectedTopic } : {}),
    };

    setState(prev => {
      // Reject if an equivalent comparison (same set of tracks) already exists.
      const existingIndex = prev.savedComparisons.findIndex(existing => {
        const existingTracks = [...new Set(existing.tracks)].sort();
        return (
          existingTracks.length === distinct.length &&
          existingTracks.every((t, i) => t === distinct[i])
        );
      });
      if (existingIndex !== -1) {
        if (!selectedTopic || prev.savedComparisons[existingIndex].selectedTopic === selectedTopic) {
          return prev;
        }
        const updatedComparisons = prev.savedComparisons.map((item, idx) =>
          idx === existingIndex ? { ...item, selectedTopic } : item,
        );
        return { ...prev, savedComparisons: updatedComparisons };
      }

      return evaluateAchievements(
        { ...prev, savedComparisons: [comparison, ...prev.savedComparisons] },
        { type: 'paths-compared', comparisonId: comparison.id }
      );
    });
  };

  const completeAttemptComparison = (
    ids: [string, string],
    reflection?: { reasons?: string[]; note?: string },
  ) => {
    if (ids.length !== 2 || ids[0] === ids[1]) return;
    const cleanReasons = Array.isArray(reflection?.reasons)
      ? reflection.reasons
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .slice(0, 6)
      : undefined;
    const cleanNote =
      typeof reflection?.note === 'string' && reflection.note.trim().length > 0
        ? reflection.note.trim().slice(0, 500)
        : undefined;
    const now = new Date().toISOString();

    setState(prev => {
      const existingIndex = prev.attemptComparisons.findIndex(c =>
        ids.every(id => c.attemptIds.includes(id)),
      );
      if (existingIndex >= 0) {
        const updated = prev.attemptComparisons.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                completedAt: now,
                reasons: cleanReasons,
                note: cleanNote,
              }
            : item,
        );
        return { ...prev, attemptComparisons: updated };
      }

      if (!eligibleAttemptPair(prev, ids)) {
        const hasBoth = ids.every(id => prev.quizAttempts.some(a => a.id === id));
        if (!hasBoth) return prev;
        const legacyComparison = {
          id: crypto.randomUUID(),
          attemptIds: ids,
          completedAt: now,
          reasons: cleanReasons,
          note: cleanNote,
        };
        return {
          ...prev,
          attemptComparisons: [...prev.attemptComparisons, legacyComparison],
        };
      }

      const comparison = {
        id: crypto.randomUUID(),
        attemptIds: ids,
        completedAt: now,
        reasons: cleanReasons,
        note: cleanNote,
      };
      return evaluateAchievements(
        { ...prev, attemptComparisons: [...prev.attemptComparisons, comparison] },
        { type: 'attempts-compared', comparisonId: comparison.id },
        comparison.completedAt,
      );
    });
  };

  const removeComparison = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedComparisons: prev.savedComparisons.filter((c) => c.id !== id),
    }));
  };

  const updatePreferences = (prefs: Partial<StudentPreferences>): SaveResult =>
    persistChange({
      ...state,
      preferences: {
        ...state.preferences,
        ...prefs,
        ...(prefs.theme !== undefined ? { themeExplicit: prefs.themeExplicit ?? true } : {}),
      },
    });

  const completeAuthLogin = (params: {
    email: string;
    displayName?: string;
    program?: string;
    yearLevel?: string;
    section?: string;
    provider: AuthProvider;
    keepSignedIn: boolean;
    applyProfile?: boolean;
  }) => {
    const email = params.email.trim();
    const resolvedName =
      (params.displayName || '').trim() ||
      (state.name && state.name !== INITIAL_STATE.name
        ? state.name
        : fallbackNameFromEmail(email));

    const nextSession: AuthSession = {
      email,
      displayName: resolvedName,
      provider: params.provider,
      signedInAt: new Date().toISOString(),
      keepSignedIn: params.keepSignedIn,
    };
    saveAuthSession(
      nextSession,
      typeof window !== 'undefined' ? localStorage : undefined,
      typeof window !== 'undefined' ? sessionStorage : undefined,
    );
    saveGuestSession(false, typeof window !== 'undefined' ? sessionStorage : undefined);
    markLuniLoginGreetPending(typeof window !== 'undefined' ? sessionStorage : undefined);
    setIsGuest(false);
    setAuthSession(nextSession);

    const shouldUpdateName =
      Boolean(params.applyProfile) ||
      (Boolean(params.displayName?.trim()) && state.name === INITIAL_STATE.name);

    const nextProfile: StudentState = {
      ...state,
      ...(shouldUpdateName && resolvedName ? { name: resolvedName.slice(0, 60) } : {}),
      ...(params.applyProfile && params.program !== undefined
        ? { program: params.program.trim().slice(0, 100) }
        : {}),
      ...(params.applyProfile && params.yearLevel !== undefined
        ? { yearLevel: params.yearLevel.trim().slice(0, 60) }
        : {}),
      ...(params.applyProfile && params.section !== undefined
        ? { section: params.section.trim().slice(0, 40) }
        : {}),
      profileSchemaVersion: 1,
    };

    if (
      nextProfile.name !== state.name ||
      nextProfile.program !== state.program ||
      nextProfile.yearLevel !== state.yearLevel ||
      nextProfile.section !== state.section
    ) {
      persistChange(nextProfile);
    }
  };

  const enterGuestSession = () => {
    saveGuestSession(true, typeof window !== 'undefined' ? sessionStorage : undefined);
    markLuniLoginGreetPending(typeof window !== 'undefined' ? sessionStorage : undefined);
    setIsGuest(true);
  };

  const signOutSession = async () => {
    clearAuthSession(
      typeof window !== 'undefined' ? localStorage : undefined,
      typeof window !== 'undefined' ? sessionStorage : undefined,
    );
    saveGuestSession(false, typeof window !== 'undefined' ? sessionStorage : undefined);
    setAuthSession(null);
    setIsGuest(false);
    await firebaseSignOut();
  };

  const resetAllData = (): SaveResult => {
    const result=clearStudentData(localStorage,sessionStorage);
    if(result.ok) {setState(structuredClone(INITIAL_STATE));setStorageWarning('');window.dispatchEvent(new Event('ctrl_focus_mode_changed'));}
    return result;
  };

  return (
    <StudentContext.Provider
      value={{
        state,
        overallJourneyProgress,
        modulesExploredCount,
        nextActivity,
        markTrackExplored,
        updateTrackProgress,
        toggleComparisonSelection,
        clearComparisonSelection,
        saveTrackReflection,
        acknowledgeAchievement,
        completeAttemptComparison,
        storageWarning,
        saveQuizAttempt,
        saveComparison,
        removeComparison,
        updatePreferences,
        updateProfile,
        completeModule,
        markAlumniStoryRead,
        recordActivity,
        resetAllData,
        authSession,
        isGuest,
        enterGuestSession,
        completeAuthLogin,
        signOutSession,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
