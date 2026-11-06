import React from 'react';
import { TrackModule } from '../../types';
import { Button } from './Button';
import { X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { LuniSprite } from '../luni/LuniSprite';

export interface ModuleDetailModalProps {
  module: TrackModule | null;
  trackName: string;
  onClose: () => void;
  onCompleteModule?: (moduleId: string) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  trackName,
  onClose,
  onCompleteModule,
}) => {
  if (!module) return null;

  const isPrep = module.status === 'in_preparation';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {trackName}
              </span>
              <span className="text-xs text-slate-400 font-medium">· {module.subject}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {module.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close module view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Status Banner */}
          {isPrep ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs sm:text-sm">Curriculum Material in Preparation</div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  To adhere to BatStateU guidelines, official laboratory slides and handouts for this
                  topic are being digitized by the BSIT department and will be linked upon release.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{module.durationMinutes} minutes reading</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Academic Module</span>
              </span>
            </div>
          )}

          {/* Topics Covered */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Topics Covered
            </h4>
            <div className="flex flex-wrap gap-2">
              {module.topicTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Module Educational Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Academic Overview & Lesson Concepts
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{module.overviewSummary}</p>
              <p>{module.description}</p>
            </div>
          </div>

          {/* Luni's Note */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
            <div className="shrink-0">
              <LuniSprite pose="star_eyes" size={44} animate />
            </div>
            <div className="text-xs text-indigo-950">
              <strong className="font-bold">Luni's Study Tip:</strong> Don't just memorize terms—think
              about how this connects to the real-world scenarios on your campus and in daily technology!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {!isPrep && onCompleteModule && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onCompleteModule(module.id);
                onClose();
              }}
              icon={<CheckCircle2 className="w-4 h-4" />}
              iconPosition="right"
            >
              Mark Module Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
