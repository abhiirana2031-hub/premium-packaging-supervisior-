'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, Edit2, Search, Check, Calendar, Clock, Layers, Sparkles } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { Category, Item, ProductionRecord, UserProfile } from '@/types';
import { calculateProductionWeights } from '@/lib/calculations';
import { formatDisplayDate, getTodayString } from '@/lib/dateUtils';
import { SHIFT_OPTIONS, PRODUCTION_LINES } from '@/lib/constants';

interface MobileQuickEntryScreenProps {
  items: Item[];
  categories: Category[];
  currentUser: UserProfile;
  onSaveRecord: (record: Partial<ProductionRecord>) => void;
  onBack: () => void;
}

export function MobileQuickEntryScreen({
  items,
  categories,
  currentUser,
  onSaveRecord,
  onBack,
}: MobileQuickEntryScreenProps) {
  // Selected metadata
  const [productionDate, setProductionDate] = useState(getTodayString());
  const [shift, setShift] = useState(currentUser.preferences?.defaultShift || SHIFT_OPTIONS[0]);
  const [line, setLine] = useState(currentUser.preferences?.defaultLine || PRODUCTION_LINES[0]);

  // Selected item
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || items[0],
    [items, selectedItemId]
  );

  // Production Inputs
  const [quantity, setQuantity] = useState<number>(500);
  const [actualJar, setActualJar] = useState<string>('');
  const [actualCap, setActualCap] = useState<string>('');
  const [actualPlastic, setActualPlastic] = useState<string>('');
  const [actualSteel, setActualSteel] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize actual weights from ideal whenever item changes
  useEffect(() => {
    if (selectedItem) {
      setActualJar(selectedItem.jarWeight != null ? String(selectedItem.jarWeight) : '');
      setActualCap(selectedItem.capWeight != null ? String(selectedItem.capWeight) : '');
      setActualPlastic(selectedItem.plasticHandleWeight != null ? String(selectedItem.plasticHandleWeight) : '');
      setActualSteel(selectedItem.steelHandleWeight != null ? String(selectedItem.steelHandleWeight) : '');
    }
  }, [selectedItem]);

  // Live calculations
  const numJar = parseFloat(actualJar) || 0;
  const numCap = parseFloat(actualCap) || 0;
  const numPlastic = parseFloat(actualPlastic) || 0;
  const numSteel = parseFloat(actualSteel) || 0;
  const liveUnitWeight = Number((numJar + numCap + numPlastic + numSteel).toFixed(2));

  const idealWeight = selectedItem?.approvedIdealWeight || 1;
  const unitDiff = Number((liveUnitWeight - idealWeight).toFixed(2));
  const pctDiff = Number(((unitDiff / idealWeight) * 100).toFixed(1));
  const isOver = unitDiff > 0;

  // Thumbnail helper
  const getItemThumbnail = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cap') || lower.includes('wad') || lower.includes('closure')) return '/images/cap_round.jpg';
    if (lower.includes('handle') || lower.includes('wire')) return '/images/handle_black.jpg';
    if (lower.includes('bucket') || lower.includes('jerry') || lower.includes('container') || lower.includes('dw')) return '/images/container_white.jpg';
    return '/images/jar_red_cap.jpg';
  };

  // Filter items category-wise
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const handleSave = (addAnother: boolean = false) => {
    if (!selectedItem) return;

    const actualComponents = {
      jarWeight: selectedItem.jarWeight != null ? numJar : null,
      capWeight: selectedItem.capWeight != null ? numCap : null,
      plasticHandleWeight: selectedItem.plasticHandleWeight != null ? numPlastic : null,
      steelHandleWeight: selectedItem.steelHandleWeight != null ? numSteel : null,
      otherComponentWeight: null,
    };

    const calc = calculateProductionWeights(
      selectedItem.approvedIdealWeight,
      liveUnitWeight,
      quantity,
      selectedItem.toleranceLimits,
      {
        jarWeight: selectedItem.jarWeight,
        capWeight: selectedItem.capWeight,
        plasticHandleWeight: selectedItem.plasticHandleWeight,
        steelHandleWeight: selectedItem.steelHandleWeight,
      },
      actualComponents
    );

    const record: Partial<ProductionRecord> = {
      productionDate,
      shift,
      productionLine: line,
      batchNumber: `B${Date.now().toString().slice(-6)}`,
      itemId: selectedItem.id,
      itemNameSnapshot: selectedItem.itemName,
      itemCodeSnapshot: selectedItem.itemCode,
      categorySnapshot: categories.find((c) => c.id === selectedItem.categoryId)?.name || 'General',
      subcategorySnapshot: 'Standard Production',
      idealComponentWeightsSnapshot: {
        jarWeight: selectedItem.jarWeight,
        capWeight: selectedItem.capWeight,
        plasticHandleWeight: selectedItem.plasticHandleWeight,
        steelHandleWeight: selectedItem.steelHandleWeight,
      },
      approvedIdealWeightSnapshot: selectedItem.approvedIdealWeight,
      toleranceSnapshot: selectedItem.toleranceLimits,
      actualComponentWeights: actualComponents,
      actualUnitWeight: liveUnitWeight,
      measurementMode: 'components_entered',
      productionQuantity: quantity,
      rejectedQuantity: 0,
      wastageWeight: 0,
      unitDifference: calc.unitDifference,
      totalIdealWeight: calc.totalIdealWeight,
      totalActualWeight: calc.totalActualWeight,
      totalWeightDifference: calc.totalWeightDifference,
      percentageDeviation: calc.percentageDeviation,
      weightStatus: calc.weightStatus,
      remarks: 'Recorded via Mobile Quick Entry',
      recordedById: currentUser.id,
      recordedByName: currentUser.fullName,
      recordedByDesignation: currentUser.designation,
    };

    onSaveRecord(record);
    setSuccessToast(`Saved entry for ${selectedItem.itemName}!`);
    setTimeout(() => setSuccessToast(null), 2500);

    if (!addAnother) {
      setTimeout(() => onBack(), 600);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none relative">
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

        <div className="text-center">
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Quick Production Entry</h1>
          <p className="text-[10px] text-slate-500 font-medium">Add multiple items quickly</p>
        </div>

        <button
          type="button"
          onClick={() => setIsItemPickerOpen(true)}
          className="p-1.5 -mr-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="absolute top-14 left-4 right-4 z-40 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
        {/* Meta Strip: Date, Shift, Line */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs grid grid-cols-3 gap-2 text-left">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>Date</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
              {formatDisplayDate(productionDate)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Shift</span>
            </div>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="text-xs font-bold text-slate-800 mt-0.5 bg-transparent focus:outline-none w-full truncate cursor-pointer"
            >
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
              <Layers className="w-3 h-3 text-blue-600" />
              <span>Line</span>
            </div>
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="text-xs font-bold text-slate-800 mt-0.5 bg-transparent focus:outline-none w-full truncate cursor-pointer"
            >
              {PRODUCTION_LINES.map((l) => (
                <option key={l} value={l}>
                  {l.split('—')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Selector Box */}
        <div
          onClick={() => setIsItemPickerOpen(true)}
          className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-left mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Product
            </span>
            <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
              <Search className="w-3 h-3" />
              Change Item
            </span>
          </div>

          {selectedItem && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 shrink-0 overflow-hidden border border-slate-200/70">
                <Image
                  src={getItemThumbnail(selectedItem.itemName)}
                  alt={selectedItem.itemName}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {selectedItem.itemName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Code: <span className="text-slate-700 font-semibold">{selectedItem.itemCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ideal Weights Strip */}
        <div className="bg-blue-50/60 rounded-2xl border border-blue-100/80 p-3 text-left">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
            Ideal Weights (g) &bull; Total: {selectedItem?.approvedIdealWeight}g
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/80 py-1.5 px-1 rounded-xl border border-blue-100">
              <div className="text-[9px] text-slate-500 font-semibold">Jar</div>
              <div className="text-xs font-bold text-slate-800">
                {selectedItem?.jarWeight != null ? `${selectedItem.jarWeight}` : '-'}
              </div>
            </div>
            <div className="bg-white/80 py-1.5 px-1 rounded-xl border border-blue-100">
              <div className="text-[9px] text-slate-500 font-semibold">Cap</div>
              <div className="text-xs font-bold text-slate-800">
                {selectedItem?.capWeight != null ? `${selectedItem.capWeight}` : '-'}
              </div>
            </div>
            <div className="bg-white/80 py-1.5 px-1 rounded-xl border border-blue-100">
              <div className="text-[9px] text-slate-500 font-semibold">Plastic</div>
              <div className="text-xs font-bold text-slate-800">
                {selectedItem?.plasticHandleWeight != null ? `${selectedItem.plasticHandleWeight}` : '-'}
              </div>
            </div>
            <div className="bg-white/80 py-1.5 px-1 rounded-xl border border-blue-100">
              <div className="text-[9px] text-slate-500 font-semibold">Steel</div>
              <div className="text-xs font-bold text-slate-800">
                {selectedItem?.steelHandleWeight != null ? `${selectedItem.steelHandleWeight}` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Quantity (pcs)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            min={1}
          />
        </div>

        {/* Actual Component Weights Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs text-left">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Actual Weights (g)
          </label>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold mb-1">Jar</span>
              <input
                type="number"
                step="0.1"
                value={actualJar}
                onChange={(e) => setActualJar(e.target.value)}
                placeholder="-"
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold mb-1">Cap</span>
              <input
                type="number"
                step="0.1"
                value={actualCap}
                onChange={(e) => setActualCap(e.target.value)}
                placeholder="-"
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold mb-1">Plastic</span>
              <input
                type="number"
                step="0.1"
                value={actualPlastic}
                onChange={(e) => setActualPlastic(e.target.value)}
                placeholder="-"
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold mb-1">Steel</span>
              <input
                type="number"
                step="0.1"
                value={actualSteel}
                onChange={(e) => setActualSteel(e.target.value)}
                placeholder="-"
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Live Actual Unit Weight Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Actual Unit Weight</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {liveUnitWeight} <span className="text-xs font-normal text-slate-500">g</span>
            </div>
          </div>

          <div
            className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
              isOver
                ? 'text-rose-600 bg-rose-50 border border-rose-200'
                : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
            }`}
          >
            {isOver ? `+${unitDiff} g (+${pctDiff}%)` : `${unitDiff} g (${pctDiff}%)`}
          </div>
        </div>

        {/* Dual CTA Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="w-full py-3 px-3 rounded-xl border border-blue-600 text-blue-600 bg-white text-xs font-bold shadow-xs hover:bg-blue-50 active:scale-[0.99] transition-all"
          >
            Save & Add Another
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="w-full py-3 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* Category-wise Product Picker Modal */}
      {isItemPickerOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85%] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Select Factory Product</h3>
              <button
                type="button"
                onClick={() => setIsItemPickerOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1"
              >
                Close
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search among 70 real products..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Items list grouped category wise */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-slate-100">
              {categories.map((cat) => {
                const catItems = filteredItems.filter((i) => i.categoryId === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.id} className="pt-2">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 px-1">
                      {cat.name} ({catItems.length})
                    </div>
                    <div className="space-y-1.5">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setIsItemPickerOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            item.id === selectedItemId
                              ? 'bg-blue-50/80 border-blue-400 text-blue-900'
                              : 'bg-white border-slate-200/70 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="text-left min-w-0 pr-2">
                            <div className="text-xs font-bold truncate">{item.itemName}</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {item.itemCode} &bull; Ideal: {item.approvedIdealWeight}g
                            </div>
                          </div>
                          {item.id === selectedItemId && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
