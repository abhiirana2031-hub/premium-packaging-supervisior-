'use client';

import React from 'react';
import { ArrowLeft, Calendar, TrendingUp, Percent, Scale, Target } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { ProductionRecord } from '@/types';

interface MobileAnalyticsScreenProps {
  records: ProductionRecord[];
  onBack: () => void;
}

export function MobileAnalyticsScreen({ records, onBack }: MobileAnalyticsScreenProps) {
  // Aggregate stats
  const totalActualKg = records.reduce((acc, r) => acc + r.totalActualWeight, 0) / 1000;
  const totalIdealKg = records.reduce((acc, r) => acc + r.totalIdealWeight, 0) / 1000;
  const netVarianceKg = totalActualKg - totalIdealKg;
  const variancePct = totalIdealKg > 0 ? (netVarianceKg / totalIdealKg) * 100 : 0;

  // Aggregate components
  let jarKg = 0;
  let capKg = 0;
  let plasticKg = 0;
  let steelKg = 0;

  records.forEach((r) => {
    const q = r.productionQuantity;
    if (r.actualComponentWeights.jarWeight) jarKg += (r.actualComponentWeights.jarWeight * q) / 1000;
    if (r.actualComponentWeights.capWeight) capKg += (r.actualComponentWeights.capWeight * q) / 1000;
    if (r.actualComponentWeights.plasticHandleWeight) plasticKg += (r.actualComponentWeights.plasticHandleWeight * q) / 1000;
    if (r.actualComponentWeights.steelHandleWeight) steelKg += (r.actualComponentWeights.steelHandleWeight * q) / 1000;
  });

  const totalCompKg = jarKg + capKg + plasticKg + steelKg || 1;
  const jarPct = Math.round((jarKg / totalCompKg) * 100) || 45;
  const capPct = Math.round((capKg / totalCompKg) * 100) || 25;
  const plasticPct = Math.round((plasticKg / totalCompKg) * 100) || 20;
  const steelPct = 100 - jarPct - capPct - plasticPct || 10;

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

        <h1 className="text-sm font-bold text-slate-900">Weight Variance</h1>

        <button type="button" className="p-1.5 -mr-1 text-slate-500 hover:text-slate-800">
          <Calendar className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Date Range Chip */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Period Variance Analysis</span>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
          {records.length} Batches
        </span>
      </div>

      {/* Scrollable Analytics Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 4 Metric Cards (2x2) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Ideal Weight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
              <Target className="w-3 h-3 text-blue-500" />
              <span>Ideal Weight</span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {totalIdealKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
          </div>

          {/* Actual Weight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
              <Scale className="w-3 h-3 text-purple-500" />
              <span>Actual Weight</span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {totalActualKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
          </div>

          {/* Net Variance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
              <TrendingUp className="w-3 h-3 text-rose-500" />
              <span>Net Variance</span>
            </div>
            <div className="text-base font-bold text-rose-600 mt-1">
              {netVarianceKg >= 0 ? `+${netVarianceKg.toFixed(1)} kg` : `${netVarianceKg.toFixed(1)} kg`}
            </div>
          </div>

          {/* Variance % */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
              <Percent className="w-3 h-3 text-emerald-500" />
              <span>Variance %</span>
            </div>
            <div className="text-base font-bold text-emerald-600 mt-1">
              {variancePct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Daily Weight Variance Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs text-left">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Daily Weight Variance</h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-500">Ideal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-500">Actual</span>
              </div>
            </div>
          </div>

          {/* SVG Trend Visualization */}
          <div className="relative w-full h-36 border-b border-l border-slate-200 pt-2 pb-1 pl-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

              {/* Ideal Line (Blue) */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                points="10,55 60,50 120,48 180,52 240,49 290,50"
              />

              {/* Actual Line (Orange/Coral) */}
              <polyline
                fill="none"
                stroke="#F97316"
                strokeWidth="2.5"
                points="10,60 60,45 120,40 180,48 240,42 290,44"
              />

              {/* Data points */}
              <circle cx="10" cy="60" r="3.5" fill="#F97316" />
              <circle cx="60" cy="45" r="3.5" fill="#F97316" />
              <circle cx="120" cy="40" r="3.5" fill="#F97316" />
              <circle cx="180" cy="48" r="3.5" fill="#F97316" />
              <circle cx="240" cy="42" r="3.5" fill="#F97316" />
              <circle cx="290" cy="44" r="3.5" fill="#F97316" />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-2 px-1">
            <span>Day 1</span>
            <span>Day 7</span>
            <span>Day 14</span>
            <span>Day 21</span>
            <span>Today</span>
          </div>
        </div>

        {/* Component-wise Contribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs text-left">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Component-wise Contribution</h3>

          <div className="flex items-center justify-between">
            {/* Donut Chart Visual */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                />
                {/* Jar: Blue */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray={`${jarPct} 100`}
                  strokeDashoffset="0"
                />
                {/* Cap: Emerald */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeDasharray={`${capPct} 100`}
                  strokeDashoffset={`-${jarPct}`}
                />
                {/* Plastic: Amber */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeDasharray={`${plasticPct} 100`}
                  strokeDashoffset={`-${jarPct + capPct}`}
                />
                {/* Steel: Coral */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="4"
                  strokeDasharray={`${steelPct} 100`}
                  strokeDashoffset={`-${jarPct + capPct + plasticPct}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-900 leading-tight">
                  {netVarianceKg >= 0 ? `+${netVarianceKg.toFixed(1)}` : `${netVarianceKg.toFixed(1)}`}
                </span>
                <span className="text-[8px] text-slate-400 font-medium">kg Net</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 text-xs flex-1 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600 font-medium">Jar Body</span>
                </div>
                <span className="font-bold text-slate-900">{jarPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Cap / Closure</span>
                </div>
                <span className="font-bold text-slate-900">{capPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Plastic Handle</span>
                </div>
                <span className="font-bold text-slate-900">{plasticPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">Steel Handle</span>
                </div>
                <span className="font-bold text-slate-900">{steelPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
