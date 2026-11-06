import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  variant?: 'primary' | 'nt' | 'ba' | 'sm';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barStyles = {
    primary: 'bg-blue-600',
    nt: 'bg-blue-600',
    ba: 'bg-violet-600',
    sm: 'bg-emerald-600',
  };

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} ${barStyles[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
};
