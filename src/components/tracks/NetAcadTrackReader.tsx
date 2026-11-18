import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Search,
  X,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  ChevronDown,
} from 'lucide-react';
import type { TrackInfo, TrackModuleTopic, TrackSubject } from '../../types';
import { useStudent } from '../../context/StudentContext';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../shared/PixelArt';
import { EmbeddedPdfPresentation } from './EmbeddedPdfPresentation';
import { calculateReaderScrollProgress } from '../../utils/scrollProgress';
import { getModuleNavSummary } from '../../utils/netAcadLayout';

interface NetAcadTrackReaderProps {
  track: TrackInfo;
  subject?: TrackSubject | null;
  initialModuleId?: string | null;
  onClose: () => void;
}

const renderFormattedText = (text: string, isLight: boolean): React.ReactNode => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className={`${isLight ? 'text-slate-900' : 'text-white'} font-bold`}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-[0.9em] border ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-blue-700'
              : 'bg-slate-800/90 border-slate-700/70 text-cyan-300'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
};

export const NetAcadTrackReader: React.FC<NetAcadTrackReaderProps> = ({
  track,
  subject,
  initialModuleId,
  onClose,
}) => {
  const { state, completeModule, updatePreferences } = useStudent();
  const isLight = state.preferences.theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');

  // Active subject passed from Track Explorer subject cards
  const availableSubjects = track.subjects && track.subjects.length > 0 ? track.subjects : [];
  const activeSubject = subject || availableSubjects[0] || null;

  // Active module list derived from the active subject or track
  const activeModules =
    activeSubject && activeSubject.modules && activeSubject.modules.length > 0
      ? activeSubject.modules
      : track.modules;

  // Selected module index
  const initialIndex = activeModules.findIndex((m) => m.id === initialModuleId);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const currentModule = activeModules[selectedModuleIndex] || activeModules[0];

  // Active topic highlighted in the sidebar (driven by scroll spy)
  const [activeTopicId, setActiveTopicId] = useState<string>(
    currentModule?.topics?.[0]?.id || ''
  );

  // High-watermark scroll progress percentage per module (0% to 100%)
  // Maintains reached percentage on back-scroll and increases again when scrolling deeper
  const [moduleMaxProgress, setModuleMaxProgress] = useState<Record<string, number>>({});
  const [pdfSlidesCount, setPdfSlidesCount] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState<boolean>(false);
  const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const hasEmbeddedPdf = Boolean(currentModule?.embeddedPdfUrl);

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const isResettingScrollRef = useRef<boolean>(false);

  // Check if a module is completed
  const isModuleCompleted = (moduleId: string) =>
    state.moduleCompletions.some((m) => m.track === track.code && m.moduleId === moduleId);

  // Select module
  const handleSelectModule = (index: number) => {
    isResettingScrollRef.current = true;
    setPdfSlidesCount(0);
    setPdfLoadError(false);
    setSelectedModuleIndex(index);
    setIsMobileDrawerOpen(false);
    const mod = activeModules[index];
    if (mod) {
      setActiveTopicId(mod.topics?.[0]?.id || '');
    }
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  };

  const handleSlidesReady = (count: number) => {
    isResettingScrollRef.current = true;
    setPdfLoadError(false);
    setPdfSlidesCount(count);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  };

  // Scroll to topic anchor in the continuous main reading pane
  const handleScrollToTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    const topicEl = contentScrollRef.current?.querySelector(`[data-topic-id="${topicId}"]`);
    if (topicEl) {
      topicEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Next / Prev module navigation
  const handleNextModule = () => {
    if (selectedModuleIndex < activeModules.length - 1) {
      handleSelectModule(selectedModuleIndex + 1);
    }
  };

  const handlePrevModule = () => {
    if (selectedModuleIndex > 0) {
      handleSelectModule(selectedModuleIndex - 1);
    }
  };

  // Scroll spy: tracks scroll depth in the continuous content area
  // Maintains reached percentage on back-scroll; increases when scrolling deeper; 100% completes module
  const handleScroll = () => {
    const el = contentScrollRef.current;
    if (!el || !currentModule) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const renderedSlideSlots = hasEmbeddedPdf
      ? el.querySelectorAll('[data-pdf-slide]').length
      : undefined;

    const progress = calculateReaderScrollProgress({
      scrollTop,
      scrollHeight,
      clientHeight,
      hasEmbeddedPdf,
      pdfSlidesCount,
      renderedSlideSlots,
      isResettingScroll: isResettingScrollRef.current,
    });

    if (progress.shouldIgnore || currentModule.status !== 'available') return;

    setModuleMaxProgress((prev) => {
      const existing = prev[currentModule.id] ?? (isModuleCompleted(currentModule.id) ? 100 : 0);
      if (progress.percentage <= existing) return prev;
      return { ...prev, [currentModule.id]: progress.percentage };
    });

    // Bottom reached -> mark module complete
    if (progress.isComplete) {
      setModuleMaxProgress((prev) =>
        prev[currentModule.id] === 100 ? prev : { ...prev, [currentModule.id]: 100 }
      );
      if (!isModuleCompleted(currentModule.id)) {
        completeModule(track.code, currentModule.id);
      }
    }
  };

  // Reset scroll position when switching modules (preserving reached progress in moduleMaxProgress)
  useEffect(() => {
    isResettingScrollRef.current = true;
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
    setPdfSlidesCount(0);
    setPdfLoadError(false);
    if (!currentModule?.embeddedPdfUrl) {
      setIsPresentationFullscreen(false);
    }
    setActiveTopicId(currentModule?.topics?.[0]?.id || '');
  }, [currentModule?.id, currentModule?.embeddedPdfUrl]);

  // Guarantee scroll stays at top before paint when slides mount so browser scroll anchoring cannot jump to 100%
  useLayoutEffect(() => {
    if (contentScrollRef.current && (!hasEmbeddedPdf || pdfSlidesCount > 0)) {
      if (pdfSlidesCount > 0 || contentScrollRef.current.scrollTop !== 0) {
        contentScrollRef.current.scrollTop = 0;
      }
    }
    isResettingScrollRef.current = false;
  }, [currentModule?.id, hasEmbeddedPdf, pdfSlidesCount]);

  // Allow Esc key to exit fullscreen presentation view or close mobile modules drawer
  useEffect(() => {
    if (!isPresentationFullscreen && !isMobileDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
        if (isPresentationFullscreen) setIsPresentationFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPresentationFullscreen, isMobileDrawerOpen]);

  // Intersection Observer to detect which topic is currently in view
  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el) return;

    const topicElements = el.querySelectorAll('[data-topic-id]');
    if (topicElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Sort by position relative to top
          const topTopic = visible.sort(
            (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
          )[0];
          const id = topTopic.target.getAttribute('data-topic-id');
          if (id) {
            setActiveTopicId(id);
          }
        }
      },
      {
        root: el,
        rootMargin: '-60px 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    topicElements.forEach((topEl) => observer.observe(topEl));

    return () => observer.disconnect();
  }, [currentModule?.id, selectedModuleIndex, pdfSlidesCount]);

  // Filter modules based on search query
  const filteredModules = activeModules.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = m.title.toLowerCase().includes(q);
    const matchDesc = m.description.toLowerCase().includes(q);
    const matchTopics = m.topics?.some(
      (t) => t.title.toLowerCase().includes(q) || t.objective.toLowerCase().includes(q)
    );
    return matchTitle || matchDesc || matchTopics;
  });

  const topicsList = currentModule?.topics || [];
  const availableModuleCount = activeModules.filter((m) => m.status === 'available').length;
  const completedCount = activeModules.filter(
    (m) => m.status === 'available' && isModuleCompleted(m.id)
  ).length;
  const overallProgress = Math.round((completedCount / (availableModuleCount || 1)) * 100);
  const moduleNavSummary = getModuleNavSummary(activeModules, selectedModuleIndex);
  const currentModuleProgress =
    !currentModule
      ? 0
      : isModuleCompleted(currentModule.id)
      ? 100
      : (moduleMaxProgress[currentModule.id] ?? 0);

  // Hero image based on track
  const heroImage =
    activeSubject?.heroImage ||
    (track.code === 'NT'
      ? '/assets/aistudio/Gemini_Generated_Image_ff5grlff5grlff5g_c3f13806.jpg'
      : track.code === 'BA'
      ? '/assets/aistudio/Gemini_Generated_Image_svdehgsvdehgsvde_cfa1031e.jpg'
      : '/assets/aistudio/Gemini_Generated_Image_saf5susaf5susaf5_1f235ff0.jpg');

  // Track Color Coding Theme
  const trackTheme = {
    NT: {
      categoryText: isLight ? 'text-blue-600' : 'text-blue-400',
      progressText: isLight ? 'text-blue-600' : 'text-blue-400',
      progressBar: isLight ? 'bg-blue-600' : 'bg-blue-500',
      badgeCompleted: isLight
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      topicActive: isLight
        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-3'
        : 'bg-blue-500/20 text-blue-300 font-bold border-l-2 border-blue-400 pl-3',
      checkIcon: isLight ? 'text-blue-600' : 'text-blue-400',
      heroPill: isLight
        ? 'bg-blue-100/90 text-blue-800 border border-blue-200'
        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      completedBadge: isLight
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      completeBtn: 'bg-blue-600 hover:bg-blue-500 text-white',
      accentText: isLight ? 'text-blue-600' : 'text-blue-400',
      tableRowActive: isLight
        ? 'bg-blue-50 font-bold text-blue-900'
        : 'bg-blue-500/10 font-bold text-blue-200',
      tableDotActive: isLight ? 'bg-blue-600' : 'bg-blue-400',
      floatingChevron: 'bg-blue-600/85 hover:bg-blue-500',
      slideBorder: isLight ? 'border-blue-200' : 'border-blue-900/50',
      activeSubjBtn: 'bg-blue-600 text-white',
    },
    BA: {
      categoryText: isLight ? 'text-purple-600' : 'text-purple-400',
      progressText: isLight ? 'text-purple-600' : 'text-purple-400',
      progressBar: isLight ? 'bg-purple-600' : 'bg-purple-500',
      badgeCompleted: isLight
        ? 'bg-purple-50 text-purple-700 border border-purple-200'
        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      topicActive: isLight
        ? 'bg-purple-50 text-purple-700 font-bold border-l-2 border-purple-600 pl-3'
        : 'bg-purple-500/20 text-purple-300 font-bold border-l-2 border-purple-400 pl-3',
      checkIcon: isLight ? 'text-purple-600' : 'text-purple-400',
      heroPill: isLight
        ? 'bg-purple-100/90 text-purple-800 border border-purple-200'
        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      completedBadge: isLight
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
      completeBtn: 'bg-purple-600 hover:bg-purple-500 text-white',
      accentText: isLight ? 'text-purple-600' : 'text-purple-400',
      tableRowActive: isLight
        ? 'bg-purple-50 font-bold text-purple-900'
        : 'bg-purple-500/10 font-bold text-purple-200',
      tableDotActive: isLight ? 'bg-purple-600' : 'bg-purple-400',
      floatingChevron: 'bg-purple-600/85 hover:bg-purple-500',
      slideBorder: isLight ? 'border-purple-200' : 'border-purple-900/50',
      activeSubjBtn: 'bg-purple-600 text-white',
    },
    SM: {
      categoryText: isLight ? 'text-emerald-600' : 'text-emerald-400',
      progressText: isLight ? 'text-emerald-600' : 'text-emerald-400',
      progressBar: isLight ? 'bg-emerald-600' : 'bg-emerald-500',
      badgeCompleted: isLight
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      topicActive: isLight
        ? 'bg-emerald-50 text-emerald-700 font-bold border-l-2 border-emerald-600 pl-3'
        : 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-3',
      checkIcon: isLight ? 'text-emerald-600' : 'text-emerald-400',
      heroPill: isLight
        ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      completedBadge: isLight
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      completeBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      accentText: isLight ? 'text-emerald-600' : 'text-emerald-400',
      tableRowActive: isLight
        ? 'bg-emerald-50 font-bold text-emerald-900'
        : 'bg-emerald-500/10 font-bold text-emerald-200',
      tableDotActive: isLight ? 'bg-emerald-600' : 'bg-emerald-400',
      floatingChevron: 'bg-emerald-700/85 hover:bg-emerald-600',
      slideBorder: isLight ? 'border-emerald-200' : 'border-emerald-900/50',
      activeSubjBtn: 'bg-emerald-600 text-white',
    },
  }[track.code];

  return (
    <div
      data-reader-theme={isLight ? 'light' : 'dark'}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-200 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'
      }`}
    >
      {/* ==================================================================== */}
      {/* 1. TOP NAVIGATION HEADER (Strictly CTRL+PATH branding)               */}
      {/* ==================================================================== */}
      {!(isPresentationFullscreen && hasEmbeddedPdf) && (
        <header
          className={`h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 border-b transition-colors ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#070b16] border-slate-800/90'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidebar Collapse/Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsDesktopSidebarOpen((prev) => !prev)}
              className={`hidden lg:inline-flex p-1.5 rounded-xl transition-colors cursor-pointer items-center justify-center border shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isDesktopSidebarOpen ? 'Collapse Modules Sidebar' : 'Expand Modules Sidebar'}
              aria-label={isDesktopSidebarOpen ? 'Collapse Modules Sidebar' : 'Expand Modules Sidebar'}
              aria-expanded={isDesktopSidebarOpen}
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>

            <div className="shrink-0 flex items-center justify-center">
              {track.code === 'NT' && <NtTrackBadge size={34} className="rounded-xl shadow-xs" />}
              {track.code === 'BA' && <BaTrackBadge size={34} className="rounded-xl shadow-xs" />}
              {track.code === 'SM' && <SmTrackBadge size={34} className="rounded-xl shadow-xs" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] font-bold ${trackTheme.categoryText} tracking-wider uppercase truncate`}>
                CTRL+PATH
              </span>
              <h1
                className={`text-xs sm:text-sm font-extrabold truncate ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                {activeSubject
                  ? `${activeSubject.code} — ${activeSubject.title}`
                  : `${track.code} Pathway Curriculum`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Module Completion Status Badge */}
            {currentModule && isModuleCompleted(currentModule.id) ? (
              <div
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </div>
            ) : (
              <span
                className={`hidden md:inline text-[11px] font-medium ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Scroll down to finish (100%)
              </span>
            )}

            {/* Reader Theme Toggle (Light / Dark Mode) */}
            <button
              type="button"
              onClick={() => updatePreferences({ theme: isLight ? 'dark' : 'light' })}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title={isLight ? 'Switch Reader to Dark Mode' : 'Switch Reader to Light Mode'}
              aria-label={isLight ? 'Switch Reader to Dark Mode' : 'Switch Reader to Light Mode'}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-indigo-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Full Screen PPT Toggle */}
            {hasEmbeddedPdf && (
              <button
                type="button"
                onClick={() => setIsPresentationFullscreen(true)}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border-slate-700'
                }`}
                title="Expand Presentation to Full Screen"
                aria-label="Expand Presentation to Full Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </button>
            )}

            {/* Close Reader Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-transparent ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700'
              }`}
              title="Close Curriculum Reader"
              aria-label="Back to Explorer"
            >
              <span className="hidden sm:inline">Back to Explorer</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* ==================================================================== */}
      {/* 1B. COMPACT MOBILE MODULE BAR (< lg): Collapsed Modules Drawer Trigger */}
      {/* ==================================================================== */}
      {!(isPresentationFullscreen && hasEmbeddedPdf) && (
        <div
          data-testid="netacad-mobile-bar"
          className={`lg:hidden px-3 py-2 flex items-center justify-between gap-2 shrink-0 border-b z-20 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : 'bg-[#090e1c] border-slate-800/90 text-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            data-testid="netacad-mobile-modules-toggle"
            aria-expanded={isMobileDrawerOpen}
            aria-label={`Toggle modules list (${moduleNavSummary.currentNumber} of ${moduleNavSummary.totalCount}, ${currentModule?.status === 'in_preparation' ? 'Pending' : `${currentModuleProgress}% read`})`}
            className={`relative overflow-hidden flex-1 min-w-0 flex items-center justify-between gap-2 px-3 pt-2 pb-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-2xs'
                : 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800 text-slate-100'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <PanelLeft className={`w-4 h-4 shrink-0 ${trackTheme.accentText}`} />
              <span className="text-xs font-extrabold truncate">{moduleNavSummary.shortLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span
                data-testid="netacad-mobile-scroll-progress"
                className={`text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md ${
                  currentModule?.status === 'in_preparation'
                    ? isLight
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-amber-500/15 text-amber-300'
                    : currentModuleProgress >= 100
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-emerald-500/20 text-emerald-300'
                    : trackTheme.badgeCompleted
                }`}
              >
                {currentModule?.status === 'in_preparation' ? 'Pending' : `${currentModuleProgress}%`}
              </span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {moduleNavSummary.currentNumber}/{moduleNavSummary.totalCount}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMobileDrawerOpen ? 'rotate-180' : ''
                }`}
              />
            </span>

            {/* Live Per-Scroll Module Progress Bar */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-[3px] ${
                isLight ? 'bg-slate-200/80' : 'bg-slate-800'
              }`}
            >
              <span
                className={`block h-full transition-all duration-150 ${
                  currentModuleProgress >= 100
                    ? isLight
                      ? 'bg-emerald-500'
                      : 'bg-emerald-400'
                    : trackTheme.progressBar
                }`}
                style={{
                  width: `${currentModule?.status === 'in_preparation' ? 0 : currentModuleProgress}%`,
                }}
              />
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrevModule}
              disabled={!moduleNavSummary.canGoPrev}
              aria-label="Previous module"
              className={`p-2 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextModule}
              disabled={!moduleNavSummary.canGoNext}
              aria-label="Next module"
              className={`p-2 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. DUAL-PANE NETACAD LAYOUT: COLLAPSIBLE SIDEBAR + MAIN READER       */}
      {/* ==================================================================== */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile Drawer Backdrop */}
        {isMobileDrawerOpen && !(isPresentationFullscreen && hasEmbeddedPdf) && (
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* MODULES SIDEBAR: Slide-over drawer on mobile (< lg), sticky left pane on desktop (>= lg) */}
        {!(isPresentationFullscreen && hasEmbeddedPdf) && (isMobileDrawerOpen || isDesktopSidebarOpen) && (
        <aside
          data-testid="netacad-modules-sidebar"
          className={`${
            isMobileDrawerOpen
              ? 'fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs shadow-2xl flex'
              : 'hidden'
          } ${
            isDesktopSidebarOpen ? 'lg:static lg:flex lg:w-80 xl:w-88 lg:shadow-none lg:z-10' : 'lg:hidden'
          } border-r flex-col shrink-0 select-none transition-colors ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#0c1222] border-slate-800/90'
          }`}
        >
          {/* Mobile Drawer Close Header */}
          <div
            className={`lg:hidden px-3 py-2.5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#070b16]'
            }`}
          >
            <span className={`text-xs font-black uppercase tracking-wider ${trackTheme.categoryText}`}>
              Modules ({activeModules.length})
            </span>
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close modules list"
              className={`p-1.5 rounded-lg cursor-pointer ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Subject Overall Completion */}
          <div
            className={`p-3 border-b space-y-2 ${
              isLight
                ? 'border-slate-200 bg-slate-50/80'
                : 'border-slate-800/80 bg-[#090e1c]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Subject Progress:</span>
              <span className={`font-black ${trackTheme.progressText}`}>
                {completedCount} of {availableModuleCount} {availableModuleCount === activeModules.length ? 'Modules' : 'Available'} ({overallProgress}%)
              </span>
            </div>
            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-slate-800/80'
              }`}
            >
              <div
                className={`${trackTheme.progressBar} h-full rounded-full transition-all duration-300`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Search Modules & Topics */}
          <div className={`p-2.5 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            <div className="relative">
              <Search
                className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules & topics..."
                className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs border focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:bg-white'
                    : 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Nested Modules & Sub-topics Navigation */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredModules.length > 0 ? (
              filteredModules.map((mod, modIdx) => {
                const isCompleted = isModuleCompleted(mod.id);
                const isSelected = mod.id === currentModule?.id;
                const modNumber = mod.moduleNumber || modIdx + 1;

                // Maintain highest reached percentage per module (persists on back-scroll)
                const moduleDisplayProgress = isCompleted
                  ? 100
                  : (moduleMaxProgress[mod.id] ?? 0);

                return (
                  <div
                    key={mod.id}
                    className={`rounded-xl border transition-all ${
                      isSelected
                        ? isLight
                          ? 'border-slate-300 bg-slate-100/90 shadow-xs'
                          : 'border-slate-700 bg-slate-900/90 shadow-xs'
                        : isLight
                        ? 'border-transparent hover:bg-slate-50'
                        : 'border-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Module Item Header */}
                    <button
                      type="button"
                      onClick={() => {
                        const actualIdx = activeModules.findIndex((m) => m.id === mod.id);
                        handleSelectModule(actualIdx >= 0 ? actualIdx : modIdx);
                      }}
                      className="w-full text-left p-2.5 flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`shrink-0 whitespace-nowrap text-[10px] font-black px-1.5 py-0.5 rounded ${
                              isCompleted
                                ? trackTheme.badgeCompleted
                                : isLight
                                ? 'bg-slate-200/80 text-slate-600'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Mod {modNumber}
                          </span>
                          <span
                            className={`text-xs font-bold truncate transition-colors ${
                              isLight
                                ? isSelected
                                  ? 'text-slate-950'
                                  : 'text-slate-800 group-hover:text-slate-950'
                                : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {mod.title.replace(/^Module \d+:\s*/, '')}
                          </span>
                        </div>

                        {/* Module Dynamic Scroll Progress Line */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div
                            className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                              isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-200 ${
                                moduleDisplayProgress > 0 || isSelected
                                  ? isLight
                                    ? 'bg-blue-600'
                                    : 'bg-blue-500'
                                  : isLight
                                  ? 'bg-slate-300'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${moduleDisplayProgress}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold tabular-nums ${
                              mod.status === 'in_preparation'
                                ? isLight
                                  ? 'text-amber-600'
                                  : 'text-amber-400'
                                : isSelected || moduleDisplayProgress > 0
                                ? isLight
                                  ? 'text-blue-600'
                                  : 'text-blue-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {mod.status === 'in_preparation' ? 'Pending' : `${moduleDisplayProgress}%`}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No modules match "{searchQuery}"
              </div>
            )}
          </div>

          {/* Sidebar Footer Hint */}
          <div
            className={`p-3 border-t text-[11px] flex items-center gap-2 ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-slate-800/80 bg-[#080d1a] text-slate-400'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
            <span className="leading-snug">
              Reading continuously updates your live progress. 100% scroll depth verifies mastery!
            </span>
          </div>
        </aside>
        )}

        {/* RIGHT MAIN SCROLLING CONTENT AREA (Continuous native presentation content) */}
        <main
          id="reader-main-scroll-pane"
          ref={contentScrollRef}
          onScroll={handleScroll}
          className={`flex-1 flex flex-col relative select-text transition-colors [overflow-anchor:none] ${
            hasEmbeddedPdf && pdfSlidesCount === 0 && !pdfLoadError
              ? 'overflow-y-hidden'
              : 'overflow-y-auto'
          } ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'}`}
        >
          {/* Floating Exit Full Screen control when presentation fullscreen is active */}
          {isPresentationFullscreen && hasEmbeddedPdf && (
            <button
              onClick={() => setIsPresentationFullscreen(false)}
              className={`fixed top-4 right-5 z-50 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-2xl inline-flex items-center gap-2 cursor-pointer backdrop-blur-sm ${
                isLight
                  ? 'bg-white/95 hover:bg-slate-50 text-slate-900 border-slate-200'
                  : 'bg-slate-900/95 hover:bg-slate-800 text-white border-slate-700'
              }`}
              title="Exit Full Screen (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Full Screen</span>
            </button>
          )}

          {/* Header Banner Backdrop */}
          {!(isPresentationFullscreen && hasEmbeddedPdf) && (
          <div
            className={`relative w-full min-h-[144px] sm:min-h-[180px] flex items-end overflow-hidden shrink-0 border-b ${
              isLight ? 'border-slate-200 bg-white' : 'border-slate-800'
            }`}
          >
            <img
              src={heroImage}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-center filter ${
                isLight ? 'opacity-90 brightness-95' : 'brightness-75'
              }`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                isLight
                  ? 'from-slate-100/95 via-white/40 to-transparent'
                  : 'from-[#0a0f1d] via-[#0a0f1d]/75 to-transparent'
              }`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                isLight
                  ? 'from-white/95 via-white/80 via-55% to-transparent'
                  : 'from-[#0a0f1d]/92 via-[#0a0f1d]/55 to-transparent'
              }`}
            />

            <div className="relative z-10 w-full px-4 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 max-w-2xl min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md ${trackTheme.heroPill} text-[11px] sm:text-xs font-black uppercase tracking-wider`}>
                    {activeSubject?.code || track.code} · Module {currentModule?.moduleNumber || selectedModuleIndex + 1}
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold flex items-center gap-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{currentModule?.durationMinutes || 20} mins reading time</span>
                  </span>
                </div>

                <h2
                  className={`text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug ${
                    isLight ? 'text-slate-900' : 'text-white drop-shadow-md'
                  }`}
                >
                  {currentModule?.title}
                </h2>

                <p
                  className={`text-xs sm:text-sm leading-relaxed max-w-xl lg:line-clamp-2 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {currentModule?.description}
                </p>
              </div>

              {/* Module Completed Status Indicator */}
              {currentModule && isModuleCompleted(currentModule.id) && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${trackTheme.completedBadge} text-xs font-bold shadow-sm`}>
                    <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span className={isLight ? 'text-emerald-700' : 'text-emerald-300'}>Module Verified (100%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Embedded Presentation Content Body */}
          <div
            className={
              hasEmbeddedPdf
                ? `w-full flex-1 flex flex-col ${
                    isPresentationFullscreen ? 'p-1.5 sm:p-4 max-w-[1440px] mx-auto' : 'p-2 sm:p-4'
                  } space-y-3 sm:space-y-4`
                : 'max-w-4xl w-full mx-auto p-3.5 sm:p-8 lg:p-10 space-y-6 sm:space-y-10 flex-1'
            }
          >
            {/* Module Overview & Objectives Block (only for text-based modules without an embedded deck) */}
            {!hasEmbeddedPdf && (
            <section
              className={`p-6 rounded-2xl border shadow-md space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
              }`}
            >
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${trackTheme.accentText}`}>
                <Layers className="w-4 h-4" />
                <span>Module Focus & Objectives</span>
              </div>
              <p className={`text-sm leading-relaxed font-normal ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {currentModule?.overviewSummary}
              </p>

              {/* Topics Breakdown Table */}
              {topicsList.length > 0 && (
                <div className="pt-2">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Topics Included in this Module:
                  </div>
                  <div
                    className={`overflow-x-auto rounded-xl border ${
                      isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#090d18]'
                    }`}
                  >
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr
                          className={`border-b ${
                            isLight
                              ? 'border-slate-200 bg-slate-100 text-slate-700'
                              : 'border-slate-800 bg-slate-900/90 text-slate-300'
                          }`}
                        >
                          <th className="py-2.5 px-3 font-bold w-1/3">Topic Title</th>
                          <th className="py-2.5 px-3 font-bold">Learning Objective</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
                        {topicsList.map((top, idx) => {
                          const isCurrent = activeTopicId === top.id;
                          return (
                            <tr
                              key={top.id || idx}
                              onClick={() => handleScrollToTopic(top.id)}
                              className={`cursor-pointer transition-colors ${
                                isCurrent
                                  ? trackTheme.tableRowActive
                                  : isLight
                                  ? 'hover:bg-slate-100/80 text-slate-700'
                                  : 'hover:bg-slate-900/40 text-slate-300'
                              }`}
                            >
                              <td className="py-2.5 px-3 flex items-center gap-2 font-semibold">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isCurrent ? trackTheme.tableDotActive : 'bg-slate-500'
                                  }`}
                                />
                                <span>
                                  {top.numberPrefix ? `${top.numberPrefix} ` : ''}
                                  {top.title}
                                </span>
                              </td>
                              <td
                                className={`py-2.5 px-3 leading-relaxed ${
                                  isLight ? 'text-slate-600' : 'text-slate-400'
                                }`}
                              >
                                {top.objective}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
            )}

            {/* Embedded Presentation Content: Direct PDF Slides or Continuous Native Topics */}
            {currentModule?.embeddedPdfUrl ? (
              <EmbeddedPdfPresentation
                key={currentModule.id}
                pdfUrl={currentModule.embeddedPdfUrl}
                topics={topicsList}
                scrollContainerRef={contentScrollRef}
                startPage={currentModule.pdfStartPage}
                endPage={currentModule.pdfEndPage}
                onSlidesReady={handleSlidesReady}
                onLoadError={() => setPdfLoadError(true)}
                isLight={isLight}
              />
            ) : (
              topicsList.map((topic, topicIdx) => (
                <section
                  key={topic.id || topicIdx}
                  data-topic-id={topic.id}
                  id={`topic-${topic.id}`}
                  className={`space-y-6 pt-4 border-t first:border-0 ${
                    isLight ? 'border-slate-200' : 'border-slate-800/80'
                  }`}
                >
                  {/* Topic Header */}
                  <div className="space-y-1.5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${trackTheme.badgeCompleted}`}>
                        Topic {topic.numberPrefix || `${topicIdx + 1}.0`}
                      </span>
                      <h3 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {topic.title}
                      </h3>
                    </div>
                    <p className={`text-xs sm:text-sm ${trackTheme.accentText} font-medium`}>
                      <strong>Objective:</strong> {topic.objective}
                    </p>
                  </div>

                  {/* Extracted Presentation Slides (Native formatted components) */}
                  {topic.contentSections && topic.contentSections.length > 0 ? (
                    <div className="space-y-5">
                      {topic.contentSections.map((sec, secIdx) => (
                        <div
                          key={secIdx}
                          className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                            isLight ? 'bg-white border-slate-200' : 'bg-[#0d1424] border-slate-800'
                          }`}
                        >
                          {/* Slide Title */}
                          <div
                            className={`flex items-center justify-between pb-2 border-b ${
                              isLight ? 'border-slate-200' : 'border-slate-800/80'
                            }`}
                          >
                            <h4
                              className={`font-extrabold text-sm sm:text-base flex items-center gap-2.5 ${
                                isLight ? 'text-slate-900' : 'text-slate-100'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${trackTheme.progressBar}`} />
                              <span>{sec.heading}</span>
                            </h4>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isLight ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              Slide {secIdx + 1} of {topic.contentSections?.length}
                            </span>
                          </div>

                          {/* Slide Body Narrative */}
                          <p
                            className={`text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line ${
                              isLight ? 'text-slate-700' : 'text-slate-300'
                            }`}
                          >
                            {renderFormattedText(sec.body, isLight)}
                          </p>

                          {/* Structured Comparison / Reference Table */}
                          {sec.table && sec.table.headers.length > 0 && (
                            <div
                              className={`overflow-x-auto rounded-xl border ${
                                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#090d18]'
                              }`}
                            >
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr
                                    className={`border-b ${
                                      isLight
                                        ? 'border-slate-200 bg-slate-100 text-slate-800'
                                        : 'border-slate-800 bg-slate-900/90 text-slate-200'
                                    }`}
                                  >
                                    {sec.table.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="py-2.5 px-3 font-extrabold">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
                                  {sec.table.rows.map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className={
                                        isLight
                                          ? 'hover:bg-slate-100/70 text-slate-700'
                                          : 'hover:bg-slate-900/40 text-slate-300'
                                      }
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`py-2.5 px-3 leading-relaxed align-top ${
                                            cIdx === 0
                                              ? `font-bold sm:whitespace-nowrap ${
                                                  isLight ? 'text-slate-900' : 'text-slate-100'
                                                }`
                                              : ''
                                          }`}
                                        >
                                          {renderFormattedText(cell, isLight)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Slide Bullets */}
                          {sec.bullets && sec.bullets.length > 0 && (
                            <div className="space-y-2 pt-1 pl-1">
                              {sec.bullets.map((bullet, bIdx) => (
                                <div
                                  key={bIdx}
                                  className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                                    isLight ? 'text-slate-700' : 'text-slate-300'
                                  }`}
                                >
                                  <span className={`${trackTheme.accentText} font-black mt-0.5`}>
                                    ▸
                                  </span>
                                  <span className="leading-relaxed">{renderFormattedText(bullet, isLight)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CLI / Configuration Code Block */}
                          {sec.codeBlock && (
                            <pre
                              className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto leading-relaxed ${
                                isLight
                                  ? 'bg-slate-900 border-slate-300 text-cyan-200'
                                  : 'bg-[#070b14] border-slate-700/80 text-cyan-200'
                              }`}
                            >
                              <code>{sec.codeBlock}</code>
                            </pre>
                          )}

                          {/* Key Slide Takeaway / Tip Callout */}
                          {sec.tip && (
                            <div
                              className={`mt-3 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                                isLight
                                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
                              }`}
                            >
                              <BookOpen className={`w-4 h-4 ${trackTheme.checkIcon} shrink-0 mt-0.5`} />
                              <div>
                                <strong className={`${isLight ? 'text-slate-900' : 'text-white'} font-extrabold`}>
                                  Key Concept:
                                </strong>{' '}
                                <span>{renderFormattedText(sec.tip, isLight)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`p-6 rounded-2xl border space-y-3 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0d1424] border-slate-800'
                      }`}
                    >
                      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {currentModule?.description}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        This core concept forms a vital foundation for BSIT students specializing in {track.name}.
                        Follow the sequential lesson slides above to build comprehensive technical fluency.
                      </p>
                    </div>
                  )}
                </section>
              ))
            )}

            {/* Module Summary & Completion Banner at the Bottom */}
            {!hasEmbeddedPdf ? (
            <div
              className={`p-6 sm:p-8 rounded-2xl border space-y-5 shadow-xl ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-gradient-to-br from-[#0c1322] to-[#111a30] border-slate-800'
              }`}
            >
              <div
                className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                <Award className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>Chapter Summary & Key Takeaways</span>
              </div>

              <div
                className={`space-y-2 text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                {currentModule?.keyTakeaways && currentModule.keyTakeaways.length > 0 ? (
                  currentModule.keyTakeaways.map((takeaway, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2">
                      <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-bold`}>✓</span>
                      <span>{renderFormattedText(takeaway, isLight)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-bold`}>✓</span>
                      <span>
                        Mastery of {currentModule?.title.replace(/^Module \d+:\s*/, '')} curriculum fundamentals.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-bold`}>✓</span>
                      <span>
                        Direct alignment with {activeSubject?.code} academic course benchmarks.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-bold`}>✓</span>
                      <span>
                        Progress depth tracked automatically via scroll completion.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 100% Reading Verification Banner */}
              <div
                className={`pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentModule?.status === 'in_preparation'
                      ? 'Pending slide upload — not required for track completion.'
                      : isModuleCompleted(currentModule?.id || '')
                      ? 'Module Completed & Verified in Student Portfolio'
                      : 'You have reached the end of this module! Marked as complete.'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePrevModule}
                    disabled={selectedModuleIndex === 0}
                    className={`flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:py-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLight
                        ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextModule}
                    disabled={selectedModuleIndex === activeModules.length - 1}
                    className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 sm:py-2 rounded-xl ${trackTheme.completeBtn} disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md`}
                  >
                    <span>Next Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div
                className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-[#0c1322] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isModuleCompleted(currentModule?.id || '')
                      ? 'Module Completed & Verified in Student Portfolio'
                      : 'Scroll to the end of the presentation to complete this module.'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePrevModule}
                    disabled={selectedModuleIndex === 0}
                    className={`flex-1 sm:flex-initial justify-center px-3 py-2 sm:py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLight
                        ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextModule}
                    disabled={selectedModuleIndex === activeModules.length - 1}
                    className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 sm:py-1.5 rounded-lg ${trackTheme.completeBtn} disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md`}
                  >
                    <span>Next Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floating Next / Previous Navigation Chevrons */}
          {!(isPresentationFullscreen && hasEmbeddedPdf) && (
          <>
          <button
            type="button"
            onClick={handlePrevModule}
            disabled={selectedModuleIndex === 0}
            className={`hidden lg:flex fixed ${isDesktopSidebarOpen ? 'left-80 xl:left-88' : 'left-2'} top-1/2 -translate-y-1/2 w-8 h-16 rounded-r-lg ${trackTheme.floatingChevron} disabled:opacity-20 disabled:pointer-events-none items-center justify-center text-white transition-all shadow-lg cursor-pointer z-20`}
            title="Previous Module"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNextModule}
            disabled={selectedModuleIndex === activeModules.length - 1}
            className={`hidden lg:flex fixed right-2 top-1/2 -translate-y-1/2 w-8 h-16 rounded-l-lg ${trackTheme.floatingChevron} disabled:opacity-20 disabled:pointer-events-none items-center justify-center text-white transition-all shadow-lg cursor-pointer z-20`}
            title="Next Module"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          </>
          )}
        </main>
      </div>
    </div>
  );
};
