import React, { useState, useEffect } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { LuniDialogueBubble } from './LuniDialogueBubble';
import { LuniAssistantPanel } from './LuniAssistantPanel';
import { ROUTE_DIALOGUES, TRACK_SPECIFIC_DIALOGUES } from '../../data/luniDialogues';
import { LuniState, LuniDialogueItem } from '../../types/luni';
import { TrackCode } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { useStudent } from '../../context/StudentContext';
import { useLocation } from 'react-router-dom';
import { Sparkles, MessageCircle, Minus, Volume2, VolumeX } from 'lucide-react';

export const LuniAssistantWidget: React.FC = () => {
  const { state: studentState, updatePreferences } = useStudent();
  const location = useLocation();
  const { stories } = useCommunity();

  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [showFullPanel, setShowFullPanel] = useState(false);
  const [characterState, setCharacterState] = useState<LuniState>('waving');
  const isMinimized = studentState.preferences?.luniMinimized ?? false;
  const [isSleeping, setIsSleeping] = useState(false);

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

  useEffect(() => {
    if (isQuizAnswering) {
      setShowSpeechBubble(false);
      setShowFullPanel(false);
    }
  }, [isQuizAnswering]);

  // Determine current contextual dialogue
  const getActiveDialogue = (): LuniDialogueItem => {
    const searchParams = new URLSearchParams(location.search);
    const trackParam = searchParams.get('track') as TrackCode | null;

    if (location.pathname === '/tracks' && trackParam && TRACK_SPECIFIC_DIALOGUES[trackParam]) {
      return TRACK_SPECIFIC_DIALOGUES[trackParam];
    }

    if (location.pathname.startsWith('/alumni')) {
      return {
        ...ROUTE_DIALOGUES['/alumni'],
        message: stories.length
          ? "Everyone's journey is different, Luminary! Let's learn from the experiences of those who came before us."
          : ROUTE_DIALOGUES['/alumni'].message,
      };
    }
    const routeKey = location.pathname.startsWith('/announcements')
      ? '/announcements'
      : location.pathname;
    return ROUTE_DIALOGUES[routeKey] || ROUTE_DIALOGUES['/'];
  };

  const activeDialogue = getActiveDialogue();

  // Route transition effect: update Luni's state without popping intrusive auto-dialogues
  useEffect(() => {
    setIsSleeping(false);
    const dialogue = getActiveDialogue();
    setCharacterState(dialogue.state);
    setShowSpeechBubble(false);
  }, [location.pathname, location.search, stories.length]);

  // Inactivity timeout: transition Luni to sleeping pose after 90 seconds
  useEffect(() => {
    if (isSleeping || isMinimized || showFullPanel) return;

    const sleepTimer = setTimeout(() => {
      setIsSleeping(true);
      setCharacterState('sleeping');
      setShowSpeechBubble(false);
    }, 90000);

    const resetSleep = () => {
      if (isSleeping) {
        setIsSleeping(false);
        setCharacterState(activeDialogue.state);
      }
    };

    window.addEventListener('mousemove', resetSleep, { passive: true });
    window.addEventListener('keydown', resetSleep, { passive: true });

    return () => {
      clearTimeout(sleepTimer);
      window.removeEventListener('mousemove', resetSleep);
      window.removeEventListener('keydown', resetSleep);
    };
  }, [isSleeping, isMinimized, showFullPanel, activeDialogue.state]);

  if (studentState.preferences?.luniEnabled === false || isQuizFocusMode || isQuizAnswering) {
    return null;
  }

  const toggleMinimize = (min: boolean) => {
    setShowSpeechBubble(false);
    updatePreferences({ luniMinimized: min });
  };

  return (
    <>
      <div
        data-luni-animated={studentState.preferences.luniFloatingAnimation !== false}
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none"
      >
        {/* Floating Speech Bubble */}
        {showSpeechBubble && !isMinimized && !showFullPanel && (
          <div className="mb-2.5">
            <LuniDialogueBubble
              dialogue={activeDialogue}
              onDismiss={() => setShowSpeechBubble(false)}
              onOpenPanel={() => {
                setShowSpeechBubble(false);
                setShowFullPanel(true);
              }}
            />
          </div>
        )}

        {/* Character & Quick Launcher */}
        <div className="flex items-end gap-2">
          {isMinimized ? (
            /* Minimized Sleek Pill */
            <button
              onClick={() => toggleMinimize(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-white/95 hover:bg-indigo-50 border border-indigo-200/90 rounded-full shadow-lg shadow-indigo-950/10 text-slate-800 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
              aria-label="Wake Luni Companion"
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <LuniCharacter state="waving" size={28} animate={false} showParticles={false} />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-indigo-950 leading-none">Ask Luni!</div>
                <div className="text-[10px] text-indigo-500 font-semibold leading-none mt-0.5">
                  AI Mentor
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
            </button>
          ) : (
            <div className="flex flex-col items-end group">
              {/* Quick Action Floating Pill (Hover controls) */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 -mb-1 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white shadow-lg text-[11px] font-semibold">
                <button
                  onClick={() => setShowSpeechBubble(!showSpeechBubble)}
                  className="hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                  title={showSpeechBubble ? 'Hide tip' : 'Show tip'}
                >
                  {showSpeechBubble ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <span className="text-white/30">•</span>
                <button
                  onClick={() => toggleMinimize(true)}
                  className="hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                  title="Minimize Luni"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-white/30">•</span>
                <button
                  onClick={() => setShowFullPanel(true)}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3 text-amber-400" />
                  <span>Chat</span>
                </button>
              </div>

              {/* Luni Sprite with Subtle Pedestal & Glowing Glow */}
              <div
                className="relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 flex flex-col items-center"
                onClick={() => {
                  if (showSpeechBubble) {
                    setShowFullPanel(true);
                    setShowSpeechBubble(false);
                  } else {
                    setShowSpeechBubble(true);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowFullPanel(true);
                  }
                }}
                aria-label="Luni, Moonstone Companion. Click to chat and ask questions."
              >
                {/* Soft Celestial Glow Aura */}
                <div className="absolute inset-0 bg-radial from-indigo-400/25 to-transparent rounded-full blur-md -z-10 scale-90" />

                {/* Soft ground shadow */}
                <div className="absolute bottom-0 w-12 h-2.5 bg-indigo-950/15 rounded-full blur-xs" />

                <div className="filter drop-shadow-[0_4px_10px_rgba(99,102,241,0.2)]">
                  <LuniCharacter
                    state={characterState}
                    size={76}
                    animate
                    showParticles
                    interactive
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Assistant Panel */}
      <LuniAssistantPanel
        isOpen={showFullPanel}
        onClose={() => setShowFullPanel(false)}
        currentState={characterState}
      />
    </>
  );
};
