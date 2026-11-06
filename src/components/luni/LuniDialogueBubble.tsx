import React from 'react';
import { LuniDialogueItem } from '../../types/luni';
import { Sparkles, X, Compass, BookOpen, GitCompare, Trophy, ArrowRight } from 'lucide-react';
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

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'compass':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case 'quiz':
      case 'book':
        return <BookOpen className="w-3.5 h-3.5 text-purple-500" />;
      case 'compare':
        return <GitCompare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'gem':
        return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getActionColor = (variant?: string) => {
    switch (variant) {
      case 'nt':
        return 'hover:bg-blue-50 text-blue-700 border-blue-200';
      case 'ba':
        return 'hover:bg-purple-50 text-purple-700 border-purple-200';
      case 'sm':
        return 'hover:bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-xs';
      default:
        return 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      role="region"
      aria-label="Luni Guidance"
      className="w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100/90 p-4 transition-all animate-in slide-in-from-bottom-2 duration-200 select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
          <span className="font-extrabold text-xs text-indigo-900 tracking-tight">
            {dialogue.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenPanel}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline px-1.5 py-0.5"
            aria-label="Open Full Luni Guide"
          >
            Ask Luni
          </button>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close speech bubble"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Speech Message */}
      <p className="text-xs text-slate-600 leading-relaxed">{dialogue.message}</p>

      {/* Quick Action Navigation Pills */}
      {dialogue.quickActions && dialogue.quickActions.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex flex-wrap gap-1.5">
          {dialogue.quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(action.route);
                onDismiss();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${getActionColor(
                action.variant
              )}`}
            >
              {renderIcon(action.iconName)}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
