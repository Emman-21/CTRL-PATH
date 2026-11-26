import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Compass,
  FileQuestion,
  Flame,
  Lightbulb,
  Lock,
  RotateCcw,
  Sparkles,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { BACKGROUNDS, GEMSTONE_ASSETS, type GemstoneAsset } from '../assets/manifest';
import { RaritySparkles } from '../components/achievements/AchievementCard';
import { DashboardLuniIdle } from '../components/dashboard/DashboardLuniIdle';
import { UniversityCrests } from '../components/shared/UniversityCrests';
import {
  NtPixelArt,
  BaPixelArt,
  SmPixelArt,
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
} from '../components/shared/PixelArt';
import { useStudent } from '../context/StudentContext';
import { clampProgressPercent, studentProgress } from '../utils/studentControls';
import { loadQuizSession } from '../utils/quizEngine';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { QUIZ_LEVELS } from '../data/quiz/quizLevels';
import { achievementStats, achievementProgress } from '../utils/achievementRules';
import { getEffectiveStreak } from '../utils/streakManager';
import type { TrackCode } from '../types';

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH: QUIZ METADATA CONSTANTS
 * Shared with CTRL Quiz & Smart Results. Avoids hardcoded duplicates.
 * ============================================================================
 */
export const QUIZ_META_CONSTANTS = {
  totalChapters: QUIZ_LEVELS.length, // 5 calibrated chapters
  totalQuestions: QUIZ_QUESTIONS.length, // 99 calibrated questions
  estimatedTimeText: '~45 mins',
  estimatedTimeMinutes: 45,
  maxAttempts: 3,
} as const;

/**
 * Crossroads Signpost Illustration
 * Displays the day signpost in light mode and the night signpost in dark mode
 */
const CrossroadsSignpostIllustration: React.FC = () => (
  <div className="relative w-28 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 shrink-0 rounded-2xl overflow-hidden border border-[var(--border)] dark:border-slate-800 shadow-xs select-none bg-[var(--surface-2)] dark:bg-slate-900 group">
    <img
      src="/assets/aistudio/Gemini_Generated_Image_3awrwn3awrwn3awr_013726b0.jpg"
      alt="Crossroads Signpost: Knowledge, Practice, Brighter Path (Day)"
      className="w-full h-full object-cover block dark:hidden transition-transform duration-300 group-hover:scale-105"
      loading="eager"
    />
    <img
      src="/assets/aistudio/Gemini_Generated_Image_fa4wzefa4wzefa4w_8364c5ea.jpg"
      alt="Crossroads Signpost: Knowledge, Practice, Brighter Path (Night)"
      className="w-full h-full object-cover hidden dark:block transition-transform duration-300 group-hover:scale-105"
      loading="eager"
    />
  </div>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: studentState, overallJourneyProgress, modulesExploredCount, nextActivity } = useStudent();
  const overallProgressPercent = clampProgressPercent(overallJourneyProgress);
  const journey = studentProgress(studentState);
  const activeQuiz = loadQuizSession();
  const collection = achievementStats(studentState);

  // User state indicators
  const isNewUser = overallJourneyProgress === 0 && modulesExploredCount === 0 && studentState.quizAttempts.length === 0;
  const isQuizCompleted = studentState.quizAttempts.length > 0;
  const hasRealActivity = overallJourneyProgress > 0 || modulesExploredCount > 0 || studentState.quizAttempts.length > 0 || collection.unlocked > 0;

  // Streak state with TikTok-style pop animation
  const [streakData, setStreakData] = useState(() => getEffectiveStreak(overallJourneyProgress));
  const [isStreakPopping, setIsStreakPopping] = useState(false);

  useEffect(() => {
    setStreakData(getEffectiveStreak(overallJourneyProgress));
  }, [overallJourneyProgress]);

  useEffect(() => {
    const handlePop = () => {
      setStreakData(getEffectiveStreak(overallJourneyProgress));
      setIsStreakPopping(true);
      setTimeout(() => setIsStreakPopping(false), 850);
    };

    const handleUpdate = () => {
      setStreakData(getEffectiveStreak(overallJourneyProgress));
    };

    window.addEventListener('ctrl_streak_badge_pop', handlePop);
    window.addEventListener('ctrl_streak_updated', handleUpdate);
    return () => {
      window.removeEventListener('ctrl_streak_badge_pop', handlePop);
      window.removeEventListener('ctrl_streak_updated', handleUpdate);
    };
  }, [overallJourneyProgress]);

  // --------------------------------------------------------------------------
  // QUIZ STATE EVALUATION (One Source of Truth)
  // Count only unique valid answered questions from QUIZ_QUESTIONS
  // --------------------------------------------------------------------------
  const answeredQuestionIds = new Set(
    QUIZ_QUESTIONS.filter((q) => {
      const val = activeQuiz?.answers?.[q.id];
      return val !== undefined && val !== null && val !== '';
    }).map((q) => q.id)
  );

  const answeredCount = Math.min(QUIZ_META_CONSTANTS.totalQuestions, answeredQuestionIds.size);
  const quizPercent = Math.min(100, Math.round((answeredCount / QUIZ_META_CONSTANTS.totalQuestions) * 100));

  // Determine chapter-by-chapter progression for chapter dots
  const chaptersProgress = QUIZ_LEVELS.map((lvl) => {
    const lvlQuestions = QUIZ_QUESTIONS.filter((q) => q.level === lvl.level);
    const lvlTotal = lvlQuestions.length;
    const lvlAnswered = lvlQuestions.filter((q) => answeredQuestionIds.has(q.id)).length;
    const isCompleted = isQuizCompleted || (lvlAnswered === lvlTotal && lvlTotal > 0);
    return {
      level: lvl.level,
      name: lvl.name,
      total: lvlTotal,
      answered: isQuizCompleted ? lvlTotal : lvlAnswered,
      isCompleted,
    };
  });

  // Identify where the student is currently stopped
  const firstUnfinishedChapter = chaptersProgress.find((c) => !c.isCompleted)?.level || 1;
  const currentChapterNumber = isQuizCompleted ? 5 : activeQuiz?.currentLevel || firstUnfinishedChapter;
  const currentAttemptNumber = Math.min(QUIZ_META_CONSTANTS.maxAttempts, studentState.quizAttempts.length + (activeQuiz && !isQuizCompleted ? 1 : isQuizCompleted ? 0 : 1));

  // --------------------------------------------------------------------------
  // RECENT GEMSTONES (Canonical shared GEMSTONE_ASSETS matching Vault)
  // --------------------------------------------------------------------------
  const unlockedGemIds = new Set(studentState.achievementRecords.map((r) => r.id));
  if (isQuizCompleted) {
    unlockedGemIds.add('special-first-spark');
  }

  // Find all unlocked gems with their real metadata from GEMSTONE_ASSETS
  const unlockedGemsList = collection.recent.map((entry) => {
    const record = studentState.achievementRecords.find((r) => r.id === entry.gem.achievementId);
    return {
      gem: entry.gem,
      isUnlocked: true,
      unlockedText: record?.unlockedAt
        ? new Date(record.unlockedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
        : 'Just unlocked',
    };
  });

  // If quiz is completed but First Spark isn't in collection.recent yet, add it
  if (isQuizCompleted && !unlockedGemsList.some((g) => g.gem.achievementId === 'special-first-spark')) {
    const firstSparkGem = GEMSTONE_ASSETS.find((g) => g.achievementId === 'special-first-spark');
    if (firstSparkGem) {
      unlockedGemsList.unshift({
        gem: firstSparkGem,
        isUnlocked: true,
        unlockedText: studentState.quizAttempts[0]?.date
          ? new Date(studentState.quizAttempts[0].date).toLocaleDateString(undefined, { dateStyle: 'medium' })
          : 'Just unlocked',
      });
    }
  }

  // Canonical fill order for remaining slots when fewer than 4 are unlocked:
  // 1. First Spark, 2. Sapphire's Protocol, 3. Amethyst's Foresight, 4. Aquamarine's Precision
  const defaultFillIds = [
    'special-first-spark',
    'nt-peridots-protocol',
    'ba-garnets-foresight',
    'sm-pearls-precision',
  ];

  const displayGems = [...unlockedGemsList.slice(0, 4)];
  for (const fillId of defaultFillIds) {
    if (displayGems.length >= 4) break;
    if (!displayGems.some((d) => d.gem.achievementId === fillId)) {
      const gemAsset = GEMSTONE_ASSETS.find((g) => g.achievementId === fillId);
      if (gemAsset) {
        displayGems.push({
          gem: gemAsset,
          isUnlocked: false,
          unlockedText: 'Locked',
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // TODAY'S NEXT STEP LOGIC
  // - New user with no quiz attempt -> Recommend Quiz ("Start Assessment" filled primary)
  // - Post-quiz -> Recommend Smart Results, then recommended track
  // - Button text: "Start Exploring" when track has no progress, "Continue" when it does
  // --------------------------------------------------------------------------
  const topTrack: TrackCode = journey.analysis?.highestTrack || 'NT';
  const topTrackProgress = studentState.trackProgress[topTrack] || 0;
  const topTrackName =
    topTrack === 'NT'
      ? 'Networking Technology'
      : topTrack === 'BA'
      ? 'Business Analytics'
      : 'Service Management';

  const topTrackStyle = {
    NT: {
      cardBg: 'bg-linear-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-slate-900 border-2 border-[var(--accent-nt-border)] dark:border-blue-800/70',
      badge: 'bg-[var(--accent-nt-tint)] dark:bg-blue-900/60 text-[var(--accent-nt-text)] dark:text-blue-200 border border-[var(--accent-nt-border)] dark:border-blue-800/60',
      titleHighlight: 'text-[var(--accent-nt-text)] dark:text-blue-300',
    },
    BA: {
      cardBg: 'bg-linear-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/90 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border-2 border-[var(--accent-ba-border)] dark:border-purple-800/70',
      badge: 'bg-[var(--accent-ba-tint)] dark:bg-purple-900/60 text-[var(--accent-ba-text)] dark:text-purple-200 border border-[var(--accent-ba-border)] dark:border-purple-800/60',
      titleHighlight: 'text-[var(--accent-ba-text)] dark:text-purple-300',
    },
    SM: {
      cardBg: 'bg-linear-to-r from-emerald-50/90 via-teal-50/70 to-cyan-50/90 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border-2 border-[var(--accent-sm-border)] dark:border-emerald-800/70',
      badge: 'bg-[var(--accent-sm-tint)] dark:bg-emerald-900/60 text-[var(--accent-sm-text)] dark:text-emerald-200 border border-[var(--accent-sm-border)] dark:border-emerald-800/60',
      titleHighlight: 'text-[var(--accent-sm-text)] dark:text-emerald-300',
    },
  }[topTrack];

  const recommendedNextStep = !isQuizCompleted
    ? {
        title: 'Begin the CTRL Track Affinity Quiz',
        description:
          'Take the 5-chapter assessment to discover whether Networking Technology, Business Analytics, or Service Management aligns best with your natural problem-solving strengths.',
        route: '/quiz',
        buttonText: 'Start Assessment',
        isPrimary: true,
        tag: 'Aptitude Assessment',
        timeText: QUIZ_META_CONSTANTS.estimatedTimeText,
      }
    : modulesExploredCount === 0
    ? {
        title: 'View Your Smart Results & Track Fit',
        description: `Your responses aligned strongest with ${topTrackName}. Review your personalized report and career match.`,
        route: '/results',
        buttonText: 'View Smart Results',
        isPrimary: false,
        tag: 'Report & Affinity',
        timeText: '3 min read',
      }
    : {
        title: `Explore ${topTrackName} Track`,
        description: `Dive into official courses, syllabus roadmaps, and career pathways calibrated for ${topTrackName}.`,
        route: `/tracks?track=${topTrack}`,
        buttonText: topTrackProgress > 0 ? 'Continue' : 'Start Exploring',
        isPrimary: false,
        tag: 'Track Immersion',
        timeText: '5 min read',
      };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ==================================================================== */}
      {/* 1. HERO (WELCOME & ONE OVERALL PROGRESS BAR)                         */}
      {/* ==================================================================== */}
      <section className="relative w-full rounded-3xl overflow-hidden border border-[var(--border)] dark:border-indigo-950/80 shadow-[var(--card-shadow)] bg-linear-to-r from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-950 dark:via-indigo-950/60 dark:to-purple-950/50">
        <div className="absolute inset-0 z-0">
          <img
            src={BACKGROUNDS.dashboardSkyKingdom}
            alt=""
            className="w-full h-full object-cover object-center pixelated"
          />
          {/* Richer gradient overlay derived from --hero-overlay so text stays crisp */}
          <div
            className="absolute inset-0 backdrop-blur-[1px]"
            style={{ background: 'var(--hero-overlay)' }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-6">
            <div>
              <div className="mb-2.5 flex flex-wrap items-center gap-2.5 text-xs font-bold text-[var(--accent-nt-text)] dark:text-blue-200 tracking-tight">
                <UniversityCrests size="sm" gapClassName="gap-1.5" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span>Batangas State University Alangilan</span>
                  <span aria-hidden="true" className="opacity-50">·</span>
                  <span>CICS IINTESS BSIT Hub</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text)] dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span>Welcome back, Luminary!</span>
                <Sparkles
                  className="w-6 h-6 text-amber-400 animate-sparkle-spin shrink-0"
                  style={{ animationDuration: '7s' }}
                />
              </h1>

              <p className="mt-2 text-sm text-[var(--text-muted)] dark:text-slate-300 leading-relaxed font-normal">
                Every small step brings you closer to a brighter future. Let's explore your pathways and discover the specialization that suits your strengths.
              </p>
            </div>

            {/* Overall Progress Container (Lifted glass card with clean border & shadow) */}
            <div className="bg-[var(--hero-progress-bg)] dark:bg-[#0f172a]/95 backdrop-blur-md rounded-2xl p-6 border border-[var(--hero-progress-border)] dark:border-indigo-950/80 shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text)] dark:text-slate-100 font-extrabold text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Overall Journey Progress</span>
                </div>
                <span className="text-base font-black text-[var(--accent-nt-text)] dark:text-blue-400">
                  {overallProgressPercent}%
                </span>
              </div>

              {/* Single Progress Bar in Hero */}
              <div
                className="w-full bg-[var(--surface-2)] dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-[var(--border-subtle)] dark:border-transparent"
                role="progressbar"
                aria-label="Overall Journey Progress"
                aria-valuenow={overallProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="bg-[var(--accent-nt)] dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>

              {/* Metric stats + Streak Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-[var(--border-subtle)] dark:border-slate-800/80">
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-center font-bold text-xs">
                      ★
                    </span>
                    <span>
                      <strong className="text-[var(--text)] dark:text-slate-100 font-extrabold">{modulesExploredCount}</strong> Modules Explored
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[var(--accent-nt-text)] dark:text-blue-400" />
                    <span>
                      <strong className="text-[var(--text)] dark:text-slate-100 font-extrabold">{journey.attempts.length}</strong> Quizzes Submitted
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[var(--accent-ba-text)] dark:text-purple-400" />
                    <span>
                      <strong className="text-[var(--text)] dark:text-slate-100 font-extrabold">{collection.unlocked}</strong> / {GEMSTONE_ASSETS.length} Gemstones
                    </span>
                  </div>
                </div>

                {/* TikTok-style Streak Badge in Hero */}
                {streakData.streakCount > 0 && overallJourneyProgress > 0 ? (
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 select-none ${
                      isStreakPopping ? 'scale-105 shadow-md ring-2 ring-amber-400/50' : 'shadow-2xs'
                    } bg-[var(--badge-streak-bg)] border-[var(--badge-streak-border)]`}
                    style={{ boxShadow: 'var(--badge-streak-glow)' }}
                  >
                    <div className={`relative flex items-center justify-center ${isStreakPopping ? 'animate-bounce' : ''}`}>
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-xs text-orange-700 dark:text-orange-300 transition-transform duration-300 inline-block ${
                          isStreakPopping ? 'scale-130' : 'scale-100'
                        }`}
                      >
                        {streakData.streakCount}
                      </span>
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        Day Streak
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] dark:bg-slate-900/60 border border-[var(--border)] dark:border-slate-800 text-[var(--text-subtle)] dark:text-slate-500 select-none">
                    <Flame className="w-4 h-4 text-[var(--text-subtle)] dark:text-slate-500" />
                    <span className="font-extrabold text-xs text-[var(--text-muted)] dark:text-slate-500">
                      0
                    </span>
                    <span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium">
                      Explore today to start your streak
                    </span>
                  </div>
                )}
              </div>

              {/* Continue Journey button (Neutral outline styling requested by user) */}
              <div className="pt-2 flex justify-end">
                <Link to={recommendedNextStep.route}>
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-11 md:min-h-0 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 border border-[var(--border)] dark:border-slate-700 bg-[var(--surface)] dark:bg-slate-900/80 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-200 shadow-2xs"
                  >
                    <span>Continue Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mascot Section: Luni appears once here with shortened 1-sentence guidance */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center lg:items-end justify-center lg:justify-end gap-4 self-center lg:self-auto">
            <div className="bg-[var(--hero-progress-bg)] dark:bg-[#0f172a]/95 backdrop-blur-md border border-[var(--border)] dark:border-indigo-900/60 rounded-2xl p-4 shadow-[var(--card-shadow)] max-w-[260px] relative text-left">
              <div className="text-xs font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                <span>Luni's Celestial Guide</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-[var(--text-muted)] dark:text-slate-300 leading-relaxed font-medium">
                "Take time to explore all three tracks before locking in your specialization!"
              </p>
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[var(--surface)] dark:border-l-[#0f172a]" />
            </div>

            <div className="relative">
              <DashboardLuniIdle size={148} animate glow />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. TODAY'S NEXT STEP                                                 */}
      {/* ==================================================================== */}
      <section className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 p-6 shadow-[var(--card-shadow)]">
        <div className="flex items-center gap-2 text-[var(--text)] dark:text-slate-100 font-black text-sm mb-4">
          <Compass className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
          <span>Today's Next Step</span>
        </div>

        {/* Nested box uses --surface-2 layer instead of white-on-white */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-4 rounded-2xl bg-[var(--surface-2)] dark:bg-[#0d1526] border border-[var(--border)] dark:border-slate-800">
          <CrossroadsSignpostIllustration />

          <div className="flex-1 space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-[var(--text)] dark:text-slate-100">
              {recommendedNextStep.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] dark:text-slate-300 leading-relaxed">
              {recommendedNextStep.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--text-muted)] dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                <span>{recommendedNextStep.timeText}</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[var(--accent-nt-tint)] dark:bg-blue-950/70 text-[var(--accent-nt-text)] dark:text-blue-300 border border-[var(--accent-nt-border)] dark:border-blue-800/60">
                {recommendedNextStep.tag}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[var(--accent-ba-tint)] dark:bg-purple-950/70 text-[var(--accent-ba-text)] dark:text-purple-300 border border-[var(--accent-ba-border)] dark:border-purple-800/60">
                +1 Gemstone
              </span>
            </div>
          </div>

          <Link to={recommendedNextStep.route} className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto min-h-11 md:min-h-0 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 border border-[var(--border)] dark:border-slate-700 bg-[var(--surface)] dark:bg-slate-900/80 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-200 shadow-2xs"
            >
              <span>{recommendedNextStep.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. HOW IT WORKS: SLIMMER SINGLE-LINE STRIP (BELOW TODAY'S NEXT STEP) */}
      {/* ==================================================================== */}
      {modulesExploredCount === 0 && (
        <section className="bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-[var(--border)] dark:border-indigo-950 rounded-2xl p-4 shadow-[var(--card-shadow)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-black text-[var(--text)] dark:text-slate-100 shrink-0">
              <Lightbulb className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
              <span>How CTRL+PATH Works:</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[var(--text-muted)] dark:text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-nt)] text-white font-bold text-xs flex items-center justify-center">1</span>
                <span>Explore</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-ba)] text-white font-bold text-xs flex items-center justify-center">2</span>
                <span>Take the quiz</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[var(--accent-sm)] text-white font-bold text-xs flex items-center justify-center">3</span>
                <span>Earn gemstones</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 4. EXPLORE YOUR TRACKS (TINTED ACCENTS & OUTLINED BUTTONS)           */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[var(--text)] dark:text-slate-100 tracking-tight">
              Explore Your Tracks
            </h2>
            <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 mt-0.5 font-medium">
              Three official specializations offered in the BatStateU BSIT curriculum
            </p>
          </div>
          <Link
            to="/tracks"
            className="touch-target-44 text-xs font-bold text-[var(--text)] dark:text-slate-300 hover:text-[var(--accent-nt-text)] dark:hover:text-white hover:underline flex items-center gap-1 transition-colors shrink-0"
          >
            <span>View Track Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recommended Track Fit (Appears Post-Quiz in Dynamic Track Color) */}
        {isQuizCompleted && journey.analysis && (
          <div className={`${topTrackStyle.cardBg} rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
            <div className="space-y-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${topTrackStyle.badge} text-xs font-black`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Recommended For You Based On Your Assessment</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text)] dark:text-slate-100 mt-2">
                <span className={topTrackStyle.titleHighlight}>
                  {topTrack === 'NT' ? 'Networking Technology (NT)' : topTrack === 'BA' ? 'Business Analytics (BA)' : 'Service Management (SM)'}
                </span>
                {' '}— Top Track Fit
              </h3>
              <p className="text-sm text-[var(--text-muted)] dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
                Based on your quiz submission, your problem-solving responses aligned strongest with this pathway. Explore syllabus topics and career insights to prepare for your second year.
              </p>
            </div>

            <Link to="/results" className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto min-h-11 md:min-h-0 border border-[var(--border)] dark:border-slate-700 bg-[var(--surface)] dark:bg-slate-900/80 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-200 font-bold text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>View Smart Results</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TRACK 1: NETWORKING TECHNOLOGY (NT) - BLUE */}
          <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 border-t-4 border-t-[var(--accent-nt)] dark:border-t-blue-500 hover:border-blue-300 dark:hover:border-blue-700/80 p-6 flex flex-col justify-between shadow-[var(--card-shadow)] hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <NtTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
                  <div>
                    <h3 className="font-black text-[var(--text)] dark:text-slate-100 text-base leading-tight">
                      Networking Technology
                    </h3>
                    <span className="text-xs text-[var(--accent-nt-text)] dark:text-blue-400 font-bold">
                      Infrastructure & Security
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] dark:text-slate-300 leading-relaxed font-medium">
                Build, connect, and secure the digital world. Master Cisco routing, server virtualization, and cloud defense.
              </p>

              {/* Tinted "Best for you if..." container */}
              <div className="p-3 rounded-xl bg-[var(--accent-nt-tint)] dark:bg-blue-950/40 border border-[var(--accent-nt-border)] dark:border-blue-900/50 text-xs text-[var(--accent-nt-text)] dark:text-blue-200 font-medium">
                <strong className="font-extrabold">Best for you if:</strong> you enjoy hands-on hardware, network defense, and connecting global systems.
              </div>

              {/* Tinted illustration backdrop with reduced height */}
              <div className="h-16 flex items-center justify-center rounded-xl bg-[var(--accent-nt-tint)] dark:bg-linear-to-b dark:from-blue-950/50 dark:to-slate-900 border border-[var(--accent-nt-border)] dark:border-blue-900/40 overflow-hidden">
                <div className="scale-85 origin-center">
                  <NtPixelArt size="sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] dark:border-slate-800 space-y-3">
              {studentState.trackProgress.NT > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] dark:text-slate-400 font-semibold">Track Progress</span>
                    <span className="font-extrabold text-[var(--accent-nt-text)] dark:text-blue-400">
                      {studentState.trackProgress.NT}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-2)] dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-[var(--border-subtle)] dark:border-transparent">
                    <div
                      className="bg-[var(--accent-nt)] dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${studentState.trackProgress.NT}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-subtle)] dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--border)] dark:bg-slate-700" />
                  <span>Not started yet</span>
                </div>
              )}

              {/* Outlined button using track accent color */}
              <Link to="/tracks?track=NT" className="block">
                <button
                  type="button"
                  className="w-full min-h-11 md:min-h-0 border border-[var(--accent-nt)] hover:bg-[var(--accent-nt-tint)] text-[var(--accent-nt-text)] dark:border-blue-800/80 dark:hover:bg-blue-950/50 dark:text-blue-300 font-bold text-sm py-2 px-3 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Explore NT Track</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* TRACK 2: BUSINESS ANALYTICS (BA) - PURPLE */}
          <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 border-t-4 border-t-[var(--accent-ba)] dark:border-t-purple-500 hover:border-purple-300 dark:hover:border-purple-700/80 p-6 flex flex-col justify-between shadow-[var(--card-shadow)] hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BaTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
                  <div>
                    <h3 className="font-black text-[var(--text)] dark:text-slate-100 text-base leading-tight">
                      Business Analytics
                    </h3>
                    <span className="text-xs text-[var(--accent-ba-text)] dark:text-purple-400 font-bold">
                      Data & Intelligence
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] dark:text-slate-300 leading-relaxed font-medium">
                Turn data into insights for real-world impact. Learn statistical modeling, BI, and predictive strategy.
              </p>

              {/* Tinted "Best for you if..." container */}
              <div className="p-3 rounded-xl bg-[var(--accent-ba-tint)] dark:bg-purple-950/40 border border-[var(--accent-ba-border)] dark:border-purple-900/50 text-xs text-[var(--accent-ba-text)] dark:text-purple-200 font-medium">
                <strong className="font-extrabold">Best for you if:</strong> you enjoy finding hidden patterns in charts, data stories, and problem-solving.
              </div>

              {/* Tinted illustration backdrop with reduced height */}
              <div className="h-16 flex items-center justify-center rounded-xl bg-[var(--accent-ba-tint)] dark:bg-linear-to-b dark:from-purple-950/50 dark:to-slate-900 border border-[var(--accent-ba-border)] dark:border-purple-900/40 overflow-hidden">
                <div className="scale-85 origin-center">
                  <BaPixelArt size="sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] dark:border-slate-800 space-y-3">
              {studentState.trackProgress.BA > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] dark:text-slate-400 font-semibold">Track Progress</span>
                    <span className="font-extrabold text-[var(--accent-ba-text)] dark:text-purple-400">
                      {studentState.trackProgress.BA}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-2)] dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-[var(--border-subtle)] dark:border-transparent">
                    <div
                      className="bg-[var(--accent-ba)] dark:bg-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${studentState.trackProgress.BA}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-subtle)] dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--border)] dark:bg-slate-700" />
                  <span>Not started yet</span>
                </div>
              )}

              {/* Outlined button using track accent color */}
              <Link to="/tracks?track=BA" className="block">
                <button
                  type="button"
                  className="w-full min-h-11 md:min-h-0 border border-[var(--accent-ba)] hover:bg-[var(--accent-ba-tint)] text-[var(--accent-ba-text)] dark:border-purple-800/80 dark:hover:bg-purple-950/50 dark:text-purple-300 font-bold text-sm py-2 px-3 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Explore BA Track</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* TRACK 3: SERVICE MANAGEMENT (SM) - GREEN */}
          <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 border-t-4 border-t-[var(--accent-sm)] dark:border-t-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-700/80 p-6 flex flex-col justify-between shadow-[var(--card-shadow)] hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <SmTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
                  <div>
                    <h3 className="font-black text-[var(--text)] dark:text-slate-100 text-base leading-tight">
                      Service Management
                    </h3>
                    <span className="text-xs text-[var(--accent-sm-text)] dark:text-emerald-400 font-bold">
                      Operations, CX & Tech
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] dark:text-slate-300 leading-relaxed font-medium">
                Create seamless service experiences. Master ITIL frameworks, SLA delivery, and enterprise support.
              </p>

              {/* Tinted "Best for you if..." container */}
              <div className="p-3 rounded-xl bg-[var(--accent-sm-tint)] dark:bg-emerald-950/40 border border-[var(--accent-sm-border)] dark:border-emerald-900/50 text-xs text-[var(--accent-sm-text)] dark:text-emerald-200 font-medium">
                <strong className="font-extrabold">Best for you if:</strong> you like managing operations, leading teams, and optimizing IT user experiences.
              </div>

              {/* Tinted illustration backdrop with reduced height */}
              <div className="h-16 flex items-center justify-center rounded-xl bg-[var(--accent-sm-tint)] dark:bg-linear-to-b dark:from-emerald-950/50 dark:to-slate-900 border border-[var(--accent-sm-border)] dark:border-emerald-900/40 overflow-hidden">
                <div className="scale-85 origin-center">
                  <SmPixelArt size="sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] dark:border-slate-800 space-y-3">
              {studentState.trackProgress.SM > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] dark:text-slate-400 font-semibold">Track Progress</span>
                    <span className="font-extrabold text-[var(--accent-sm-text)] dark:text-emerald-400">
                      {studentState.trackProgress.SM}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-2)] dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-[var(--border-subtle)] dark:border-transparent">
                    <div
                      className="bg-[var(--accent-sm)] dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${studentState.trackProgress.SM}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-subtle)] dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--border)] dark:bg-slate-700" />
                  <span>Not started yet</span>
                </div>
              )}

              {/* Outlined button using track accent color */}
              <Link to="/tracks?track=SM" className="block">
                <button
                  type="button"
                  className="w-full min-h-11 md:min-h-0 border border-[var(--accent-sm)] hover:bg-[var(--accent-sm-tint)] text-[var(--accent-sm-text)] dark:border-emerald-800/80 dark:hover:bg-emerald-950/50 dark:text-emerald-300 font-bold text-sm py-2 px-3 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Explore SM Track</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. QUIZ PROGRESS & RECENT ACHIEVEMENTS (SIDE-BY-SIDE)                */}
      {/* ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QUIZ PROGRESS CARD WITH CHAPTER TRACKER */}
        <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 p-6 flex flex-col justify-between shadow-[var(--card-shadow)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] dark:border-slate-800">
              <div className="flex items-center gap-2 text-[var(--text)] dark:text-slate-100 font-black text-sm">
                <BookOpen className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
                <span>CTRL Track Affinity Quiz</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-semibold">
                Attempt {currentAttemptNumber} of {QUIZ_META_CONSTANTS.maxAttempts}
              </span>
            </div>

            {/* Nested box uses --surface-2 layer */}
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] dark:bg-slate-900/40 border border-[var(--border)] dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface)] dark:bg-[#0f172a] border border-[var(--border)] dark:border-slate-800 flex items-center justify-center text-[var(--text)] dark:text-slate-300 font-black text-base shadow-xs shrink-0">
                  <FileQuestion className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-[var(--text)] dark:text-slate-100 text-sm truncate">
                      {isQuizCompleted
                        ? 'Assessment Completed'
                        : answeredCount === 0
                        ? '5-Chapter Affinity Assessment'
                        : `Chapter ${currentChapterNumber} of ${QUIZ_META_CONSTANTS.totalChapters}`}
                    </h4>
                    <span className="text-xs font-bold text-[var(--text)] dark:text-slate-300 shrink-0">
                      {isQuizCompleted ? '100%' : `${quizPercent}%`}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium">
                    {isQuizCompleted
                      ? `All ${QUIZ_META_CONSTANTS.totalQuestions} questions completed across ${QUIZ_META_CONSTANTS.totalChapters} chapters`
                      : `${answeredCount} of ${QUIZ_META_CONSTANTS.totalQuestions} questions answered • ${QUIZ_META_CONSTANTS.estimatedTimeText}`}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-[var(--surface)] dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-[var(--border-subtle)] dark:border-transparent">
                    <div
                      className="bg-[var(--accent-nt)] dark:bg-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${isQuizCompleted ? 100 : quizPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Compact Chapter Tracker (Row of 5 Numbered Chapter Dots) */}
              <div className="pt-2 border-t border-[var(--border-subtle)] dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] dark:text-slate-400 mb-1.5 font-medium">
                  <span>Chapters Progression</span>
                  <span className="text-[var(--text)] dark:text-slate-300 font-semibold">
                    {isQuizCompleted ? 'All 5 Chapters Complete' : `Chapter ${currentChapterNumber} of ${QUIZ_META_CONSTANTS.totalChapters}`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 select-none">
                  {chaptersProgress.map((ch) => {
                    const isCurrent = !isQuizCompleted && ch.level === currentChapterNumber;
                    return (
                      <div
                        key={ch.level}
                        title={`Chapter ${ch.level}: ${ch.answered}/${ch.total} answered`}
                        className={`flex-1 min-w-[50px] p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          ch.isCompleted
                            ? 'bg-[var(--accent-nt-tint)] dark:bg-blue-950/55 border-[var(--accent-nt-border)] dark:border-blue-800/70 text-[var(--accent-nt-text)] dark:text-blue-200'
                            : isCurrent
                            ? 'bg-[var(--surface)] dark:bg-[#0f172a] border-[var(--accent-nt)] dark:border-sky-400/75 ring-2 ring-[var(--accent-nt)]/25 dark:ring-sky-400/25 text-[var(--text)] dark:text-slate-100 shadow-[0_0_10px_rgba(59,91,219,0.15)]'
                            : 'bg-[var(--surface)]/60 dark:bg-slate-900/40 border-[var(--border-subtle)] dark:border-slate-800 text-[var(--text-subtle)] dark:text-slate-500'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                            ch.isCompleted
                              ? 'bg-[var(--accent-nt)] dark:bg-sky-500 text-white dark:text-slate-950'
                              : isCurrent
                              ? 'bg-[var(--accent-nt-tint)] dark:bg-blue-900/80 text-[var(--accent-nt-text)] dark:text-sky-200'
                              : 'bg-[var(--surface-2)] dark:bg-slate-800 text-[var(--text-subtle)] dark:text-slate-400'
                          }`}
                        >
                          {ch.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : ch.level}
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap">
                          Ch {ch.level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row & Footer Info */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium">
              {isQuizCompleted
                ? studentState.quizAttempts[0]?.date
                  ? `Completed on ${new Date(studentState.quizAttempts[0].date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
                  : 'Completed recently'
                : answeredCount > 0
                ? 'Saved automatically'
                : 'Free to take anytime'}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {isQuizCompleted ? (
                <>
                  <Link to="/results">
                    <button
                      type="button"
                      className="min-h-11 md:min-h-0 border border-[var(--border)] dark:border-slate-700 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-200 font-bold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>View Smart Results</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </Link>

                  <Link to="/quiz">
                    <button
                      type="button"
                      className="min-h-11 md:min-h-0 border border-[var(--border)] dark:border-slate-700 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-300 font-bold text-sm px-3.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Review Answers</span>
                    </button>
                  </Link>

                  {studentState.quizAttempts.length < QUIZ_META_CONSTANTS.maxAttempts && (
                    <Link to="/quiz?retake=true">
                      <button
                        type="button"
                        className="min-h-11 md:min-h-0 border border-[var(--border)] dark:border-slate-700 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text-muted)] dark:text-slate-400 font-bold text-sm px-3 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Retake Quiz"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                    </Link>
                  )}
                </>
              ) : (
                <Link to={`/quiz${answeredCount > 0 ? `?level=${currentChapterNumber}` : ''}`}>
                  <button
                    type="button"
                    className="min-h-11 md:min-h-0 border border-[var(--border)] dark:border-slate-700 hover:bg-[var(--surface-2)] dark:hover:bg-slate-800 text-[var(--text)] dark:text-slate-200 font-bold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>
                      {answeredCount === 0
                        ? 'Start Assessment'
                        : `Resume Chapter ${currentChapterNumber}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* RECENT GEMSTONES (Canonical shared GEMSTONE_ASSETS matching Vault) */}
        <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 p-6 flex flex-col justify-between shadow-[var(--card-shadow)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] dark:border-slate-800">
              <div className="flex items-center gap-2 text-[var(--text)] dark:text-slate-100 font-black text-sm">
                <Trophy className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
                <span>Recent Gemstones</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-semibold">
                Milestones & Discoveries
              </span>
            </div>

            {/* 4 Preview Gems matching Achievement Vault style */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              data-reduced-motion={studentState.preferences.reducedMotion}
            >
              {displayGems.map((item) => {
                const category = item.gem.category;
                const isSpecialCategory = category === 'Special';
                const isEpic = item.gem.rarity === 'Epic';
                const isLegendary = item.gem.rarity === 'Legendary';
                const unlockedCardClass =
                  category === 'Special'
                    ? 'bg-linear-to-b from-yellow-50/90 via-amber-50/40 to-[var(--surface)] dark:from-yellow-950/45 dark:via-amber-950/20 dark:to-[#0f172a] border-yellow-300 dark:border-yellow-500/75 shadow-2xs'
                    : category === 'NT'
                    ? 'bg-linear-to-b from-blue-50/80 to-[var(--surface)] dark:from-blue-950/40 dark:to-[#0f172a] border-[var(--accent-nt-border)] dark:border-blue-800/80 shadow-2xs'
                    : category === 'SM'
                    ? 'bg-linear-to-b from-emerald-50/80 to-[var(--surface)] dark:from-emerald-950/40 dark:to-[#0f172a] border-[var(--accent-sm-border)] dark:border-emerald-800/80 shadow-2xs'
                    : 'bg-linear-to-b from-violet-50/80 to-[var(--surface)] dark:from-violet-950/40 dark:to-[#0f172a] border-[var(--accent-ba-border)] dark:border-violet-800/80 shadow-2xs';
                const lockedCardClass = isSpecialCategory
                  ? 'bg-[var(--gem-locked-bg)] dark:bg-slate-900/50 border-[var(--gem-locked-border)] dark:border-yellow-800/50 border-t-2 border-t-yellow-400/80 dark:border-t-yellow-500/75'
                  : category === 'NT'
                  ? 'bg-[var(--gem-locked-bg)] dark:bg-slate-900/50 border-[var(--gem-locked-border)] dark:border-blue-800/50 border-t-2 border-t-blue-400/80 dark:border-t-blue-500/75'
                  : category === 'BA'
                  ? 'bg-[var(--gem-locked-bg)] dark:bg-slate-900/50 border-[var(--gem-locked-border)] dark:border-violet-800/50 border-t-2 border-t-violet-400/80 dark:border-t-violet-500/75'
                  : 'bg-[var(--gem-locked-bg)] dark:bg-slate-900/50 border-[var(--gem-locked-border)] dark:border-emerald-800/50 border-t-2 border-t-emerald-400/80 dark:border-t-emerald-500/75';
                const rarityGlowClass = isLegendary
                  ? 'ring-1 ring-amber-400/45 dark:ring-amber-400/45 shadow-[0_0_20px_-6px_rgba(250,204,21,0.4)]'
                  : isEpic
                  ? 'ring-1 ring-purple-400/35 dark:ring-purple-500/35 shadow-[0_0_18px_-6px_rgba(168,85,247,0.35)]'
                  : '';
                const earnedBadgeClass =
                  category === 'Special'
                    ? 'text-yellow-800 dark:text-yellow-300 bg-yellow-100/90 dark:bg-yellow-950/85 border-yellow-300 dark:border-yellow-600/80'
                    : category === 'NT'
                    ? 'text-[var(--accent-nt-text)] dark:text-blue-300 bg-[var(--accent-nt-tint)] dark:bg-blue-950/80 border-[var(--accent-nt-border)] dark:border-blue-800/80'
                    : category === 'SM'
                    ? 'text-[var(--accent-sm-text)] dark:text-emerald-300 bg-[var(--accent-sm-tint)] dark:bg-emerald-950/80 border-[var(--accent-sm-border)] dark:border-emerald-800/80'
                    : 'text-[var(--accent-ba-text)] dark:text-violet-300 bg-[var(--accent-ba-tint)] dark:bg-violet-950/80 border-[var(--accent-ba-border)] dark:border-violet-800/80';
                const unlockedIdColorClass =
                  category === 'Special'
                    ? 'text-yellow-700 dark:text-yellow-300/85'
                    : category === 'NT'
                    ? 'text-blue-700 dark:text-blue-300/85'
                    : category === 'BA'
                    ? 'text-violet-700 dark:text-violet-300/85'
                    : 'text-emerald-700 dark:text-emerald-300/85';
                const trackLabelColorClass =
                  category === 'Special'
                    ? 'text-yellow-700 dark:text-yellow-300/90'
                    : category === 'NT'
                    ? 'text-blue-700 dark:text-blue-300/90'
                    : category === 'BA'
                    ? 'text-violet-700 dark:text-violet-300/90'
                    : 'text-emerald-700 dark:text-emerald-300/90';

                return (
                <div
                  key={item.gem.achievementId}
                  title={item.isUnlocked ? `${item.gem.name} (Unlocked)` : `To unlock: ${item.gem.requirement}`}
                  className={`relative px-2.5 py-3 rounded-2xl border transition-all flex flex-col items-center justify-between text-center select-none min-w-0 overflow-hidden ${
                    item.isUnlocked ? unlockedCardClass : lockedCardClass
                  } ${rarityGlowClass}`}
                >
                  {(isEpic || isLegendary) && (
                    <RaritySparkles rarity={item.gem.rarity} unlocked={item.isUnlocked} />
                  )}

                  {/* Top status indicator matching Vault card style */}
                  <div className="relative z-10 w-full flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-semibold shrink-0 ${
                      item.isUnlocked
                        ? unlockedIdColorClass
                        : 'text-[var(--text-subtle)] dark:text-slate-500'
                    }`}>
                      #{item.gem.id}
                    </span>
                    {item.isUnlocked ? (
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${earnedBadgeClass}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Earned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--text-muted)] dark:text-slate-400 bg-[var(--surface)] dark:bg-slate-800/90 px-1.5 py-0.5 rounded-md border border-[var(--border)] dark:border-slate-700/80 whitespace-nowrap shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Gemstone Image */}
                  <div className="relative z-10 w-14 h-14 flex items-center justify-center my-1">
                    <img
                      src={item.gem.url}
                      alt={item.gem.name}
                      className={`w-12 h-12 object-contain pixelated drop-shadow-sm ${
                        item.isUnlocked ? 'gem-earned' : 'gem-locked'
                      }`}
                      style={!item.isUnlocked ? { filter: 'grayscale(1)', opacity: 0.55 } : undefined}
                    />
                  </div>

                  {/* Name: NOT truncated, allowed two lines */}
                  <span className="relative z-10 text-xs font-bold text-[var(--text)] dark:text-slate-100 min-h-[2.5rem] flex items-center justify-center text-center break-words leading-tight w-full px-0.5">
                    {item.gem.name}
                  </span>

                  {/* Bottom details: Rarity + Category or Unlock Date */}
                  <div className="relative z-10 w-full mt-2 pt-2 border-t border-[var(--border-subtle)] dark:border-slate-800/80 flex flex-col items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold text-center border whitespace-nowrap ${
                        item.gem.rarity === 'Legendary'
                          ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                          : item.gem.rarity === 'Epic'
                          ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80'
                          : item.gem.rarity === 'Rare'
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                          : item.gem.rarity === 'Special'
                          ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/80'
                          : 'bg-[var(--surface-2)] dark:bg-slate-800/90 text-[var(--text-muted)] dark:text-slate-300 border-[var(--border)] dark:border-slate-700/80'
                      }`}
                    >
                      {(isEpic || isLegendary) && <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />}
                      <span>{item.gem.rarity}</span>
                    </span>

                    <span className={`text-[11px] truncate max-w-full font-medium ${trackLabelColorClass}`}>
                      {item.isUnlocked
                        ? item.unlockedText
                        : item.gem.category === 'Special'
                        ? 'Special Milestone'
                        : `${item.gem.category} Track`}
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Card Footer: The ONE link per card to the Gemstone Vault */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] dark:border-slate-800 flex items-center justify-between text-xs text-[var(--text-muted)] dark:text-slate-400">
            <span className="font-medium">{collection.unlocked} of {GEMSTONE_ASSETS.length} unlocked</span>
            <Link
              to="/achievements"
              className="touch-target-44 text-[var(--text)] dark:text-slate-300 hover:text-[var(--accent-ba-text)] dark:hover:text-white font-bold hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View All in Gemstone Vault</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
