import React, { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { ProgressBar } from '../components/shared/ProgressBar';

import { BACKGROUNDS } from '../assets/manifest';
import { useStudent } from '../context/StudentContext';

import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Eye,
  EyeOff,
  FileCheck,
} from 'lucide-react';

// Modular Quiz Components
import { QuizIntro } from '../components/quiz/QuizIntro';
import { QuizPreparation } from '../components/quiz/QuizPreparation';
import { QuizLevelCompletion } from '../components/quiz/QuizLevelCompletion';
import { QuizQuestionRenderer } from '../components/quiz/QuizQuestionRenderer';
import { QuizReviewModal } from '../components/quiz/QuizReviewModal';
import { QuizCompletion } from '../components/quiz/QuizCompletion';

// Engine & Data
import { QuizSessionState, QuizScoreResult, QuizQuestion } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { QUIZ_LEVELS } from '../data/quiz/quizLevels';
import {
  initNewQuizSession,
  loadQuizSession,
  saveQuizSession,
  clearQuizSession,
  calculateQuizScores,
} from '../utils/quizEngine';

export const CtrlQuizPage: React.FC = () => {
  const { state: studentState, saveQuizAttempt } = useStudent();

  // Active quiz session state loaded from local storage
  const [session, setSession] = useState<QuizSessionState | null>(() => loadQuizSession());

  // Navigation flow stage
  const [flowStage, setFlowStage] = useState<
    'intro' | 'preparation' | 'question' | 'level_complete' | 'completed'
  >(() => {
    const existing = loadQuizSession();
    if (existing && !existing.isCompleted) {
      return existing.levelPrepSeen[existing.currentLevel] ? 'question' : 'preparation';
    }
    return 'intro';
  });

  // Focus mode state
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Review modal visibility
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Final scoring result
  const [scoreResult, setScoreResult] = useState<QuizScoreResult | null>(null);

  // Track whether First Spark existed BEFORE this submission, so we can
  // distinguish "just unlocked" from "already had it" on the completion screen.
  const [hadFirstSparkOnSubmit, setHadFirstSparkOnSubmit] = useState(false);

  // Sync Focus Mode with sessionStorage and window event for Luni assistant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ctrl_quiz_focus_mode', String(focusMode));
      window.dispatchEvent(new Event('ctrl_focus_mode_changed'));
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('ctrl_quiz_focus_mode');
        window.dispatchEvent(new Event('ctrl_focus_mode_changed'));
      }
    };
  }, [focusMode]);

  // Current Level metadata
  const currentLevelNum = session?.currentLevel || 1;
  const currentLevelMeta = QUIZ_LEVELS[currentLevelNum - 1] || QUIZ_LEVELS[0];

  // List of question IDs for current level
  const currentLevelQuestionIds =
    session?.shuffledQuestionsByLevel[currentLevelNum] || [];

  const currentQIndex = session?.currentQuestionIndex || 0;
  const activeQuestionId = currentLevelQuestionIds[currentQIndex];
  const activeQuestion: QuizQuestion | undefined = QUIZ_QUESTIONS.find(
    (q) => q.id === activeQuestionId
  );

  // Start new attempt
  const handleStartNewAttempt = () => {
    const attemptNumber = studentState.quizAttempts.length + 1;
    const newSession = initNewQuizSession(attemptNumber);
    setSession(newSession);
    setFlowStage('preparation');
  };

  // Resume active attempt
  const handleResumeAttempt = () => {
    if (!session) return;
    const hasSeenPrep = session.levelPrepSeen[session.currentLevel];
    setFlowStage(hasSeenPrep ? 'question' : 'preparation');
  };

  // Begin level after reading preparation screen
  const handleBeginLevel = () => {
    if (!session) return;
    const updated: QuizSessionState = {
      ...session,
      levelPrepSeen: { ...session.levelPrepSeen, [session.currentLevel]: true },
    };
    setSession(updated);
    saveQuizSession(updated);
    setFlowStage('question');
  };

  // Handle student answering a question
  const handleAnswerChange = (value: any) => {
    if (!session || !activeQuestionId) return;
    const updatedAnswers = { ...session.answers, [activeQuestionId]: value };
    const updated: QuizSessionState = { ...session, answers: updatedAnswers };
    setSession(updated);
    saveQuizSession(updated);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (!session) return;
    if (currentQIndex < currentLevelQuestionIds.length - 1) {
      const updated: QuizSessionState = {
        ...session,
        currentQuestionIndex: currentQIndex + 1,
      };
      setSession(updated);
      saveQuizSession(updated);
    } else {
      // Reached end of current level
      if (currentLevelNum < 5) {
        setFlowStage('level_complete');
      } else {
        // End of Level 5 -> Open review modal
        setShowReviewModal(true);
      }
    }
  };

  // Previous Question
  const handlePrevQuestion = () => {
    if (!session) return;
    if (currentQIndex > 0) {
      const updated: QuizSessionState = {
        ...session,
        currentQuestionIndex: currentQIndex - 1,
      };
      setSession(updated);
      saveQuizSession(updated);
    } else if (currentLevelNum > 1) {
      // Go to previous level's last question
      const prevLvl = currentLevelNum - 1;
      const prevIds = session.shuffledQuestionsByLevel[prevLvl] || [];
      const updated: QuizSessionState = {
        ...session,
        currentLevel: prevLvl,
        currentQuestionIndex: Math.max(0, prevIds.length - 1),
      };
      setSession(updated);
      saveQuizSession(updated);
    }
  };

  // Proceed to next level from Level Complete screen
  const handleContinueToNextLevel = () => {
    if (!session) return;
    if (currentLevelNum < 5) {
      const nextLvl = currentLevelNum + 1;
      const updated: QuizSessionState = {
        ...session,
        currentLevel: nextLvl,
        currentQuestionIndex: 0,
      };
      setSession(updated);
      saveQuizSession(updated);
      setFlowStage('preparation');
    } else {
      setShowReviewModal(true);
    }
  };

  // Jump to specific question from review modal
  const handleJumpToQuestion = (level: number, questionIndex: number) => {
    if (!session) return;
    const updated: QuizSessionState = {
      ...session,
      currentLevel: level,
      currentQuestionIndex: questionIndex,
      levelPrepSeen: { ...session.levelPrepSeen, [level]: true },
    };
    setSession(updated);
    saveQuizSession(updated);
    setFlowStage('question');
  };

  // Confirm and Submit Final Attempt
  const handleConfirmSubmit = () => {
    if (!session) return;
    setShowReviewModal(false);

    // Capture BEFORE saveQuizAttempt fires so we can detect a newly-unlocked First Spark
    const hadBefore = studentState.achievementRecords.some(
      (r) => r.id === 'special-first-spark'
    );
    setHadFirstSparkOnSubmit(hadBefore);

    // Calculate score
    const result = calculateQuizScores(session);
    setScoreResult(result);

    // Persist attempt in student context
    saveQuizAttempt({
      submissionId: session.attemptId,
      attemptNumber: result.attemptNumber,
      ntScore: result.ntPercentage,
      baScore: result.baPercentage,
      smScore: result.smPercentage,
      ntRaw: result.ntRaw,
      baRaw: result.baRaw,
      smRaw: result.smRaw,
      totalAnswered: result.totalAnswered,
      totalQuestions: result.totalQuestions,
      durationMinutes: result.durationMinutes,
      answers: session.answers,
    });

    // Mark session as completed and clean up
    clearQuizSession();
    setSession(null);
    setFlowStage('completed');
  };

  return (
    <div
      className={`relative min-h-[82vh] flex flex-col justify-center rounded-3xl overflow-hidden transition-all duration-300 ${
        focusMode ? 'bg-slate-900 text-white p-4 sm:p-8' : 'bg-slate-50'
      }`}
    >
      {/* Background Cloudscape (Minimal to prevent distraction during assessment) */}
      {!focusMode && (
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <img
            src={BACKGROUNDS.quizMinimalClouds}
            alt=""
            className="w-full h-full object-cover pixelated"
          />
        </div>
      )}

      {/* Top Bar Header with Title, Focus Mode, and Attempt Tracker */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200/80 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-black text-xs sm:text-sm tracking-tight uppercase text-blue-600">
            CTRL Quiz Adventure
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
            · 99 Questions (33 NT, 33 BA, 33 SM)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Focus Mode Toggle */}
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              focusMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            aria-label="Toggle Focus Mode"
          >
            {focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{focusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
          </button>

          {/* Attempt Tracker Pill */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>
              Attempt {session ? session.attemptNumber : Math.min(3, studentState.quizAttempts.length + 1)} of 3
            </span>
          </div>
        </div>
      </div>

      {/* FLOW STAGE 1: INTRO */}
      {flowStage === 'intro' && (
        <QuizIntro
          attemptNumber={studentState.quizAttempts.length + 1}
          maxAttempts={3}
          hasActiveSession={Boolean(session && !session.isCompleted)}
          onStart={handleStartNewAttempt}
          onResume={handleResumeAttempt}
        />
      )}

      {/* FLOW STAGE 2: LEVEL PREPARATION */}
      {flowStage === 'preparation' && (
        <QuizPreparation
          levelNumber={currentLevelNum}
          onBeginLevel={handleBeginLevel}
        />
      )}

      {/* FLOW STAGE 3: ACTIVE QUESTIONS */}
      {flowStage === 'question' && activeQuestion && (
        <div className="relative z-10 max-w-2xl mx-auto w-full space-y-4">
          {/* Level & Question Progress Bar */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase text-indigo-600 tracking-wider">
                Chapter {currentLevelNum}: {currentLevelMeta.typeTitle}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                Question {currentQIndex + 1} of {currentLevelQuestionIds.length}
              </div>
            </div>

            <div className="w-28 sm:w-36 text-right">
              <ProgressBar
                value={Math.round(((currentQIndex + 1) / currentLevelQuestionIds.length) * 100)}
                variant="primary"
                size="sm"
                showLabel
              />
            </div>
          </div>

          {/* White Question Card */}
          <Card padding="lg" className="border-slate-200 shadow-sm relative">
            <QuizQuestionRenderer
              question={activeQuestion}
              value={session?.answers[activeQuestion.id]}
              onChange={handleAnswerChange}
            />

            {/* Navigation Bar */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentQIndex === 0 && currentLevelNum === 1}
                onClick={handlePrevQuestion}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewModal(true)}
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  Review All
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextQuestion}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {currentQIndex === currentLevelQuestionIds.length - 1
                    ? currentLevelNum === 5
                      ? 'Review & Submit'
                      : `Complete Level ${currentLevelNum}`
                    : 'Next Question'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* FLOW STAGE 4: LEVEL COMPLETION CHECKPOINT */}
      {flowStage === 'level_complete' && (
        <QuizLevelCompletion
          completedLevel={currentLevelNum}
          onContinue={handleContinueToNextLevel}
        />
      )}

      {/* FLOW STAGE 5: FINAL COMPLETION */}
      {flowStage === 'completed' && scoreResult && (
        <QuizCompletion
          scoreResult={scoreResult}
          firstSparkUnlocked={
            !hadFirstSparkOnSubmit &&
            studentState.achievementRecords.some((r) => r.id === 'special-first-spark')
          }
          onRetake={handleStartNewAttempt}
        />
      )}

      {/* REVIEW & SUBMISSION MODAL */}
      {session && (
        <QuizReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          session={session}
          onJumpToQuestion={handleJumpToQuestion}
          onConfirmSubmit={handleConfirmSubmit}
        />
      )}
    </div>
  );
};
