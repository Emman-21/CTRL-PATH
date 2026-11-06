import React, { useState } from 'react';
import { LuniCharacter } from './LuniCharacter';
import { LuniState } from '../../types/luni';
import { SCRIPTED_TOPICS } from '../../data/luniDialogues';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export interface LuniAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentState?: LuniState;
}

export const LuniAssistantPanel: React.FC<LuniAssistantPanelProps> = ({
  isOpen,
  onClose,
  currentState = 'waving',
}) => {
  const { state, updatePreferences } = useStudent();
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState<'topics' | 'actions' | 'settings'>('topics');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('nt-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactiveMood, setInteractiveMood] = useState<LuniState>(currentState);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Luni Assistant Guide"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-6 sm:pb-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Panel Container (Mobile: Bottom Sheet, Desktop: Floating Card) */}
      <div className="relative w-full sm:w-[380px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-indigo-100 flex flex-col max-h-[85vh] sm:max-h-[620px] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header with Magical Gradient */}
        <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shrink-0 flex items-center justify-between">
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
                <span>Moonstone Companion</span>
              </div>
              <h3 className="text-base font-black leading-tight">Ask Luni Anything</h3>
              <p className="text-[11px] text-blue-100">Click Luni to see different expressions!</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              aria-label="Close Assistant Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-2 py-1 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'topics'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Curriculum Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'actions'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Quick Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center text-slate-500 hover:text-slate-800 ${
              activeTab === 'settings' ? 'bg-white text-blue-700 shadow-xs' : ''
            }`}
            aria-label="Luni Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Selected Topic Full Answer */}
              {selectedTopic && (
                <div className="p-3.5 rounded-2xl bg-linear-to-br from-indigo-50/60 to-blue-50/40 border border-indigo-100 text-slate-800 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <h4 className="text-xs font-black text-indigo-950">{selectedTopic.question}</h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedTopic.answer}</p>

                  {selectedTopic.relatedRoute && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-100/80 flex justify-end">
                      <button
                        onClick={() => handleActionClick(selectedTopic.relatedRoute!)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
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
                className="w-full p-3 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all flex items-center gap-3 text-left group"
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
                className="w-full p-3 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all flex items-center gap-3 text-left group"
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
                className="w-full p-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex items-center gap-3 text-left group"
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
                className="w-full p-3 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-all flex items-center gap-3 text-left group"
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
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Floating Animations</div>
                    <div className="text-[11px] text-slate-500">Gentle hover and sparkle effects</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.luniFloatingAnimation ?? true}
                    onChange={(e) => updatePreferences({ luniFloatingAnimation: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Auto Guidance Bubbles</div>
                    <div className="text-[11px] text-slate-500">Show helpful speech tips on page changes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.luniAutoTips ?? true}
                    onChange={(e) => updatePreferences({ luniAutoTips: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Reduced Motion</div>
                    <div className="text-[11px] text-slate-500">Disables bouncing and floating across the UI</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={state.preferences?.reducedMotion ?? false}
                    onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
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
            <span>Guided BSIT Curriculum Engine</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
