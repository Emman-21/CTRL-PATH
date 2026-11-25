import React from 'react';
import { Sparkles, Save } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import type { TrackCode } from '../../types';

export interface CompareReflectionValues {
  interests: string;
  topicsToLearn: string;
  questions: string;
}

interface CompareReflectionCardProps {
  code: TrackCode;
  values: CompareReflectionValues;
  saved: boolean;
  onChange: (values: CompareReflectionValues) => void;
  onSave: () => void;
}

export const CompareReflectionCard: React.FC<CompareReflectionCardProps> = ({
  code,
  values,
  saved,
  onChange,
  onSave,
}) => (
  <Card className="border border-[var(--border)] dark:border-slate-800! bg-linear-to-b from-[var(--surface)] to-[var(--surface-raised)] dark:from-[#0f172a] dark:to-[#0d1526] p-4 space-y-3">
    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
      <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        <span>My Reflection: {code}</span>
      </div>
      {saved && (
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          Saved! ✨
        </span>
      )}
    </div>

    <div className="space-y-2.5 text-xs">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
          What excites me about {code}:
        </label>
        <textarea
          rows={2}
          value={values.interests}
          onChange={(e) => onChange({ ...values, interests: e.target.value })}
          placeholder="e.g. Connecting routers, discovering trends..."
          className="w-full p-2 text-xs rounded-xl border border-[var(--border)] dark:border-slate-700/80 bg-[var(--surface)] dark:bg-[#0a0f1d] text-[var(--text)] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
          Skills I want to build in {code}:
        </label>
        <textarea
          rows={2}
          value={values.topicsToLearn}
          onChange={(e) => onChange({ ...values, topicsToLearn: e.target.value })}
          placeholder="e.g. Cisco CLI, Python scripting, SLA design..."
          className="w-full p-2 text-xs rounded-xl border border-[var(--border)] dark:border-slate-700/80 bg-[var(--surface)] dark:bg-[#0a0f1d] text-[var(--text)] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
          My questions or uncertainties:
        </label>
        <textarea
          rows={2}
          value={values.questions}
          onChange={(e) => onChange({ ...values, questions: e.target.value })}
          placeholder="e.g. What certifications are expected in 2nd year?"
          className="w-full p-2 text-xs rounded-xl border border-[var(--border)] dark:border-slate-700/80 bg-[var(--surface)] dark:bg-[#0a0f1d] text-[var(--text)] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 resize-none"
        />
      </div>

      <div className="pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="w-full justify-center text-xs dark:bg-[#131d33]! dark:hover:bg-[#1a2744]! dark:border-slate-700! dark:hover:border-slate-600! dark:text-slate-100!"
          icon={<Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
        >
          Save {code} Reflection
        </Button>
      </div>
    </div>
  </Card>
);
