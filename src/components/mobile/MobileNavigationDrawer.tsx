'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Home,
  PlusSquare,
  History,
  Package,
  Layers,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Download,
} from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { UserProfile } from '@/types';
import { triggerPwaInstall } from '@/components/pwa/PwaController';

export type MobileScreenView =
  | 'login'
  | 'profile_setup'
  | 'dashboard'
  | 'quick_entry'
  | 'production_list'
  | 'item_details'
  | 'categories'
  | 'item_master'
  | 'history'
  | 'analytics'
  | 'reports'
  | 'generate_report'
  | 'pdf_preview'
  | 'export_options'
  | 'more_menu';

interface MobileNavigationDrawerProps {
  currentUser: UserProfile;
  onNavigate: (screen: MobileScreenView) => void;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNavigationDrawer({
  currentUser,
  onNavigate,
  onClose,
  onLogout,
}: MobileNavigationDrawerProps) {
  const menuItems = [
    { id: 'dashboard' as MobileScreenView, label: 'Home', icon: Home },
    { id: 'quick_entry' as MobileScreenView, label: 'Add Production', icon: PlusSquare },
    { id: 'history' as MobileScreenView, label: 'Production History', icon: History },
    { id: 'item_master' as MobileScreenView, label: 'Items', icon: Package },
    { id: 'categories' as MobileScreenView, label: 'Categories', icon: Layers },
    { id: 'reports' as MobileScreenView, label: 'Reports', icon: FileText },
    { id: 'analytics' as MobileScreenView, label: 'Analytics', icon: BarChart3 },
    { id: 'profile_setup' as MobileScreenView, label: 'My Profile', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <MobileStatusBar />

      {/* User Profile Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div
          onClick={() => onNavigate('profile_setup')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <Image
              src="/images/rohit_avatar.jpg"
              alt={currentUser.fullName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {currentUser.fullName}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {currentUser.designation}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-4 h-4 text-slate-500 stroke-[2.2]" />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          );
        })}
      </div>

      {/* Footer Area: Install App, Logout & Version */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => {
            triggerPwaInstall();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Install App on Device</span>
          </div>
          <span className="text-[10px] bg-blue-200/70 text-blue-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">PWA</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Logout</span>
        </button>

        <p className="text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Image src="/images/logo.png" alt="Logo" width={14} height={14} className="object-contain rounded-xs" />
          <span>Premium Packaging Supervisor v1.0.0</span>
        </p>
      </div>
    </div>
  );
}
