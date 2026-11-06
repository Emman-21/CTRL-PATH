import { TrackCode } from '../types';
import { QuizAttempt } from '../types';
import { QuizQuestion } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { normalizeAnswer } from './quizEngine';

export interface EvaluatedQuestion {
  question: QuizQuestion;
  isCorrect: boolean;
  status: 'correct' | 'incorrect' | 'skipped';
  studentDisplay: string;
  correctDisplay: string;
}

export interface LevelPerformance {
  level: number;
  name: string;
  questionType: string;
  correct: number;
  total: number;
  percentage: number;
  leadingTrack: TrackCode;
}

export interface DetailedResultsAnalysis {
  attempt: QuizAttempt;
  isTie: boolean;
  highestTrack: TrackCode;
  tiedTracks?: TrackCode[];
  /**
   * True when the analysis has trustworthy per-question data
   * (either real answers from a modern submission, or clearly-labeled sample data).
   * False for legacy attempts that predate answer tracking.
   */
  answerReviewAvailable: boolean;
  trackBreakdowns: {
    NT: { raw: number; total: number; percentage: number; level: string; label: string };
    BA: { raw: number; total: number; percentage: number; level: string; label: string };
    SM: { raw: number; total: number; percentage: number; level: string; label: string };
  };
  headlineTitle: string;
  spotlightNarrative: string;
  personaMatch: string;
  levelPerformances: LevelPerformance[];
  demonstratedStrengths: { title: string; track: TrackCode; description: string }[];
  growthOpportunities: { title: string; track: TrackCode; description: string; recommendedRoute: string }[];
  evaluatedQuestions: EvaluatedQuestion[];
}

/**
 * Evaluates an individual question's correctness and generates display text for review
 */
export function evaluateQuestionForReview(
  q: QuizQuestion,
  studentAns: any
): EvaluatedQuestion {
  const isSkipped = studentAns === undefined || studentAns === null || studentAns === '';
  let isCorrect = false;
  let studentDisplay = 'Not Answered';
  let correctDisplay = '';

  if (q.type === 'true_false') {
    correctDisplay = q.correctAnswer ? 'True' : 'False';
    if (!isSkipped && typeof studentAns === 'boolean') {
      studentDisplay = studentAns ? 'True' : 'False';
      isCorrect = studentAns === q.correctAnswer;
    }
  } else if (q.type === 'multiple_choice') {
    const correctOpt = q.options.find((o) => o.key === q.correctAnswer);
    correctDisplay = `${q.correctAnswer}: ${correctOpt ? correctOpt.text : ''}`;
    if (!isSkipped) {
      const studentOpt = q.options.find((o) => o.key === studentAns);
      studentDisplay = studentOpt ? `${studentAns}: ${studentOpt.text}` : String(studentAns);
      isCorrect = studentAns === q.correctAnswer;
    }
  } else if (q.type === 'matching') {
    correctDisplay = q.pairs.map((p) => `${p.term} → ${p.definition}`).join('; ');
    if (!isSkipped && typeof studentAns === 'object') {
      let matchCount = 0;
      const userPairs: string[] = [];
      q.pairs.forEach((p) => {
        const val = studentAns[p.term];
        if (val) {
          userPairs.push(`${p.term} → ${val}`);
          if (val === p.definition) matchCount++;
        }
      });
      studentDisplay = userPairs.length > 0 ? userPairs.join('; ') : 'No matches made';
      isCorrect = matchCount === q.pairs.length;
    }
  } else if (q.type === 'sequencing') {
    correctDisplay = q.steps.map((s, idx) => `${idx + 1}. ${s}`).join(' → ');
    if (!isSkipped && Array.isArray(studentAns)) {
      studentDisplay = studentAns.map((s, idx) => `${idx + 1}. ${s}`).join(' → ');
      let inOrder = true;
      for (let i = 0; i < q.steps.length; i++) {
        if (studentAns[i] !== q.steps[i]) {
          inOrder = false;
          break;
        }
      }
      isCorrect = inOrder && studentAns.length === q.steps.length;
    }
  } else if (q.type === 'identification') {
    if (q.isEnumeration && q.enumerationFields) {
      correctDisplay = q.enumerationFields
        .map((f) => `${f.label}: ${f.acceptedAnswers[0]}`)
        .join(', ');
      if (!isSkipped && Array.isArray(studentAns)) {
        studentDisplay = studentAns.filter(Boolean).join(', ') || 'No entries submitted';
        let correctCount = 0;
        q.enumerationFields.forEach((field, fIdx) => {
          const userVal = normalizeAnswer(studentAns[fIdx] || '');
          if (field.acceptedAnswers.some((acc) => normalizeAnswer(acc) === userVal)) {
            correctCount++;
          }
        });
        isCorrect = correctCount >= 2;
      }
    } else {
      correctDisplay = q.acceptedAnswers[0];
      if (!isSkipped) {
        studentDisplay = String(studentAns);
        const userNorm = normalizeAnswer(String(studentAns));
        isCorrect = q.acceptedAnswers.some((acc) => normalizeAnswer(acc) === userNorm);
      }
    }
  }

  const status = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'incorrect';

  return {
    question: q,
    isCorrect,
    status,
    studentDisplay,
    correctDisplay,
  };
}

/**
 * Deterministic sample synthesis for the demo preview only.
 * Never used for real student attempts.
 */
function synthesizeSampleQuestion(
  q: QuizQuestion,
  ntPct: number,
  baPct: number,
  smPct: number
): EvaluatedQuestion {
  const targetScore = q.track === 'NT' ? ntPct : q.track === 'BA' ? baPct : smPct;
  const pseudoScore = q.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
  const isCorrect = pseudoScore <= targetScore;

  let studentDisplay = isCorrect ? 'Demonstrated Correct Understanding' : 'Alternative Response Given';
  let correctDisplay = '';

  if (q.type === 'true_false') {
    correctDisplay = q.correctAnswer ? 'True' : 'False';
    studentDisplay = isCorrect ? correctDisplay : q.correctAnswer ? 'False' : 'True';
  } else if (q.type === 'multiple_choice') {
    const correctOpt = q.options.find((o) => o.key === q.correctAnswer);
    correctDisplay = `${q.correctAnswer}: ${correctOpt ? correctOpt.text : ''}`;
    studentDisplay = isCorrect ? correctDisplay : 'Alternative selection';
  } else if (q.type === 'matching') {
    correctDisplay = q.pairs.map((p) => `${p.term} → ${p.definition}`).join('; ');
    studentDisplay = isCorrect ? 'All pairs matched correctly' : 'Partial match';
  } else if (q.type === 'sequencing') {
    correctDisplay = q.steps.map((s, idx) => `${idx + 1}. ${s}`).join(' → ');
    studentDisplay = isCorrect ? 'All sequence steps in order' : 'Steps rearranged';
  } else if (q.type === 'identification') {
    correctDisplay = q.isEnumeration && q.enumerationFields
      ? q.enumerationFields.map((f) => f.acceptedAnswers[0]).join(', ')
      : q.acceptedAnswers[0];
    studentDisplay = isCorrect ? correctDisplay : 'Unverified term';
  }

  return {
    question: q,
    isCorrect,
    status: isCorrect ? 'correct' : 'incorrect',
    studentDisplay,
    correctDisplay,
  };
}

/**
 * Generate a comprehensive results analysis object from a QuizAttempt
 */
export function analyzeQuizAttempt(attempt: QuizAttempt): DetailedResultsAnalysis {
  const ntPct = Math.round(attempt.ntScore);
  const baPct = Math.round(attempt.baScore);
  const smPct = Math.round(attempt.smScore);

  const isSampleAttempt = attempt.id === 'demo-sample-attempt';
  const answers = attempt.answers || {};
  const hasRealAnswers = !isSampleAttempt && Object.keys(answers).length > 0;

  const getLevelLabel = (pct: number) => {
    if (pct >= 75) return 'High Alignment';
    if (pct >= 50) return 'Moderate Resonance';
    return 'Foundational Interest';
  };

  const trackScores: { track: TrackCode; score: number }[] = [
    { track: 'NT', score: ntPct },
    { track: 'BA', score: baPct },
    { track: 'SM', score: smPct },
  ];

  trackScores.sort((a, b) => b.score - a.score);
  const highestScore = trackScores[0].score;
  const highestTrack = trackScores[0].track;

  const tiedTracks = trackScores.filter((t) => t.score === highestScore).map((t) => t.track);
  const isTie = tiedTracks.length > 1;

  const levelNames: Record<number, { name: string; type: string }> = {
    1: { name: 'Level 1: Core Fundamentals', type: 'True / False' },
    2: { name: 'Level 2: Applied Scenarios', type: 'Multiple Choice' },
    3: { name: 'Level 3: Terminology & Tools', type: 'Matching Pairs' },
    4: { name: 'Level 4: Operational Processes', type: 'Sequencing Steps' },
    5: { name: 'Level 5: Domain Technical Mastery', type: 'Identification & Enumeration' },
  };

  // Determine per-question evaluation strategy:
  // - Sample demo: synthesize deterministic data (clearly preview-only)
  // - Real attempt with answers: evaluate honestly
  // - Real legacy attempt without answers: return empty (no fabrication)
  let evaluatedQuestions: EvaluatedQuestion[] = [];
  if (hasRealAnswers) {
    evaluatedQuestions = QUIZ_QUESTIONS.map((q) => evaluateQuestionForReview(q, answers[q.id]));
  } else if (isSampleAttempt) {
    evaluatedQuestions = QUIZ_QUESTIONS.map((q) => synthesizeSampleQuestion(q, ntPct, baPct, smPct));
  }
  // Legacy real attempt: evaluatedQuestions stays empty

  // Level performances can only be honestly computed when we have per-question data
  const levelPerformances: LevelPerformance[] =
    evaluatedQuestions.length > 0
      ? [1, 2, 3, 4, 5].map((lvl) => {
          const lvlQuestions = evaluatedQuestions.filter((eq) => eq.question.level === lvl);
          const correctCount = lvlQuestions.filter((eq) => eq.isCorrect).length;
          const totalCount = lvlQuestions.length;
          const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

          const ntLvl = lvlQuestions.filter((eq) => eq.question.track === 'NT' && eq.isCorrect).length;
          const baLvl = lvlQuestions.filter((eq) => eq.question.track === 'BA' && eq.isCorrect).length;
          const smLvl = lvlQuestions.filter((eq) => eq.question.track === 'SM' && eq.isCorrect).length;

          let leadingTrack: TrackCode = 'NT';
          if (baLvl >= ntLvl && baLvl >= smLvl) leadingTrack = 'BA';
          if (smLvl > ntLvl && smLvl > baLvl) leadingTrack = 'SM';

          return {
            level: lvl,
            name: levelNames[lvl].name,
            questionType: levelNames[lvl].type,
            correct: correctCount,
            total: totalCount,
            percentage,
            leadingTrack,
          };
        })
      : [];

  // Narratives use only stored percentages (always available)
  let headlineTitle = '';
  let spotlightNarrative = '';
  let personaMatch = '';

  if (isTie) {
    if (tiedTracks.length === 3) {
      headlineTitle = 'Harmonious Polymath Resonance!';
      spotlightNarrative =
        'You demonstrated remarkably balanced curiosity and aptitude across all three IT domains (NT, BA, and SM). In modern technology organizations, versatile professionals who understand networks, data storytelling, and service delivery are exceptionally valuable!';
      personaMatch = 'The Complete Architect';
    } else if (tiedTracks.includes('NT') && tiedTracks.includes('BA')) {
      headlineTitle = 'Network Intelligence & Data Fusion!';
      spotlightNarrative =
        'Your answers illuminate an exciting balance between Networking Technology and Business Analytics. You appreciate the hardware highways that carry data while also wanting to extract strategic insights from that traffic—ideal for Telecommunications Analytics, IoT Systems, and Network Forensics!';
      personaMatch = 'The Cyber Analyst';
    } else if (tiedTracks.includes('NT') && tiedTracks.includes('SM')) {
      headlineTitle = 'Infrastructure & Service Operations Synergy!';
      spotlightNarrative =
        'Your strengths bridge Networking Technology and Service Management. You enjoy technical connectivity while intuitively valuing uptime, user satisfaction, and structured operations—the exact DNA of modern Cloud Operations and DevOps Engineering!';
      personaMatch = 'The Systems Orchestrator';
    } else {
      headlineTitle = 'Business Intelligence & Operations Alignment!';
      spotlightNarrative =
        'Your responses highlight a powerful blend of Business Analytics and Service Management. You have the analytical mindset to find patterns in numbers, combined with the process acumen to translate findings into high-efficiency workflows and client satisfaction!';
      personaMatch = 'The Strategic Optimizer';
    }
  } else {
    if (highestTrack === 'NT') {
      headlineTitle = 'Networking Technology Alignment';
      spotlightNarrative =
        'Your responses reflect an instinct for network topologies, device connectivity, and security protocols. You enjoy hands-on troubleshooting and understanding how data travels between systems!';
      personaMatch = 'The Master Connector';
    } else if (highestTrack === 'BA') {
      headlineTitle = 'Business Analytics Alignment';
      spotlightNarrative =
        'Your responses demonstrate a strong curiosity in data modeling, statistical patterns, and actionable intelligence. You naturally look for trends within information to inform strategic organizational decisions!';
      personaMatch = 'The Data Strategist';
    } else {
      headlineTitle = 'Service Management Alignment';
      spotlightNarrative =
        'Your responses highlight an understanding of operational workflows, ITIL service governance, and customer-centric delivery. You recognize how people, processes, and technology unite to power seamless enterprise IT!';
      personaMatch = 'The Service Vanguard';
    }
  }

  const demonstratedStrengths: { title: string; track: TrackCode; description: string }[] = [];
  if (ntPct >= 50) {
    demonstratedStrengths.push({
      title: 'Protocol & Architectural Reasoning',
      track: 'NT',
      description: 'You understand packet routing, topological hierarchy, and defense-in-depth principles across digital networks.',
    });
  }
  if (baPct >= 50) {
    demonstratedStrengths.push({
      title: 'Quantitative Trend Patterning',
      track: 'BA',
      description: 'You intuitively recognize data structures, query relationships, and performance KPI correlations.',
    });
  }
  if (smPct >= 50) {
    demonstratedStrengths.push({
      title: 'Process Optimization & SLA Governance',
      track: 'SM',
      description: 'You appreciate standard operational lifecycles, incident escalation workflows, and customer service empathy.',
    });
  }
  if (demonstratedStrengths.length < 3) {
    demonstratedStrengths.push({
      title: 'Curious Exploratory Mindset',
      track: highestTrack,
      description: 'You demonstrate active curiosity and willingness to navigate diverse IT specializations with an open mind.',
    });
  }

  const growthOpportunities: { title: string; track: TrackCode; description: string; recommendedRoute: string }[] = [];
  if (ntPct < 70) {
    growthOpportunities.push({
      title: 'Subnetting & Network Configuration Practice',
      track: 'NT',
      description: 'Sharpen your understanding of CIDR subnet masks, IP addressing, and router/switch CLI configurations.',
      recommendedRoute: '/tracks',
    });
  }
  if (baPct < 70) {
    growthOpportunities.push({
      title: 'SQL Schema & Business Metric Interpretation',
      track: 'BA',
      description: 'Deepen your knowledge of relational database tables, aggregation functions, and dashboard visualization design.',
      recommendedRoute: '/tracks',
    });
  }
  if (smPct < 70) {
    growthOpportunities.push({
      title: 'ITIL Framework & Incident Response Sequencing',
      track: 'SM',
      description: 'Explore the difference between incidents, problems, and change requests in enterprise IT service operations.',
      recommendedRoute: '/tracks',
    });
  }
  if (growthOpportunities.length === 0) {
    growthOpportunities.push({
      title: 'Cross-Track Capstone Synthesis',
      track: highestTrack,
      description: 'Challenge yourself by connecting your technical knowledge to end-to-end enterprise real-world scenarios.',
      recommendedRoute: '/compare',
    });
  }

  return {
    attempt,
    isTie,
    highestTrack,
    tiedTracks: isTie ? tiedTracks : undefined,
    answerReviewAvailable: hasRealAnswers || isSampleAttempt,
    trackBreakdowns: {
      NT: {
        raw: attempt.ntRaw ?? Math.round((ntPct / 100) * 33),
        total: 33,
        percentage: ntPct,
        level: getLevelLabel(ntPct),
        label: 'Networking Technology',
      },
      BA: {
        raw: attempt.baRaw ?? Math.round((baPct / 100) * 33),
        total: 33,
        percentage: baPct,
        level: getLevelLabel(baPct),
        label: 'Business Analytics',
      },
      SM: {
        raw: attempt.smRaw ?? Math.round((smPct / 100) * 33),
        total: 33,
        percentage: smPct,
        level: getLevelLabel(smPct),
        label: 'Service Management',
      },
    },
    headlineTitle,
    spotlightNarrative,
    personaMatch,
    levelPerformances,
    demonstratedStrengths,
    growthOpportunities,
    evaluatedQuestions,
  };
}

/**
 * Sample preview data when student hasn't taken a quiz yet
 */
export const SAMPLE_DEMO_ATTEMPT: QuizAttempt = {
  id: 'demo-sample-attempt',
  date: 'Sample Exploration',
  attemptNumber: 1,
  ntScore: 82,
  baScore: 73,
  smScore: 61,
  totalAnswered: 99,
  totalQuestions: 99,
  durationMinutes: 28,
};