import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderAccent?: 'none' | 'nt' | 'ba' | 'sm';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  borderAccent = 'none',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const accentStyles = {
    none: 'border-[var(--border)] dark:border-slate-800',
    nt: 'border-blue-200 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-700',
    ba: 'border-purple-200 dark:border-purple-900/70 hover:border-purple-400 dark:hover:border-purple-700',
    sm: 'border-emerald-200 dark:border-emerald-900/70 hover:border-emerald-400 dark:hover:border-emerald-700',
  };

  return (
    <div
      className={`bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border shadow-xs transition-all duration-200 ${accentStyles[borderAccent]} ${paddingStyles[padding]} ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
