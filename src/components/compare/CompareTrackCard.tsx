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
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  NtPixelArt,
  BaPixelArt,
  SmPixelArt,
} from '../shared/PixelArt';
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
  const borderTheme = {
    NT: 'border-blue-200 dark:border-blue-900/70 hover:border-blue-300 dark:hover:border-blue-700',
    BA: 'border-violet-200 dark:border-purple-900/70 hover:border-violet-300 dark:hover:border-purple-700',
    SM: 'border-emerald-200 dark:border-emerald-900/70 hover:border-emerald-300 dark:hover:border-emerald-700',
  };

  return (
    <Card className={`flex flex-col space-y-6 border-2 transition-all ${borderTheme[code]}`}>
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {code === 'NT' ? (
            <NtTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
          ) : code === 'BA' ? (
            <BaTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
          ) : (
            <SmTrackBadge size={48} className="shrink-0 rounded-2xl shadow-xs" />
          )}
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg leading-tight">{track.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{track.tagline}</p>
          </div>
        </div>

        <img
          src={track.introAchievement.gemstoneUrl}
          alt={track.introAchievement.name}
          className="w-10 h-10 object-contain pixelated shrink-0 drop-shadow-xs"
          title={track.introAchievement.name}
        />
      </div>

      <div
        className={`h-16 flex items-center justify-center rounded-xl overflow-hidden border ${
          code === 'NT'
            ? 'bg-[var(--accent-nt-tint)] dark:bg-linear-to-b dark:from-blue-950/50 dark:to-slate-900 border-[var(--accent-nt-border)] dark:border-blue-900/40'
            : code === 'BA'
            ? 'bg-[var(--accent-ba-tint)] dark:bg-linear-to-b dark:from-purple-950/50 dark:to-slate-900 border-[var(--accent-ba-border)] dark:border-purple-900/40'
            : 'bg-[var(--accent-sm-tint)] dark:bg-linear-to-b dark:from-emerald-950/50 dark:to-slate-900 border-[var(--accent-sm-border)] dark:border-emerald-900/40'
        }`}
      >
        <div className="scale-85 origin-center">
          {code === 'NT' ? (
            <NtPixelArt size="sm" />
          ) : code === 'BA' ? (
            <BaPixelArt size="sm" />
          ) : (
            <SmPixelArt size="sm" />
          )}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1222]/90 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Your Quiz Alignment:</span>
          </span>
          <span className="font-black text-slate-900 dark:text-slate-100">
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
            className="touch-target-44 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline block pt-1"
          >
            Take quiz to measure alignment →
          </Link>
        )}
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Key Curriculum Subjects</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {track.keySubjects.map((subj, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#131d33] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/80"
            >
              {subj}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Technical Skills & Tools</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {track.coreSkills
            .flatMap((c) => c.skills)
            .slice(0, 6)
            .map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-[var(--surface)] dark:bg-[#131d33] border border-[var(--border)] dark:border-slate-700/80 text-[var(--text)] dark:text-slate-200 text-[11px] font-medium shadow-2xs"
              >
                {skill}
              </span>
            ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Real-World Hands-on Project</span>
        </h4>
        {track.realWorldApplications[0] && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900 dark:text-slate-100">
              {track.realWorldApplications[0].title}
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {track.realWorldApplications[0].scenario}
            </p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/80">
              Impact: {track.realWorldApplications[0].impact}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Sample Career Pathways</span>
        </h4>
        <div className="space-y-2">
          {track.possibleCareers.slice(0, 3).map((job, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b1222]/85 border border-slate-200/60 dark:border-slate-700/80 text-xs flex flex-col justify-between"
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">{job.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{job.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Work Environment & Dynamics</span>
        </h4>
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {track.workStyle.map((style, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-1.5" />
              <span className="leading-snug">{style}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
          Best Fit For Students Who...
        </h4>
        <div className="space-y-2">
          {track.bestFitTraits.slice(0, 3).map((trait, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
