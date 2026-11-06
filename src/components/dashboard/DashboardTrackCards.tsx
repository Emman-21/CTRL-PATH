import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { NtPixelArt, BaPixelArt, SmPixelArt } from '../shared/PixelArt';
import type { TrackCode } from '../../types';

interface DashboardTrackCardsProps {
  trackProgress: Record<TrackCode, number>;
}

export const DashboardTrackCards: React.FC<DashboardTrackCardsProps> = ({ trackProgress }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore Your Tracks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academically aligned specializations for Batangas State University BSIT first-year students
          </p>
        </div>
        <Link
          to="/tracks"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View All Tracks</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          hoverable
          borderAccent="nt"
          onClick={() => navigate('/tracks')}
          className="flex flex-col justify-between p-5 sm:p-6"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  NT
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Networking Technology</h3>
                  <span className="text-[11px] text-blue-600 font-semibold">Infrastructure & Security</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              Build, connect, and secure the digital world. Master routing, switching, and cloud defense.
            </p>
            <div className="flex items-center justify-center py-2 bg-blue-50/40 rounded-xl mb-4">
              <NtPixelArt size="sm" />
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Exploration Progress</span>
              <span className="font-bold text-blue-700">{trackProgress.NT}%</span>
            </div>
            <ProgressBar value={trackProgress.NT} variant="nt" size="sm" />
          </div>
        </Card>

        <Card
          hoverable
          borderAccent="ba"
          onClick={() => navigate('/tracks')}
          className="flex flex-col justify-between p-5 sm:p-6"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  BA
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Business Analytics</h3>
                  <span className="text-[11px] text-violet-600 font-semibold">Data & Intelligence</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              Turn data into insights for real-world impact. Learn statistical modeling, BI, and predictive strategy.
            </p>
            <div className="flex items-center justify-center py-2 bg-purple-50/40 rounded-xl mb-4">
              <BaPixelArt size="sm" />
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Exploration Progress</span>
              <span className="font-bold text-violet-700">{trackProgress.BA}%</span>
            </div>
            <ProgressBar value={trackProgress.BA} variant="ba" size="sm" />
          </div>
        </Card>

        <Card
          hoverable
          borderAccent="sm"
          onClick={() => navigate('/tracks')}
          className="flex flex-col justify-between p-5 sm:p-6"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  SM
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Service Management</h3>
                  <span className="text-[11px] text-emerald-600 font-semibold">Operations, CX & Tech</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              Create better experiences through people, process and tech. Learn ITIL, SLA delivery, and CX improvement.
            </p>
            <div className="flex items-center justify-center py-2 bg-emerald-50/40 rounded-xl mb-4">
              <SmPixelArt size="sm" />
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Exploration Progress</span>
              <span className="font-bold text-emerald-700">{trackProgress.SM}%</span>
            </div>
            <ProgressBar value={trackProgress.SM} variant="sm" size="sm" />
          </div>
        </Card>
      </div>
    </div>
  );
};
