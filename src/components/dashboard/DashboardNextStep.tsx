import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Compass, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { LuniSprite } from '../luni/LuniSprite';
import type { DashboardNextActivity } from './DashboardHero';

const CrossroadsSignpostIllustration: React.FC = () => (
  <div className="relative w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-linear-to-b from-sky-200 to-indigo-100 flex items-center justify-center select-none">
    <svg viewBox="0 0 120 80" className="w-full h-full pixelated" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#BAE6FD" />
      <circle cx="20" cy="20" r="14" fill="#E0F2FE" />
      <circle cx="36" cy="16" r="16" fill="#E0F2FE" />
      <circle cx="50" cy="22" r="12" fill="#E0F2FE" />
      <path d="M-10 60 Q60 52 130 60 L130 90 L-10 90 Z" fill="#65A30D" />
      <path d="M-10 68 Q60 62 130 68 L130 90 L-10 90 Z" fill="#78350F" />
      <rect x="56" y="24" width="8" height="42" fill="#92400E" stroke="#78350F" strokeWidth="1" />
      <path d="M40 28 L78 28 L84 34 L78 40 L40 40 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      <text x="44" y="36.5" fill="#78350F" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">KNOWLEDGE</text>
      <path d="M36 42 L72 42 L78 47 L72 52 L36 52 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      <text x="40" y="49.5" fill="#78350F" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">PRACTICE</text>
      <path d="M42 54 L84 54 L90 59 L84 64 L42 64 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      <text x="46" y="61.5" fill="#78350F" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">BRIGHTER PATHS</text>
      <circle cx="30" cy="58" r="2" fill="#F43F5E" />
      <circle cx="92" cy="59" r="2.5" fill="#FBBF24" />
      <circle cx="86" cy="62" r="2" fill="#FFFFFF" />
    </svg>
  </div>
);

interface DashboardNextStepProps {
  nextActivity: DashboardNextActivity;
}

export const DashboardNextStep: React.FC<DashboardNextStepProps> = ({ nextActivity }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-slate-900 font-black text-sm mb-3">
        <Compass className="w-4 h-4 text-blue-600" />
        <span>Today's Next Step</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
        <CrossroadsSignpostIllustration />

        <div className="flex-1 space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            {nextActivity.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {nextActivity.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>5 min</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              Career Insight
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
              +1 Gemstone
            </span>
          </div>
        </div>

        <Link to={nextActivity.route} className="shrink-0 w-full sm:w-auto">
          <Button
            variant={nextActivity.trackCode === 'SM' ? 'sm' : 'primary'}
            size="md"
            className="w-full sm:w-auto"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Start Exploring
          </Button>
        </Link>
      </div>
    </Card>

    <Card className="p-6 border-indigo-100 bg-linear-to-br from-indigo-50/40 via-purple-50/30 to-white flex flex-col justify-between">
      <div className="flex items-center gap-2 text-indigo-950 font-black text-xs mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-spin" />
        <span>A little reminder from Luni...</span>
      </div>

      <div className="flex items-center gap-3 my-auto py-2">
        <div className="shrink-0">
          <LuniSprite pose="sit" size={56} animate />
        </div>
        <p className="text-xs text-slate-700 leading-relaxed italic">
          "Progress isn't about being perfect, it's about showing up. You're doing great! 🌙✨"
        </p>
      </div>

      <div className="pt-2 border-t border-indigo-100/60 text-[11px] text-indigo-600 font-extrabold text-right">
        Moonstone Guide
      </div>
    </Card>
  </div>
);
