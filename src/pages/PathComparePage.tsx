import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { CompareToolbar } from '../components/compare/CompareToolbar';
import { CompareTrackCard } from '../components/compare/CompareTrackCard';
import { CompareReflectionCard } from '../components/compare/CompareReflectionCard';
import type { CompareReflectionValues } from '../components/compare/CompareReflectionCard';
import { SavedViewsBar } from '../components/compare/SavedViewsBar';
import { BACKGROUNDS } from '../assets/manifest';
import { TRACKS_DATA } from '../data/tracks';
import { useStudent } from '../context/StudentContext';
import type { TrackCode } from '../types';

export const PathComparePage: React.FC = () => {
  const { state, saveComparison, removeComparison, saveTrackReflection } = useStudent();

  const [params] = useSearchParams();
  const [selectedTracks, setSelectedTracks] = useState<TrackCode[]>(() => {
    const saved = state.savedComparisons.find((comparison) => comparison.id === params.get('saved'));
    if (saved && saved.tracks.length >= 2) return saved.tracks;
    if (state.comparisonSelection && state.comparisonSelection.length >= 2) {
      return state.comparisonSelection;
    }
    return ['NT', 'BA', 'SM'];
  });

  const [activeMobileTab, setActiveMobileTab] = useState<TrackCode>('NT');
  const [reviewedTracks, setReviewedTracks] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reflectionInputs, setReflectionInputs] = useState<Record<TrackCode, CompareReflectionValues>>({
    NT: {
      interests: state.reflections.NT?.interests || '',
      topicsToLearn: state.reflections.NT?.topicsToLearn || '',
      questions: state.reflections.NT?.questions || '',
    },
    BA: {
      interests: state.reflections.BA?.interests || '',
      topicsToLearn: state.reflections.BA?.topicsToLearn || '',
      questions: state.reflections.BA?.questions || '',
    },
    SM: {
      interests: state.reflections.SM?.interests || '',
      topicsToLearn: state.reflections.SM?.topicsToLearn || '',
      questions: state.reflections.SM?.questions || '',
    },
  });
  const [savedReflectionSuccess, setSavedReflectionSuccess] = useState<TrackCode | null>(null);

  useEffect(() => {
    if (!selectedTracks.includes(activeMobileTab)) {
      setActiveMobileTab(selectedTracks[0] || 'NT');
    }
  }, [selectedTracks, activeMobileTab]);

  const toggleTrack = (code: TrackCode) => {
    setReviewedTracks(false);
    if (selectedTracks.includes(code)) {
      if (selectedTracks.length <= 2) {
        return;
      }
      setSelectedTracks(selectedTracks.filter((track) => track !== code));
    } else {
      setSelectedTracks([...selectedTracks, code]);
    }
  };

  const handleSaveComparison = () => {
    const title = selectedTracks.map((track) => TRACKS_DATA[track].name).join(' vs ');

    if (!reviewedTracks) return;
    saveComparison(selectedTracks, title, reviewedTracks);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveReflection = (track: TrackCode) => {
    saveTrackReflection(track, reflectionInputs[track]);
    setSavedReflectionSuccess(track);
    setTimeout(() => setSavedReflectionSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const latestAttempt = state.quizAttempts[0] || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12 print:space-y-4 print:p-0">
      <PageHeader
        title="Compare Your Academic Pathways"
        subtitle="Explore detailed side-by-side matrices of subjects, day-to-day toolchains, career pathways, and project scenarios across the three BSIT specializations."
        backgroundImage={BACKGROUNDS.trackExplorerAcademy}
        luniPose="point"
        luniTitle="Compare with Clarity! ✨"
        luniQuote="Comparing tracks side by side illuminates where your strengths and interests truly align. There is no wrong choice — just the path where you will thrive! 🌙"
      />

      <CompareToolbar
        selectedTracks={selectedTracks}
        reviewedTracks={reviewedTracks}
        isSaved={isSaved}
        onToggleTrack={toggleTrack}
        onReviewChange={setReviewedTracks}
        onPrint={handlePrint}
        onSave={handleSaveComparison}
      />

      {state.savedComparisons.length > 0 && (
        <SavedViewsBar
          comparisons={state.savedComparisons}
          onLoad={(comparison) => {
            setSelectedTracks(comparison.tracks);
            setReviewedTracks(false);
          }}
          onRemove={removeComparison}
        />
      )}

      <div className="block md:hidden">
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          {selectedTracks.map((code) => (
            <button
              key={code}
              onClick={() => setActiveMobileTab(code)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                activeMobileTab === code
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {code} · {TRACKS_DATA[code].name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          selectedTracks.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {selectedTracks.map((code) => {
          const track = TRACKS_DATA[code];
          const isMobileActive = activeMobileTab === code;
          const trackScore = latestAttempt
            ? Math.round(
                latestAttempt[
                  `${code.toLowerCase()}Score` as 'ntScore' | 'baScore' | 'smScore'
                ] || 0
              )
            : null;

          return (
            <div
              key={code}
              className={`flex flex-col space-y-6 ${
                !isMobileActive ? 'hidden md:flex' : 'flex'
              }`}
            >
              <CompareTrackCard code={code} track={track} trackScore={trackScore} />
              <CompareReflectionCard
                code={code}
                values={reflectionInputs[code]}
                saved={savedReflectionSuccess === code}
                onChange={(values) =>
                  setReflectionInputs({
                    ...reflectionInputs,
                    [code]: values,
                  })
                }
                onSave={() => handleSaveReflection(code)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
