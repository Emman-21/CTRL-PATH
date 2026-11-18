import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '../shared/Card';
import { TrackBadge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  NtPixelArt,
  BaPixelArt,
  SmPixelArt,
} from '../shared/PixelArt';
import {
  formatTrackScorecardDisplay,
  type DetailedResultsAnalysis,
} from '../../utils/resultsAnalytics';

interface ResultsScorecardsProps {
  analysis: DetailedResultsAnalysis | null;
}

export const ResultsScorecards: React.FC<ResultsScorecardsProps> = ({ analysis }) => {
  const ntDisplay = formatTrackScorecardDisplay(analysis?.trackBreakdowns.NT);
  const baDisplay = formatTrackScorecardDisplay(analysis?.trackBreakdowns.BA);
  const smDisplay = formatTrackScorecardDisplay(analysis?.trackBreakdowns.SM);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card borderAccent="nt" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <NtTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
              <div>
                <TrackBadge code="NT" />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Blue Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{ntDisplay.percentageText}</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {ntDisplay.rawText}
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base mb-1">Networking Technology</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-[#111e3b] text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800/70">
              {ntDisplay.levelLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Demonstrates aptitude in physical & logical network design, IP routing, packet inspection,
            and defense-in-depth infrastructure protocols.
          </p>
          <div className="flex items-center justify-center py-2 bg-blue-50/40 dark:border dark:border-blue-900/40 rounded-xl mb-3">
            <NtPixelArt size="sm" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={ntDisplay.progressValue} variant="nt" size="md" />
          <Link
            to="/tracks?track=NT"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Explore NT Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      <Card borderAccent="ba" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BaTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
              <div>
                <TrackBadge code="BA" />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Violet Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-violet-600 dark:text-violet-400">{baDisplay.percentageText}</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {baDisplay.rawText}
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base mb-1">Business Analytics</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 dark:bg-[#1e1338] text-violet-700 dark:text-[#c4b5fd] text-[11px] font-bold border border-violet-200 dark:border-purple-800/70">
              {baDisplay.levelLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Demonstrates aptitude in data warehousing, relational SQL queries, trend modeling,
            and translating quantitative patterns into business insights.
          </p>
          <div className="flex items-center justify-center py-2 bg-purple-50/40 dark:border dark:border-purple-900/40 rounded-xl mb-3">
            <BaPixelArt size="sm" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={baDisplay.progressValue} variant="ba" size="md" />
          <Link
            to="/tracks?track=BA"
            className="text-xs font-bold text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Explore BA Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      <Card borderAccent="sm" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <SmTrackBadge size={40} className="shrink-0 rounded-xl shadow-xs" />
              <div>
                <TrackBadge code="SM" />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Green Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{smDisplay.percentageText}</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {smDisplay.rawText}
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base mb-1">Service Management</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#0c2419] text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/70">
              {smDisplay.levelLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Demonstrates aptitude in ITIL service lifecycles, incident escalation workflows, SLA agreements,
            and stakeholder empathy in enterprise service delivery.
          </p>
          <div className="flex items-center justify-center py-2 bg-emerald-50/40 dark:border dark:border-emerald-900/40 rounded-xl mb-3">
            <SmPixelArt size="sm" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={smDisplay.progressValue} variant="sm" size="md" />
          <Link
            to="/tracks?track=SM"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Explore SM Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>
    </div>
  );
};
