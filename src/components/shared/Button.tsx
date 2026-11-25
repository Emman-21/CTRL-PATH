import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'nt' | 'ba' | 'sm';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-11 md:min-h-0 gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-11 md:min-h-0 gap-2',
    lg: 'text-base px-6 py-3 min-h-11 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-[#131d33] dark:hover:bg-[#1c2b4a] dark:text-slate-100 dark:border dark:border-slate-700/80',
    outline:
      'border border-[var(--border)] hover:border-slate-300 bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-raised)] focus:ring-blue-400 dark:border-slate-700 dark:hover:border-slate-600 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-[#16223e]',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#16223e]',
    nt:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-400',
    ba:
      'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow focus:ring-violet-400',
    sm:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow focus:ring-emerald-400',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
