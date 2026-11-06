import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { TrackCode } from '../../types';

interface TrackDetailTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TrackDetailTabsProps {
  trackCode: TrackCode;
  tabs: TrackDetailTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const TrackDetailTabs: React.FC<TrackDetailTabsProps> = ({
  trackCode,
  tabs,
  activeTab,
  onTabChange,
}) => (
  <div className="flex border-b border-slate-200 mt-6 gap-2 sm:gap-6 overflow-x-auto">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${
            isActive
              ? trackCode === 'NT'
                ? 'border-blue-600 text-blue-600'
                : trackCode === 'BA'
                ? 'border-purple-600 text-purple-600'
                : 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
);
