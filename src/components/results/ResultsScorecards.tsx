import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { Card } from '../shared/Card';
import { TrackBadge } from '../shared/Badge';
import { ProgressBar } from '../shared/ProgressBar';
import type { DetailedResultsAnalysis } from '../../utils/resultsAnalytics';

interface ResultsScorecardsProps {
  analysis: DetailedResultsAnalysis;
}

export const ResultsScorecards: React.FC<ResultsScorecardsProps> = ({ analysis }) => {
  const ntGemstone = GEMSTONE_ASSETS.find((gem) => gem.id === 5) || GEMSTONE_ASSETS[0];
  const baGemstone = GEMSTONE_ASSETS.find((gem) => gem.id === 10) || GEMSTONE_ASSETS[5];
  const smGemstone = GEMSTONE_ASSETS.find((gem) => gem.id === 15) || GEMSTONE_ASSETS[10];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card borderAccent="nt" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img src={ntGemstone.url} alt="NT Gemstone" className="w-8 h-8 object-contain pixelated drop-shadow-xs" />
              <div>
                <TrackBadge code="NT" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Blue Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">{analysis.trackBreakdowns.NT.percentage}%</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {analysis.trackBreakdowns.NT.raw}/{analysis.trackBreakdowns.NT.total} pts
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1">Networking Technology</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
              {analysis.trackBreakdowns.NT.level}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Demonstrates aptitude in physical & logical network design, IP routing, packet inspection,
            and defense-in-depth infrastructure protocols.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={analysis.trackBreakdowns.NT.percentage} variant="nt" size="md" />
          <Link
            to="/tracks"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between pt-2 border-t border-slate-100"
          >
            <span>Explore NT Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      <Card borderAccent="ba" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img src={baGemstone.url} alt="BA Gemstone" className="w-8 h-8 object-contain pixelated drop-shadow-xs" />
              <div>
                <TrackBadge code="BA" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Violet Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-violet-600">{analysis.trackBreakdowns.BA.percentage}%</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {analysis.trackBreakdowns.BA.raw}/{analysis.trackBreakdowns.BA.total} pts
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1">Business Analytics</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200">
              {analysis.trackBreakdowns.BA.level}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Demonstrates aptitude in data warehousing, relational SQL queries, trend modeling,
            and translating quantitative patterns into business insights.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={analysis.trackBreakdowns.BA.percentage} variant="ba" size="md" />
          <Link
            to="/tracks"
            className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center justify-between pt-2 border-t border-slate-100"
          >
            <span>Explore BA Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      <Card borderAccent="sm" className="flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img src={smGemstone.url} alt="SM Gemstone" className="w-8 h-8 object-contain pixelated drop-shadow-xs" />
              <div>
                <TrackBadge code="SM" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Green Pathway</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">{analysis.trackBreakdowns.SM.percentage}%</span>
              <div className="text-[10px] text-slate-400 font-medium">
                {analysis.trackBreakdowns.SM.raw}/{analysis.trackBreakdowns.SM.total} pts
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1">Service Management</h3>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              {analysis.trackBreakdowns.SM.level}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Demonstrates aptitude in ITIL service lifecycles, incident escalation workflows, SLA agreements,
            and stakeholder empathy in enterprise service delivery.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <ProgressBar value={analysis.trackBreakdowns.SM.percentage} variant="sm" size="md" />
          <Link
            to="/tracks"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-slate-100"
          >
            <span>Explore SM Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>
    </div>
  );
};
