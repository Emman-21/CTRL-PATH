import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Layers,
  Sparkles,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { ProgressBar } from '../shared/ProgressBar';
import {
  CompareReflectionCard,
  type CompareReflectionValues,
} from './CompareReflectionCard';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  NtPixelArt,
  BaPixelArt,
  SmPixelArt,
} from '../shared/PixelArt';
import {
  COMPARE_TOPICS,
  getNextCompareTopicIndex,
  type CompareTopicId,
} from '../../data/compareTopics';
import { TRACKS_DATA } from '../../data/tracks';
import type { TrackCode, TrackInfo } from '../../types';

export interface CompareMatrixBoxProps {
  selectedTracks: TrackCode[];
  selectedTopic: CompareTopicId;
  onSelectTopic: (topic: CompareTopicId) => void;
  getTrackScore: (code: TrackCode) => number | null;
  reflectionInputs?: Record<TrackCode, CompareReflectionValues>;
  savedReflectionSuccess?: TrackCode | null;
  onChangeReflection?: (code: TrackCode, values: CompareReflectionValues) => void;
  onSaveReflection?: (code: TrackCode) => void;
}

const EMPTY_REFLECTION: CompareReflectionValues = {
  interests: '',
  topicsToLearn: '',
  questions: '',
};

const TOPIC_ICON: Record<CompareTopicId, React.ComponentType<{ className?: string }>> = {
  subjects: BookOpen,
  skills: Wrench,
  project: Layers,
  careers: Briefcase,
  workStyle: Users,
  bestFit: CheckCircle2,
  reflection: Sparkles,
};

const TRACK_COLUMN_THEME: Record<
  TrackCode,
  {
    columnSurface: string;
    headerSurface: string;
    exploreButton: string;
  }
> = {
  NT: {
    columnSurface:
      'border-t-3! border-t-blue-500! dark:border-t-blue-400! bg-blue-50/30 dark:bg-[#0b162d]/85!',
    headerSurface:
      'bg-blue-50/75 dark:bg-[#0f2042]/90! border-b border-blue-200/70 dark:border-blue-900/50!',
    exploreButton:
      'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus-visible:outline-blue-500',
  },
  BA: {
    columnSurface:
      'border-t-3! border-t-violet-500! dark:border-t-violet-400! bg-violet-50/30 dark:bg-[#150f29]/85!',
    headerSurface:
      'bg-violet-50/75 dark:bg-[#1d143b]/90! border-b border-violet-200/70 dark:border-violet-900/50!',
    exploreButton:
      'text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 focus-visible:outline-violet-500',
  },
  SM: {
    columnSurface:
      'border-t-3! border-t-emerald-500! dark:border-t-emerald-400! bg-emerald-50/30 dark:bg-[#081f18]/85!',
    headerSurface:
      'bg-emerald-50/75 dark:bg-[#0b2b22]/90! border-b border-emerald-200/70 dark:border-emerald-900/50!',
    exploreButton:
      'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 focus-visible:outline-emerald-500',
  },
};

interface TopicContentContext {
  reflectionValues: CompareReflectionValues;
  reflectionSaved: boolean;
  onChangeReflection?: (values: CompareReflectionValues) => void;
  onSaveReflection?: () => void;
}

function renderTopicContent(
  topicId: CompareTopicId,
  track: TrackInfo,
  context: TopicContentContext,
) {
  switch (topicId) {
    case 'subjects':
      return (
        <div className="space-y-3">
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Key Curriculum Subjects</span>
          </h4>
          {track.subjects && track.subjects.length > 0 && (
            <div className="space-y-2">
              {track.subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:border-slate-700/80! space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-slate-900">
                      {subj.code}: {subj.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                      {subj.moduleCount} modules
                    </span>
                  </div>
                  {subj.subtitle && (
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {subj.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Core Topic Areas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {track.keySubjects.map((subj, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/80!"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>
        </div>
      );

    case 'skills': {
      const featuredDomains = track.coreSkills.slice(0, 3);
      const remainingDomains = Math.max(0, track.coreSkills.length - featuredDomains.length);
      return (
        <div className="space-y-3">
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>Technical Skills & Tools</span>
          </h4>
          <div className="space-y-2.5">
            {featuredDomains.map((domain, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:border-slate-700/80! space-y-1.5"
              >
                <div className="text-[11px] font-bold text-slate-800 leading-snug">
                  {domain.category.replace(/\s*\([^)]*\)/g, '').trim()}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {domain.skills.slice(0, 2).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 dark:border-slate-700/80! text-slate-700 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {remainingDomains > 0 && (
            <div className="text-[11px] text-slate-500 font-medium">
              +{remainingDomains} more competency {remainingDomains === 1 ? 'domain' : 'domains'} covered in Track Explorer
            </div>
          )}
        </div>
      );
    }

    case 'project': {
      const primaryApp = track.realWorldApplications[0];
      const extraApps = track.realWorldApplications.slice(1);
      return (
        <div className="space-y-2.5">
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Real-World Hands-on Project</span>
          </h4>
          {primaryApp && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:border-slate-700/80! text-xs space-y-1.5">
              <div className="font-extrabold text-slate-900">
                {primaryApp.title}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {primaryApp.scenario}
              </p>
              <div className="text-[10px] text-slate-500 font-semibold pt-1.5 border-t border-slate-200/60 dark:border-slate-700/80!">
                Impact: {primaryApp.impact}
              </div>
            </div>
          )}
          {extraApps.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70 dark:border-slate-700/80! space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Additional Applied Scenarios
              </div>
              {extraApps.map((app, idx) => (
                <div key={idx} className="text-[11px] leading-snug">
                  <span className="font-bold text-slate-800">{app.title}:</span>{' '}
                  <span className="text-slate-600">{app.impact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'careers': {
      const featuredCareers = track.possibleCareers.slice(0, 3);
      const remainingCareers = Math.max(0, track.possibleCareers.length - featuredCareers.length);
      return (
        <div className="space-y-2.5">
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Career Pathways</span>
          </h4>
          <div className="space-y-2">
            {featuredCareers.map((job, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 dark:border-slate-700/80! text-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900">{job.title}</div>
                  {job.level && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {job.level === 'BEGINNER' ? 'Entry' : job.level === 'INTERMEDIATE' ? 'Mid' : 'Senior'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug">{job.description}</div>
                {job.salaryRange && (
                  <div className="text-[10px] font-semibold text-slate-600 pt-0.5">
                    Est. Salary: {job.salaryRange}
                  </div>
                )}
              </div>
            ))}
          </div>
          {remainingCareers > 0 && (
            <div className="text-[11px] text-slate-500 font-medium">
              +{remainingCareers} more career {remainingCareers === 1 ? 'role' : 'roles'} in Track Explorer
            </div>
          )}
        </div>
      );
    }

    case 'workStyle':
      return (
        <div className="space-y-3">
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Work Environment & Dynamics</span>
          </h4>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 dark:border-slate-700/80! space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Primary Focus
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">{track.focus}</p>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            {track.workStyle.map((style, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span className="leading-snug">{style}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'bestFit':
      return (
        <div>
          <h4 className="hidden print:flex text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Best Fit For Students Who...</span>
          </h4>
          <div className="space-y-2">
            {track.bestFitTraits.map((trait, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{trait}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'reflection':
      return (
        <CompareReflectionCard
          code={track.code}
          values={context.reflectionValues}
          saved={context.reflectionSaved}
          onChange={(values) => context.onChangeReflection?.(values)}
          onSave={() => context.onSaveReflection?.()}
        />
      );
  }
}

export const CompareMatrixBox: React.FC<CompareMatrixBoxProps> = ({
  selectedTracks,
  selectedTopic,
  onSelectTopic,
  getTrackScore,
  reflectionInputs,
  savedReflectionSuccess,
  onChangeReflection,
  onSaveReflection,
}) => {
  const topicButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTopicKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const nextIndex = getNextCompareTopicIndex(
      index,
      event.key,
      COMPARE_TOPICS.length,
    );
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTopic = COMPARE_TOPICS[nextIndex];
    onSelectTopic(nextTopic.id);
    topicButtonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      data-testid="compare-matrix-box"
      className="rounded-2xl border border-slate-200 dark:border-slate-800! bg-white dark:bg-[#0f172a]! md:overflow-hidden shadow-xs print:overflow-visible print:border-slate-300"
    >
      <div className="flex flex-col md:flex-row md:items-stretch print:block">
        {/* Left topic rail (desktop) / Sticky horizontal topic strip (under 768px) */}
        <div
          role="group"
          aria-label="Comparison topics"
          data-testid="compare-topic-rail"
          className="sticky top-16 z-20 md:static flex flex-row overflow-x-auto md:overflow-visible md:flex-col md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800! divide-x md:divide-x-0 md:divide-y divide-slate-200 dark:divide-slate-800! bg-slate-50/95 backdrop-blur-md md:backdrop-blur-none md:bg-slate-50/70 dark:bg-[#0b1222]/95! md:dark:bg-[#0b1222]! rounded-t-2xl md:rounded-t-none print:hidden"
        >
          {COMPARE_TOPICS.map((topic, index) => {
            const isActive = selectedTopic === topic.id;
            const Icon = TOPIC_ICON[topic.id];

            return (
              <button
                key={topic.id}
                ref={(el) => {
                  topicButtonRefs.current[index] = el;
                }}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectTopic(topic.id)}
                onKeyDown={(event) => handleTopicKeyDown(event, index)}
                className={`min-h-[44px] px-4 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-150 cursor-pointer whitespace-nowrap md:whitespace-normal shrink-0 md:shrink flex items-center gap-2.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-sky-400 ${
                  isActive
                    ? 'bg-white dark:bg-[#16223e]! text-slate-900 dark:text-white! shadow-[inset_0_-2px_0_#2563eb] md:shadow-[inset_3px_0_0_#2563eb] dark:shadow-[inset_0_-2px_0_#38bdf8] dark:md:shadow-[inset_3px_0_0_#38bdf8]'
                    : 'bg-transparent text-slate-500 dark:text-slate-400! hover:bg-white/70 dark:hover:bg-[#131d33]! hover:text-slate-900 dark:hover:text-white!'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>

        {/* Equal-width track columns */}
        <div
          data-testid="compare-track-columns"
          className={`flex-1 min-w-0 grid grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 rounded-b-2xl md:rounded-b-none overflow-hidden print:grid print:divide-y-0 print:divide-x ${
            selectedTracks.length === 2
              ? 'md:grid-cols-2 print:grid-cols-2'
              : 'md:grid-cols-3 print:grid-cols-3'
          }`}
        >
          {selectedTracks.map((code) => {
            const track = TRACKS_DATA[code];
            const trackScore = getTrackScore(code);
            const columnTheme = TRACK_COLUMN_THEME[code];

            return (
              <section
                key={code}
                aria-label={`${code} ${track.name}`}
                data-testid={`compare-column-${code}`}
                className={`flex flex-col min-w-0 ${columnTheme.columnSurface}`}
              >
                {/* Existing track header block (icon/logo, name, tagline, corner SVG, illustration, alignment) */}
                <div className={`p-5 flex flex-col gap-3 md:min-h-[380px] ${columnTheme.headerSurface}`}>
                  <div className="flex items-start pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {code === 'NT' ? (
                        <NtTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
                      ) : code === 'BA' ? (
                        <BaTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
                      ) : (
                        <SmTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
                      )}
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight">
                          {track.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{track.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`min-h-[116px] flex-1 flex items-center justify-center rounded-xl overflow-hidden border py-2 ${
                      code === 'NT'
                        ? 'bg-[var(--accent-nt-tint)] dark:bg-linear-to-b dark:from-blue-950/50 dark:to-slate-900 border-[var(--accent-nt-border)] dark:border-blue-900/40'
                        : code === 'BA'
                        ? 'bg-[var(--accent-ba-tint)] dark:bg-linear-to-b dark:from-purple-950/50 dark:to-slate-900 border-[var(--accent-ba-border)] dark:border-purple-900/40'
                        : 'bg-[var(--accent-sm-tint)] dark:bg-linear-to-b dark:from-emerald-950/50 dark:to-slate-900 border-[var(--accent-sm-border)] dark:border-emerald-900/40'
                    }`}
                  >
                    <div className="origin-center">
                      {code === 'NT' ? (
                        <NtPixelArt size="md" />
                      ) : code === 'BA' ? (
                        <BaPixelArt size="md" />
                      ) : (
                        <SmPixelArt size="md" />
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>Your Quiz Alignment:</span>
                      </span>
                      <span className="font-black text-slate-900">
                        {trackScore !== null ? `${trackScore}%` : 'Not Taken'}
                      </span>
                    </div>

                    {trackScore !== null ? (
                      <ProgressBar
                        value={trackScore}
                        variant={code === 'NT' ? 'nt' : code === 'BA' ? 'ba' : 'sm'}
                        size="sm"
                      />
                    ) : (
                      <Link
                        to="/quiz"
                        className="text-[11px] font-bold text-blue-600 hover:underline block pt-1"
                      >
                        Take quiz to measure alignment →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Selected topic content (screen) + all topics expanded when printing + persistent Explore Modules button */}
                <div className="p-5 flex-1 flex flex-col gap-5">
                  <div className="space-y-5">
                    {COMPARE_TOPICS.map((topic) => {
                      const isSelected = topic.id === selectedTopic;
                      const isReflection = topic.id === 'reflection';
                      return (
                        <div
                          key={isSelected ? `${code}-${topic.id}-active` : `${code}-${topic.id}`}
                          className={
                            isSelected
                              ? isReflection
                                ? 'block animate-in fade-in duration-150 print:hidden'
                                : 'block animate-in fade-in duration-150'
                              : isReflection
                              ? 'hidden print:hidden'
                              : 'hidden print:block print:pt-4 print:border-t print:border-slate-200/70'
                          }
                        >
                          {renderTopicContent(topic.id, track, {
                            reflectionValues: reflectionInputs?.[code] ?? EMPTY_REFLECTION,
                            reflectionSaved: savedReflectionSuccess === code,
                            onChangeReflection: onChangeReflection
                              ? (values) => onChangeReflection(code, values)
                              : undefined,
                            onSaveReflection: onSaveReflection
                              ? () => onSaveReflection(code)
                              : undefined,
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200/70 dark:border-slate-800/80 print:hidden">
                    <Link to="/tracks" className="block">
                      <button
                        type="button"
                        className={`w-full py-1 px-0 bg-transparent text-xs font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded-md ${columnTheme.exploreButton}`}
                      >
                        <span>Explore {code} Modules</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
