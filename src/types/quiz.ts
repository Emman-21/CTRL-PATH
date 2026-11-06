import { TrackCode } from './index';

export type QuestionType =
  | 'true_false'
  | 'multiple_choice'
  | 'matching'
  | 'sequencing'
  | 'identification';

export interface BaseQuestion {
  id: string;
  level: number; // 1 to 5
  type: QuestionType;
  track: TrackCode; // NT | BA | SM (kept hidden from student during quiz)
  prompt: string;
  explanation?: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface MatchingPair {
  term: string;
  definition: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[]; // terms to match with definitions
}

export interface SequencingQuestion extends BaseQuestion {
  type: 'sequencing';
  steps: string[]; // Correct chronological order
}

export interface IdentificationQuestion extends BaseQuestion {
  type: 'identification';
  acceptedAnswers: string[]; // Normalized strings
  placeholder?: string;
  isEnumeration?: boolean;
  enumerationFields?: {
    label: string;
    acceptedAnswers: string[];
  }[];
}

export type QuizQuestion =
  | TrueFalseQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion
  | SequencingQuestion
  | IdentificationQuestion;

export interface QuizSessionState {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  currentLevel: number; // 1 to 5
  currentQuestionIndex: number; // index in the active level
  shuffledQuestionsByLevel: Record<number, string[]>; // level -> list of question IDs
  answers: Record<string, any>; // questionId -> answer payload
  isCompleted: boolean;
  submittedAt?: string;
  levelPrepSeen: Record<number, boolean>;
}

export interface QuizScoreResult {
  attemptNumber: number;
  ntRaw: number;
  ntTotal: number;
  ntPercentage: number;
  baRaw: number;
  baTotal: number;
  baPercentage: number;
  smRaw: number;
  smTotal: number;
  smPercentage: number;
  overallScore: number;
  totalAnswered: number;
  totalQuestions: number;
  highestTrack: TrackCode;
  isTie: boolean;
  tiedTracks?: TrackCode[];
  durationMinutes: number;
}
