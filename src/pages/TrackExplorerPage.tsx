import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../components/shared/PixelArt';
import { LuniSprite } from '../components/luni/LuniSprite';
import { FEATURE_HEADER_LUNI_SIZE } from '../components/shared/PageHeader';
import { ModuleDetailModal } from '../components/shared/ModuleDetailModal';
import { TrackOverviewCard } from '../components/tracks/TrackOverviewCard';
import { TrackReflectionPanel } from '../components/tracks/TrackReflectionPanel';
import type { TrackReflectionValues } from '../components/tracks/TrackReflectionPanel';
import { TrackDetailTabs } from '../components/tracks/TrackDetailTabs';
import { BACKGROUNDS } from '../assets/manifest';
import { TRACKS_DATA } from '../data/tracks';
import { useStudent } from '../context/StudentContext';
import { TrackCode, TrackModule, TrackSubject } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { NetAcadTrackReader } from '../components/tracks/NetAcadTrackReader';
import { scrollViewportToTop } from '../utils/scrollTop';
import { useBottomBarOffset } from '../hooks/useBottomBarOffset';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  Briefcase,
  ArrowRight,
  GitCompare,
  Sparkles,
  ArrowLeft,
  Clock,
  Cpu,
  MessageSquare,
  Share2,
  Lock,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Layers,
  Banknote,
} from 'lucide-react';

export const TrackExplorerPage: React.FC = () => {
  const {
    state,
    completeModule,
    toggleComparisonSelection,
    clearComparisonSelection,
    saveTrackReflection,
    recordActivity,
  } = useStudent();
  const [params] = useSearchParams();
  const initialTrack = params.get('track');

  // Navigation state: either viewing all 3 pathways (null) or a specific track detail
  const [activeTrackCode, setActiveTrackCode] = useState<TrackCode | null>(
    ['NT', 'BA', 'SM'].includes(initialTrack || '') ? (initialTrack as TrackCode) : null
  );

  // Modals & Celebrations
  const [activeModule, setActiveModule] = useState<TrackModule | null>(null);
  const [detailTab, setDetailTab] = useState('about');
  const [selectedSubject, setSelectedSubject] = useState<TrackSubject | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerModuleId, setReaderModuleId] = useState<string | null>(null);
  const tracks: TrackCode[] = ['NT', 'BA', 'SM'];
  const currentTrack = activeTrackCode ? TRACKS_DATA[activeTrackCode] : null;
  const hasComparisonBar = !activeTrackCode && Boolean(state.comparisonSelection && state.comparisonSelection.length > 0);
  const comparisonBarRef = useBottomBarOffset(hasComparisonBar);

  const handleOpenReader = (subject?: TrackSubject, moduleId?: string) => {
    const targetSubj = subject || currentTrack?.subjects?.[0] || null;
    setSelectedSubject(targetSubj);
    if (moduleId) {
      setReaderModuleId(moduleId);
    } else if (targetSubj?.modules?.[0]) {
      setReaderModuleId(targetSubj.modules[0].id);
    } else if (currentTrack?.modules?.[0]) {
      setReaderModuleId(currentTrack.modules[0].id);
    }
    setIsReaderOpen(true);
  };

  // Open track detail view
  const handleOpenTrack = (code: TrackCode) => {
    recordActivity('view-track-detail');
    setActiveTrackCode(code);
    setDetailTab('about');
  };

  useEffect(() => {
    if (initialTrack && ['NT', 'BA', 'SM'].includes(initialTrack)) {
      setActiveTrackCode(initialTrack as TrackCode);
      setDetailTab('about');
      recordActivity('view-track-detail');
    } else if (!initialTrack) {
      setActiveTrackCode(null);
    }
  }, [initialTrack]);

  const didMountTrackView = useRef(false);
  useEffect(() => {
    if (!didMountTrackView.current) {
      didMountTrackView.current = true;
      return;
    }
    scrollViewportToTop();
  }, [activeTrackCode, detailTab]);

  // Save student reflection
  const handleSaveReflection = (code: TrackCode, values: TrackReflectionValues) => {
    saveTrackReflection(code, values);
  };

  // Handle completing an individual module
  const handleCompleteModule = (moduleId: string) => {
    if (!activeTrackCode) return;
    completeModule(activeTrackCode,moduleId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ====================================================================
          HERO BANNER: Floating Academy Scenery
          ==================================================================== */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 dark:border-indigo-950/80 shadow-sm bg-linear-to-r from-blue-100 via-indigo-50 to-purple-100 dark:from-[#0a1228] dark:via-[#0f172a] dark:to-[#161030]">
        <div className="absolute inset-0 z-0">
          <img
            src={BACKGROUNDS.trackExplorerAcademy}
            alt=""
            className="w-full h-full object-cover object-center pixelated"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[var(--surface-95)] via-[var(--surface-85)] to-[var(--surface)]/50 dark:from-[#0a0f1d]/95 dark:via-[#0d152a]/90 dark:to-[#111a2e]/60 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            {activeTrackCode && (
              <button
                onClick={() => setActiveTrackCode(null)}
                className="inline-flex items-center gap-1.5 min-h-11 md:min-h-0 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-sky-300 dark:hover:text-sky-200 bg-[var(--surface-80)] dark:bg-[#0f172a]/90 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/70 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Pathways</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
              <span>BSIT Academic Pathways</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Academic Tracks
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {activeTrackCode
                ? currentTrack?.tagline
                : 'Three pathways, endless possibilities. Discover what each track offers and find the one that speaks to your interests.'}
            </p>
          </div>

          {/* Luni Greeting & Animated Sprite */}
          <div className="shrink-0 flex items-center md:items-end justify-end gap-3 self-end md:self-auto">
            <div className="bg-[var(--surface-95)] dark:bg-[#0f172a]/95 backdrop-blur-md border border-blue-200 dark:border-blue-800/70 rounded-2xl p-4 shadow-sm max-w-[240px] relative hidden sm:block">
              <div className="text-xs font-black text-blue-700 dark:text-blue-300 mb-0.5">
                {activeTrackCode ? `${activeTrackCode} Pathway Guide` : 'Hi there, Explorer!'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {activeTrackCode
                  ? currentTrack?.luniQuote
                  : 'Take your time to explore each track before deciding. Every path can lead to an amazing future! ✨'}
              </p>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[var(--surface-95)] dark:border-l-[#0f172a]" />
            </div>

            <div className="relative p-2">
              <LuniSprite
                pose={
                  activeTrackCode === 'NT'
                    ? 'track_wifi'
                    : activeTrackCode === 'BA'
                    ? 'track_charts'
                    : activeTrackCode === 'SM'
                    ? 'track_files'
                    : 'track_read'
                }
                size={FEATURE_HEADER_LUNI_SIZE}
                animate
                glow
                staticCircle
                pixelated={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          VIEW 1: THE THREE PATHWAYS (Landing Overview Cards)
          ==================================================================== */}
      {!activeTrackCode && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                The Three Academic Pathways
              </h2>
              <p className="text-xs text-slate-500">
                Click "Explore Track" to review curriculum subjects, skills, and real-world applications.
              </p>
            </div>

            {/* Quick Link to Path Compare */}
            <Link
              to="/compare"
              className="touch-target-44 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Go to Path Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tracks.map((code) => (
              <TrackOverviewCard
                key={code}
                code={code}
                track={TRACKS_DATA[code]}
                isExplored={state.exploredTracks[code]}
                isCompared={state.comparisonSelection?.includes(code) ?? false}
                progress={state.trackProgress[code]}
                onExplore={() => handleOpenTrack(code)}
                onToggleCompare={() => toggleComparisonSelection(code)}
              />
            ))}
          </div>

          {/* Persistent Comparison Tray Bar */}
          {state.comparisonSelection && state.comparisonSelection.length > 0 && (
            <div
              ref={comparisonBarRef}
              className="fixed bottom-[calc(0.5rem+var(--safe-bottom))] inset-x-3 md:inset-x-auto md:sticky md:bottom-[calc(1.5rem+var(--safe-bottom))] z-[var(--z-sticky)] p-4 rounded-2xl bg-[var(--surface-95)] dark:bg-[#0f172a]/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-800/70 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[#111e3b] text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Selected for Side-by-Side Comparison ({state.comparisonSelection.length} of 3 tracks)
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {state.comparisonSelection.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#131d33] text-slate-800 dark:text-slate-100 text-[11px] font-extrabold"
                      >
                        {c} — {TRACKS_DATA[c].name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearComparisonSelection}
                  className="text-xs text-slate-500"
                >
                  Clear Selection
                </Button>
                <Link to="/compare">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Open Path Compare
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          VIEW 2: INDIVIDUAL TRACK DETAIL VIEW (Reusable for NT, BA, SM)
          ==================================================================== */}
      {activeTrackCode && currentTrack && (
        <div className="space-y-6">
          {/* Track Detail Hero Bar */}
          <Card padding="lg" className="border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {activeTrackCode === 'NT' ? (
                    <NtTrackBadge size={44} className="shrink-0 rounded-xl shadow-xs" />
                  ) : activeTrackCode === 'BA' ? (
                    <BaTrackBadge size={44} className="shrink-0 rounded-xl shadow-xs" />
                  ) : (
                    <SmTrackBadge size={44} className="shrink-0 rounded-xl shadow-xs" />
                  )}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {currentTrack.name}
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {currentTrack.description}
                </p>
              </div>

              {/* Action Buttons & Earned Exploration Badge */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {state.exploredTracks[activeTrackCode] && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Explored & Verified</span>
                  </div>
                )}

                <button
                  onClick={() => toggleComparisonSelection(activeTrackCode)}
                  className={`px-4 py-2.5 min-h-11 md:min-h-0 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    state.comparisonSelection?.includes(activeTrackCode)
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-500/70 text-indigo-700 dark:text-indigo-200 font-extrabold'
                      : 'bg-[var(--surface)] dark:bg-[#131d33] border-[var(--border)] dark:border-slate-700 text-[var(--text)] dark:text-slate-200 hover:bg-[var(--surface-raised)] dark:hover:bg-[#1a2744]'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>
                    {state.comparisonSelection?.includes(activeTrackCode)
                      ? 'Selected for Compare'
                      : 'Add to Compare'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs Navigation within Track Detail (Real-World Applications removed per user request) */}
            <TrackDetailTabs
              trackCode={activeTrackCode}
              activeTab={detailTab}
              onTabChange={setDetailTab}
              tabs={[
                { id: 'about', label: 'About & Curriculum', icon: Compass },
                { id: 'modules', label: `Curriculum Subjects (${currentTrack.subjects?.length || 2})`, icon: BookOpen },
                { id: 'skills', label: 'Core Skills', icon: Cpu },
                { id: 'careers', label: `Potential Careers (${currentTrack.possibleCareers.length})`, icon: Briefcase },
                { id: 'reflect', label: 'My Reflection', icon: MessageSquare },
              ]}
            />

            {/* TAB 1: ABOUT & CURRICULUM */}
            {detailTab === 'about' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Academic Focus & Overview
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentTrack.focus}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Work Style & Study Environment
                  </h4>
                  <div className="space-y-2">
                    {currentTrack.workStyle.map((style, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-sky-400 shrink-0" />
                        <span>{style}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Key Curriculum Subjects
                  </h4>
                  <div className="space-y-2">
                    {currentTrack.keySubjects.map((subj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-[var(--border)] dark:border-slate-800 bg-[var(--surface)] dark:bg-[#111c33] flex items-center gap-3 text-xs sm:text-sm font-semibold text-[var(--text)] dark:text-slate-100"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-[#131d33] text-slate-600 dark:text-sky-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{subj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CURRICULUM SUBJECTS (One box per complete subject course) */}
            {detailTab === 'modules' && (
              <div className="pt-6 space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Curriculum Subjects & Course Syllabus
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Select a subject below to open all its interactive educational modules
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-[#131d33] px-3 py-1 rounded-lg border border-transparent dark:border-slate-700/80">
                      {currentTrack.subjects?.length || 2} Curriculum Courses
                    </span>
                  </div>
                </div>

                {/* SUBJECT CARDS (CompNet 3: ENSA card & IoT card) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentTrack.subjects?.map((subj) => {
                    const availableModules = subj.modules.filter((m) => m.status === 'available');
                    const completedCount = availableModules.filter((m) =>
                      state.moduleCompletions.some(
                        (c) => c.track === activeTrackCode && c.moduleId === m.id
                      )
                    ).length;
                    const progressPercent = Math.round(
                      (completedCount / (availableModules.length || 1)) * 100
                    );

                    return (
                      <Card
                        key={subj.id}
                        hoverable
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${subj.title} (${subj.code}) reader`}
                        onClick={() => handleOpenReader(subj)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenReader(subj);
                          }
                        }}
                        className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 group"
                      >
                        <div>
                          {/* Subject Photo Banner */}
                          {subj.heroImage && (
                            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[var(--surface)] dark:bg-[#0f172a]">
                              <img
                                src={subj.heroImage}
                                alt={subj.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[var(--surface)] via-[var(--surface)]/45 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/50 dark:to-transparent pointer-events-none" />
                              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-sky-950 bg-sky-200/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-sky-300/90 uppercase tracking-wider shadow-sm">
                                  {subj.code}
                                </span>
                                {subj.status === 'in_preparation' ? (
                                  <span className="text-[10px] font-bold text-amber-200 bg-amber-950/85 backdrop-blur-xs px-2.5 py-1 rounded-md border border-amber-500/30">
                                    In Preparation · Mocked Info
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-200 bg-emerald-950/85 backdrop-blur-xs px-2.5 py-1 rounded-md border border-emerald-500/30">
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="p-6 space-y-3">
                            {!subj.heroImage && (
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                  {subj.code}
                                </span>
                                {subj.status === 'in_preparation' ? (
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/70">
                                    In Preparation · Mocked Info
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/70">
                                    Available
                                  </span>
                                )}
                              </div>
                            )}

                            <h5 className="font-black text-xl text-slate-900 dark:text-slate-100 leading-tight">
                              {subj.title}
                            </h5>

                            {subj.subtitle && (
                              <div className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
                                {subj.subtitle}
                              </div>
                            )}

                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              {subj.description}
                            </p>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{subj.moduleCount} Educational Modules</span>
                            </div>

                            {/* Subject Completion Progress */}
                            {completedCount > 0 && (
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-500 dark:text-slate-400">Progress:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6 pt-0">
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xs">
                            <span className="text-blue-600 dark:text-blue-300 font-bold hover:text-blue-700 dark:hover:text-blue-200 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/70 border border-blue-200/80 dark:border-blue-800/70 transition-colors shadow-2xs">
                              <span>Open</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CORE SKILLS */}
            {detailTab === 'skills' && (
              <div className="pt-6 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentTrack.coreSkills.map((group, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>{group.category.replace(/\s*\([^)]*\)/g, '').trim()}</span>
                      </h5>
                      <ul className="space-y-2">
                        {group.skills.map((skill, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: POTENTIAL CAREERS (4 to 6 text-only list items showcasing realistic job roles) */}
            {detailTab === 'careers' && (
              <div className="pt-6 space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold block">
                      Realistic Industry Career Pathways
                    </strong>
                    <span>
                      The career pathways below represent realistic job roles for BSIT graduates based on competencies mastered across this track's curriculum modules. Each role directly draws from the skills and practical concepts embedded in our subjects.
                    </span>
                  </div>
                </div>

                {/* 4 to 6 Text-Only Career List Items */}
                <div className="space-y-4">
                  {currentTrack.possibleCareers.map((career, idx) => {
                    const level = career.level || (idx % 2 === 0 ? 'BEGINNER' : 'INTERMEDIATE');
                    const levelLabel =
                      level === 'BEGINNER'
                        ? 'Entry-Level / Associate'
                        : level === 'INTERMEDIATE'
                        ? 'Associate to Mid-Level'
                        : 'Mid-Level to Senior';

                    const levelBadgeStyle =
                      level === 'BEGINNER'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                        : level === 'INTERMEDIATE'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70'
                        : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70';

                    return (
                      <div
                        key={career.id || idx}
                        className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] dark:border-slate-800 bg-[var(--surface)] dark:bg-[#111c33] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all space-y-4"
                      >
                        {/* Header: Title, Level, and Sample Titles */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#131d33] text-slate-700 dark:text-sky-300 font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                                {career.title}
                              </h5>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Primary Specialization: {currentTrack.name}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                            {career.salaryRange && (
                              <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md border bg-amber-50/90 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/70"
                                title="Estimated Philippine monthly salary range (varies by company, location, and experience)"
                              >
                                <Banknote className="w-3.5 h-3.5 shrink-0 opacity-85" />
                                <span>Est. Salary: {career.salaryRange}</span>
                              </span>
                            )}
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${levelBadgeStyle}`}
                            >
                              {levelLabel}
                            </span>
                          </div>
                        </div>

                        {/* Role Description */}
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {career.description}
                        </p>

                        {/* Workplace Responsibilities */}
                        {career.responsibilities && career.responsibilities.length > 0 && (
                          <div className="pt-1">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/80 dark:border-slate-800 space-y-2">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                                Key Workplace Responsibilities:
                              </span>
                              <ul className="space-y-1.5">
                                {career.responsibilities.map((resp, rIdx) => (
                                  <li
                                    key={rIdx}
                                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                                  >
                                    <span className="text-slate-400 dark:text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Sample Roles Footer */}
                        {career.sampleRoles && career.sampleRoles.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                              Common Job Titles:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {career.sampleRoles.map((role, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="text-[11px] font-semibold bg-slate-100 dark:bg-[#131d33] text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-md border border-transparent dark:border-slate-700/70"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: EXPLORE AND REFLECT */}
            <TrackReflectionPanel
              trackName={currentTrack.name}
              initialValues={{
                interests: state.reflections?.[activeTrackCode]?.interests || '',
                topicsToLearn: state.reflections?.[activeTrackCode]?.topicsToLearn || '',
                questions: state.reflections?.[activeTrackCode]?.questions || '',
              }}
              onSave={(values) => handleSaveReflection(activeTrackCode, values)}
              isActive={detailTab === 'reflect'}
            />
          </Card>
        </div>
      )}

      {/* ====================================================================
          CISCO NETACAD INTERACTIVE READER OVERLAY
          ==================================================================== */}
      {isReaderOpen && currentTrack && (
        <NetAcadTrackReader
          track={currentTrack}
          subject={selectedSubject || currentTrack.subjects?.[0]}
          initialModuleId={readerModuleId}
          onClose={() => setIsReaderOpen(false)}
        />
      )}

      {/* ====================================================================
          MODALS & CELEBRATION OVERLAYS
          ==================================================================== */}
      {/* 2. Educational Module Detail Modal */}
      <ModuleDetailModal
        module={activeModule}
        trackName={currentTrack?.name || ''}
        onClose={() => setActiveModule(null)}
        onCompleteModule={handleCompleteModule}
      />
    </div>
  );
};