import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { LuniSprite } from '../luni/LuniSprite';
import { Card } from '../shared/Card';
import type { DetailedResultsAnalysis } from '../../utils/resultsAnalytics';

interface ResultsSpotlightProps {
  analysis: DetailedResultsAnalysis;
}

export const ResultsSpotlight: React.FC<ResultsSpotlightProps> = ({ analysis }) => (
  <Card
    padding="lg"
    className={`border-2 relative overflow-hidden transition-all ${
      analysis.highestTrack === 'NT'
        ? 'border-blue-300 dark:border-blue-800/70! bg-linear-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-[#0c1a38] dark:via-[#111936] dark:to-[#0f172a]'
        : analysis.highestTrack === 'BA'
        ? 'border-violet-300 dark:border-purple-800/70! bg-linear-to-r from-violet-50/90 via-fuchsia-50/60 to-white dark:from-[#1f123b] dark:via-[#191536] dark:to-[#0f172a]'
        : 'border-emerald-300 dark:border-emerald-800/70! bg-linear-to-r from-emerald-50/90 via-teal-50/60 to-white dark:from-[#09271b] dark:via-[#0d1f26] dark:to-[#0f172a]'
    }`}
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
      <div className="max-w-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
          <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className={
            analysis.highestTrack === 'NT'
              ? 'text-blue-700 dark:text-blue-300'
              : analysis.highestTrack === 'BA'
              ? 'text-violet-700 dark:text-purple-300'
              : 'text-emerald-700 dark:text-emerald-300'
          }>
            {analysis.isTie ? 'Balanced Multi-Track Harmony' : 'Demonstrated Aptitude Spotlight'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {analysis.headlineTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {analysis.spotlightNarrative}
        </p>

        <div className="p-3.5 rounded-xl bg-white/95 dark:bg-[#0b1222]/90! border border-slate-200 dark:border-slate-800/90! text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Academic Independence Notice:</strong> CTRL+PATH is designed to inform, illuminate, and empower your
            academic exploration at Batangas State University. It does not enforce or restrict your track enrollment.
            You are encouraged to explore all three tracks!
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-center">
        <div className="text-center bg-white/95 dark:bg-[#0b1222]/90! backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-indigo-900/60! shadow-sm min-w-[180px]">
          <LuniSprite pose={analysis.isTie ? 'star_eyes' : 'celebrate'} size={110} animate glow />
          <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            "{analysis.personaMatch}"
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Luni's Analytical Persona Match</div>
        </div>
      </div>
    </div>
  </Card>
);
