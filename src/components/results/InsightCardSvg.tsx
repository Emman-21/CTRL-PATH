import React, { useId } from 'react';
import type { TrackCode } from '../../types';

export interface InsightCardSvgProps {
  kind: 'strength' | 'growth';
  title: string;
  track: TrackCode;
}

const CONTAINER_CLASSES: Record<TrackCode, string> = {
  NT: 'bg-blue-50/90 dark:bg-[#0f1f42] border-blue-200/80 dark:border-blue-800/70',
  BA: 'bg-violet-50/90 dark:bg-[#1e1338] border-violet-200/80 dark:border-purple-800/70',
  SM: 'bg-emerald-50/90 dark:bg-[#0c2419] border-emerald-200/80 dark:border-emerald-800/70',
};

export const InsightCardSvg: React.FC<InsightCardSvgProps> = ({ kind, title, track }) => {
  const uid = useId().replace(/:/g, '');

  const renderGraphic = () => {
    if (kind === 'strength') {
      if (title.includes('Protocol') || (track === 'NT' && !title.includes('Mindset'))) {
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-nt-s`} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="16" stroke="#60A5FA" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="10" y1="13" x2="30" y2="13" stroke="#60A5FA" strokeWidth="1.6" />
            <line x1="10" y1="13" x2="20" y2="29" stroke="#3B82F6" strokeWidth="1.6" />
            <line x1="30" y1="13" x2="20" y2="29" stroke="#3B82F6" strokeWidth="1.6" />
            <circle cx="10" cy="13" r="3" fill="#2563EB" stroke="#BFDBFE" strokeWidth="1.2" />
            <circle cx="30" cy="13" r="3" fill="#2563EB" stroke="#BFDBFE" strokeWidth="1.2" />
            <circle cx="20" cy="29" r="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.2" />
            <path d="M20 9L26 11.5C26 17 23.2 21.3 20 23.5C16.8 21.3 14 17 14 11.5L20 9Z" fill={`url(#${uid}-nt-s)`} stroke="#DBEAFE" strokeWidth="1.2" />
            <path d="M17.8 16L19.4 17.6L22.5 14.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      }

      if (title.includes('Quantitative') || (track === 'BA' && !title.includes('Mindset'))) {
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-ba-s`} x1="8" y1="32" x2="32" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect x="6" y="7" width="28" height="26" rx="5" fill="#4C1D95" fillOpacity="0.16" stroke="#A78BFA" strokeOpacity="0.5" strokeWidth="1.2" />
            <rect x="10" y="21" width="4" height="8" rx="1.5" fill="#A78BFA" />
            <rect x="16" y="17" width="4" height="12" rx="1.5" fill="#8B5CF6" />
            <rect x="22" y="13" width="4" height="16" rx="1.5" fill={`url(#${uid}-ba-s)`} />
            <rect x="28" y="10" width="4" height="19" rx="1.5" fill="#38BDF8" />
            <path d="M10 18L17 14L23 11L30 8" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="30" cy="8" r="2.2" fill="#FDE047" />
          </svg>
        );
      }

      if (title.includes('Process') || (track === 'SM' && !title.includes('Mindset'))) {
        return (
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-sm-s`} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <g transform="translate(17 20)">
              <rect x="-2.5" y="-11" width="5" height="22" rx="1.5" fill={`url(#${uid}-sm-s)`} />
              <rect x="-2.5" y="-11" width="5" height="22" rx="1.5" fill={`url(#${uid}-sm-s)`} transform="rotate(45)" />
              <rect x="-2.5" y="-11" width="5" height="22" rx="1.5" fill={`url(#${uid}-sm-s)`} transform="rotate(90)" />
              <rect x="-2.5" y="-11" width="5" height="22" rx="1.5" fill={`url(#${uid}-sm-s)`} transform="rotate(135)" />
              <circle cx="0" cy="0" r="7.5" fill="#059669" stroke="#A7F3D0" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
            </g>
            <path d="M28 8L34 10.2C34 15.2 31.3 19.2 28 21.2C24.7 19.2 22 15.2 22 10.2L28 8Z" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1.2" />
            <path d="M25.8 14.3L27.4 15.9L30.4 12.9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      }

      // Fallback strength: Curious Exploratory Mindset
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="14" stroke="#60A5FA" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="20" cy="20" r="10" fill="#2563EB" fillOpacity="0.16" stroke="#818CF8" strokeWidth="1.4" />
          <polygon points="20,9 23.2,16.8 31,20 23.2,23.2 20,31 16.8,23.2 9,20 16.8,16.8" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1" />
          <circle cx="20" cy="20" r="2.2" fill="#1E293B" />
        </svg>
      );
    }

    // Growth opportunity cards
    if (title.includes('Subnetting') || (track === 'NT' && !title.includes('Capstone'))) {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="28" height="20" rx="4.5" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.4" />
          <rect x="9" y="14" width="22" height="12" rx="2" fill="#0F172A" />
          <path d="M15 17L12.5 20L15 23" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25 17L27.5 20L25 23" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="21.5" y1="16.5" x2="18.5" y2="23.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11" cy="7.5" r="2" fill="#60A5FA" />
          <circle cx="29" cy="7.5" r="2" fill="#34D399" />
          <line x1="11" y1="9.5" x2="11" y2="10" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="29" y1="9.5" x2="29" y2="10" stroke="#34D399" strokeWidth="1.5" />
        </svg>
      );
    }

    if (title.includes('SQL') || (track === 'BA' && !title.includes('Capstone'))) {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          <ellipse cx="17" cy="12" rx="9" ry="3.5" fill="#A855F7" stroke="#E9D5FF" strokeWidth="1.2" />
          <path d="M8 12V20C8 21.9 12 23.5 17 23.5C22 23.5 26 21.9 26 20V12" fill="#7E22CE" fillOpacity="0.85" stroke="#DDD6FE" strokeWidth="1.2" />
          <path d="M8 20V28C8 29.9 12 31.5 17 31.5C22 31.5 26 29.9 26 28V20" fill="#581C87" fillOpacity="0.9" stroke="#C4B5FD" strokeWidth="1.2" />
          <circle cx="27" cy="25" r="5.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.8" />
          <line x1="31" y1="29" x2="35" y2="33" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24.8 26.2L26.5 24.4L27.8 25.4L29.5 23.2" stroke="#FDE047" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (title.includes('ITIL') || (track === 'SM' && !title.includes('Capstone'))) {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          <rect x="8" y="7" width="24" height="26" rx="4.5" fill="#064E3B" stroke="#34D399" strokeWidth="1.4" />
          <rect x="14" y="5" width="12" height="5" rx="2" fill="#10B981" stroke="#A7F3D0" strokeWidth="1" />
          <circle cx="14" cy="16" r="2.2" fill="#34D399" />
          <line x1="18.5" y1="16" x2="28" y2="16" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14" cy="22" r="2.2" fill="#FBBF24" />
          <line x1="18.5" y1="22" x2="26.5" y2="22" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14" cy="28" r="2.2" fill="#38BDF8" />
          <line x1="18.5" y1="28" x2="28" y2="28" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    // Fallback growth: Cross-Track Capstone Synthesis
    return (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
        <circle cx="12" cy="13" r="3.5" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="1.2" />
        <circle cx="28" cy="13" r="3.5" fill="#8B5CF6" stroke="#EDE9FE" strokeWidth="1.2" />
        <circle cx="20" cy="29" r="3.5" fill="#10B981" stroke="#D1FAE5" strokeWidth="1.2" />
        <line x1="14.8" y1="15" x2="20" y2="20" stroke="#93C5FD" strokeWidth="1.5" />
        <line x1="25.2" y1="15" x2="20" y2="20" stroke="#C4B5FD" strokeWidth="1.5" />
        <line x1="20" y1="25.5" x2="20" y2="20" stroke="#6EE7B7" strokeWidth="1.5" />
        <polygon points="20,15 24,20 20,25 16,20" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.2" />
      </svg>
    );
  };

  return (
    <div
      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${CONTAINER_CLASSES[track]}`}
      aria-hidden="true"
    >
      {renderGraphic()}
    </div>
  );
};
