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
}

export type AchievementEvent =
  | { type: 'track-explored'; track: 'NT' | 'BA' | 'SM' }
  | { type: 'quiz-submitted'; attemptId: string }
  | { type: 'paths-compared'; comparisonId: string }
  | { type: 'attempts-compared'; comparisonId: string };
