'use client';

import React from 'react';
import { WeightStatus } from '@/types';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface ToleranceBadgeProps {
  status: WeightStatus;
  label?: string;
  unitDiff?: number;
  percentageDiff?: number;
  compact?: boolean;
}

export const ToleranceBadge: React.FC<ToleranceBadgeProps> = ({
  status,
  label,
  unitDiff,
  percentageDiff,
  compact = false,
}) => {
  switch (status) {
    case 'within_tolerance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
          title="Within approved weight tolerance"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {label || (percentageDiff !== undefined ? `${percentageDiff >= 0 ? '+' : ''}${percentageDiff.toFixed(1)}% (Pass)` : 'In Spec')}
          </span>
        </span>
      );

    case 'warning':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
          title="Approaching tolerance limit"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            {label || (percentageDiff !== undefined ? `${percentageDiff >= 0 ? '+' : ''}${percentageDiff.toFixed(1)}% (Warning)` : 'Near Limit')}
          </span>
        </span>
      );

    case 'outside_tolerance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-pulse ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
          title="Weight is outside acceptable tolerance limits"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>
            {label || (percentageDiff !== undefined ? `${percentageDiff >= 0 ? '+' : ''}${percentageDiff.toFixed(1)}% (Out of Spec)` : 'Out of Spec')}
          </span>
        </span>
      );

    case 'incomplete':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
          title="Incomplete measurements or specification data"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{label || 'Incomplete'}</span>
        </span>
      );
  }
};
