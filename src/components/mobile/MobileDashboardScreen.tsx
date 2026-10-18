'use client';

import React from 'react';
import Image from 'next/image';
import { Box, Calendar, TrendingUp, Plus, ArrowRight, Package, Layers, Scale, Target } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileBottomNav, MobileTab } from './MobileBottomNav';
import { ProductionRecord, UserProfile } from '@/types';
import { formatDisplayDate } from '@/lib/dateUtils';
import { SyncBadge } from '@/components/sync/SyncBadge';

interface MobileDashboardScreenProps {
  currentUser: UserProfile;
  records: ProductionRecord[];
  selectedDate: string;
  onOpenQuickEntry: () => void;
  onOpenProductionList: () => void;
  onSelectTab: (tab: MobileTab) => void;
  onOpenProfile: () => void;
  onSelectRecord: (record: ProductionRecord) => void;
}

export function MobileDashboardScreen({
  currentUser,
  records,
  selectedDate,
  onOpenQuickEntry,
  onOpenProductionList,
  onSelectTab,
  onOpenProfile,
  onSelectRecord,
}: MobileDashboardScreenProps) {
  // Filter today's records
  const todayRecords = records.filter((r) => r.productionDate === selectedDate);
  const displayRecords = todayRecords.length > 0 ? todayRecords : records.slice(0, 4);

  // Totals calculations
  const totalItemsProduced = displayRecords.length;
  const totalQuantity = displayRecords.reduce((acc, r) => acc + r.productionQuantity, 0);
  const totalActualWeightKg = displayRecords.reduce((acc, r) => acc + r.totalActualWeight, 0) / 1000;
  const totalIdealWeightKg = displayRecords.reduce((acc, r) => acc + r.totalIdealWeight, 0) / 1000;
  const netWeightDiffKg = totalActualWeightKg - totalIdealWeightKg;

  // Fallback image helper based on item name or type
  const getItemThumbnail = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cap') || lower.includes('wad') || lower.includes('closure')) {
      return '/images/cap_round.jpg';
    }
    if (lower.includes('handle') || lower.includes('wire')) {
      return '/images/handle_black.jpg';
    }
    if (lower.includes('bucket') || lower.includes('jerry') || lower.includes('container') || lower.includes('dw')) {
      return '/images/container_white.jpg';
    }
    return '/images/jar_red_cap.jpg';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      <MobileStatusBar />

      {/* Top App Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
            <Image
              src="/images/logo.png"
              alt="Premium Packaging Supervisor Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Premium Packaging</h1>
            <p className="text-[10px] text-slate-500 font-medium">Supervisor</p>
          </div>
        </div>

        {/* Right: Sync Badge & User Avatar */}
        <div className="flex items-center gap-2">
          <SyncBadge compact />
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-500/20 active:scale-95 transition-all"
          >
            <Image
              src="/images/rohit_avatar.jpg"
              alt={currentUser.fullName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Date Chip */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs w-fit">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">
            Today &bull; {formatDisplayDate(selectedDate)}
          </span>
        </div>

        {/* 2x2 Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Items Produced (Blue) */}
          <div className="bg-white border border-blue-100 rounded-2xl p-3.5 shadow-2xs text-left relative overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Package className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="text-lg font-bold text-slate-900 leading-none">
              {totalItemsProduced}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Items Produced
            </div>
          </div>

          {/* Total Quantity (Emerald) */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-2xs text-left relative overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="text-lg font-bold text-slate-900 leading-none">
              {totalQuantity.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Total Quantity
            </div>
          </div>

          {/* Actual Weight (Purple) */}
          <div className="bg-white border border-purple-100 rounded-2xl p-3.5 shadow-2xs text-left relative overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <Scale className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="text-lg font-bold text-slate-900 leading-none">
              {totalActualWeightKg.toFixed(1)} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Actual Weight
            </div>
          </div>

          {/* Ideal Weight (Amber) */}
          <div className="bg-white border border-amber-100 rounded-2xl p-3.5 shadow-2xs text-left relative overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Target className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="text-lg font-bold text-slate-900 leading-none">
              {totalIdealWeightKg.toFixed(1)} <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Ideal Weight
            </div>
          </div>
        </div>

        {/* Weight Difference Banner */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/70 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="text-base font-bold text-rose-600 leading-none">
                {netWeightDiffKg >= 0 ? `+${netWeightDiffKg.toFixed(1)} kg` : `${netWeightDiffKg.toFixed(1)} kg`}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                Weight Difference
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
            {totalIdealWeightKg > 0 ? `${((netWeightDiffKg / totalIdealWeightKg) * 100).toFixed(1)}%` : '+0.0%'}
          </span>
        </div>

        {/* Today's Production Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Today&apos;s Production
            </h2>
            <button
              type="button"
              onClick={onOpenProductionList}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>See All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {displayRecords.slice(0, 3).map((rec) => {
              const diffKg = (rec.totalWeightDifference / 1000).toFixed(2);
              const isOver = rec.totalWeightDifference > 0;
              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-1.5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 shrink-0 overflow-hidden border border-slate-200/60">
                      <Image
                        src={getItemThumbnail(rec.itemNameSnapshot)}
                        alt={rec.itemNameSnapshot}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {rec.itemNameSnapshot}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {rec.productionQuantity.toLocaleString()} pcs &bull; {rec.actualUnitWeight.toFixed(1)}g
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                      isOver
                        ? 'text-rose-600 bg-rose-50 border border-rose-200/60'
                        : 'text-emerald-600 bg-emerald-50 border border-emerald-200/60'
                    }`}
                  >
                    {isOver ? `+${diffKg} kg` : `${diffKg} kg`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div>
          <button
            type="button"
            onClick={onOpenQuickEntry}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Production</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="home" onSelectTab={onSelectTab} />
    </div>
  );
}
