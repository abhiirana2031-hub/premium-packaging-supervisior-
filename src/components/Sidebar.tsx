'use client';

import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Zap,
  PlusCircle,
  History,
  Scale,
  Package,
  Layers,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  Users,
  Building2,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { UserProfile } from '@/types';

export type NavPage =
  | 'dashboard'
  | 'quick-entry'
  | 'add-entry'
  | 'history'
  | 'variance'
  | 'items'
  | 'categories'
  | 'reports'
  | 'analytics'
  | 'audit'
  | 'settings'
  | 'users';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  currentUser: UserProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  todayCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  todayCount = 0,
}) => {
  const mainNavItems: { id: NavPage; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string; roles?: string[] }[] = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { 
      id: 'quick-entry', 
      label: 'Quick Multi-Entry', 
      icon: Zap, 
      badge: 'Fast', 
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
    },
    { id: 'add-entry', label: 'Record Production', icon: PlusCircle },
    { 
      id: 'history', 
      label: 'Production History', 
      icon: History, 
      badge: todayCount > 0 ? todayCount : undefined,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    { 
      id: 'variance', 
      label: 'Weight & Material Usage', 
      icon: Scale, 
      badge: 'Audit',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'reports', label: 'Report & Export Center', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3 },
  ];

  const masterNavItems: { id: NavPage; label: string; icon: React.ElementType; roles?: string[] }[] = [
    { id: 'items', label: 'Item Specifications Master', icon: Package },
    { id: 'categories', label: 'Categories & Subcategories', icon: Layers },
    { id: 'audit', label: 'System Audit Trail', icon: ShieldCheck },
  ];

  const adminNavItems: { id: NavPage; label: string; icon: React.ElementType; roles?: string[] }[] = [
    { id: 'users', label: 'User & Permissions', icon: Users, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'Profile & Plant Settings', icon: Settings },
  ];

  const handleNavClick = (page: NavPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 xl:w-72 shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-slate-700/80 flex items-center justify-center p-0.5 shadow-sm">
              <Image
                src="/images/logo.png"
                alt="Premium Packaging Supervisor Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Premium Packaging
              </h1>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-blue-400">
                Supervisor Console
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Supervisor Card */}
        <div className="p-3.5 mx-3 my-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 border border-slate-600">
              {currentUser.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.fullName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser.designation}
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            {currentUser.role}
          </span>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 text-sm">
          {/* Main Production Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Daily Operations
            </div>
            {mainNavItems.map((item) => {
              const active = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                        active
                          ? 'bg-emerald-700 text-white border-emerald-500'
                          : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Master Catalog Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Product Master & Specs
            </div>
            {masterNavItems.map((item) => {
              const active = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Plant Admin Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Administration & Profile
            </div>
            {adminNavItems
              .filter((item) => !item.roles || item.roles.includes(currentUser.role))
              .map((item) => {
                const active = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-emerald-600 text-white shadow-md font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Bottom Plant Status & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">Unit 1 Plant — Silvassa</p>
            <p className="text-[10px] text-slate-400">Asia/Kolkata (IST)</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Switch User / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
