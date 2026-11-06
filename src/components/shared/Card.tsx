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
    none: 'border-slate-100/90',
    nt: 'border-blue-200 hover:border-blue-400',
    ba: 'border-purple-200 hover:border-purple-400',
    sm: 'border-emerald-200 hover:border-emerald-400',
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-xs transition-all duration-200 ${accentStyles[borderAccent]} ${paddingStyles[padding]} ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
