'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  unit?: string;
  icon: LucideIcon;
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo';
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'negative' | 'neutral';
  };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  unit,
  icon: Icon,
  variant = 'default',
  badge,
  onClick,
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      accentGlow: 'hover:border-slate-300 dark:hover:border-slate-700',
    },
    emerald: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-emerald-200/80 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      accentGlow: 'hover:border-emerald-300 dark:hover:border-emerald-800 shadow-sm',
    },
    amber: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      accentGlow: 'hover:border-amber-300 dark:hover:border-amber-800 shadow-sm',
    },
    rose: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-rose-200/80 dark:border-rose-900/50',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      accentGlow: 'hover:border-rose-300 dark:hover:border-rose-800 shadow-sm',
    },
    indigo: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-indigo-200/80 dark:border-indigo-900/50',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      accentGlow: 'hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm',
    },
  }[variant];

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    negative: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[badge?.variant || 'neutral'];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${variantStyles.bg} ${variantStyles.border} ${variantStyles.accentGlow} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg shrink-0 ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </span>
          )}
          {badge && (
            <span
              className={`ml-auto font-medium px-2 py-0.5 rounded-full border text-[11px] ${badgeStyles}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
