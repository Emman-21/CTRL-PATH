import React from 'react';
import { ChevronRight, Folder, ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '../types/drive';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (index: number) => void;
  onGoBack: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  onNavigate,
  onGoBack,
}) => {
  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 py-2 mb-4 overflow-x-auto text-sm text-slate-600">
      {breadcrumbs.length > 1 && (
        <button
          type="button"
          onClick={onGoBack}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer mr-1"
          title="Go to parent folder"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back</span>
        </button>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={item.id + index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onNavigate(index)}
                disabled={isLast}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isLast
                    ? 'text-slate-900 font-semibold bg-slate-100/90 cursor-default'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 cursor-pointer'
                }`}
              >
                <Folder
                  className={`w-3.5 h-3.5 ${
                    isLast ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                />
                <span className="max-w-[180px] sm:max-w-[260px] truncate">{item.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
