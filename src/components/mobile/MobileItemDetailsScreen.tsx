'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, MoreVertical, Edit3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { Category, Item, Subcategory } from '@/types';

interface MobileItemDetailsScreenProps {
  item: Item;
  category?: Category;
  subcategory?: Subcategory;
  onBack: () => void;
  onEdit: () => void;
}

export function MobileItemDetailsScreen({
  item,
  category,
  subcategory,
  onBack,
  onEdit,
}: MobileItemDetailsScreenProps) {
  // Thumbnail helper
  const getItemThumbnail = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cap') || lower.includes('wad') || lower.includes('closure')) return '/images/cap_round.jpg';
    if (lower.includes('handle') || lower.includes('wire')) return '/images/handle_black.jpg';
    if (lower.includes('bucket') || lower.includes('jerry') || lower.includes('container') || lower.includes('dw')) return '/images/container_white.jpg';
    return '/images/jar_red_cap.jpg';
  };

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

        <h1 className="text-sm font-bold text-slate-900">Item Details</h1>

        <button type="button" className="p-1.5 -mr-1 text-slate-500 hover:text-slate-800">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Product Visual Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center mb-3">
            <Image
              src={getItemThumbnail(item.itemName)}
              alt={item.itemName}
              width={112}
              height={112}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-slate-900">{item.itemName}</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Code: <span className="text-slate-700">{item.itemCode}</span>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Category</span>
            <span className="font-semibold text-slate-800">{category?.name || 'General'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Subcategory</span>
            <span className="font-semibold text-slate-800">{subcategory?.name || 'Standard'}</span>
          </div>
          <div className="flex flex-col py-1">
            <span className="text-slate-400 font-medium mb-1">Description</span>
            <span className="text-slate-700 font-normal leading-relaxed">
              {item.itemDescription || 'Factory specification with approved component weights.'}
            </span>
          </div>
        </div>

        {/* Ideal Component Weights Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs text-left">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Ideal Component Weights (g)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Jar Weight</span>
              <span className="font-bold text-slate-800">
                {item.jarWeight != null ? `${item.jarWeight.toFixed(1)} g` : '-'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Cap Weight</span>
              <span className="font-bold text-slate-800">
                {item.capWeight != null ? `${item.capWeight.toFixed(1)} g` : '-'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Plastic Handle</span>
              <span className="font-bold text-slate-800">
                {item.plasticHandleWeight != null ? `${item.plasticHandleWeight.toFixed(1)} g` : '-'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Steel Handle</span>
              <span className="font-bold text-slate-800">
                {item.steelHandleWeight != null ? `${item.steelHandleWeight.toFixed(1)} g` : '-'}
              </span>
            </div>
            {item.otherComponentWeight != null && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">
                  {item.otherComponentName || 'Other Component'}
                </span>
                <span className="font-bold text-slate-800">
                  {item.otherComponentWeight.toFixed(1)} g
                </span>
              </div>
            )}
          </div>

          {/* Ideal Total Weight Banner */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900">Ideal Total Weight</span>
            <span className="text-base font-extrabold text-blue-600">
              {item.approvedIdealWeight.toFixed(1)} g
            </span>
          </div>
        </div>

        {/* Tolerance Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-left flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.3]" />
              <span>Tolerance: &plusmn;{item.toleranceLimits.percentage}%</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">
              Min: {item.toleranceLimits.minWeight} g &bull; Max: {item.toleranceLimits.maxWeight} g
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
            &plusmn;{item.toleranceLimits.percentage}%
          </span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-white border-t border-slate-100">
        <button
          type="button"
          onClick={onEdit}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Item</span>
        </button>
      </div>
    </div>
  );
}
