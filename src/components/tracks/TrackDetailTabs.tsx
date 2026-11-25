import React, { useRef } from 'react';
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
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx >= 0 && tabs[nextIdx]) {
      e.preventDefault();
      onTabChange(tabs[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={`${trackCode} track sections`}
      className="flex border-b border-slate-200 dark:border-slate-800 mt-6 gap-2 sm:gap-6 overflow-x-auto"
    >
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-2 min-h-11 md:min-h-0 py-3 px-2 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? trackCode === 'NT'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : trackCode === 'BA'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
