import React, { useState } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { LuniState } from '../../types/luni';
import { SCRIPTED_TOPICS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';
import { askLuniAi } from '../../services/geminiService';
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

export const LuniAssistantPanel: React.FC<LuniAssistantPanelProps> = ({
  isOpen,
  onClose,
  currentState = 'waving',
}) => {
  const { state, updatePreferences } = useStudent();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'live' | 'topics' | 'actions' | 'settings'>('live');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('nt-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactiveMood, setInteractiveMood] = useState<LuniState>(currentState);

  // Live AI Chat state
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'luni',
      text: 'Kumusta, Luminary! 🌙✨ I am Luni, your celestial guide for BSIT at BatStateU Alangilan. Ask me anything about Networking Technology, Business Analytics, Service Management, or the CTRL Quiz!',
    },
  ]);

  if (!isOpen) return null;

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

    setCustomQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setIsAiLoading(true);
    setInteractiveMood('thinking');

    try {
      const answer = await askLuniAi(question);
      setChatMessages((prev) => [...prev, { sender: 'luni', text: answer }]);
      setInteractiveMood('happy');
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'luni',
          text: 'The starlight is fluctuating a bit, but every track has an incredible future! Try checking the Path Compare matrix or Curriculum Q&A! ✨',
        },
      ]);
      setInteractiveMood('curious');
    } finally {
      setIsAiLoading(false);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-6 sm:pb-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Panel Container */}
      <div className="relative w-full sm:w-[410px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-indigo-100 flex flex-col h-[88vh] sm:h-[640px] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header with Magical Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <LuniCharacter
                state={interactiveMood}
                size={58}
                animate
                showParticles={false}
                interactive
                onClick={() => {
                  const moods: LuniState[] = ['waving', 'celebrating', 'curious', 'happy', 'thinking'];
                  const nextMood = moods[(moods.indexOf(interactiveMood) + 1) % moods.length];
                  setInteractiveMood(nextMood);
                }}
              />
            </div>
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
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Assistant Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1222] px-2 py-1 text-xs font-bold shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-white dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ask Live AI</span>
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-white dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Curriculum Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-white dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-[#1a2744]! text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
            }`}
            aria-label="Luni Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 0: LIVE AI CHAT */}
          {activeTab === 'live' && (
            <div className="flex flex-col h-full space-y-3">
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {samplePromptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiQuestion(chip)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 dark:text-indigo-200! dark:border-indigo-700/50 font-medium transition-colors cursor-pointer text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 dark:bg-[#090e1c]/70 dark:border dark:border-slate-800/80 dark:rounded-2xl dark:p-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
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
                className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0"
              >
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask Luni anything about BSIT tracks..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/80 font-normal"
                />
                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isAiLoading}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white cursor-pointer transition-colors shadow-xs"
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
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask or search topics (e.g. NT, ITIL, Quiz)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{selectedTopic.relatedActionLabel || 'Explore Pathway'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Available Questions List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Available Topics ({filteredTopics.length})
                </div>

                {filteredTopics.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                    No matching topic found. Try searching for "Networking", "Analytics", "Service
                    Management", or "Quiz".
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setInteractiveMood('thinking');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        selectedTopicId === topic.id
                          ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
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
                className="w-full p-3 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Track Explorer</div>
                  <div className="text-[11px] text-slate-500">Explore NT, BA, and SM curriculum</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/quiz')}
                className="w-full p-3 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">CTRL Quiz Assessment</div>
                  <div className="text-[11px] text-slate-500">5 levels with objective evaluation</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/compare')}
                className="w-full p-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Path Comparison Matrix</div>
                  <div className="text-[11px] text-slate-500">Compare 2 or 3 tracks side-by-side</div>
                </div>
              </button>

              <button
                onClick={() => handleActionClick('/achievements')}
                className="w-full p-3 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Gemstone Vault</div>
                  <div className="text-[11px] text-slate-500">Collect 20 unique milestone achievements</div>
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

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                Tip: If you're taking the CTRL Quiz, you can also toggle Focus Mode anytime to silence all
                animations and focus strictly on questions.
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>BatStateU Alangilan AI Mentor</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
