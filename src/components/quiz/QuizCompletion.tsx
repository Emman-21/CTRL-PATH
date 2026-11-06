import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { LuniCharacter } from '../luni/LuniCharacter';
import { QuizScoreResult } from '../../types/quiz';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { TRACKS_DATA } from '../../data/tracks';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export interface QuizCompletionProps {
  scoreResult: QuizScoreResult;
  firstSparkUnlocked?: boolean;
  onRetake: () => void;
}

export const QuizCompletion: React.FC<QuizCompletionProps> = ({
  scoreResult,
  firstSparkUnlocked = false,
  onRetake,
}) => {
  const navigate = useNavigate();

  const ntGem = GEMSTONE_ASSETS.find((g) => g.id === 1);
  const baGem = GEMSTONE_ASSETS.find((g) => g.id === 6);
  const smGem = GEMSTONE_ASSETS.find((g) => g.id === 11);
  const firstSparkGem = GEMSTONE_ASSETS.find((g) => g.id === 16);

  const highestTrackInfo = TRACKS_DATA[scoreResult.highestTrack];

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-200">
      <Card padding="lg" className="border-indigo-100 shadow-xl text-center relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-linear-to-b from-blue-300/15 via-purple-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Luni Celebration */}
        <div className="relative z-10 flex justify-center mb-3">
          <LuniCharacter state="celebrating" size={104} animate glow />
        </div>

        {/* First Spark Achievement Toast if newly unlocked */}
        {firstSparkUnlocked && firstSparkGem && (
          <div className="relative z-10 mb-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-center gap-3 animate-bounce duration-1000">
            <img
              src={firstSparkGem.url}
              alt={firstSparkGem.name}
              className="w-10 h-10 object-contain pixelated drop-shadow-sm"
            />
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                Achievement Unlocked!
              </div>
              <div className="text-xs font-black text-slate-900">{firstSparkGem.name}</div>
              <div className="text-[11px] text-slate-500">First completed assessment journey</div>
            </div>
          </div>
        )}

        <div className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Assessment Completed!</span>
        </div>

        <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          Bravo, Luminary!
        </h2>

        <p className="relative z-10 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          You've completed all 5 Chapters of the CTRL Quiz. Your answers have been objectively scored across
          Networking Technology, Business Analytics, and Service Management.
        </p>

        {/* Three Gemstone Score Displays */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 text-center">
          {/* NT Track */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col items-center">
            {ntGem && (
              <img
                src={ntGem.url}
                alt="NT Gemstone"
                className="w-12 h-12 object-contain pixelated drop-shadow-xs mb-1"
              />
            )}
            <div className="text-xs font-bold text-blue-700">Networking Technology</div>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{scoreResult.ntPercentage}%</div>
            <div className="text-[10px] text-slate-500">
              {scoreResult.ntRaw} / {scoreResult.ntTotal} scored units
            </div>
          </div>

          {/* BA Track */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col items-center">
            {baGem && (
              <img
                src={baGem.url}
                alt="BA Gemstone"
                className="w-12 h-12 object-contain pixelated drop-shadow-xs mb-1"
              />
            )}
            <div className="text-xs font-bold text-purple-700">Business Analytics</div>
            <div className="text-2xl font-black text-purple-900 mt-0.5">{scoreResult.baPercentage}%</div>
            <div className="text-[10px] text-slate-500">
              {scoreResult.baRaw} / {scoreResult.baTotal} scored units
            </div>
          </div>

          {/* SM Track */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center">
            {smGem && (
              <img
                src={smGem.url}
                alt="SM Gemstone"
                className="w-12 h-12 object-contain pixelated drop-shadow-xs mb-1"
              />
            )}
            <div className="text-xs font-bold text-emerald-700">Service Management</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{scoreResult.smPercentage}%</div>
            <div className="text-[10px] text-slate-500">
              {scoreResult.smRaw} / {scoreResult.smTotal} scored units
            </div>
          </div>
        </div>

        {/* Highest Demonstrated Performance Highlight */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              {scoreResult.isTie ? 'Balanced Multi-Track Aptitude' : 'Highest Demonstrated Knowledge'}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {scoreResult.isTie ? (
              <span>
                Your responses showed an equal tie between{' '}
                <strong>{scoreResult.tiedTracks?.join(' & ')}</strong>! You demonstrate versatile foundational
                comprehension.
              </span>
            ) : (
              <span>
                Your responses showed the highest alignment in{' '}
                <strong className="text-blue-700">{highestTrackInfo.name}</strong> ({highestTrackInfo.tagline}).
              </span>
            )}
          </p>

          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-200/60 pt-2 leading-relaxed">
            Remember: This score is an exploration insight, not an assignment. You retain full freedom to select
            whichever BSIT track inspires your future!
          </p>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/results')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="w-full sm:w-auto"
          >
            Explore Smart Results
          </Button>

          {scoreResult.attemptNumber < 3 && (
            <Button
              variant="outline"
              size="md"
              onClick={onRetake}
              icon={<RotateCcw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Start Retake (Attempt {scoreResult.attemptNumber + 1}/3)
            </Button>
          )}

          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Return to Luminary Hub
          </Button>
        </div>
      </Card>
    </div>
  );
};
