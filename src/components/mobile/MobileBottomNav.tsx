'use client';

import React from 'react';
import { Home, PlusSquare, Package, FileText, Menu } from 'lucide-react';

export type MobileTab = 'home' | 'production' | 'items' | 'reports' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export function MobileBottomNav({ activeTab, onSelectTab }: MobileBottomNavProps) {
  const tabs = [
    { id: 'home' as MobileTab, label: 'Home', icon: Home },
    { id: 'production' as MobileTab, label: 'Production', icon: PlusSquare },
    { id: 'items' as MobileTab, label: 'Items', icon: Package },
    { id: 'reports' as MobileTab, label: 'Reports', icon: FileText },
    { id: 'more' as MobileTab, label: 'More', icon: Menu },
  ];

  return (
    <nav className="w-full bg-white border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-lg select-none z-30 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'scale-110 bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
