import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { Button } from '../shared/Button';

export interface TrackReflectionValues {
  interests: string;
  topicsToLearn: string;
  questions: string;
}

interface TrackReflectionPanelProps {
  trackName: string;
  initialValues: TrackReflectionValues;
  onSave: (values: TrackReflectionValues) => void;
  isActive: boolean;
}

export const TrackReflectionPanel: React.FC<TrackReflectionPanelProps> = ({
  trackName,
  initialValues,
  onSave,
  isActive,
}) => {
  const [interests, setInterests] = useState(initialValues.interests);
  const [topicsToLearn, setTopicsToLearn] = useState(initialValues.topicsToLearn);
  const [questions, setQuestions] = useState(initialValues.questions);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSave({ interests, topicsToLearn, questions });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div
      hidden={!isActive}
      className="pt-6 space-y-5 animate-in fade-in max-w-2xl"
    >
      <div>
        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
          Personal Track Reflection
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Your answers are saved privately on your device to help you compare tracks later.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            1. What interests me most about {trackName}?
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. I enjoy configuring hardware routers and understanding data packet flows..."
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            2. Which specific topics would I like to learn more about?
          </label>
          <textarea
            value={topicsToLearn}
            onChange={(e) => setTopicsToLearn(e.target.value)}
            placeholder="e.g. Subnetting math, cloud defense, or firewall setup..."
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            3. What questions do I still have for professors or senior students?
          </label>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            placeholder="e.g. What certifications are most valued for internships?..."
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Reflection
          </Button>

          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to local storage!</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
