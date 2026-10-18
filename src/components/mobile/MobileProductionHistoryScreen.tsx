'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, Filter, Search, Calendar, ChevronRight } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { ProductionRecord } from '@/types';
import { formatDisplayDate } from '@/lib/dateUtils';

interface MobileProductionHistoryScreenProps {
  records: ProductionRecord[];
  onBack: () => void;
  onSelectRecord: (record: ProductionRecord) => void;
}

export function MobileProductionHistoryScreen({
  records,
  onBack,
  onSelectRecord,
}: MobileProductionHistoryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
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
          (r.batchNumber || '').toLowerCase().includes(q) ||
          r.itemCodeSnapshot.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, searchQuery]);

  // Group records by Date and Shift
  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: ProductionRecord[] } = {};
    filteredRecords.forEach((rec) => {
      const lineStr = (rec.productionLine || '').split('—')[0].trim();
      const key = `${rec.productionDate} &bull; ${rec.shift} (${lineStr || 'Line 1'})`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });
    return groups;
  }, [filteredRecords]);

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

        <h1 className="text-sm font-bold text-slate-900">Production History</h1>

        <button type="button" className="p-1.5 -mr-1 text-slate-500 hover:text-slate-800">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Date Range Chip */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Last 30 Days Production Run</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {filteredRecords.length} records
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, batches..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center gap-2">
        {(['all', 'today', '7days', 'month'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeFilter === f
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === '7days' ? '7 Days' : f}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groupedRecords).length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No history records match the filter.
          </div>
        ) : (
          Object.entries(groupedRecords).map(([groupTitle, itemsInGroup]) => (
            <div key={groupTitle} className="space-y-2">
              <div
                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1"
                dangerouslySetInnerHTML={{ __html: groupTitle }}
              />
              <div className="space-y-2">
                {itemsInGroup.map((rec) => {
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
                        <div className="w-11 h-11 rounded-xl bg-slate-100 p-1 shrink-0 overflow-hidden border border-slate-200/60">
                          <Image
                            src={getItemThumbnail(rec.itemNameSnapshot)}
                            alt={rec.itemNameSnapshot}
                            width={44}
                            height={44}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {rec.itemNameSnapshot}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {rec.productionQuantity.toLocaleString()} pcs &bull;{' '}
                            {rec.actualUnitWeight.toFixed(1)} g
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            isOver
                              ? 'text-rose-600 bg-rose-50 border border-rose-200/60'
                              : 'text-emerald-600 bg-emerald-50 border border-emerald-200/60'
                          }`}
                        >
                          {diffDisplay}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
