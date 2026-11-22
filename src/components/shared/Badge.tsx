import React from 'react';
import { TrackCode } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'nt' | 'ba' | 'sm' | 'neutral' | 'gem';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    nt: 'bg-blue-50 dark:bg-[#111e3b] text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70 font-bold',
    ba: 'bg-violet-50 dark:bg-[#1e1338] text-violet-700 dark:text-[#c4b5fd] border border-violet-200/80 dark:border-purple-800/70 font-bold',
    sm: 'bg-emerald-50 dark:bg-[#0c2419] text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/70 font-bold',
    neutral: 'bg-slate-100 dark:bg-[#131d33] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-medium',
    gem: 'bg-amber-50 dark:bg-[#241c08] text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/70 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const TrackBadge: React.FC<{ code: TrackCode; size?: 'sm' | 'md'; compact?: boolean }> = ({
  code,
  size = 'md',
  compact = false,
}) => {
  const trackMap = {
    NT: {
      label: 'Networking Technology',
      variant: 'nt' as const,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="4" fill="#2563EB" />
          <path d="M4 8h8M8 4v8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="4" cy="8" r="1.2" fill="#93C5FD" />
          <circle cx="12" cy="8" r="1.2" fill="#93C5FD" />
          <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
        </svg>
      ),
    },
    BA: {
      label: 'Business Analytics',
      variant: 'ba' as const,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="4" fill="#7C3AED" />
          <path d="M4 11l2.5-3.5 2 2 3.5-5" stroke="#FDE047" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="4.5" r="1" fill="#FDE047" />
        </svg>
      ),
    },
    SM: {
      label: 'Service Management',
      variant: 'sm' as const,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="4" fill="#059669" />
          <circle cx="8" cy="8" r="4" stroke="#A7F3D0" strokeWidth="1" strokeDasharray="1.5 1.5" />
          <path d="M6 8l1.5 1.5 3-3" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  };

  const item = trackMap[code];

  return (
    <Badge variant={item.variant} size={size} className="whitespace-nowrap shrink-0">
      {item.icon}
      <span className="font-extrabold">{code}</span>
      {!compact && <span className="hidden sm:inline font-medium">· {item.label}</span>}
    </Badge>
  );
};
