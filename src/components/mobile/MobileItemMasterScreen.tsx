'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, Plus, Search, ChevronRight } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { Category, Item } from '@/types';

interface MobileItemMasterScreenProps {
  items: Item[];
  categories: Category[];
  initialCategoryId?: string;
  onBack: () => void;
  onSelectItem: (item: Item) => void;
  onAddItem: () => void;
}

export function MobileItemMasterScreen({
  items,
  categories,
  initialCategoryId,
  onBack,
  onSelectItem,
  onAddItem,
}: MobileItemMasterScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback image helper
  const getItemThumbnail = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cap') || lower.includes('wad') || lower.includes('closure')) return '/images/cap_round.jpg';
    if (lower.includes('handle') || lower.includes('wire')) return '/images/handle_black.jpg';
    if (lower.includes('bucket') || lower.includes('jerry') || lower.includes('container') || lower.includes('dw')) return '/images/container_white.jpg';
    return '/images/jar_red_cap.jpg';
  };

  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedCategory !== 'all') {
      list = list.filter((i) => i.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, selectedCategory, searchQuery]);

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

        <h1 className="text-sm font-bold text-slate-900">Item Master</h1>

        <button
          type="button"
          onClick={onAddItem}
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
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Horizontally Scrollable Category Pills */}
      <div className="bg-white px-3 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = items.filter((i) => i.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name.split('(')[0].trim()} ({count})
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No packaging items found in this category.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 shrink-0 overflow-hidden border border-slate-200/60">
                  <Image
                    src={getItemThumbnail(item.itemName)}
                    alt={item.itemName}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{item.itemName}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {item.itemCode} &bull;{' '}
                    <span className="text-blue-600 font-bold">{item.approvedIdealWeight} g</span>
                  </div>

                  {/* Component Breakdown Pills */}
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500 font-medium overflow-hidden">
                    {item.jarWeight != null && <span>Jar: {item.jarWeight}g</span>}
                    {item.capWeight != null && <span>&bull; Cap: {item.capWeight}g</span>}
                    {item.steelHandleWeight != null && <span>&bull; Steel: {item.steelHandleWeight}g</span>}
                    {item.plasticHandleWeight != null && <span>&bull; Plastic: {item.plasticHandleWeight}g</span>}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
