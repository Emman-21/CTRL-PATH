import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { TrackBadge } from '../components/shared/Badge';
import { LuniSprite } from '../components/luni/LuniSprite';
import { BACKGROUNDS } from '../assets/manifest';
import { useStudent } from '../context/StudentContext';
import { TrackCode } from '../types';
import { ResultsScorecards } from '../components/results/ResultsScorecards';
import { ResultsSpotlight } from '../components/results/ResultsSpotlight';
import { ResultsAnswerReview } from '../components/results/ResultsAnswerReview';
import { ResultsShiftView } from '../components/results/ResultsShiftView';
import { InsightCardSvg } from '../components/results/InsightCardSvg';
import { FiveLevelBreakdown } from '../components/results/FiveLevelBreakdown';
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
} from 'lucide-react';

export const SmartResultsPage: React.FC = () => {
  const { state, toggleComparisonSelection } = useStudent();
  const navigate = useNavigate();
  const [params]=useSearchParams();

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(()=>Math.max(0,state.quizAttempts.findIndex(a=>a.id===params.get('attempt'))));
  const [selectedReviewLevel, setSelectedReviewLevel] = useState<number | 'ALL'>(1);

  const handleReviewLevel = (level: number) => {
    setSelectedReviewLevel(level);
    if (typeof document !== 'undefined') {
      const target = document.getElementById('answer-review-section');
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({
          behavior: state.preferences.reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }
  };

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
      <div className="space-y-8 animate-in fade-in duration-200 pb-6">
        <PageHeader
          title="Smart Results & Guidance"
          subtitle="Discover where your instincts, analytical patterns, and problem-solving talents align across BSIT specializations."
          titleClassName="text-3xl sm:text-4xl font-black"
          subtitleClassName="text-xs sm:text-[13px]"
          backgroundImage={BACKGROUNDS.dashboardSkyKingdom}
          luniPose="sit"
          luniTitle="Welcome to Results, Explorer!"
          luniQuote="Complete the 5-level CTRL Quiz adventure to generate your personalized path analytics! 🌟"
        />

        <ResultsScorecards analysis={null} />

        <Card padding="lg" className="text-center py-12 max-w-2xl mx-auto border-blue-200 dark:border-blue-900/60! shadow-sm bg-white dark:bg-[#0f172a]">
          <div className="flex justify-center mb-4">
            <LuniSprite pose="curious" size={120} animate glow />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">No Assessment Completed Yet</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
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
              icon={<Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            >
              Preview Sample Results Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-6 print:space-y-4 print:p-0">
      {/* Sample preview notice banner if active */}
      {previewMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-[#241c08] border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Sample Preview Mode:</strong> You are viewing an illustrative assessment report. Take the real quiz
              to generate your personal analytics!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/quiz">
              <span className="font-bold underline text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100">Take Quiz →</span>
            </Link>
            {hasRealAttempts && (
              <button
                onClick={() => setPreviewMode(false)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer"
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
        titleClassName="text-3xl sm:text-4xl font-black"
        subtitleClassName="text-xs sm:text-[13px]"
        backgroundImage={BACKGROUNDS.dashboardSkyKingdom}
        luniPose="celebrate"
        luniTitle="Great Work, Explorer!"
        luniQuote="These results illuminate where your knowledge currently shines brightest. Remember: you are always in the driver's seat of your future! ✨"
      />

      {/* Top Action & Attempt Selection Bar */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 dark:bg-[#0f172a]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Selected Attempt:
          </div>
          {hasRealAttempts ? (
            <div className="flex items-center gap-2">
              {state.quizAttempts.map((att, idx) => (
                <button
                  key={att.id || idx}
                  onClick={() => setSelectedAttemptIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                    selectedAttemptIndex === idx
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#131d33] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2744]'
                  }`}
                >
                  Attempt {att.attemptNumber} ({att.date})
                </button>
              ))}
            </div>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-transparent dark:border-blue-800/70 text-xs font-bold">
              Demonstration Sample
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
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
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Your Key Demonstrated Strengths</span>
            </div>

            <div className="space-y-3">
              {analysis.demonstratedStrengths.map((st, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182542] transition-colors flex items-start gap-3"
                >
                  <InsightCardSvg kind="strength" title={st.title} track={st.track} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {st.title}
                      </span>
                      <TrackBadge code={st.track} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Growth Opportunities */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm mb-4">
              <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Recommended Areas for Growth & Exploration</span>
            </div>

            <div className="space-y-3">
              {analysis.growthOpportunities.map((op, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#182542] transition-colors flex items-start gap-3"
                >
                  <InsightCardSvg kind="growth" title={op.title} track={op.track} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {op.title}
                      </span>
                      <TrackBadge code={op.track} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      {op.description}
                    </p>
                    <Link
                      to={op.recommendedRoute}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span>Explore Track Modules</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <FiveLevelBreakdown
        levelPerformances={analysis.levelPerformances}
        onReviewLevel={handleReviewLevel}
      />

      <ResultsAnswerReview
        analysis={analysis}
        selectedLevel={selectedReviewLevel}
        onLevelChange={setSelectedReviewLevel}
      />

      {!previewMode && state.quizAttempts.length > 1 ? (
        <ResultsShiftView
          selectedAttemptId={activeAttempt.id}
          onSelectAttempt={(attemptId) => {
            const idx = state.quizAttempts.findIndex((item) => item.id === attemptId);
            if (idx >= 0) setSelectedAttemptIndex(idx);
          }}
          onOpenPathCompare={handleProceedToCompare}
        />
      ) : (
        /* Action / Next Steps Bar for first-attempt or sample preview */
        <Card className="bg-linear-to-r from-blue-50 via-indigo-50/90 to-violet-50 dark:from-slate-900 dark:via-[#111b36] dark:to-indigo-950 border-indigo-200/80! dark:border-indigo-900/70! text-slate-900 dark:text-white p-6 sm:p-7 rounded-3xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Ready for the Next Chapter?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Compare your top tracks side-by-side in Path Compare to inspect curriculum subjects,
                internship capstones, and alumni career paths!
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleProceedToCompare}
                className="bg-white! hover:bg-blue-50/80! text-slate-800! border-indigo-200! hover:border-blue-300! shadow-2xs whitespace-nowrap dark:bg-white/10! dark:hover:bg-white/20! dark:text-white! dark:border-white/20!"
                icon={<GitCompare className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
              >
                Side-by-Side Comparison
              </Button>

              {state.quizAttempts.length < 3 ? (
                <Link to="/quiz" className="shrink-0">
                  <Button
                    variant="primary"
                    size="md"
                    className="whitespace-nowrap"
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Retake Assessment ({state.quizAttempts.length + 1}/3)
                  </Button>
                </Link>
              ) : (
                <Link to="/alumni" className="shrink-0">
                  <Button
                    variant="primary"
                    size="md"
                    className="whitespace-nowrap"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Read Alumni Stories
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
