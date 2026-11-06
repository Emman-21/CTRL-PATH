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
import { Sparkles } from 'lucide-react';

export const LuniAssistantWidget: React.FC = () => {
  const { state: studentState, updatePreferences } = useStudent();
  const location = useLocation();
  const {stories}=useCommunity();

  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [showFullPanel, setShowFullPanel] = useState(false);
  const [characterState, setCharacterState] = useState<LuniState>('waving');
  // Single source of truth: preference (no local mirror to drift out of sync).
  const isMinimized = studentState.preferences?.luniMinimized ?? false;
  const [isSleeping, setIsSleeping] = useState(false);

  const [isQuizFocusMode, setIsQuizFocusMode] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true'
    );
  });

  useEffect(() => {
    const handleFocusChange = () => {
      setIsQuizFocusMode(window.sessionStorage.getItem('ctrl_quiz_focus_mode') === 'true');
    };
    window.addEventListener('ctrl_focus_mode_changed', handleFocusChange);
    return () => window.removeEventListener('ctrl_focus_mode_changed', handleFocusChange);
  }, []);

  // Determine current contextual dialogue
  const getActiveDialogue = (): LuniDialogueItem => {
    // Check if on tracks page with specific track query parameter
    const searchParams = new URLSearchParams(location.search);
    const trackParam = searchParams.get('track') as TrackCode | null;

    if (location.pathname === '/tracks' && trackParam && TRACK_SPECIFIC_DIALOGUES[trackParam]) {
      return TRACK_SPECIFIC_DIALOGUES[trackParam];
    }

    if (location.pathname.startsWith('/alumni')) return {...ROUTE_DIALOGUES['/alumni'],message:stories.length ? "Everyone's journey is different, Luminary! Let's learn from the experiences of those who came before us." : ROUTE_DIALOGUES['/alumni'].message};
    const routeKey=location.pathname.startsWith('/announcements')?'/announcements':location.pathname;
    const routeDialogue = ROUTE_DIALOGUES[routeKey] || ROUTE_DIALOGUES['/'];
    return routeDialogue;
  };

  const activeDialogue = getActiveDialogue();

  // Route transition effect: update Luni's mood and pop auto-tip if enabled
  useEffect(() => {
    setIsSleeping(false);
    const dialogue = getActiveDialogue();
    setCharacterState(dialogue.state);

    // Auto-pop tip if enabled in preferences and not on quiz
    if (
      studentState.preferences?.luniAutoTips !== false &&
      location.pathname !== '/quiz' &&
      !isMinimized
    ) {
      setShowSpeechBubble(true);
      // Auto-hide bubble after 8 seconds
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowSpeechBubble(false);
    }
  }, [location.pathname, location.search, isMinimized, studentState.preferences?.luniAutoTips, stories.length]);

  // Inactivity timeout: transition Luni to sleeping pose after 90 seconds of no interaction
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
  }, [isSleeping, isMinimized, showFullPanel, activeDialogue.state, studentState.preferences?.luniMinimized]);

  // If Luni is globally disabled in user preferences, return null
  if (studentState.preferences?.luniEnabled === false) {
    return null;
  }

  // If Focus Mode is active on the Quiz, hide the floating companion completely to preserve distraction-free state
  if (isQuizFocusMode) {
    return null;
  }

  const toggleMinimize = (min: boolean) => {
    setShowSpeechBubble(false);
    updatePreferences({ luniMinimized: min });
  };

  return (
    <>
      <div data-luni-animated={studentState.preferences.luniFloatingAnimation !== false} className="fixed bottom-5 right-5 z-40 flex flex-col items-end select-none">
        {/* Floating Speech Bubble */}
        {showSpeechBubble && !isMinimized && !showFullPanel && (
          <div className="mb-3">
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
          {/* Minimized Compact Icon */}
          {isMinimized ? (
            <button
              onClick={() => toggleMinimize(false)}
              className="flex items-center gap-2 px-3 py-2 bg-white/95 hover:bg-blue-50 border border-blue-200 rounded-full shadow-lg text-slate-800 transition-all hover:scale-105 active:scale-95 group"
              aria-label="Wake Luni Companion"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <LuniCharacter state="waving" size={26} animate={false} showParticles={false} />
              </div>
              <span className="text-xs font-black text-blue-700 hidden sm:inline">Ask Luni!</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
            </button>
          ) : (
            <div className="flex flex-col items-end group">
              {/* Controls bar above Luni */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-full border border-slate-200 shadow-xs text-[10px] text-slate-600">
                <button
                  onClick={() => setShowSpeechBubble(!showSpeechBubble)}
                  className="hover:text-blue-600 px-1 font-bold"
                  aria-label="Toggle speech bubble"
                >
                  {showSpeechBubble ? 'Mute' : 'Tip'}
                </button>
                <span>•</span>
                <button
                  onClick={() => toggleMinimize(true)}
                  className="hover:text-blue-600 px-1 font-bold"
                  aria-label="Minimize companion"
                >
                  Minimize
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowFullPanel(true)}
                  className="hover:text-blue-600 px-1 font-bold"
                  aria-label="Open Full Guide"
                >
                  Q&A
                </button>
              </div>

              {/* Luni Silhouette Trigger (Free from circular container!) */}
              <div
                className="relative cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 flex flex-col items-center"
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
                {/* Floating Shadow Under Luni */}
                <div className="absolute -bottom-1 w-10 h-2 bg-slate-900/15 rounded-full blur-2xs" />

                <LuniCharacter
                  state={characterState}
                  size={74}
                  animate
                  showParticles
                  interactive
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Assistant Panel (Desktop Modal / Mobile Bottom Sheet) */}
      <LuniAssistantPanel
        isOpen={showFullPanel}
        onClose={() => setShowFullPanel(false)}
        currentState={characterState}
      />
    </>
  );
};
