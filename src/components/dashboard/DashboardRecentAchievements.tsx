import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle, Trophy } from 'lucide-react';
import { Card } from '../shared/Card';
import { GEMSTONE_ASSETS, type GemstoneAsset } from '../../assets/manifest';

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
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-black text-sm">
          <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Recent Achievements</span>
        </div>
        <Link to="/achievements" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
          <span>View All ({unlockedCount}/{GEMSTONE_ASSETS.length} · {percent}%)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {unlockedCount === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Your collection is waiting. Explore a pathway to discover your first gemstone.
        </p>
      )}
      <div className="grid grid-cols-5 gap-2.5 text-center">
        {recentGems.map((gem) => (
          <Link
            key={gem.id}
            to="/achievements"
            className="p-2 rounded-xl border border-[var(--border)] dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/70 bg-[var(--surface-raised)] dark:bg-[#111c33] hover:bg-[var(--surface)] dark:hover:bg-[#16223e] transition-all flex flex-col items-center group shadow-2xs"
          >
            <img
              src={gem.url}
              alt={gem.name}
              className="w-10 h-10 object-contain pixelated group-hover:scale-110 transition-transform"
              loading="lazy"
            />
            <div className="text-[10px] font-bold text-slate-800 dark:text-slate-100 mt-1.5 truncate w-full">
              {gem.name}
            </div>
            <div className="text-[9px] text-slate-400 font-medium truncate w-full">
              {gem.category}
            </div>
          </Link>
        ))}

        <Link
          to="/achievements"
          className="p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-[#0b1222]/85 hover:bg-slate-50 dark:hover:bg-[#131d33] transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#131d33] flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-300 mt-1.5">More</div>
          <div className="text-[9px] text-slate-400">to unlock!</div>
        </Link>
      </div>
    </div>

    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>Collect all {GEMSTONE_ASSETS.length} gemstones!</span>
      <Link to="/achievements" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
        <span>Gemstone Vault</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </Card>
);
