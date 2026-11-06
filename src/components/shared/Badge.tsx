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
    nt: 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold',
    ba: 'bg-violet-50 text-violet-700 border border-violet-200/80 font-bold',
    sm: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80 font-medium',
    gem: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const TrackBadge: React.FC<{ code: TrackCode; size?: 'sm' | 'md' }> = ({ code, size = 'md' }) => {
  const trackMap = {
    NT: { label: 'Networking Technology', variant: 'nt' as const },
    BA: { label: 'Business Analytics', variant: 'ba' as const },
    SM: { label: 'Service Management', variant: 'sm' as const },
  };

  const item = trackMap[code];

  return (
    <Badge variant={item.variant} size={size}>
      <span className="font-extrabold">{code}</span>
      <span className="hidden sm:inline font-medium">· {item.label}</span>
    </Badge>
  );
};
