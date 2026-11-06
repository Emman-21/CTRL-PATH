import React, { useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { TrackBadge } from '../components/shared/Badge';
import { LuniSprite } from '../components/luni/LuniSprite';
import { ModuleDetailModal } from '../components/shared/ModuleDetailModal';
import { TrackOverviewCard } from '../components/tracks/TrackOverviewCard';
import { TrackReflectionPanel } from '../components/tracks/TrackReflectionPanel';
import type { TrackReflectionValues } from '../components/tracks/TrackReflectionPanel';
import { TrackDetailTabs } from '../components/tracks/TrackDetailTabs';
import { BACKGROUNDS } from '../assets/manifest';
import { TRACKS_DATA } from '../data/tracks';
import { useStudent } from '../context/StudentContext';
import { TrackCode, TrackModule } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
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
  Lightbulb,
  Cpu,
  MessageSquare,
} from 'lucide-react';

export const TrackExplorerPage: React.FC = () => {
  const {
    state,
    markTrackExplored,
    completeModule,
    toggleComparisonSelection,
    clearComparisonSelection,
    saveTrackReflection,
  } = useStudent();
  const [params]=useSearchParams();
  const initialTrack=params.get('track');

  // Navigation state: either viewing all 3 pathways (null) or a specific track detail
  const [activeTrackCode, setActiveTrackCode] = useState<TrackCode | null>(['NT','BA','SM'].includes(initialTrack || '') ? initialTrack as TrackCode : null);

  // Modals & Celebrations
  const [activeModule, setActiveModule] = useState<TrackModule | null>(null);
  const [detailTab, setDetailTab] = useState('about');
  const tracks: TrackCode[] = ['NT', 'BA', 'SM'];
  const currentTrack = activeTrackCode ? TRACKS_DATA[activeTrackCode] : null;

  // Handle Mark as Explored with celebratory achievement unlock
  const handleMarkAsExplored = (code: TrackCode) => { markTrackExplored(code); };

  // Open track detail view
  const handleOpenTrack = (code: TrackCode) => {
    setActiveTrackCode(code);
    setDetailTab('about');
  };

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
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-linear-to-r from-blue-100 via-indigo-50 to-purple-100">
        <div className="absolute inset-0 z-0">
          <img
            src={BACKGROUNDS.trackExplorerAcademy}
            alt=""
            className="w-full h-full object-cover object-center pixelated"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/85 to-white/50 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            {activeTrackCode && (
              <button
                onClick={() => setActiveTrackCode(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white/80 px-3 py-1 rounded-full border border-blue-200 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Pathways</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
              <span>BSIT Academic Pathways</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {activeTrackCode ? currentTrack?.name : 'Explore Your Future Path'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {activeTrackCode
                ? currentTrack?.tagline
                : 'Three pathways, endless possibilities. Discover what each track offers and find the one that speaks to your interests.'}
            </p>
          </div>

          {/* Luni Greeting & Animated Sprite */}
          <div className="shrink-0 flex items-center md:items-end justify-end gap-3 self-end md:self-auto">
            <div className="bg-white/95 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 shadow-sm max-w-[240px] relative hidden sm:block">
              <div className="text-xs font-black text-indigo-700 mb-0.5">
                {activeTrackCode ? `${activeTrackCode} Pathway Guide` : 'Hi there, Explorer!'}
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                {activeTrackCode
                  ? currentTrack?.luniQuote
                  : 'Take your time to explore each track before deciding. Every path can lead to an amazing future! ✨'}
              </p>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white/95" />
            </div>

            <div className="relative">
              <LuniSprite
                pose={activeTrackCode === 'NT' ? 'point' : activeTrackCode === 'BA' ? 'curious' : activeTrackCode === 'SM' ? 'celebrate' : 'wave'}
                size={90}
                animate
                glow
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
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
            <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Selected for Side-by-Side Comparison ({state.comparisonSelection.length} of 3 tracks)
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {state.comparisonSelection.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-extrabold"
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
          {/* Track Detail Hero Bar with "Mark as Explored" Button */}
          <Card padding="lg" className="border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <TrackBadge code={activeTrackCode} size="md" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentTrack.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {currentTrack.description}
                </p>
              </div>

              {/* Action Buttons: Mark as Explored & Compare */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {!state.exploredTracks[activeTrackCode] ? (
                  <Button
                    variant={activeTrackCode.toLowerCase() as any}
                    size="md"
                    onClick={() => handleMarkAsExplored(activeTrackCode)}
                    icon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  >
                    Mark as Explored (+1 Gemstone)
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Explored & Verified</span>
                  </div>
                )}

                <button
                  onClick={() => toggleComparisonSelection(activeTrackCode)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    state.comparisonSelection?.includes(activeTrackCode)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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

            {/* Sub-Tabs Navigation within Track Detail */}
            <TrackDetailTabs
              trackCode={activeTrackCode}
              activeTab={detailTab}
              onTabChange={setDetailTab}
              tabs={[
                { id: 'about', label: 'About & Curriculum', icon: Compass },
                { id: 'modules', label: `Learning Modules (${currentTrack.modules.length})`, icon: BookOpen },
                { id: 'skills', label: 'Core Skills', icon: Cpu },
                { id: 'applications', label: 'Real-World Applications', icon: Lightbulb },
                { id: 'careers', label: 'Potential Careers', icon: Briefcase },
                { id: 'reflect', label: 'My Reflection', icon: MessageSquare },
              ]}
            />

            {/* TAB 1: ABOUT & CURRICULUM */}
            {detailTab === 'about' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    Academic Focus & Overview
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {currentTrack.focus}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    Work Style & Study Environment
                  </h4>
                  <div className="space-y-2">
                    {currentTrack.workStyle.map((style, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{style}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    Key Curriculum Subjects
                  </h4>
                  <div className="space-y-2">
                    {currentTrack.keySubjects.map((subj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-800"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{subj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEARNING MODULES */}
            {detailTab === 'modules' && (
              <div className="pt-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    Available Educational Modules
                  </h4>
                  <span className="text-xs text-slate-500">
                    Click any module to read educational concepts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTrack.modules.map((mod) => (
                    <Card
                      key={mod.id}
                      hoverable
                      onClick={() => setActiveModule(mod)}
                      className="p-4 border-slate-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                            {mod.subject}
                          </span>
                          {mod.status === 'in_preparation' ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              In Preparation
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Available
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-sm text-slate-900 mb-1">{mod.title}</h5>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                          {mod.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {mod.topicTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{mod.durationMinutes} mins</span>
                        </span>
                        <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                          <span>Open Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CORE SKILLS */}
            {detailTab === 'skills' && (
              <div className="pt-6 space-y-4 animate-in fade-in">
                <div className="text-xs text-slate-500 mb-2">
                  Introductory informational skill categories developed through laboratory practice and coursework:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentTrack.coreSkills.map((group, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span>{group.category}</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {group.skills.map((skill, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: REAL-WORLD APPLICATIONS */}
            {detailTab === 'applications' && (
              <div className="pt-6 space-y-4 animate-in fade-in">
                <div className="text-xs text-slate-500 mb-2">
                  Concrete practical scenarios demonstrating how this knowledge is applied in industry:
                </div>

                <div className="space-y-4">
                  {currentTrack.realWorldApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                    >
                      <h5 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>{app.title}</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <strong className="text-slate-800 block mb-1">Scenario Challenge:</strong>
                          <span className="text-slate-600">{app.scenario}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                          <strong className="text-blue-900 block mb-1">Engineering Solution:</strong>
                          <span className="text-slate-600">{app.solution}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                          <strong className="text-emerald-900 block mb-1">Measurable Impact:</strong>
                          <span className="text-slate-600">{app.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: POTENTIAL CAREER PATHS */}
            {detailTab === 'careers' && (
              <div className="pt-6 space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <strong>Career Information Note:</strong> Potential careers depend on additional certifications, experience, personal dedication, and hiring requirements. CTRL+PATH does not guarantee employment.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {currentTrack.possibleCareers.map((career, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-900 mb-1">{career.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {career.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Sample Roles
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {career.sampleRoles.map((role, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: EXPLORE AND REFLECT */}
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