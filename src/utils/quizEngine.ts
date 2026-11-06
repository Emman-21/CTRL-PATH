import { QuizSessionState, QuizScoreResult } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { TrackCode } from '../types';

const STORAGE_KEY = 'ctrl_path_quiz_session_v1';

/**
 * Seeded pseudo-random generator to ensure deterministic shuffle per attempt
 */
function createPrng(seedString: string) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles questions for each level based on attempt ID
 */
export function generateShuffledQuestionsByLevel(attemptId: string): Record<number, string[]> {
  const prng = createPrng(attemptId);
  const byLevel: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  for (let lvl = 1; lvl <= 5; lvl++) {
    const levelQuestions = QUIZ_QUESTIONS.filter((q) => q.level === lvl);
    const ids = levelQuestions.map((q) => q.id);

    // Fisher-Yates with deterministic prng
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    byLevel[lvl] = ids;
  }

  return byLevel;
}

/**
 * Initialize a brand-new quiz session
 */
export function initNewQuizSession(attemptNumber: number): QuizSessionState {
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) {
    throw new Error(
      `initNewQuizSession: attemptNumber must be a positive integer. Received: ${attemptNumber}`
    );
  }

  const attemptId = `attempt-${attemptNumber}-${Date.now()}`;
  const shuffledQuestionsByLevel = generateShuffledQuestionsByLevel(attemptId);

  const newSession: QuizSessionState = {
    attemptId,
    attemptNumber,
    startedAt: new Date().toISOString(),
    currentLevel: 1,
    currentQuestionIndex: 0,
    shuffledQuestionsByLevel,
    answers: {},
    isCompleted: false,
    levelPrepSeen: { 1: false, 2: false, 3: false, 4: false, 5: false },
  };

  saveQuizSession(newSession);
  return newSession;
}

/**
 * Load active session from LocalStorage
 */
export function loadQuizSession(): QuizSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.attemptId && parsed.shuffledQuestionsByLevel) {
      return parsed as QuizSessionState;
    }
  } catch (e) {
    console.warn('Failed to parse quiz session from storage', e);
  }
  return null;
}

/**
 * Save active session to LocalStorage
 */
export function saveQuizSession(session: QuizSessionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save quiz session to storage', e);
  }
}

/**
 * Clear current active session (e.g. after successful submission)
 */
export function clearQuizSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear quiz session from storage', e);
  }
}

/**
 * Normalize text for string matching
 */
export function normalizeAnswer(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Calculate scores across NT, BA, and SM tracks
 */
export function calculateQuizScores(
  session: QuizSessionState,
  durationMinutesOverride?: number
): QuizScoreResult {
  let ntScore = 0;
  let baScore = 0;
  let smScore = 0;

  let ntTotal = 0;
  let baTotal = 0;
  let smTotal = 0;

  let totalAnswered = 0;

  for (const q of QUIZ_QUESTIONS) {
    const studentAns = session.answers[q.id];

    if (q.track === 'NT') ntTotal++;
    if (q.track === 'BA') baTotal++;
    if (q.track === 'SM') smTotal++;

    if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
      totalAnswered++;
    }

    let isCorrect = false;

    if (q.type === 'true_false') {
      if (typeof studentAns === 'boolean' && studentAns === q.correctAnswer) {
        isCorrect = true;
      }
    } else if (q.type === 'multiple_choice') {
      if (studentAns === q.correctAnswer) {
        isCorrect = true;
      }
    } else if (q.type === 'matching') {
      // studentAns is an object: { [term]: selectedDefinition }
      if (studentAns && typeof studentAns === 'object') {
        let allMatched = true;
        for (const pair of q.pairs) {
          if (studentAns[pair.term] !== pair.definition) {
            allMatched = false;
            break;
          }
        }
        isCorrect = allMatched;
      }
    } else if (q.type === 'sequencing') {
      // studentAns is array of strings in user order
      if (Array.isArray(studentAns) && studentAns.length === q.steps.length) {
        let allInOrder = true;
        for (let i = 0; i < q.steps.length; i++) {
          if (studentAns[i] !== q.steps[i]) {
            allInOrder = false;
            break;
          }
        }
        isCorrect = allInOrder;
      }
    } else if (q.type === 'identification') {
      if (q.isEnumeration && q.enumerationFields) {
        // studentAns is an array of strings
        if (Array.isArray(studentAns)) {
          let correctCount = 0;
          q.enumerationFields.forEach((field, fIdx) => {
            const userVal = normalizeAnswer(studentAns[fIdx] || '');
            if (field.acceptedAnswers.some((acc) => normalizeAnswer(acc) === userVal)) {
              correctCount++;
            }
          });
          // Full or proportional credit (at least 2 of 3 correct counts)
          if (correctCount >= 2) {
            isCorrect = true;
          }
        }
      } else {
        const userNorm = normalizeAnswer(String(studentAns || ''));
        if (q.acceptedAnswers.some((acc) => normalizeAnswer(acc) === userNorm)) {
          isCorrect = true;
        }
      }
    }

    if (isCorrect) {
      if (q.track === 'NT') ntScore++;
      if (q.track === 'BA') baScore++;
      if (q.track === 'SM') smScore++;
    }
  }

  const ntPercentage = ntTotal > 0 ? Math.round((ntScore / ntTotal) * 100) : 0;
  const baPercentage = baTotal > 0 ? Math.round((baScore / baTotal) * 100) : 0;
  const smPercentage = smTotal > 0 ? Math.round((smScore / smTotal) * 100) : 0;

  const totalQuestions = QUIZ_QUESTIONS.length;
  const overallScore = Math.round(((ntScore + baScore + smScore) / totalQuestions) * 100);

  // Determine highest track & ties
  const scores: { track: TrackCode; score: number }[] = [
    { track: 'NT', score: ntPercentage },
    { track: 'BA', score: baPercentage },
    { track: 'SM', score: smPercentage },
  ];

  scores.sort((a, b) => b.score - a.score);

  const highestTrack = scores[0].track;
  const highestValue = scores[0].score;

  const tiedTracks = scores.filter((s) => s.score === highestValue).map((s) => s.track);
  const isTie = tiedTracks.length > 1;

  // Derive duration from the session start when no explicit override is given.
  // Clamp to a sane range to guard against malformed startedAt or paused tabs.
  let resolvedDuration: number;
  if (durationMinutesOverride != null) {
    resolvedDuration = durationMinutesOverride;
  } else {
    const started = new Date(session.startedAt).getTime();
    if (Number.isFinite(started)) {
      const elapsed = Math.round((Date.now() - started) / 60000);
      resolvedDuration = Math.max(1, Math.min(180, elapsed));
    } else {
      resolvedDuration = 25; // fallback for malformed startedAt
    }
  }

  return {
    attemptNumber: session.attemptNumber,
    ntRaw: ntScore,
    ntTotal,
    ntPercentage,
    baRaw: baScore,
    baTotal,
    baPercentage,
    smRaw: smScore,
    smTotal,
    smPercentage,
    overallScore,
    totalAnswered,
    totalQuestions,
    highestTrack,
    isTie,
    tiedTracks: isTie ? tiedTracks : undefined,
    durationMinutes: resolvedDuration,
  };
}
