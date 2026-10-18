'use client';

import React, { useState, useEffect } from 'react';
import {
  Category,
  Item,
  ProductionRecord,
  Subcategory,
  UserProfile,
} from '@/types';
import { calculateProductionWeights, formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import { formatDateDDMMYYYY, getTodayString } from '@/lib/dateUtils';
import { PRODUCTION_LINES, SHIFT_OPTIONS } from '@/lib/constants';
import { ToleranceBadge } from '../ToleranceBadge';
import {
  PlusCircle,
  Save,
  RotateCcw,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AddProductionEntryViewProps {
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: UserProfile;
  initialDate?: string;
  onSaveRecord: (
    record: Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'>,
    saveAndAddAnother?: boolean
  ) => void;
  onCancel: () => void;
}

export const AddProductionEntryView: React.FC<AddProductionEntryViewProps> = ({
  items,
  categories,
  subcategories,
  currentUser,
  initialDate,
  onSaveRecord,
  onCancel,
}) => {
  const [productionDate, setProductionDate] = useState<string>(initialDate || '2026-10-18');
  const [shift, setShift] = useState<string>(currentUser.preferences?.defaultShift || SHIFT_OPTIONS[0]);
  const [productionLine, setProductionLine] = useState<string>(currentUser.preferences?.defaultLine || PRODUCTION_LINES[0]);
  const [batchNumber, setBatchNumber] = useState<string>('B-01');

  useEffect(() => {
    if (!initialDate) {
      setProductionDate(getTodayString());
    }
  }, [initialDate]);

  // Cascade Selectors
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  // Quantities & Wastage
  const [productionQuantity, setProductionQuantity] = useState<number | ''>(5000);
  const [rejectedQuantity, setRejectedQuantity] = useState<number | ''>(0);
  const [wastageWeight, setWastageWeight] = useState<number | ''>(0);

  // Measurements
  const [entryMode, setEntryMode] = useState<'unit_only' | 'components'>('components');
  const [actualUnitWeight, setActualUnitWeight] = useState<number | ''>('');
  const [actualJarWeight, setActualJarWeight] = useState<number | ''>('');
  const [actualCapWeight, setActualCapWeight] = useState<number | ''>('');
  const [actualPlasticHandleWeight, setActualPlasticHandleWeight] = useState<number | ''>('');
  const [actualSteelHandleWeight, setActualSteelHandleWeight] = useState<number | ''>('');
  const [actualOtherWeight, setActualOtherWeight] = useState<number | ''>('');

  const [remarks, setRemarks] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Available Subcategories based on Category
  const availableSubcategories = subcategories.filter((s) => s.categoryId === categoryId);

  // Available Items based on Category & Subcategory
  const availableItems = items.filter(
    (i) => i.categoryId === categoryId && (!subcategoryId || i.subcategoryId === subcategoryId)
  );

  // Active Selected Item
  const activeItem = items.find((i) => i.id === itemId) || availableItems[0];

  // Auto-select first subcategory and item when category changes
  useEffect(() => {
    if (availableSubcategories.length > 0) {
      setSubcategoryId(availableSubcategories[0].id);
    } else {
      setSubcategoryId('');
    }
  }, [categoryId]);

  useEffect(() => {
    if (availableItems.length > 0) {
      setItemId(availableItems[0].id);
    } else {
      setItemId('');
    }
  }, [categoryId, subcategoryId]);

  // When active item changes, load its ideal specifications as defaults
  useEffect(() => {
    if (activeItem) {
      setActualUnitWeight(activeItem.approvedIdealWeight);
      setActualJarWeight(activeItem.jarWeight !== null ? activeItem.jarWeight : '');
      setActualCapWeight(activeItem.capWeight !== null ? activeItem.capWeight : '');
      setActualPlasticHandleWeight(activeItem.plasticHandleWeight !== null ? activeItem.plasticHandleWeight : '');
      setActualSteelHandleWeight(activeItem.steelHandleWeight !== null ? activeItem.steelHandleWeight : '');
      setActualOtherWeight(activeItem.otherComponentWeight !== null ? activeItem.otherComponentWeight : '');
    }
  }, [activeItem?.id]);

  // Auto-calculate unit weight when components change
  useEffect(() => {
    if (entryMode === 'components' && activeItem) {
      const sum =
        (Number(actualJarWeight) || 0) +
        (Number(actualCapWeight) || 0) +
        (Number(actualPlasticHandleWeight) || 0) +
        (Number(actualSteelHandleWeight) || 0) +
        (Number(actualOtherWeight) || 0);

      if (sum > 0) {
        setActualUnitWeight(Number(sum.toFixed(2)));
      }
    }
  }, [actualJarWeight, actualCapWeight, actualPlasticHandleWeight, actualSteelHandleWeight, actualOtherWeight, entryMode]);

  // Real-time calculation preview
  const calculations = activeItem
    ? calculateProductionWeights(
        activeItem.approvedIdealWeight,
        Number(actualUnitWeight) || 0,
        Number(productionQuantity) || 0,
        activeItem.toleranceLimits,
        {
          jarWeight: activeItem.jarWeight,
          capWeight: activeItem.capWeight,
          plasticHandleWeight: activeItem.plasticHandleWeight,
          steelHandleWeight: activeItem.steelHandleWeight,
          otherComponentWeight: activeItem.otherComponentWeight,
          otherComponentName: activeItem.otherComponentName,
        },
        {
          jarWeight: actualJarWeight ? Number(actualJarWeight) : undefined,
          capWeight: actualCapWeight ? Number(actualCapWeight) : undefined,
          plasticHandleWeight: actualPlasticHandleWeight ? Number(actualPlasticHandleWeight) : undefined,
          steelHandleWeight: actualSteelHandleWeight ? Number(actualSteelHandleWeight) : undefined,
          otherComponentWeight: actualOtherWeight ? Number(actualOtherWeight) : undefined,
        }
      )
    : null;

  const handleSave = (addAnother = false) => {
    setFormErrors([]);
    const errors: string[] = [];

    if (!activeItem) {
      errors.push('Please select a packaging item.');
    }

    const qty = Number(productionQuantity);
    if (!qty || qty <= 0) {
      errors.push('Production quantity must be greater than zero.');
    }

    const actual = Number(actualUnitWeight);
    if (!actual || actual <= 0) {
      errors.push('Actual unit weight must be greater than zero grams.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!calculations || !activeItem) return;

    setIsSubmitting(true);

    const activeCat = categories.find((c) => c.id === activeItem.categoryId);
    const activeSub = subcategories.find((s) => s.id === activeItem.subcategoryId);

    const newRecord: Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'> = {
      companyId: currentUser.companyId,
      productionDate,
      shift,
      productionLine,
      batchNumber: batchNumber.trim() || `B-${Date.now().toString().slice(-4)}`,
      itemId: activeItem.id,
      itemNameSnapshot: activeItem.itemName,
      itemCodeSnapshot: activeItem.itemCode,
      categorySnapshot: activeCat?.name || 'Packaging',
      subcategorySnapshot: activeSub?.name || 'Standard',
      idealComponentWeightsSnapshot: {
        jarWeight: activeItem.jarWeight,
        capWeight: activeItem.capWeight,
        plasticHandleWeight: activeItem.plasticHandleWeight,
        steelHandleWeight: activeItem.steelHandleWeight,
        otherComponentWeight: activeItem.otherComponentWeight,
        otherComponentName: activeItem.otherComponentName,
      },
      approvedIdealWeightSnapshot: activeItem.approvedIdealWeight,
      toleranceSnapshot: activeItem.toleranceLimits,
      actualComponentWeights: {
        jarWeight: actualJarWeight ? Number(actualJarWeight) : undefined,
        capWeight: actualCapWeight ? Number(actualCapWeight) : undefined,
        plasticHandleWeight: actualPlasticHandleWeight ? Number(actualPlasticHandleWeight) : undefined,
        steelHandleWeight: actualSteelHandleWeight ? Number(actualSteelHandleWeight) : undefined,
        otherComponentWeight: actualOtherWeight ? Number(actualOtherWeight) : undefined,
      },
      actualUnitWeight: actual,
      measurementMode: entryMode === 'components' ? 'components_entered' : 'unit_only',
      hasIncompleteComponents: false,
      productionQuantity: qty,
      rejectedQuantity: Number(rejectedQuantity) || 0,
      wastageWeight: Number(wastageWeight) || 0,
      unitDifference: calculations.unitDifference,
      totalIdealWeight: calculations.totalIdealWeight,
      totalActualWeight: calculations.totalActualWeight,
      totalWeightDifference: calculations.totalWeightDifference,
      percentageDeviation: calculations.percentageDeviation,
      weightStatus: calculations.weightStatus,
      remarks: remarks.trim(),
      recordedById: currentUser.id,
      recordedByName: currentUser.fullName,
      recordedByDesignation: currentUser.designation,
    };

    setTimeout(() => {
      onSaveRecord(newRecord, addAnother);
      setIsSubmitting(false);

      if (addAnother) {
        setSuccessToast(`Saved entry for ${activeItem.itemName}! You can now enter the next item.`);
        // Reset quantities while retaining date, shift, and line
        setProductionQuantity('');
        setRemarks('');
      }
    }, 350);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Daily Production Record Form
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Record Packaging Production
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisor in charge: <strong className="text-slate-800 dark:text-slate-200">{currentUser.fullName}</strong> ({currentUser.designation})
          </p>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Form Errors */}
      {formErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Validation Required:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {formErrors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form Body */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-sm">
        {/* Section 1: Production Schedule & Lot */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            Production Shift & Machine Assignment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Shift <span className="text-rose-500">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium"
              >
                {SHIFT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Production Line <span className="text-rose-500">*</span>
              </label>
              <select
                value={productionLine}
                onChange={(e) => setProductionLine(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium"
              >
                {PRODUCTION_LINES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batch / Lot Number
              </label>
              <input
                type="text"
                value={batchNumber}
                placeholder="e.g. B-01"
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cascade Product Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            Product Selection (Cascading Filters)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Subcategory <span className="text-rose-500">*</span>
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                {availableSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                3. Packaging Item <span className="text-rose-500">*</span>
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-bold text-emerald-700 dark:text-emerald-400"
              >
                {availableItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.itemCode}] {i.itemName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Item Loaded Specs Banner */}
          {activeItem && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{activeItem.itemName}</span>
                  <span className="font-mono text-emerald-600 font-bold">[{activeItem.itemCode}]</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Spec Mode: <strong>{activeItem.idealWeightMode.toUpperCase()}</strong> • Approved Ideal Total Weight:{' '}
                  <strong className="text-slate-900 dark:text-white">{activeItem.approvedIdealWeight.toFixed(2)} g</strong> • Tolerance: ±{activeItem.toleranceLimits.percentage}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  Target: {activeItem.targetProductionQty ? `${activeItem.targetProductionQty.toLocaleString()} pcs` : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Quantity, Rejections & Wastage */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            Production Volume & Rejections
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Good Production Quantity (pcs) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={productionQuantity}
                onChange={(e) => setProductionQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-base font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rejected Quantity (pcs)
              </label>
              <input
                type="number"
                min="0"
                value={rejectedQuantity}
                onChange={(e) => setRejectedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wastage / Purge Weight (g)
              </label>
              <input
                type="number"
                min="0"
                value={wastageWeight}
                onChange={(e) => setWastageWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Weight Measurement Entry (Side-by-side components vs total) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">4</span>
              Actual Weight Measurements (Grams)
            </h3>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setEntryMode('components')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  entryMode === 'components'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Component-Wise Entry
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('unit_only')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  entryMode === 'unit_only'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Total Unit Weight Only
              </button>
            </div>
          </div>

          {entryMode === 'components' && activeItem ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Enter actual measured weights for each component. The item's approved ideal specification is displayed beside each input.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {activeItem.jarWeight !== null && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Jar / Body Weight</span>
                      <span>Ideal: <strong>{activeItem.jarWeight}g</strong></span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Measured weight (g)"
                      value={actualJarWeight}
                      onChange={(e) => setActualJarWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {activeItem.capWeight !== null && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Cap / Closure Weight</span>
                      <span>Ideal: <strong>{activeItem.capWeight}g</strong></span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Measured weight (g)"
                      value={actualCapWeight}
                      onChange={(e) => setActualCapWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {activeItem.plasticHandleWeight !== null && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Plastic Handle Weight</span>
                      <span>Ideal: <strong>{activeItem.plasticHandleWeight}g</strong></span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Measured weight (g)"
                      value={actualPlasticHandleWeight}
                      onChange={(e) => setActualPlasticHandleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {activeItem.steelHandleWeight !== null && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Steel Handle Weight</span>
                      <span>Ideal: <strong>{activeItem.steelHandleWeight}g</strong></span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Measured weight (g)"
                      value={actualSteelHandleWeight}
                      onChange={(e) => setActualSteelHandleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {activeItem.otherComponentWeight !== null && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{activeItem.otherComponentName || 'Other Component'}</span>
                      <span>Ideal: <strong>{activeItem.otherComponentWeight}g</strong></span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={actualOtherWeight}
                      onChange={(e) => setActualOtherWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Weigh the entire assembled product on precision scales and enter total grams.
              </p>
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Actual Total Weight Per Unit (g) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actualUnitWeight}
                  onChange={(e) => setActualUnitWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-lg font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Real-time Live Calculation Verification Box (Section 6.8 & 7) */}
        {calculations && activeItem && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Live Weight Verification & Variance Engine
              </span>
              <ToleranceBadge
                status={calculations.weightStatus}
                percentageDiff={calculations.percentageDeviation}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Ideal Unit Wt</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {activeItem.approvedIdealWeight.toFixed(2)} g
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Actual Unit Wt</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {Number(actualUnitWeight || 0).toFixed(2)} g
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Unit Difference</p>
                <p className={`text-base font-mono font-bold mt-0.5 ${calculations.unitDifference > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatVariance(calculations.unitDifference)}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Net Total Weight Diff</p>
                <p className={`text-base font-mono font-bold mt-0.5 ${calculations.totalWeightDifference > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {calculations.totalWeightDifference >= 0 ? '+' : ''}{formatKgOnly(calculations.totalWeightDifference)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span>
                Total Actual: <strong>{formatKgOnly(calculations.totalActualWeight)}</strong> vs Ideal:{' '}
                <strong>{formatKgOnly(calculations.totalIdealWeight)}</strong>
              </span>
              <span>
                Deviation: <strong>{calculations.percentageDeviation >= 0 ? '+' : ''}{calculations.percentageDeviation.toFixed(2)}%</strong>
              </span>
            </div>
          </div>
        )}

        {/* Section 6: Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Supervisor Production Remarks / Observations
          </label>
          <textarea
            rows={2}
            value={remarks}
            placeholder="e.g. Mold temperatures normal, color shade masterbatch 2% verified by QC lab."
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Save & Add Another</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Record...' : 'Save Production Record'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
