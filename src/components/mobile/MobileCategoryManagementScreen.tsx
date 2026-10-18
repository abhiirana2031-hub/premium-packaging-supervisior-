'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, ChevronRight, Package, Box, Layers, Container, Disc, Wrench } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { Category, Item, Subcategory } from '@/types';

interface MobileCategoryManagementScreenProps {
  categories: Category[];
  subcategories: Subcategory[];
  items: Item[];
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: () => void;
}

export function MobileCategoryManagementScreen({
  categories,
  subcategories,
  items,
  onBack,
  onSelectCategory,
  onAddCategory,
}: MobileCategoryManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping
  const getCategoryTheme = (idx: number) => {
    const themes = [
      { bg: 'bg-amber-100 text-amber-700', icon: Box },
      { bg: 'bg-blue-100 text-blue-700', icon: Package },
      { bg: 'bg-purple-100 text-purple-700', icon: Container },
      { bg: 'bg-emerald-100 text-emerald-700', icon: Layers },
      { bg: 'bg-rose-100 text-rose-700', icon: Container },
      { bg: 'bg-cyan-100 text-cyan-700', icon: Disc },
      { bg: 'bg-slate-200 text-slate-700', icon: Wrench },
    ];
    return themes[idx % themes.length];
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      <MobileStatusBar />

      {/* Top App Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-bold text-slate-900">Categories</h1>

        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredCategories.map((cat, idx) => {
          const theme = getCategoryTheme(idx);
          const Icon = theme.icon;
          const subCount = subcategories.filter((s) => s.categoryId === cat.id).length;
          const itemCount = items.filter((i) => i.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left min-w-0 pr-2">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${theme.bg}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{cat.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {subCount} subcategories &bull; {itemCount} items
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
