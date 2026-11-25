import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../components/shared/PixelArt';

import { BACKGROUNDS } from '../assets/manifest';
import { useStudent } from '../context/StudentContext';

import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

// Modular Quiz Components
import { QuizIntro } from '../components/quiz/QuizIntro';
import { QuizPreparation } from '../components/quiz/QuizPreparation';
import { QuizLevelCompletion } from '../components/quiz/QuizLevelCompletion';
import { QuizQuestionRenderer } from '../components/quiz/QuizQuestionRenderer';
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
  isQuestionAnswered,
  getUnansweredQuestionIndices,
  isChapterComplete,
} from '../utils/quizEngine';
import {
  isInteractiveControl,
  isTypingElement,
  resolveQuizShortcut,
} from '../utils/keyboardNav';
import { scrollViewportToTop } from '../utils/scrollTop';

export const CtrlQuizPage: React.FC = () => {
  const { state: studentState, saveQuizAttempt, recordActivity } = useStudent();

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

  // Final scoring result
  const [scoreResult, setScoreResult] = useState<QuizScoreResult | null>(null);

  // Sync answering stage with sessionStorage and window event for non-scrolling main layout
  useEffect(() => {
    scrollViewportToTop();
    const isAnswering = flowStage === 'question';
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ctrl_quiz_answering', String(isAnswering));
      window.dispatchEvent(new Event('ctrl_quiz_answering_changed'));
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('ctrl_quiz_answering');
        window.dispatchEvent(new Event('ctrl_quiz_answering_changed'));
      }
    };
  }, [flowStage]);

  // Current Level metadata
  const currentLevelNum = session?.currentLevel || 1;
  const currentLevelMeta = QUIZ_LEVELS[currentLevelNum - 1] || QUIZ_LEVELS[0];

  // List of question IDs for current level
  const currentLevelQuestionIds =
    session?.shuffledQuestionsByLevel[currentLevelNum] || [];

  const currentQIndex = session?.currentQuestionIndex || 0;
  const activeQuestionId = currentLevelQuestionIds[currentQIndex];
  const quizQuestionsById = useMemo(
    () => new Map(QUIZ_QUESTIONS.map((q) => [q.id, q])),
    []
  );
  const activeQuestion: QuizQuestion | undefined = quizQuestionsById.get(activeQuestionId);
  const unansweredIndices = useMemo(
    () => getUnansweredQuestionIndices(currentLevelQuestionIds, session?.answers || {}),
    [currentLevelQuestionIds, session?.answers]
  );
  const isCurrentChapterComplete =
    currentLevelQuestionIds.length > 0 && unansweredIndices.length === 0;
  const isLastQuestionInChapter =
    currentLevelQuestionIds.length > 0 && currentQIndex === currentLevelQuestionIds.length - 1;

  const location = useLocation();
  const questionCardRef = useRef<HTMLDivElement | null>(null);
  const didAutostartRef = useRef(false);
  const pillNavRef = useRef<HTMLDivElement | null>(null);
  const activePillRef = useRef<HTMLButtonElement | null>(null);
  const pillDragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    didDrag: boolean;
  } | null>(null);
  const suppressPillClickRef = useRef(false);

  // Keep the active question pill visible inside the swipable strip
  useEffect(() => {
    if (flowStage === 'question' && activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [flowStage, currentLevelNum, currentQIndex]);

  // Focus question card when entering or switching non-identification questions so keyboard shortcuts work right away
  useEffect(() => {
    if (flowStage !== 'question' || !activeQuestion || activeQuestion.type === 'identification') {
      return;
    }
    const timer = window.setTimeout(() => {
      const activeEl = document.activeElement;
      const inBlockingOverlay = Boolean(
        document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')
      );
      if (inBlockingOverlay) return;
      if (activeEl?.closest?.('#topbar-search-results')) return;
      questionCardRef.current?.focus({ preventScroll: true });
    }, 20);
    return () => window.clearTimeout(timer);
  }, [flowStage, currentLevelNum, currentQIndex, activeQuestion?.id, activeQuestion?.type]);

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

  // Jump to a specific question inside the active chapter
  const handleJumpToChapterQuestion = (qIndex: number) => {
    if (!session || qIndex < 0 || qIndex >= currentLevelQuestionIds.length) return;
    const updated: QuizSessionState = {
      ...session,
      currentQuestionIndex: qIndex,
    };
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
      // Require all questions in the chapter to be answered before proceeding or submitting
      if (!isChapterComplete(currentLevelQuestionIds, session.answers)) {
        return;
      }
      if (currentLevelNum < 5) {
        setFlowStage('level_complete');
      } else {
        handleConfirmSubmit();
      }
    }
  };

  // Previous Question (within the current chapter)
  const handlePrevQuestion = () => {
    if (!session) return;
    if (currentQIndex > 0) {
      const updated: QuizSessionState = {
        ...session,
        currentQuestionIndex: currentQIndex - 1,
      };
      setSession(updated);
      saveQuizSession(updated);
    }
  };

  // Proceed to next level from Level Complete screen
  const handleContinueToNextLevel = () => {
    if (!session || !isChapterComplete(currentLevelQuestionIds, session.answers)) return;
    recordActivity('quiz-chapter-completed');
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
      handleConfirmSubmit();
    }
  };

  // Confirm and Submit Final Attempt
  const handleConfirmSubmit = () => {
    if (!session) return;

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

  const isActiveQuestionAnswered = activeQuestion
    ? isQuestionAnswered(activeQuestion, session?.answers[activeQuestion.id])
    : false;
  const canProceedNext = !(isLastQuestionInChapter && !isCurrentChapterComplete);

  // Optional ?autostart=1 support to jump past intro straight into preparation/active question
  useEffect(() => {
    if (didAutostartRef.current) return;
    const params = new URLSearchParams(location.search);
    if (params.get('autostart') !== '1') return;
    didAutostartRef.current = true;
    if (flowStage === 'intro') {
      if (session && !session.isCompleted) {
        const hasSeenPrep = session.levelPrepSeen[session.currentLevel];
        setFlowStage(hasSeenPrep ? 'question' : 'preparation');
      } else if (studentState.quizAttempts.length < 3) {
        const attemptNumber = studentState.quizAttempts.length + 1;
        const newSession = initNewQuizSession(attemptNumber);
        setSession(newSession);
        setFlowStage('preparation');
      }
    }
  }, [location.search, flowStage, session, studentState.quizAttempts.length]);

  const handleGlobalQuizKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Do not intercept if a modal dialog or global Topbar search listbox is active
      if (document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) {
        return;
      }
      if (document.getElementById('topbar-search-results')) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping = isTypingElement(target);
      const focusedOnButton = isInteractiveControl(target);

      // Allow Enter to advance through intro, preparation, and level_complete checkpoints
      if (flowStage === 'intro' || flowStage === 'preparation' || flowStage === 'level_complete') {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping && !focusedOnButton) {
          if (flowStage === 'intro') {
            if (session && !session.isCompleted) {
              e.preventDefault();
              handleResumeAttempt();
            } else if (studentState.quizAttempts.length < 3) {
              e.preventDefault();
              handleStartNewAttempt();
            }
          } else if (flowStage === 'preparation') {
            e.preventDefault();
            handleBeginLevel();
          } else if (flowStage === 'level_complete') {
            e.preventDefault();
            handleContinueToNextLevel();
          }
        }
        return;
      }

      if (flowStage !== 'question' || !activeQuestion || !session) return;

      const focusedOnAnswerOption = Boolean(target?.closest?.('[data-quiz-option-selected="true"]'));
      const focusedOnSequencingStep = Boolean(target?.closest?.('[data-testid^="sequencing-step-"]'));

      const action = resolveQuizShortcut({
        key: e.key,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        question: activeQuestion,
        currentValue: session.answers[activeQuestion.id],
        isCurrentQuestionAnswered: isActiveQuestionAnswered,
        canProceedNext,
        hasPrevQuestion: currentQIndex > 0,
        isTyping,
        focusedOnButton,
        focusedOnAnswerOption,
        focusedOnSequencingStep,
      });

      if (action.type === 'select_answer') {
        e.preventDefault();
        handleAnswerChange(action.value);
      } else if (action.type === 'next_question') {
        e.preventDefault();
        handleNextQuestion();
      } else if (action.type === 'prev_question') {
        e.preventDefault();
        handlePrevQuestion();
      }
    },
    [
      flowStage,
      activeQuestion,
      session,
      isActiveQuestionAnswered,
      canProceedNext,
      currentQIndex,
      studentState.quizAttempts.length,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalQuizKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalQuizKeyDown);
  }, [handleGlobalQuizKeyDown]);

  const isAnsweringStage = flowStage === 'question';

  return (
    <div
      className={`relative flex flex-col justify-start rounded-3xl overflow-hidden transition-all duration-300 bg-slate-50 dark:bg-[#0b1222] border border-slate-200/80 dark:border-slate-800 shadow-xs ${
        isAnsweringStage
          ? 'flex-1 min-h-0 p-4 sm:p-6'
          : 'min-h-[82dvh] p-4 sm:p-6 md:p-8'
      }`}
    >
      {/* Background Cloudscape (Minimal to prevent distraction during assessment) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <img
          src={BACKGROUNDS.quizMinimalClouds}
          alt=""
          className="w-full h-full object-cover pixelated"
        />
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
        <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 min-h-0 flex flex-col justify-start space-y-3 sm:space-y-3.5">
          {/* Level & Question Number Navigator */}
          <div className="bg-[var(--surface-95)] dark:bg-[#0f172a]/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-[var(--border)] dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
            <div className="shrink-0 flex items-center gap-3">
              {activeQuestion.track === 'NT' ? (
                <NtTrackBadge size={36} className="rounded-xl shadow-xs shrink-0" />
              ) : activeQuestion.track === 'BA' ? (
                <BaTrackBadge size={36} className="rounded-xl shadow-xs shrink-0" />
              ) : (
                <SmTrackBadge size={36} className="rounded-xl shadow-xs shrink-0" />
              )}
              <div>
                <div className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-300 tracking-wider">
                  Chapter {currentLevelNum}: {currentLevelMeta.typeTitle}
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  Question {currentQIndex + 1} of {currentLevelQuestionIds.length}
                </div>
              </div>
            </div>

            <div
              ref={pillNavRef}
              onPointerDown={(e) => {
                const el = pillNavRef.current;
                if (!el || el.scrollWidth <= el.clientWidth || e.pointerType === 'touch') return;
                pillDragRef.current = {
                  pointerId: e.pointerId,
                  startX: e.clientX,
                  scrollLeft: el.scrollLeft,
                  didDrag: false,
                };
                suppressPillClickRef.current = false;
              }}
              onPointerMove={(e) => {
                const drag = pillDragRef.current;
                const el = pillNavRef.current;
                if (!drag || !el || drag.pointerId !== e.pointerId) return;
                const dx = e.clientX - drag.startX;
                if (!drag.didDrag && Math.abs(dx) > 6) {
                  drag.didDrag = true;
                  suppressPillClickRef.current = true;
                  try {
                    el.setPointerCapture(e.pointerId);
                  } catch {
                    // ignore
                  }
                }
                if (drag.didDrag) {
                  el.scrollLeft = drag.scrollLeft - dx;
                }
              }}
              onPointerUp={(e) => {
                const drag = pillDragRef.current;
                const el = pillNavRef.current;
                if (drag && el && drag.pointerId === e.pointerId) {
                  if (drag.didDrag) {
                    try {
                      el.releasePointerCapture(e.pointerId);
                    } catch {
                      // ignore
                    }
                    setTimeout(() => {
                      suppressPillClickRef.current = false;
                    }, 0);
                  }
                  pillDragRef.current = null;
                }
              }}
              onPointerCancel={() => {
                pillDragRef.current = null;
                suppressPillClickRef.current = false;
              }}
              onWheel={(e) => {
                const el = pillNavRef.current;
                if (!el || el.scrollWidth <= el.clientWidth) return;
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  el.scrollLeft += e.deltaY;
                }
              }}
              className="w-full md:w-auto min-w-0 max-w-full flex items-center flex-nowrap overflow-x-auto touch-pan-x select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2 md:gap-1.5 py-1 px-1"
              role="navigation"
              aria-label={`Chapter ${currentLevelNum} question selector`}
            >
              {currentLevelQuestionIds.map((qId, qIdx) => {
                const qObj = quizQuestionsById.get(qId);
                const answered = qObj
                  ? isQuestionAnswered(qObj, session?.answers[qId])
                  : false;
                const isCurrent = qIdx === currentQIndex;

                return (
                  <button
                    key={qId}
                    ref={isCurrent ? activePillRef : undefined}
                    type="button"
                    onClick={() => {
                      if (suppressPillClickRef.current) return;
                      handleJumpToChapterQuestion(qIdx);
                    }}
                    aria-label={`Question ${qIdx + 1} (${answered ? 'Answered' : 'Unanswered'})`}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-11 h-11 md:w-8 md:h-8 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center shrink-0 ${
                      answered
                        ? 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-400 dark:text-white dark:hover:bg-blue-500 shadow-2xs'
                        : 'bg-[var(--surface)] border border-blue-300 text-blue-700 hover:bg-blue-50 dark:bg-[#162344] dark:border-blue-400/70 dark:text-blue-300 dark:hover:bg-blue-500/25'
                    } ${
                      isCurrent
                        ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-[var(--surface)] dark:ring-sky-300 dark:ring-offset-[#0f172a]'
                        : ''
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* White Question Card */}
          <Card padding="md" className="border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col justify-between min-h-0">
            <div
              ref={questionCardRef}
              tabIndex={-1}
              className="min-h-0 overflow-y-auto px-0.5 pt-0.5 focus:outline-hidden"
            >
              <QuizQuestionRenderer
                question={activeQuestion}
                value={session?.answers[activeQuestion.id]}
                onChange={handleAnswerChange}
              />
            </div>

            {isLastQuestionInChapter && !isCurrentChapterComplete && (
              <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 dark:bg-[#111e3b] dark:border-blue-400/40 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-semibold">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>
                    Answer all questions in Chapter {currentLevelNum} before proceeding ({unansweredIndices.length} remaining).
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-1">
                  {unansweredIndices.slice(0, 6).map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleJumpToChapterQuestion(idx)}
                      className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-black bg-[var(--surface)] border border-blue-300 text-blue-700 hover:bg-blue-100 dark:bg-[#162344] dark:border-blue-400/60 dark:text-blue-300 dark:hover:bg-blue-500/25 cursor-pointer"
                    >
                      #{idx + 1}
                    </button>
                  ))}
                  {unansweredIndices.length > 6 && (
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 px-1">
                      +{unansweredIndices.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentQIndex === 0}
                onClick={handlePrevQuestion}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2.5">
                {isActiveQuestionAnswered && canProceedNext && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">Enter</kbd>
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isLastQuestionInChapter && !isCurrentChapterComplete}
                  onClick={handleNextQuestion}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {isLastQuestionInChapter
                    ? currentLevelNum === 5
                      ? 'Submit Assessment'
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
          onRetake={handleStartNewAttempt}
        />
      )}
    </div>
  );
};
