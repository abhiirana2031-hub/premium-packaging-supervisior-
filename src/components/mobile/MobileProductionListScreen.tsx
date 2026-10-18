'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, Calendar, Search, Plus, MoreVertical, FileText } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { ProductionRecord } from '@/types';
import { formatDisplayDate } from '@/lib/dateUtils';

interface MobileProductionListScreenProps {
  records: ProductionRecord[];
  selectedDate: string;
  onBack: () => void;
  onOpenQuickEntry: () => void;
  onSelectRecord: (record: ProductionRecord) => void;
}

export function MobileProductionListScreen({
  records,
  selectedDate,
  onBack,
  onOpenQuickEntry,
  onSelectRecord,
}: MobileProductionListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback image helper
  const getItemThumbnail = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cap') || lower.includes('wad') || lower.includes('closure')) return '/images/cap_round.jpg';
    if (lower.includes('handle') || lower.includes('wire')) return '/images/handle_black.jpg';
    if (lower.includes('bucket') || lower.includes('jerry') || lower.includes('container') || lower.includes('dw')) return '/images/container_white.jpg';
    return '/images/jar_red_cap.jpg';
  };

  const filteredRecords = useMemo(() => {
    let list = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.itemNameSnapshot.toLowerCase().includes(q) ||
          r.itemCodeSnapshot.toLowerCase().includes(q) ||
          (r.batchNumber || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, searchQuery]);

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

        <h1 className="text-sm font-bold text-slate-900">Production List</h1>

        {/* Date Chip */}
        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-700">
          <Calendar className="w-3 h-3 text-blue-600" />
          <span>{formatDisplayDate(selectedDate)}</span>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Production List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No production records match your search.
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const isOver = rec.unitDifference > 0;
            const diffDisplay =
              rec.unitDifference > 0
                ? `+${rec.unitDifference.toFixed(1)} g`
                : `${rec.unitDifference.toFixed(1)} g`;

            return (
              <div
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 shrink-0 overflow-hidden border border-slate-200/60">
                    <Image
                      src={getItemThumbnail(rec.itemNameSnapshot)}
                      alt={rec.itemNameSnapshot}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {rec.itemNameSnapshot}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {rec.productionQuantity.toLocaleString()} pcs &bull; {rec.actualUnitWeight.toFixed(1)} g
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {rec.shift} &bull; {(rec.productionLine || '').split('—')[0]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isOver
                        ? 'text-rose-600 bg-rose-50 border border-rose-200/60'
                        : 'text-emerald-600 bg-emerald-50 border border-emerald-200/60'
                    }`}
                  >
                    {diffDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(rec);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 bg-white border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenQuickEntry}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Production Item</span>
        </button>
      </div>
    </div>
  );
}
