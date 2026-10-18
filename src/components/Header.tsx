'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Menu,
  Calendar,
  Zap,
  Plus,
  FileSpreadsheet,
  UserCheck,
  ChevronDown,
  Building,
  RefreshCw,
  Download,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { formatDateDDMMYYYY, getTodayString } from '@/lib/dateUtils';
import { triggerPwaInstall } from '@/components/pwa/PwaController';
import { SyncBadge } from '@/components/sync/SyncBadge';

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentUser: UserProfile;
  onSwitchUser?: (user: UserProfile) => void;
  onOpenMobileNav: () => void;
  onQuickAction: (action: 'quick-entry' | 'add-entry' | 'reports') => void;
  onResetData: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  currentUser,
  onSwitchUser,
  onOpenMobileNav,
  onQuickAction,
  onResetData,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
      {/* Left: Mobile Menu & Date Switcher */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={onOpenMobileNav}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
            <Image
              src="/images/logo.png"
              alt="Premium Packaging Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded"
            />
          </div>
        </div>

        {/* Date Selector Badge & Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Active Date:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {formatDateDDMMYYYY(selectedDate)}
            </span>
            {isToday && (
              <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                TODAY
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isToday && (
              <button
                onClick={() => onSelectDate(todayStr)}
                className="px-2 py-1 text-xs font-medium rounded bg-white dark:bg-slate-700 shadow-xs hover:bg-slate-50 text-slate-700 dark:text-slate-200"
                title="Jump to today's date"
              >
                Today
              </button>
            )}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-emerald-500"
              title="Change active date"
            />
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons & User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-Time Offline & Cloud Sync Indicator */}
        <SyncBadge />

        {/* Install PWA Button */}
        <button
          onClick={() => triggerPwaInstall()}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors"
          title="Install desktop / mobile app"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {/* Quick Multi-Entry Button */}
        <button
          onClick={() => onQuickAction('quick-entry')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Quick Entry</span>
        </button>

        {/* Add Production Entry Button */}
        <button
          onClick={() => onQuickAction('add-entry')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Record Production</span>
        </button>

        {/* User Switcher Dropdown (Allows testing Supervisor vs Manager vs Admin roles seamlessly) */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.fullName[0]}
            </div>
            <div className="hidden xl:block text-xs leading-tight">
              <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                {currentUser.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {currentUser.designation}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.fullName[0]}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
                  <span>Role / Clearance:</span>
                  <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                  <span>Employee ID:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {currentUser.employeeId || 'EMP-ADMIN'}
                  </span>
                </div>
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-col gap-1">
                {onLogout && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sign Out & Switch Account</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
