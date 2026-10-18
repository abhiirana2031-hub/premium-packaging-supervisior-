'use client';

import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileStatusBarProps {
  dark?: boolean;
}

export function MobileStatusBar({ dark = false }: MobileStatusBarProps) {
  return (
    <div
      className={`w-full flex items-center justify-between px-6 pt-3 pb-1 select-none text-xs font-semibold tracking-tight transition-colors ${
        dark ? 'text-white' : 'text-slate-800'
      }`}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Cellular Signal (4 bars) */}
        <div className="flex items-end gap-0.5 h-2.5">
          <div className={`w-0.5 h-1 rounded-xs ${dark ? 'bg-white' : 'bg-slate-800'}`} />
          <div className={`w-0.5 h-1.5 rounded-xs ${dark ? 'bg-white' : 'bg-slate-800'}`} />
          <div className={`w-0.5 h-2 rounded-xs ${dark ? 'bg-white' : 'bg-slate-800'}`} />
          <div className={`w-0.5 h-2.5 rounded-xs ${dark ? 'bg-white' : 'bg-slate-800'}`} />
        </div>
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <Battery className="w-4 h-4 stroke-[2.2] fill-current" />
      </div>
    </div>
  );
}
