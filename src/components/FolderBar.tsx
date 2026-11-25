import React, { useState } from 'react';
import {
  Search,
  RotateCw,
  FolderOpen,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ViewMode } from '../types/drive';

export const DEFAULT_REQUESTED_FOLDER = '1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO';

interface FolderBarProps {
  currentFolderInput: string;
  onFolderSubmit: (urlOrId: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: 'name' | 'date' | 'size';
  onSortByChange: (sort: 'name' | 'date' | 'size') => void;
}

export const FolderBar: React.FC<FolderBarProps> = ({
  currentFolderInput,
  onFolderSubmit,
  isLoading,
  onRefresh,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
}) => {
  const [inputValue, setInputValue] = useState(currentFolderInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onFolderSubmit(inputValue.trim());
    }
  };

  const handleLoadRequested = () => {
    setInputValue(DEFAULT_REQUESTED_FOLDER);
    onFolderSubmit(DEFAULT_REQUESTED_FOLDER);
  };

  return (
    <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 p-4 sm:p-5 shadow-xs mb-6 space-y-4">
      {/* Top row: Folder URL/ID input */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FolderOpen className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste Google Drive folder URL or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-[var(--surface)] transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Read Folder</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLoadRequested}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            title="Load folder: 1xGXjfT67LBWI2fuw2OIJ6fhqYfcSfixO"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Preset Folder</span>
          </button>
        </div>
      </form>

      {/* Bottom row: Filter, Sort, View mode & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Search within folder */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter files by name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Controls: Sort, View, Refresh */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Sort selection */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 text-xs">
            <Filter className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="date">Last Modified</option>
              <option value="size">Size</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 md:gap-0 bg-slate-100 rounded-lg p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--surface)] dark:bg-[#0f172a] text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--surface)] dark:bg-[#0f172a] text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh folder contents"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
