import React from 'react';
import { LuniDialogueItem } from '../../types/luni';
import { Sparkles, X, Compass, BookOpen, GitCompare, Trophy, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface LuniDialogueBubbleProps {
  dialogue: LuniDialogueItem;
  onDismiss: () => void;
  onOpenPanel: () => void;
}

export const LuniDialogueBubble: React.FC<LuniDialogueBubbleProps> = ({
  dialogue,
  onDismiss,
  onOpenPanel,
}) => {
  const navigate = useNavigate();

  const renderIcon = (iconName?: string, variant?: string) => {
    const isPrimary = variant === 'primary';
    switch (iconName) {
      case 'compass':
        return <Compass className={`w-3.5 h-3.5 ${isPrimary ? 'text-blue-100' : 'text-blue-500 dark:text-blue-300'}`} />;
      case 'quiz':
      case 'book':
        return <BookOpen className={`w-3.5 h-3.5 ${isPrimary ? 'text-blue-100' : 'text-purple-500 dark:text-purple-300'}`} />;
      case 'compare':
        return <GitCompare className={`w-3.5 h-3.5 ${isPrimary ? 'text-blue-100' : 'text-emerald-500 dark:text-emerald-300'}`} />;
      case 'gem':
        return <Trophy className={`w-3.5 h-3.5 ${isPrimary ? 'text-amber-200' : 'text-amber-500 dark:text-amber-300'}`} />;
      default:
        return <ArrowRight className={`w-3.5 h-3.5 ${isPrimary ? 'text-blue-100' : 'text-slate-400 dark:text-slate-300'}`} />;
    }
  };

  const getActionColor = (variant?: string) => {
    switch (variant) {
      case 'nt':
        return 'bg-blue-50/80 hover:bg-blue-100 text-blue-700 border-blue-200/80 dark:bg-blue-950/75! dark:hover:bg-blue-900/85! dark:text-blue-200! dark:border-blue-800/70!';
      case 'ba':
        return 'bg-purple-50/80 hover:bg-purple-100 text-purple-700 border-purple-200/80 dark:bg-purple-950/75! dark:hover:bg-purple-900/85! dark:text-purple-200! dark:border-purple-800/70!';
      case 'sm':
        return 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/75! dark:hover:bg-emerald-900/85! dark:text-emerald-200! dark:border-emerald-800/70!';
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 border-transparent shadow-xs dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 dark:text-white';
      default:
        return 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#131d33]! dark:hover:bg-[#1a2744]! dark:text-slate-100! dark:border-slate-700/80!';
    }
  };

  return (
    <div
      role="region"
      aria-label="Luni Guidance"
      className="relative w-[calc(100vw-24px-var(--safe-left)-var(--safe-right))] max-w-84 md:w-84 bg-[var(--surface-95)] dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl rounded-br-sm shadow-xl shadow-indigo-950/10 border border-[var(--border)] dark:border-[#1e293b] p-3.5 sm:p-4 transition-all animate-in slide-in-from-bottom-2 duration-200 select-none"
    >
      {/* Speech Bubble Little Tail pointer to Luni */}
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--surface)] dark:bg-[#0f172a] border-r border-b border-[var(--border)] dark:border-[#1e293b] transform rotate-45" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-xs text-[var(--text)] dark:text-indigo-200 tracking-tight flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {dialogue.title}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-1.5">
          <button
            onClick={onOpenPanel}
            className="inline-flex min-h-11 md:min-h-0 items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-3 md:px-2 md:py-0.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Open Full Luni Guide"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>
          <button
            onClick={onDismiss}
            className="w-11 h-11 md:w-auto md:h-auto flex items-center justify-center text-slate-400 hover:text-slate-600 md:p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close speech bubble"
          >
            <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

      {/* Speech Message */}
      <p className="relative z-10 text-xs text-[var(--text)] dark:text-slate-200 leading-relaxed font-medium">
        {dialogue.message}
      </p>

      {/* Quick Action Navigation Pills */}
      {dialogue.quickActions && dialogue.quickActions.length > 0 && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-indigo-50/80 dark:border-slate-800/90 flex flex-wrap gap-2 md:gap-1.5">
          {dialogue.quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(action.route);
                onDismiss();
              }}
              className={`min-h-11 md:min-h-0 px-3 md:px-2.5 py-2 md:py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${getActionColor(
                action.variant
              )}`}
            >
              {renderIcon(action.iconName, action.variant)}
              <span className="text-inherit">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
