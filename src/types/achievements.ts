export interface AchievementRecord {
  id: string;
  unlockedAt: string | null;
  eventRef?: string;
  celebrationAcknowledged: boolean;
}

export interface AttemptComparison {
  id: string;
  attemptIds: [string, string];
  completedAt: string;
  reasons?: string[];
  note?: string;
}

export type AchievementEvent =
  | { type: 'track-explored'; track: 'NT' | 'BA' | 'SM' }
  | { type: 'module-completed'; track: 'NT' | 'BA' | 'SM'; moduleId: string }
  | { type: 'quiz-submitted'; attemptId: string }
  | { type: 'paths-compared'; comparisonId: string }
  | { type: 'attempts-compared'; comparisonId: string }
  | { type: 'profile-updated' }
  | { type: 'story-read'; storyId: string }
  | { type: 'streak-updated'; streakCount: number }
  | { type: 'reflection-saved'; track: 'NT' | 'BA' | 'SM' };
