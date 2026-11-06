import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StudentState, TrackCode, QuizAttempt, SavedComparison, StudentPreferences } from '../types';

import { validateProfile, studentProgress, completeLearningModule, clearStudentData, type ProfileValues, type SaveResult } from '../utils/studentControls';
import { evaluateAchievements, eligibleAttemptPair, withAchievementRecords } from '../utils/achievementRules';
import { loadStudentData, serializeStudent, STUDENT_STORAGE_KEY as STORAGE_KEY } from '../utils/achievementStorage';

export const INITIAL_STATE: StudentState = {
  profileSchemaVersion: 1,
  section: '',
  biography: '',
  avatarStyle: 'neutral',
  explorationDates: {},
  moduleCompletions: [],
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
  completeAttemptComparison: (ids: [string, string]) => void;
  storageWarning: string;
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'date'>) => void;
  saveComparison: (tracks: TrackCode[], title: string, reviewed: boolean) => void;
  removeComparison: (id: string) => void;
  updatePreferences: (prefs: Partial<StudentPreferences>) => SaveResult;
  updateProfile: (values: ProfileValues) => SaveResult;
  completeModule: (track: TrackCode, moduleId: string) => void;
  resetAllData: () => SaveResult;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded] = useState(() => loadStudentData(localStorage, INITIAL_STATE));
  const [state, setState] = useState<StudentState>(loaded.state);
  const [storageWarning, setStorageWarning] = useState(loaded.warning);
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
  const updateProfile = (values: ProfileValues): SaveResult => {
    if(Object.keys(validateProfile(values)).length) return {ok:false,message:'Please correct the profile fields.'};
    const clean=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()])) as ProfileValues;
    return persistChange({...state,...clean,profileSchemaVersion:1});
  };
  const completeModule = (track: TrackCode,moduleId:string) => setState(prev=>completeLearningModule(prev,track,moduleId));

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
    const newlyUnlocked = !state.unlockedGemstones.includes(gemId);
    setState(prev => evaluateAchievements({ ...prev,
      exploredTracks: { ...prev.exploredTracks, [track]: true },
      explorationDates: { ...prev.explorationDates, [track]: prev.explorationDates[track] || new Date().toISOString() },
      trackProgress: { ...prev.trackProgress, [track]: Math.max(prev.trackProgress[track], 60) },
    }, { type: 'track-explored', track }));
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
    return persistChange({...state,reflections:{...state.reflections,[track]:{...state.reflections[track],...reflection,savedAt:new Date().toISOString()}}});
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

  const saveComparison = (tracks: TrackCode[], title: string, reviewed: boolean) => {
    // Normalize: deduplicate and sort so {NT,BA} matches {BA,NT}.
    const distinct = [...new Set(tracks.filter(t => ['NT', 'BA', 'SM'].includes(t)))].sort();
    if (!reviewed || distinct.length < 2) return;

    const comparison: SavedComparison = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      tracks: distinct,
      title,
    };

    setState(prev => {
      // Reject if an equivalent comparison (same set of tracks) already exists.
      const isDuplicate = prev.savedComparisons.some(existing => {
        const existingTracks = [...new Set(existing.tracks)].sort();
        return (
          existingTracks.length === distinct.length &&
          existingTracks.every((t, i) => t === distinct[i])
        );
      });
      if (isDuplicate) return prev;

      return evaluateAchievements(
        { ...prev, savedComparisons: [comparison, ...prev.savedComparisons] },
        { type: 'paths-compared', comparisonId: comparison.id }
      );
    });
  };

  const completeAttemptComparison = (ids: [string, string]) => {
    const comparison = { id: crypto.randomUUID(), attemptIds: ids, completedAt: new Date().toISOString() };
    setState(prev => {
      if (!eligibleAttemptPair(prev, ids) || prev.attemptComparisons.some(c => ids.every(id => c.attemptIds.includes(id)))) return prev;
      return evaluateAchievements({ ...prev, attemptComparisons: [...prev.attemptComparisons, comparison] },
        { type: 'attempts-compared', comparisonId: comparison.id }, comparison.completedAt);
    });
  };

  const removeComparison = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedComparisons: prev.savedComparisons.filter((c) => c.id !== id),
    }));
  };

  const updatePreferences = (prefs: Partial<StudentPreferences>): SaveResult => persistChange({...state,preferences:{...state.preferences,...prefs}});

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
        resetAllData,
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
