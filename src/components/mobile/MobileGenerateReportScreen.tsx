'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Filter, Check } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { Category, Item, ProductionRecord } from '@/types';
import { SHIFT_OPTIONS, PRODUCTION_LINES } from '@/lib/constants';

interface MobileGenerateReportScreenProps {
  categories: Category[];
  items: Item[];
  records: ProductionRecord[];
  onBack: () => void;
  onOpenTemplates: () => void;
  onPreviewReport: (filteredRecords: ProductionRecord[], title: string, dateRangeDisplay: string) => void;
}

export function MobileGenerateReportScreen({
  categories,
  items,
  records,
  onBack,
  onOpenTemplates,
  onPreviewReport,
}: MobileGenerateReportScreenProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'custom'>('custom');

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [includeWeightComp, setIncludeWeightComp] = useState<boolean>(true);
  const [includeCompDetails, setIncludeCompDetails] = useState<boolean>(true);

  const handleTabClick = (tab: 'template' | 'custom') => {
    setActiveTab(tab);
    if (tab === 'template') {
      onOpenTemplates();
    }
  };

  const handleGenerate = () => {
    let filtered = records;
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.id === selectedCategory);
      if (cat) filtered = filtered.filter((r) => r.categorySnapshot === cat.name);
    }
    if (selectedItem !== 'all') {
      filtered = filtered.filter((r) => r.itemId === selectedItem);
    }
    if (selectedShift !== 'all') {
      filtered = filtered.filter((r) => r.shift === selectedShift);
    }
    if (selectedLine !== 'all') {
      filtered = filtered.filter((r) => r.productionLine === selectedLine);
    }

    onPreviewReport(
      filtered.length > 0 ? filtered : records.slice(0, 5),
      'Premium Packaging Production Report',
      'Current Production Run'
    );
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

        <h1 className="text-sm font-bold text-slate-900">Generate Report</h1>

        <div className="w-5" />
      </div>

      {/* Tabs */}
      <div className="bg-white p-3 border-b border-slate-100">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center">
          <button
            type="button"
            onClick={() => handleTabClick('template')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'template'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Template
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left">
        {/* Date Range Chip */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-800">
              Active Production Cycle
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Change
          </span>
        </div>

        {/* Categories Dropdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Categories
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-1.5 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Items Dropdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Items
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full py-1.5 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer truncate"
          >
            <option value="all">All Items ({items.length} Factory Products)</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.itemName} ({i.approvedIdealWeight}g)
              </option>
            ))}
          </select>
        </div>

        {/* Shift & Line */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Shifts</option>
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Production Line
            </label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Lines</option>
              {PRODUCTION_LINES.map((l) => (
                <option key={l} value={l}>
                  {l.split('—')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
          {/* Include Weight Comparison */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-800">Include Weight Comparison</span>
            <button
              type="button"
              onClick={() => setIncludeWeightComp(!includeWeightComp)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                includeWeightComp ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  includeWeightComp ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Include Component Details */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-800">Include Component Details</span>
            <button
              type="button"
              onClick={() => setIncludeCompDetails(!includeCompDetails)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                includeCompDetails ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  includeCompDetails ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-white border-t border-slate-100">
        <button
          type="button"
          onClick={handleGenerate}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all"
        >
          Preview Report
        </button>
      </div>
    </div>
  );
}
