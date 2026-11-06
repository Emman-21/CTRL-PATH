import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { TrackBadge } from '../components/shared/Badge';
import { ProgressBar } from '../components/shared/ProgressBar';
import { LuniSprite } from '../components/luni/LuniSprite';
import { BACKGROUNDS } from '../assets/manifest';
import { useStudent } from '../context/StudentContext';
import { TrackCode } from '../types';
import { AttemptComparisonPanel } from '../components/achievements/AttemptComparisonPanel';
import { ResultsScorecards } from '../components/results/ResultsScorecards';
import { ResultsSpotlight } from '../components/results/ResultsSpotlight';
import { ResultsAnswerReview } from '../components/results/ResultsAnswerReview';
import { ResultsAttemptHistory } from '../components/results/ResultsAttemptHistory';
import {
  analyzeQuizAttempt,
  SAMPLE_DEMO_ATTEMPT,
} from '../utils/resultsAnalytics';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Search,
  Compass,
  GitCompare,
  Printer,
  Layers,
} from 'lucide-react';

export const SmartResultsPage: React.FC = () => {
  const { state, toggleComparisonSelection } = useStudent();
  const navigate = useNavigate();
  const [params]=useSearchParams();

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(()=>Math.max(0,state.quizAttempts.findIndex(a=>a.id===params.get('attempt'))));

  // Print state
  const [, setIsPrinting] = useState<boolean>(false);

  const hasRealAttempts = state.quizAttempts.length > 0;
  const activeAttempt = useMemo(() => {
    if (previewMode || !hasRealAttempts) {
      return SAMPLE_DEMO_ATTEMPT;
    }
    return state.quizAttempts[selectedAttemptIndex] || state.quizAttempts[0];
  }, [hasRealAttempts, previewMode, state.quizAttempts, selectedAttemptIndex]);

  // Analyze the active attempt
  const analysis = useMemo(() => {
    return analyzeQuizAttempt(activeAttempt);
  }, [activeAttempt]);

  // Handle navigate to comparison with preselected top 2 tracks
  const handleProceedToCompare = () => {
    // If tie, choose the tied tracks, otherwise highest + second highest
    let tracksToCompare: TrackCode[] = [];
    if (analysis.isTie && analysis.tiedTracks && analysis.tiedTracks.length >= 2) {
      tracksToCompare = analysis.tiedTracks.slice(0, 2);
    } else {
      const sorted: TrackCode[] = (['NT', 'BA', 'SM'] as TrackCode[]).sort(
        (a, b) => activeAttempt[`${b.toLowerCase()}Score` as 'ntScore' | 'baScore' | 'smScore'] -
                  activeAttempt[`${a.toLowerCase()}Score` as 'ntScore' | 'baScore' | 'smScore']
      );
      tracksToCompare = sorted.slice(0, 2);
    }

    // Set comparison selection in state if empty
    tracksToCompare.forEach((t) => {
      if (!state.comparisonSelection.includes(t)) {
        toggleComparisonSelection(t);
      }
    });

    navigate('/compare');
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  // If completely empty and not previewing
  if (!hasRealAttempts && !previewMode) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <PageHeader
          title="Smart Results & Guidance"
          subtitle="Discover where your instincts, analytical patterns, and problem-solving talents align across BSIT specializations."
          backgroundImage={BACKGROUNDS.dashboardSkyKingdom}
          luniPose="sit"
          luniTitle="Welcome to Results, Explorer!"
          luniQuote="Complete the 5-level CTRL Quiz adventure to generate your personalized path analytics! 🌟"
        />

        <Card padding="lg" className="text-center py-12 max-w-2xl mx-auto border-blue-200 shadow-sm bg-white">
          <div className="flex justify-center mb-4">
            <LuniSprite pose="curious" size={120} animate glow />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No Assessment Completed Yet</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            You haven't completed a CTRL Quiz attempt yet. Take the 5-level interactive assessment to unlock
            your comprehensive track alignment analysis, level-by-level mastery breakdown, and personalized recommendations!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/quiz">
              <Button variant="primary" size="lg" icon={<Sparkles className="w-5 h-5 text-amber-300" />}>
                Start CTRL Quiz Adventure
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPreviewMode(true)}
              icon={<Search className="w-4 h-4 text-blue-600" />}
            >
              Preview Sample Results Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12 print:space-y-4 print:p-0">
      {/* Sample preview notice banner if active */}
      {previewMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sample Preview Mode:</strong> You are viewing an illustrative assessment report. Take the real quiz
              to generate your personal analytics!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/quiz">
              <span className="font-bold underline text-amber-800 hover:text-amber-900">Take Quiz →</span>
            </Link>
            {hasRealAttempts && (
              <button
                onClick={() => setPreviewMode(false)}
                className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-slate-700 hover:bg-amber-100"
              >
                Exit Preview
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Your Path Insights & Guidance"
        subtitle="Objective diagnostic analytics from your CTRL Quiz. See where your demonstrated technical aptitude and natural curiosities resonate across the three pathways."
        backgroundImage={BACKGROUNDS.dashboardSkyKingdom}
        luniPose="celebrate"
        luniTitle="Great Work, Explorer!"
        luniQuote="These results illuminate where your knowledge currently shines brightest. Remember: you are always in the driver's seat of your future! ✨"
      />

      {/* Top Action & Attempt Selection Bar */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selected Attempt:
          </div>
          {hasRealAttempts ? (
            <div className="flex items-center gap-2">
              {state.quizAttempts.map((att, idx) => (
                <button
                  key={att.id || idx}
                  onClick={() => setSelectedAttemptIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    selectedAttemptIndex === idx
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Attempt {att.attemptNumber} ({att.date})
                </button>
              ))}
            </div>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
              Demonstration Sample
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
          >
            Save / Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleProceedToCompare}
            icon={<GitCompare className="w-3.5 h-3.5" />}
          >
            Compare in Path Compare
          </Button>
        </div>
      </Card>

      <ResultsScorecards analysis={analysis} />

      <ResultsSpotlight analysis={analysis} />

      {/* Two Column Grid: Strengths & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demonstrated Strengths */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Your Key Demonstrated Strengths</span>
            </div>

            <div className="space-y-3">
              {analysis.demonstratedStrengths.map((st, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {st.title}
                    </span>
                    <TrackBadge code={st.track} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Growth Opportunities */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-4">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Recommended Areas for Growth & Exploration</span>
            </div>

            <div className="space-y-3">
              {analysis.growthOpportunities.map((op, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {op.title}
                    </span>
                    <TrackBadge code={op.track} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {op.description}
                  </p>
                  <Link
                    to={op.recommendedRoute}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>Explore Track Modules</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Level-by-Level Assessment Mastery Breakdown */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Five-Level Assessment Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review how your understanding evolved across different question formats and cognitive tiers.
            </p>
          </div>
        </div>

          {analysis.levelPerformances.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed">
            <strong className="block mb-1">Level breakdown unavailable.</strong>
            This attempt was submitted before detailed answer tracking was introduced. Only track-level scores and the spotlight analysis above are available for this attempt.
          </div>
        ) : (
        <div className="space-y-4">
          {analysis.levelPerformances.map((lvl) => (
            <div
              key={lvl.level}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-[240px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                    {lvl.level}
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">{lvl.name}</span>
                </div>
                <div className="text-xs text-slate-500">Format: {lvl.questionType}</div>
              </div>

              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">
                    {lvl.correct} of {lvl.total} correct
                  </span>
                  <span className="font-black text-slate-900">{lvl.percentage}%</span>
                </div>
                <ProgressBar
                  value={lvl.percentage}
                  variant={lvl.percentage >= 70 ? 'nt' : lvl.percentage >= 50 ? 'ba' : 'sm'}
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">Strongest In:</span>
                <TrackBadge code={lvl.leadingTrack} size="sm" />
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>

      <ResultsAnswerReview analysis={analysis} />

      <AttemptComparisonPanel />

      {state.quizAttempts.length > 1 && (
        <ResultsAttemptHistory
          attempts={state.quizAttempts}
          selectedAttemptIndex={selectedAttemptIndex}
          onSelectAttempt={setSelectedAttemptIndex}
        />
      )}

      {/* Action / Next Steps Bar */}
      <Card className="bg-linear-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">Ready for the Next Chapter?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Compare your top tracks side-by-side in Path Compare to inspect curriculum subjects,
              internship capstones, and alumni career paths!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleProceedToCompare}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<GitCompare className="w-4 h-4" />}
            >
              Side-by-Side Comparison
            </Button>

            {state.quizAttempts.length < 3 ? (
              <Link to="/quiz">
                <Button
                  variant="primary"
                  size="md"
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Retake Assessment ({state.quizAttempts.length + 1}/3)
                </Button>
              </Link>
            ) : (
              <Link to="/alumni">
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Read Alumni Stories
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
