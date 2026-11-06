export type TrackCode = 'NT' | 'BA' | 'SM';

export interface TrackModule {
  id: string;
  title: string;
  description: string;
  subject: string;
  topicTags: string[];
  status: 'available' | 'completed' | 'in_preparation';
  durationMinutes: number;
  overviewSummary: string;
}

export interface RealWorldApplication {
  title: string;
  scenario: string;
  solution: string;
  impact: string;
}

export interface TrackInfo {
  code: TrackCode;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  badgeClass: string;
  description: string;
  focus: string;
  luniQuote: string;
  introAchievement: {
    id: number;
    name: string;
    gemstoneUrl: string;
  };
  keySubjects: string[];
  coreSkills: {
    category: string;
    skills: string[];
  }[];
  modules: TrackModule[];
  realWorldApplications: RealWorldApplication[];
  possibleCareers: {
    title: string;
    description: string;
    sampleRoles: string[];
  }[];
  workStyle: string[];
  interests: string[];
  bestFitTraits: string[];
}

export interface StudentPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  textSize: 'normal' | 'large';
  notifications: boolean;
  luniEnabled?: boolean;
  luniFloatingAnimation?: boolean;
  luniAutoTips?: boolean;
  luniMinimized?: boolean;
}

export interface QuizAttempt {
  submissionId?: string;
  submittedAt?: string;
  id: string;
  date: string;
  attemptNumber: number;
  ntScore: number;
  baScore: number;
  smScore: number;
  // Optional raw scores captured at submission time. Legacy attempts lack these;
  // UI falls back to derived raw counts when missing.
  ntRaw?: number;
  baRaw?: number;
  smRaw?: number;
  totalAnswered: number;
  totalQuestions: number;
  durationMinutes: number;
  answers?: Record<string, any>;
  levelScores?: Record<number, { correct: number; total: number; percentage: number }>;
}

export interface SavedComparison {
  reviewedAt?: string;
  id: string;
  date: string;
  tracks: TrackCode[];
  title: string;
}

export interface TrackReflection {
  interests: string;
  topicsToLearn: string;
  questions: string;
  savedAt?: string;
}

export interface StudentState {
  profileSchemaVersion: 1;
  section: string;
  biography: string;
  avatarStyle: 'neutral' | 'initials';
  explorationDates: Partial<Record<TrackCode, string>>;
  moduleCompletions: { track: TrackCode; moduleId: string; completedAt: string }[];
  achievementSchemaVersion: 2;
  achievementRecords: import('./achievements').AchievementRecord[];
  attemptComparisons: import('./achievements').AttemptComparison[];
  name: string;
  university: string;
  program: string;
  yearLevel: string;
  exploredTracks: Record<TrackCode, boolean>;
  trackProgress: Record<TrackCode, number>; // 0 to 100 percentage
  unlockedGemstones: number[]; // Read-only compatibility projection of achievementRecords; not persisted.
  currentQuizProgress: {
    level: number;
    currentQuestionIndex: number;
    answers: Record<string, any>;
    inProgress: boolean;
  };
  quizAttempts: QuizAttempt[];
  savedComparisons: SavedComparison[];
  comparisonSelection: TrackCode[];
  reflections: Record<TrackCode, TrackReflection>;
  preferences: StudentPreferences;
}
