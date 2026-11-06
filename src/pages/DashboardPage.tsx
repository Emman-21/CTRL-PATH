import React from 'react';
import { loadQuizSession } from '../utils/quizEngine';
import { QUIZ_QUESTIONS } from '../data/quiz/quizQuestions';
import { studentProgress } from '../utils/studentControls';
import { AnnouncementsPreview } from '../components/community/AnnouncementsPreview';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { DashboardTrackCards } from '../components/dashboard/DashboardTrackCards';
import { DashboardQuizProgress } from '../components/dashboard/DashboardQuizProgress';
import { DashboardRecentAchievements } from '../components/dashboard/DashboardRecentAchievements';
import { DashboardNextStep } from '../components/dashboard/DashboardNextStep';
import { achievementStats } from '../utils/achievementRules';
import { useStudent } from '../context/StudentContext';

export const DashboardPage: React.FC = () => {
  const { state, overallJourneyProgress, modulesExploredCount, nextActivity } = useStudent();
  const journey = studentProgress(state);
  const activeQuiz = loadQuizSession();
  const responseCount = activeQuiz
    ? QUIZ_QUESTIONS.filter(
        (question) =>
          activeQuiz.answers?.[question.id] !== undefined &&
          activeQuiz.answers?.[question.id] !== null &&
          activeQuiz.answers?.[question.id] !== '',
      ).length
    : 0;
  const quizPercent = Math.round((responseCount / QUIZ_QUESTIONS.length) * 100);
  const collection = achievementStats(state);
  const unlockedGems = collection.recent.slice(0, 4).map((entry) => entry.gem);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <DashboardHero
        overallProgress={overallJourneyProgress}
        modulesExploredCount={modulesExploredCount}
        quizzesSubmittedCount={journey.attempts.length}
        achievementsCount={collection.unlocked}
        nextActivity={nextActivity}
      />

      <DashboardTrackCards trackProgress={state.trackProgress} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardQuizProgress
          activeQuiz={activeQuiz}
          responseCount={responseCount}
          totalQuestions={QUIZ_QUESTIONS.length}
          quizPercent={quizPercent}
          attemptsCount={state.quizAttempts.length}
        />
        <DashboardRecentAchievements
          unlockedCount={collection.unlocked}
          percent={collection.percent}
          recentGems={unlockedGems}
        />
      </div>

      <DashboardNextStep nextActivity={nextActivity} />

      <AnnouncementsPreview />
    </div>
  );
};
