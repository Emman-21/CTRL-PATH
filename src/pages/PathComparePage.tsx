import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { CompareToolbar } from '../components/compare/CompareToolbar';
import { CompareMatrixBox } from '../components/compare/CompareMatrixBox';
import type { CompareReflectionValues } from '../components/compare/CompareReflectionCard';
import { SavedViewsBar } from '../components/compare/SavedViewsBar';
import { BACKGROUNDS } from '../assets/manifest';
import {
  DEFAULT_COMPARE_TOPIC,
  isCompareTopicId,
  type CompareTopicId,
} from '../data/compareTopics';
import { useStudent } from '../context/StudentContext';
import type { TrackCode } from '../types';

export const PathComparePage: React.FC = () => {
  const { state, removeComparison, saveTrackReflection } = useStudent();

  const [params] = useSearchParams();
  const initialSaved = state.savedComparisons.find((c) => c.id === params.get('saved'));

  const [selectedTracks, setSelectedTracks] = useState<TrackCode[]>(() => {
    if (initialSaved && initialSaved.tracks.length >= 2) return initialSaved.tracks;
    if (state.comparisonSelection && state.comparisonSelection.length >= 2) {
      return state.comparisonSelection;
    }
    return ['NT', 'BA', 'SM'];
  });

  const [selectedTopic, setSelectedTopic] = useState<CompareTopicId>(() =>
    initialSaved && isCompareTopicId(initialSaved.selectedTopic)
      ? initialSaved.selectedTopic
      : DEFAULT_COMPARE_TOPIC,
  );
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

  const toggleTrack = (code: TrackCode) => {
    if (selectedTracks.includes(code)) {
      if (selectedTracks.length <= 2) {
        return; // Enforce minimum of 2 tracks for comparison
      }
      setSelectedTracks(selectedTracks.filter((t) => t !== code));
    } else {
      setSelectedTracks([...selectedTracks, code]);
    }
  };

  const handleSaveReflection = (track: TrackCode) => {
    saveTrackReflection(track, reflectionInputs[track]);
    setSavedReflectionSuccess(track);
    setTimeout(() => setSavedReflectionSuccess(null), 3000);
  };

  const latestAttempt = state.quizAttempts[0];
  const getTrackScore = (code: TrackCode): number | null => {
    if (!latestAttempt) return null;
    if (code === 'NT') return latestAttempt.ntScore;
    if (code === 'BA') return latestAttempt.baScore;
    return latestAttempt.smScore;
  };

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
        onToggleTrack={toggleTrack}
      />

      {state.savedComparisons.length > 0 && (
        <SavedViewsBar
          comparisons={state.savedComparisons}
          onLoad={(comparison) => {
            setSelectedTracks(comparison.tracks);
            if (isCompareTopicId(comparison.selectedTopic)) {
              setSelectedTopic(comparison.selectedTopic);
            }
          }}
          onRemove={removeComparison}
        />
      )}

      <CompareMatrixBox
        selectedTracks={selectedTracks}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        getTrackScore={getTrackScore}
        reflectionInputs={reflectionInputs}
        savedReflectionSuccess={savedReflectionSuccess}
        onChangeReflection={(code, values) =>
          setReflectionInputs({
            ...reflectionInputs,
            [code]: values,
          })
        }
        onSaveReflection={handleSaveReflection}
      />
    </div>
  );
};
