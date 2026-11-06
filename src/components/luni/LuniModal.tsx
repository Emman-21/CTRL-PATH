import React, { useState } from 'react';
import { LuniSprite } from './LuniSprite';
import { LuniPoseKey, BACKGROUNDS } from '../../assets/manifest';
import { X, Sparkles, Compass, BookOpen, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface LuniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuniModal: React.FC<LuniModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<LuniPoseKey>('wave');
  const [selectedTip, setSelectedTip] = useState<string | null>(null);

  if (!isOpen) return null;

  const moodExamples: Array<{ pose: LuniPoseKey; title: string; subtitle: string }> = [
    { pose: 'wave', title: 'Wave', subtitle: 'Says hi!' },
    { pose: 'curious', title: 'Think', subtitle: 'Thinking...' },
    { pose: 'point', title: 'Point', subtitle: 'Shows you the way' },
    { pose: 'celebrate', title: 'Celebrate', subtitle: 'You did it!' },
    { pose: 'sleep', title: 'Sleep', subtitle: 'Taking a rest' },
  ];

  const quickQuestions = [
    {
      q: 'How does the CTRL Quiz work?',
      a: 'The CTRL Quiz has 5 progressive levels (99 total questions across True/False, Multiple Choice, Matching, Sequencing, and Identification). It measures your knowledge equally across NT, BA, and SM tracks!',
    },
    {
      q: 'Show me popular career tracks',
      a: 'In NT: Network Engineer, Cloud Solutions, Cybersecurity. In BA: Data Analyst, BI Specialist. In SM: IT Service Manager, CX Consultant.',
    },
    {
      q: 'What is Service Management?',
      a: 'SM focuses on how people, processes, and technology work together! It uses frameworks like ITIL to make IT services reliable, seamless, and customer-centered.',
    },
    {
      q: 'Give me a study tip!',
      a: 'Take your time and explore each track without pressure. Remember: CTRL+PATH provides insights, but the final choice is always yours!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Banner with Sky Background */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
          <img
            src={BACKGROUNDS.dashboardSkyKingdom}
            alt=""
            className="w-full h-full object-cover pixelated"
          />
          <div className="absolute inset-0 bg-linear-to-r from-blue-900/50 via-indigo-900/40 to-purple-900/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Luni & Welcome Dialogue Banner */}
          <div className="absolute inset-0 z-10 p-5 sm:p-6 flex items-center gap-4 text-white">
            <div className="relative shrink-0">
              <LuniSprite pose={selectedMood} size={110} animate glow />
            </div>
            <div className="bg-white/95 text-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md max-w-md border border-white">
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-base mb-1">
                <span>Meet Luni, Your Moonstone Guide</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-sparkle-spin" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hi there! I'm Luni, your guidance companion. I'll be with you throughout your journey,
                helping you explore tracks, learn concepts, and discover exciting possibilities! 🌙✨
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              How would you like to start?
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/tracks');
                }}
                className="p-3.5 rounded-xl border border-blue-100 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition-all text-left flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800">Explore Tracks</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Learn about NT, BA & SM</div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/quiz');
                }}
                className="p-3.5 rounded-xl border border-purple-100 hover:border-purple-300 bg-purple-50/50 hover:bg-purple-50 transition-all text-left flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800">Take the Quiz</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Assess your strengths</div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/compare');
                }}
                className="p-3.5 rounded-xl border border-emerald-100 hover:border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-left flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800">Compare Paths</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Side-by-side matrices</div>
              </button>

              <button
                onClick={onClose}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800">Explore on my own</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Browse at your pace</div>
              </button>
            </div>
          </div>

          {/* Quick Questions and answers */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Frequently Asked Guidance
            </h4>
            <div className="space-y-2">
              {quickQuestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTip(selectedTip === item.q ? null : item.q)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer"
                >
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="text-indigo-600 text-xs font-bold">
                      {selectedTip === item.q ? 'Hide' : 'Read'}
                    </span>
                  </div>
                  {selectedTip === item.q && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2 animate-in fade-in">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Luni's Little Moods Gallery */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Luni's Moods (Click to preview pose)
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {moodExamples.map((m) => (
                <button
                  key={m.pose}
                  onClick={() => setSelectedMood(m.pose)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedMood === m.pose
                      ? 'border-indigo-500 bg-indigo-50 shadow-xs ring-1 ring-indigo-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-12 flex items-center justify-center">
                    <LuniSprite pose={m.pose} size={44} animate={selectedMood === m.pose} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">{m.title}</div>
                  <div className="text-[9px] text-slate-500">{m.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Batangas State University – Alangilan BSIT Guidance System</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
