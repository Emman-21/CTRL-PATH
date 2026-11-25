import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { LuniSprite } from './LuniSprite';
import { LuniState } from '../../types/luni';
import { SCRIPTED_TOPICS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';
import { useLuniState } from '../../context/LuniStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { getLuniPoseById, getPoseDurationMs } from '../../data/luniSpritePoses';
import { askLuniAi } from '../../services/geminiService';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useVisualViewportHeight } from '../../hooks/useVisualViewportHeight';
import {
  X,
  Compass,
  BookOpen,
  GitCompare,
  Trophy,
  Search,
  Settings,
  ChevronRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Send,
  Loader2,
  Bot,
  MessageCircle,
} from 'lucide-react';

export interface LuniAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentState?: LuniState;
}

interface ChatMessage {
  sender: 'user' | 'luni';
  text: string;
}

const LUNI_TABS: Array<'live' | 'topics' | 'actions' | 'settings'> = [
  'live',
  'topics',
  'actions',
  'settings',
];

export const LuniAssistantPanel: React.FC<LuniAssistantPanelProps> = ({
  isOpen,
  onClose,
  currentState = 'waving',
}) => {
  const { state, updatePreferences } = useStudent();
  const luniState = useLuniState();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQuizFocusMode, setIsQuizFocusMode] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true'
    );
  });

  const [quizAnsweringActive, setQuizAnsweringActive] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('ctrl_quiz_answering') === 'true'
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleFocusChange = () => {
      setIsQuizFocusMode(window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true');
    };
    const handleAnsweringChange = () => {
      setQuizAnsweringActive(window.sessionStorage.getItem('ctrl_quiz_answering') === 'true');
    };
    handleFocusChange();
    handleAnsweringChange();
    window.addEventListener('ctrl_focus_mode_changed', handleFocusChange);
    window.addEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    return () => {
      window.removeEventListener('ctrl_focus_mode_changed', handleFocusChange);
      window.removeEventListener('ctrl_quiz_answering_changed', handleAnsweringChange);
    };
  }, []);

  const isQuizAnswering = location.pathname === '/quiz' && quizAnsweringActive;
  const isPanelSuppressed =
    state.preferences?.luniEnabled === false || isQuizFocusMode || isQuizAnswering;

  const [activeTab, setActiveTab] = useState<'live' | 'topics' | 'actions' | 'settings'>('live');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('nt-overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Live AI Chat state
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'luni',
      text: 'Kumusta, Luminary! 🌙✨ I am Luni, your celestial guide for BSIT at BatStateU Alangilan. Ask me anything about Networking Technology, Business Analytics, Service Management, or the CTRL Quiz!',
    },
  ]);

  const panelRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const focusScrollTimerRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeRequestIdRef = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const notifyChatOpenedRef = useRef(luniState.notifyChatOpened);
  notifyChatOpenedRef.current = luniState.notifyChatOpened;

  useBodyScrollLock(isOpen);
  useVisualViewportHeight(isOpen);

  const scrollThreadToBottom = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!isOpen || activeTab !== 'live') return;
    scrollThreadToBottom();
    const rafId = window.requestAnimationFrame(scrollThreadToBottom);
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, activeTab, chatMessages, isAiLoading, scrollThreadToBottom]);

  useEffect(() => {
    return () => {
      if (focusScrollTimerRef.current !== null) {
        window.clearTimeout(focusScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    notifyChatOpenedRef.current();
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const timer = window.setTimeout(() => {
      const initialTarget = panelRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), a[href], [tabindex="0"]'
      );
      initialTarget?.focus();
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'
        ) ?? []
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % LUNI_TABS.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + LUNI_TABS.length) % LUNI_TABS.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = LUNI_TABS.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const nextTab = LUNI_TABS[nextIdx];
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  if (!isOpen) return null;

  const panelPoseId = isPanelSuppressed ? 'idle' : luniState.renderedPoseId;
  const panelPoseConfig =
    (isPanelSuppressed ? getLuniPoseById('idle') : null) ?? luniState.renderedPoseConfig;
  const panelSheet = isPanelSuppressed
    ? (luniState.sheetsById['idle'] ?? null)
    : luniState.renderedSheet;
  const showPanelUnifiedSprite = Boolean(panelSheet);
  const panelOverlayState = isPanelSuppressed ? null : luniState.overlayState;
  const panelPlaying = luniState.isPlaying && !isPanelSuppressed;

  // Filter topics based on search query
  const filteredTopics = SCRIPTED_TOPICS.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.question.toLowerCase().includes(query) ||
      t.answer.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  });

  const selectedTopic = SCRIPTED_TOPICS.find((t) => t.id === selectedTopicId) || filteredTopics[0];

  const handleActionClick = (route: string) => {
    onClose();
    navigate(route);
  };

  const handleSendAiQuestion = async (queryToSend?: string) => {
    const question = (queryToSend || customQuestion).trim();
    if (!question || isAiLoading) return;

    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;

    setCustomQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setIsAiLoading(true);
    luniState.notifyMessageSent();

    try {
      const answer = await askLuniAi(question);
      if (activeRequestIdRef.current !== requestId) {
        luniState.notifyError();
        return;
      }
      setChatMessages((prev) => [...prev, { sender: 'luni', text: answer }]);
      luniState.notifyReplyDone(answer);
    } catch {
      luniState.notifyError();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'luni',
          text: 'The starlight is fluctuating a bit, but every track has an incredible future! Try checking the Path Compare matrix or Curriculum Q&A! ✨',
        },
      ]);
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsAiLoading(false);
      }
    }
  };

  const samplePromptChips = [
    'Which track fits me best?',
    'What jobs can I get in NT?',
    'Is Business Analytics heavy in math?',
    'What is ITIL in Service Management?',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Luni Assistant Guide"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-6 sm:pb-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Panel Container */}
      <div
        ref={panelRef}
        className="luni-assistant-sheet relative w-full sm:w-[410px] bg-[var(--surface)] dark:bg-[#0f172a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col h-[88dvh] sm:h-[640px] overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header with Magical Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="luni-panel-avatar"
              data-luni-state={isPanelSuppressed ? 'idle' : luniState.state}
              data-luni-overlay={panelOverlayState ?? 'none'}
              data-sprite-pose={panelPoseId}
              onClick={() => luniState.notifyTap()}
              aria-label="Luni Moonstone Guide. Click to interact."
              className="relative w-[58px] h-[58px] shrink-0 bg-transparent border-0 p-0 cursor-pointer rounded-2xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 flex items-center justify-center"
            >
              {!showPanelUnifiedSprite && (
                <LuniCharacter
                  state={currentState}
                  size={58}
                  animate={false}
                  showParticles={false}
                  interactive={false}
                />
              )}
              <div
                aria-hidden={!showPanelUnifiedSprite}
                className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                  showPanelUnifiedSprite ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <LuniSprite
                  mode="wave-sheet"
                  size={58}
                  activePoseId={panelPoseId}
                  sheetUrl={panelPoseConfig.src}
                  frameCount={panelPoseConfig.frames}
                  sheetData={panelSheet}
                  isPlaying={panelPlaying}
                  isPaused={luniState.isPaused}
                  playbackMode={isPanelSuppressed ? 'loop' : luniState.playbackMode}
                  playCount={luniState.playCount}
                  durationMs={getPoseDurationMs(panelPoseConfig)}
                  activeEffect={isPanelSuppressed ? null : luniState.activeEffect}
                  overlayState={panelOverlayState}
                  spriteHidden={!showPanelUnifiedSprite}
                  onWaveAnimationEnd={() => luniState.notifyOncePoseEnded(luniState.playCount)}
                  onLoopIteration={() => luniState.notifyLoopBoundary(luniState.renderedPoseId)}
                />
              </div>
            </button>
            <div>
              <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Moonstone AI Companion</span>
              </div>
              <h3 className="text-base font-black leading-tight">Ask Luni Anything</h3>
              <p className="text-[11px] text-blue-100">BatStateU Alangilan BSIT Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="w-11 h-11 md:w-7 md:h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Assistant Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          aria-label="Luni assistant sections"
          className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1222] px-2 py-1 text-xs font-bold shrink-0 gap-2 md:gap-1"
        >
          <button
            ref={(el) => {
              tabRefs.current.live = el;
            }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'live'}
            tabIndex={activeTab === 'live' ? 0 : -1}
            onClick={() => setActiveTab('live')}
            onKeyDown={(e) => handleTabKeyDown(e, 0)}
            className={`min-h-11 md:min-h-0 flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[var(--surface)] dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ask Live AI</span>
          </button>
          <button
            ref={(el) => {
              tabRefs.current.topics = el;
            }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'topics'}
            tabIndex={activeTab === 'topics' ? 0 : -1}
            onClick={() => setActiveTab('topics')}
            onKeyDown={(e) => handleTabKeyDown(e, 1)}
            className={`min-h-11 md:min-h-0 flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-[var(--surface)] dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Curriculum Q&A</span>
          </button>
          <button
            ref={(el) => {
              tabRefs.current.actions = el;
            }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'actions'}
            tabIndex={activeTab === 'actions' ? 0 : -1}
            onClick={() => setActiveTab('actions')}
            onKeyDown={(e) => handleTabKeyDown(e, 2)}
            className={`min-h-11 md:min-h-0 flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-[var(--surface)] dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>
          <button
            ref={(el) => {
              tabRefs.current.settings = el;
            }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            tabIndex={activeTab === 'settings' ? 0 : -1}
            onClick={() => setActiveTab('settings')}
            onKeyDown={(e) => handleTabKeyDown(e, 3)}
            className={`min-w-11 min-h-11 md:min-w-0 md:min-h-0 px-3 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[var(--surface)] dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
            aria-label="Luni Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* TAB 0: LIVE AI CHAT */}
          {activeTab === 'live' && (
            <div className="flex flex-col h-full min-h-0 space-y-3">
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:flex-wrap md:overflow-visible md:gap-1.5 shrink-0">
                {samplePromptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiQuestion(chip)}
                    className="min-h-11 md:min-h-0 shrink-0 whitespace-nowrap md:whitespace-normal text-xs md:text-[11px] px-3 py-1.5 md:px-2.5 md:py-1 rounded-full bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 dark:text-indigo-200! dark:border-indigo-700/50 font-medium transition-colors cursor-pointer text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div
                ref={threadRef}
                className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 dark:bg-[#090e1c]/70 dark:border dark:border-slate-800/80 dark:rounded-2xl dark:p-3"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`luni-chat-bubble max-w-[85%] sm:max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-slate-100 dark:bg-[#131d33]! text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/80!'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-[#131d33]! text-slate-500 dark:text-slate-300 border border-transparent dark:border-slate-700/80 text-xs w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span>Luni is reading the celestial starlight...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiQuestion();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0"
              >
                <input
                  type="text"
                  data-testid="luni-chat-input"
                  value={customQuestion}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setCustomQuestion(nextVal);
                    luniState.notifyTyping(nextVal);
                  }}
                  onFocus={() => {
                    scrollThreadToBottom();
                    if (focusScrollTimerRef.current !== null) {
                      window.clearTimeout(focusScrollTimerRef.current);
                    }
                    focusScrollTimerRef.current = window.setTimeout(scrollThreadToBottom, 180);
                  }}
                  onBlur={() => luniState.notifyInputBlur()}
                  placeholder="Ask Luni anything about BSIT tracks..."
                  className="flex-1 px-3.5 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/80 dark:bg-[#0a0f1d] dark:text-slate-100 font-normal"
                />
                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isAiLoading}
                  className="w-11 h-11 md:w-auto md:h-auto md:p-2 flex items-center justify-center shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white cursor-pointer transition-colors shadow-xs"
                  aria-label="Send question to Luni"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 1: CURRICULUM TOPICS & Q&A */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 md:top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask or search topics (e.g. NT, ITIL, Quiz)..."
                  className="w-full pl-9 pr-11 md:pr-8 py-2 text-base md:text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 dark:bg-[#0a0f1d] dark:text-slate-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear topic search"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 md:w-auto md:h-auto md:right-2.5 md:top-2.5 md:translate-y-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Selected Topic Full Answer */}
              {selectedTopic && (
                <div className="p-3.5 rounded-2xl bg-linear-to-br from-indigo-50/60 to-blue-50/40 dark:from-indigo-950/70 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800/60 text-slate-800 dark:text-slate-100 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">{selectedTopic.question}</h4>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedTopic.answer}</p>

                  {selectedTopic.relatedRoute && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-100/80 dark:border-indigo-800/50 flex justify-end">
                      <button
                        onClick={() => handleActionClick(selectedTopic.relatedRoute!)}
                        className="touch-target-44 min-h-11 md:min-h-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{selectedTopic.relatedActionLabel || 'Explore Pathway'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Available Questions List */}
              <div className="space-y-2 md:space-y-1.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Available Topics ({filteredTopics.length})
                </div>

                {filteredTopics.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131d33] text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching topic found. Try searching for "Networking", "Analytics", "Service
                    Management", or "Quiz".
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                      }}
                      className={`w-full min-h-11 md:min-h-0 text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        selectedTopicId === topic.id
                          ? 'bg-blue-50 dark:bg-[#111e3b] border-blue-200 dark:border-blue-600/60 text-blue-900 dark:text-blue-200 shadow-2xs'
                          : 'bg-[var(--surface)] dark:bg-[#111c33] border-[var(--border)] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[var(--text)] dark:text-slate-200'
                      }`}
                    >
                      <span className="line-clamp-1">{topic.question}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QUICK ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                Where would you like to go?
              </div>

              <button
                onClick={() => handleActionClick('/tracks')}
                className="w-full p-3 rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/35 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">Track Explorer</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Explore NT, BA, and SM curriculum</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/quiz')}
                className="w-full p-3 rounded-2xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/35 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">CTRL Quiz Assessment</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">5 levels with objective evaluation</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/compare')}
                className="w-full p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/35 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">Path Comparison Matrix</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Compare 2 or 3 tracks side-by-side</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/achievements')}
                className="w-full p-3 rounded-2xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/35 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">Gemstone Vault</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Collect {GEMSTONE_ASSETS.length} unique milestone achievements</div>
                </div>
              </button>
            </div>
          )}

          {/* TAB 3: LUNI PREFERENCES */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                Luni Companion Preferences
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#131d33] cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Floating Animations</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Gentle hover and sparkle effects</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.luniFloatingAnimation ?? true}
                    onChange={(e) => updatePreferences({ luniFloatingAnimation: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#131d33] cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Auto Guidance Bubbles</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Show helpful speech tips on page changes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.luniAutoTips ?? true}
                    onChange={(e) => updatePreferences({ luniAutoTips: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#131d33] cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Reduced Motion</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Disables bouncing and floating across the UI</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.reducedMotion ?? false}
                    onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                Tip: If you're taking the CTRL Quiz, you can also toggle Focus Mode anytime to silence all
                animations and focus strictly on questions.
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:pb-3 bg-slate-50 dark:bg-[#0b1222] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>BatStateU Alangilan AI Mentor</span>
          </div>
          <button
            onClick={onClose}
            className="touch-target-44 py-2 px-3 md:p-0 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
