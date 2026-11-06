import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Trophy } from 'lucide-react';
import { BACKGROUNDS } from '../../assets/manifest';
import { Button } from '../shared/Button';
import { ProgressBar } from '../shared/ProgressBar';
import { LuniSprite } from '../luni/LuniSprite';
import type { TrackCode } from '../../types';

export interface DashboardNextActivity {
  title: string;
  description: string;
  route: string;
  trackCode?: TrackCode;
}

interface DashboardHeroProps {
  overallProgress: number;
  modulesExploredCount: number;
  quizzesSubmittedCount: number;
  achievementsCount: number;
  nextActivity: DashboardNextActivity;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  overallProgress,
  modulesExploredCount,
  quizzesSubmittedCount,
  achievementsCount,
  nextActivity,
}) => (
  <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-linear-to-r from-blue-100 via-indigo-50 to-purple-100">
    <div className="absolute inset-0 z-0">
      <img
        src={BACKGROUNDS.dashboardSkyKingdom}
        alt=""
        className="w-full h-full object-cover object-center pixelated"
      />
      <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/85 to-white/40 backdrop-blur-[1px]" />
    </div>

    <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
      <div className="max-w-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-extrabold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
            <span>BatStateU Alangilan BSIT Luminary Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, Luminary!</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-sparkle-spin" />
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Every small step brings you closer to a brighter future. Let's continue your journey!
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-indigo-100/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm sm:text-base">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Your CTRL+PATH Journey</span>
            </div>
            <span className="text-base font-black text-blue-600">{overallProgress}%</span>
          </div>

          <ProgressBar value={overallProgress} variant="primary" size="md" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ★
                </span>
                <span>
                  <strong className="text-slate-900 font-extrabold">{modulesExploredCount}</strong> Modules Explored
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>
                  <strong className="text-slate-900 font-extrabold">{quizzesSubmittedCount}</strong> Quizzes Submitted
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span>
                  <strong className="text-slate-900 font-extrabold">{achievementsCount}</strong> Achievements
                </span>
              </div>
            </div>

            <Link to={nextActivity.route} className="shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continue Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col sm:flex-row items-center lg:items-end justify-center lg:justify-end gap-4 self-center lg:self-auto">
        <div className="bg-white/95 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 shadow-md max-w-[260px] relative text-left">
          <div className="text-xs font-black text-indigo-700 flex items-center gap-1.5 mb-1">
            <span>Hi there, Luminary!</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            You're doing great! Keep exploring and you'll discover amazing possibilities for your future! ✨
          </p>
          <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white/95" />
        </div>

        <div className="relative">
          <LuniSprite pose="wave" size={120} animate glow />
        </div>
      </div>
    </div>
  </div>
);
