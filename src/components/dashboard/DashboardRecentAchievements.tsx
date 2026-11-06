import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle, Trophy } from 'lucide-react';
import { Card } from '../shared/Card';
import type { GemstoneAsset } from '../../assets/manifest';

interface DashboardRecentAchievementsProps {
  unlockedCount: number;
  percent: number;
  recentGems: GemstoneAsset[];
}

export const DashboardRecentAchievements: React.FC<DashboardRecentAchievementsProps> = ({
  unlockedCount,
  percent,
  recentGems,
}) => (
  <Card className="flex flex-col justify-between p-6">
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
          <Trophy className="w-4 h-4 text-purple-600" />
          <span>Recent Achievements</span>
        </div>
        <Link to="/achievements" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
          <span>View All ({unlockedCount}/20 · {percent}%)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {unlockedCount === 0 && (
        <p className="text-sm text-slate-600 mb-3">
          Your collection is waiting. Explore a pathway to discover your first gemstone.
        </p>
      )}
      <div className="grid grid-cols-5 gap-2.5 text-center">
        {recentGems.map((gem) => (
          <Link
            key={gem.id}
            to="/achievements"
            className="p-2 rounded-xl border border-slate-100 hover:border-indigo-300 bg-slate-50/60 hover:bg-white transition-all flex flex-col items-center group shadow-2xs"
          >
            <img
              src={gem.url}
              alt={gem.name}
              className="w-10 h-10 object-contain pixelated group-hover:scale-110 transition-transform"
              loading="lazy"
            />
            <div className="text-[10px] font-bold text-slate-800 mt-1.5 truncate w-full">
              {gem.name}
            </div>
            <div className="text-[9px] text-slate-400 font-medium truncate w-full">
              {gem.category}
            </div>
          </Link>
        ))}

        <Link
          to="/achievements"
          className="p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-1.5">More</div>
          <div className="text-[9px] text-slate-400">to unlock!</div>
        </Link>
      </div>
    </div>

    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
      <span>Collect all 20 gemstones!</span>
      <Link to="/achievements" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
        <span>Gemstone Vault</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </Card>
);
