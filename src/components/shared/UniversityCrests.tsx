import React from 'react';
import { UNIVERSITY_LOGOS } from '../../assets/manifest';

type CrestSize = 'xs' | 'sm' | 'md' | 'lg';

interface UniversityCrestsProps {
  size?: CrestSize;
  gapClassName?: string;
  className?: string;
}

const SIZE_CLASSES: Record<CrestSize, string> = {
  xs: 'w-6 h-6 p-0.5',
  sm: 'w-8 h-8 p-0.5',
  md: 'w-11 h-11 p-0.5',
  lg: 'w-14 h-14 p-1',
};

export const UniversityCrests: React.FC<UniversityCrestsProps> = ({
  size = 'sm',
  gapClassName = 'gap-1.5',
  className = '',
}) => {
  const dimensionClass = SIZE_CLASSES[size];

  return (
    <div className={`inline-flex items-center shrink-0 ${gapClassName} ${className}`}>
      <div
        className={`${dimensionClass} rounded-full bg-[var(--surface-raised)] dark:bg-[#ffffff] border border-[var(--border)] dark:border-slate-700/80 shadow-xs overflow-hidden flex items-center justify-center shrink-0`}
        title={UNIVERSITY_LOGOS.bsuAlangilan.label}
      >
        <img
          src={UNIVERSITY_LOGOS.bsuAlangilan.url}
          alt={UNIVERSITY_LOGOS.bsuAlangilan.alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain select-none mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
      <div
        className={`${dimensionClass} rounded-full bg-[var(--surface-raised)] dark:bg-[#ffffff] border border-[var(--border)] dark:border-slate-700/80 shadow-xs overflow-hidden flex items-center justify-center shrink-0`}
        title={UNIVERSITY_LOGOS.cicsAlangilan.label}
      >
        <img
          src={UNIVERSITY_LOGOS.cicsAlangilan.url}
          alt={UNIVERSITY_LOGOS.cicsAlangilan.alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain select-none mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
    </div>
  );
};
