import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Layers,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import type { TrackCode, TrackInfo } from '../../types';

interface CompareTrackCardProps {
  code: TrackCode;
  track: TrackInfo;
  trackScore: number | null;
}

export const CompareTrackCard: React.FC<CompareTrackCardProps> = ({
  code,
  track,
  trackScore,
}) => {
  const headerTheme = {
    NT: 'bg-blue-600 text-white',
    BA: 'bg-violet-600 text-white',
    SM: 'bg-emerald-600 text-white',
  };

  const borderTheme = {
    NT: 'border-blue-200 hover:border-blue-300',
    BA: 'border-violet-200 hover:border-violet-300',
    SM: 'border-emerald-200 hover:border-emerald-300',
  };

  return (
    <Card className={`flex flex-col space-y-6 border-2 transition-all ${borderTheme[code]}`}>
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs ${headerTheme[code]}`}
          >
            {code}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg leading-tight">{track.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{track.tagline}</p>
          </div>
        </div>

        <img
          src={track.introAchievement.gemstoneUrl}
          alt={track.introAchievement.name}
          className="w-10 h-10 object-contain pixelated shrink-0 drop-shadow-xs"
          title={track.introAchievement.name}
        />
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

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Key Curriculum Subjects</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {track.keySubjects.map((subj, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60"
            >
              {subj}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-slate-500" />
          <span>Technical Skills & Tools</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {track.coreSkills
            .flatMap((c) => c.skills)
            .slice(0, 6)
            .map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs"
              >
                {skill}
              </span>
            ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Real-World Hands-on Project</span>
        </h4>
        {track.realWorldApplications[0] && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900">
              {track.realWorldApplications[0].title}
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {track.realWorldApplications[0].scenario}
            </p>
            <div className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
              Impact: {track.realWorldApplications[0].impact}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Sample Career Pathways</span>
        </h4>
        <div className="space-y-2">
          {track.possibleCareers.slice(0, 3).map((job, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex flex-col justify-between"
            >
              <div className="font-bold text-slate-900">{job.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{job.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Work Environment & Dynamics</span>
        </h4>
        <div className="space-y-1.5 text-xs text-slate-600">
          {track.workStyle.map((style, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <span className="leading-snug">{style}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
          Best Fit For Students Who...
        </h4>
        <div className="space-y-2">
          {track.bestFitTraits.slice(0, 3).map((trait, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{trait}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Link to="/tracks">
          <Button variant="outline" size="sm" className="w-full justify-center">
            Explore {track.name} Modules →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
