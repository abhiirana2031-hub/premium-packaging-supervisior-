'use client';

import React, { useState, useEffect } from 'react';
import {
  Category,
  Item,
  ProductionRecord,
  Subcategory,
  UserProfile,
} from '@/types';
import { calculateProductionWeights, formatKgOnly, formatVariance } from '@/lib/calculations';
import { formatDateDDMMYYYY, getTodayString } from '@/lib/dateUtils';
import { PRODUCTION_LINES, SHIFT_OPTIONS } from '@/lib/constants';
import { ToleranceBadge } from '../ToleranceBadge';
import {
  Zap,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuickEntryRow {
  rowId: string;
  itemId: string;
  batchNumber: string;
  quantity: number | '';
  actualUnitWeight: number | '';
  // Optional component weights
  actualJarWeight?: number | '';
  actualCapWeight?: number | '';
  actualPlasticHandleWeight?: number | '';
  actualSteelHandleWeight?: number | '';
  actualOtherWeight?: number | '';
  rejectedQuantity: number | '';
  wastageWeight: number | '';
  remarks: string;
  showComponentDetails?: boolean;
}

interface QuickEntryViewProps {
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: UserProfile;
  onSaveBatch: (records: Array<Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'>>) => void;
  onNavigateHome: () => void;
}

export const QuickEntryView: React.FC<QuickEntryViewProps> = ({
  items,
  categories,
  subcategories,
  currentUser,
  onSaveBatch,
  onNavigateHome,
}) => {
  const [productionDate, setProductionDate] = useState<string>('2026-10-18');
  const [shift, setShift] = useState<string>(currentUser.preferences?.defaultShift || SHIFT_OPTIONS[0]);
  const [productionLine, setProductionLine] = useState<string>(currentUser.preferences?.defaultLine || PRODUCTION_LINES[0]);

  useEffect(() => {
    setProductionDate(getTodayString());
  }, []);

  // Rows state
  const [rows, setRows] = useState<QuickEntryRow[]>([
    {
      rowId: `row_1`,
      itemId: items[0]?.id || '',
      batchNumber: 'B-01',
      quantity: 5000,
      actualUnitWeight: items[0] ? items[0].approvedIdealWeight : '',
      rejectedQuantity: 0,
      wastageWeight: 0,
      remarks: '',
      showComponentDetails: false,
    },
    {
      rowId: `row_2`,
      itemId: items[1]?.id || '',
      batchNumber: 'B-02',
      quantity: 3000,
      actualUnitWeight: items[1] ? items[1].approvedIdealWeight : '',
      rejectedQuantity: 0,
      wastageWeight: 0,
      remarks: '',
      showComponentDetails: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Add another row
  const handleAddRow = () => {
    const nextSeq = rows.length + 1;
    const defaultItem = items[rows.length % items.length] || items[0];
    const newRow: QuickEntryRow = {
      rowId: `row_${Date.now()}_${nextSeq}`,
      itemId: defaultItem ? defaultItem.id : '',
      batchNumber: `B-${String(nextSeq).padStart(2, '0')}`,
      quantity: '',
      actualUnitWeight: defaultItem ? defaultItem.approvedIdealWeight : '',
      rejectedQuantity: 0,
      wastageWeight: 0,
      remarks: '',
      showComponentDetails: false,
    };
    setRows([...rows, newRow]);
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    if (rows.length === 1) {
      alert('At least one production item is required in the session.');
      return;
    }
    setRows(rows.filter((r) => r.rowId !== rowId));
  };

  // Update row field
  const handleUpdateRow = (rowId: string, updates: Partial<QuickEntryRow>) => {
    setRows(
      rows.map((r) => {
        if (r.rowId !== rowId) return r;
        const updated = { ...r, ...updates };

        // If item changed, reload ideal weight as initial actual weight
        if (updates.itemId && updates.itemId !== r.itemId) {
          const newItem = items.find((i) => i.id === updates.itemId);
          if (newItem) {
            updated.actualUnitWeight = newItem.approvedIdealWeight;
          }
        }

        // If component weights entered, sum them into actualUnitWeight
        if (
          updates.actualJarWeight !== undefined ||
          updates.actualCapWeight !== undefined ||
          updates.actualPlasticHandleWeight !== undefined ||
          updates.actualSteelHandleWeight !== undefined ||
          updates.actualOtherWeight !== undefined
        ) {
          const compSum =
            (Number(updated.actualJarWeight) || 0) +
            (Number(updated.actualCapWeight) || 0) +
            (Number(updated.actualPlasticHandleWeight) || 0) +
            (Number(updated.actualSteelHandleWeight) || 0) +
            (Number(updated.actualOtherWeight) || 0);

          if (compSum > 0) {
            updated.actualUnitWeight = Number(compSum.toFixed(2));
          }
        }

        return updated;
      })
    );
  };

  // Calculate row live metrics
  const getRowCalculations = (row: QuickEntryRow) => {
    const item = items.find((i) => i.id === row.itemId);
    if (!item) return null;

    const actual = Number(row.actualUnitWeight) || 0;
    const qty = Number(row.quantity) || 0;

    return calculateProductionWeights(
      item.approvedIdealWeight,
      actual,
      qty,
      item.toleranceLimits,
      {
        jarWeight: item.jarWeight,
        capWeight: item.capWeight,
        plasticHandleWeight: item.plasticHandleWeight,
        steelHandleWeight: item.steelHandleWeight,
        otherComponentWeight: item.otherComponentWeight,
        otherComponentName: item.otherComponentName,
      },
      {
        jarWeight: row.actualJarWeight ? Number(row.actualJarWeight) : undefined,
        capWeight: row.actualCapWeight ? Number(row.actualCapWeight) : undefined,
        plasticHandleWeight: row.actualPlasticHandleWeight ? Number(row.actualPlasticHandleWeight) : undefined,
        steelHandleWeight: row.actualSteelHandleWeight ? Number(row.actualSteelHandleWeight) : undefined,
        otherComponentWeight: row.actualOtherWeight ? Number(row.actualOtherWeight) : undefined,
      }
    );
  };

  // Submit all rows
  const handleSubmitBatch = () => {
    setFormErrors([]);
    const errors: string[] = [];

    // Validate rows
    const validatedRecords: Array<Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'>> = [];

    rows.forEach((row, idx) => {
      const item = items.find((i) => i.id === row.itemId);
      if (!item) {
        errors.push(`Row ${idx + 1}: Please select a packaging item.`);
        return;
      }

      const qty = Number(row.quantity);
      if (!qty || qty <= 0) {
        errors.push(`Row ${idx + 1} (${item.itemCode}): Enter a valid production quantity (> 0).`);
        return;
      }

      const actualUnit = Number(row.actualUnitWeight);
      if (!actualUnit || actualUnit <= 0) {
        errors.push(`Row ${idx + 1} (${item.itemCode}): Enter a valid measured actual unit weight (> 0g).`);
        return;
      }

      const cat = categories.find((c) => c.id === item.categoryId);
      const sub = subcategories.find((s) => s.id === item.subcategoryId);

      const calc = getRowCalculations(row);
      if (!calc) return;

      validatedRecords.push({
        companyId: currentUser.companyId,
        productionDate,
        shift,
        productionLine,
        batchNumber: row.batchNumber.trim() || `B-${Date.now().toString().slice(-4)}`,
        itemId: item.id,
        itemNameSnapshot: item.itemName,
        itemCodeSnapshot: item.itemCode,
        categorySnapshot: cat?.name || 'General Packaging',
        subcategorySnapshot: sub?.name || 'Standard',
        idealComponentWeightsSnapshot: {
          jarWeight: item.jarWeight,
          capWeight: item.capWeight,
          plasticHandleWeight: item.plasticHandleWeight,
          steelHandleWeight: item.steelHandleWeight,
          otherComponentWeight: item.otherComponentWeight,
          otherComponentName: item.otherComponentName,
        },
        approvedIdealWeightSnapshot: item.approvedIdealWeight,
        toleranceSnapshot: item.toleranceLimits,
        actualComponentWeights: {
          jarWeight: row.actualJarWeight ? Number(row.actualJarWeight) : undefined,
          capWeight: row.actualCapWeight ? Number(row.actualCapWeight) : undefined,
          plasticHandleWeight: row.actualPlasticHandleWeight ? Number(row.actualPlasticHandleWeight) : undefined,
          steelHandleWeight: row.actualSteelHandleWeight ? Number(row.actualSteelHandleWeight) : undefined,
          otherComponentWeight: row.actualOtherWeight ? Number(row.actualOtherWeight) : undefined,
        },
        actualUnitWeight: actualUnit,
        measurementMode: row.showComponentDetails ? 'components_entered' : 'unit_only',
        hasIncompleteComponents: false,
        productionQuantity: qty,
        rejectedQuantity: Number(row.rejectedQuantity) || 0,
        wastageWeight: Number(row.wastageWeight) || 0,
        unitDifference: calc.unitDifference,
        totalIdealWeight: calc.totalIdealWeight,
        totalActualWeight: calc.totalActualWeight,
        totalWeightDifference: calc.totalWeightDifference,
        percentageDeviation: calc.percentageDeviation,
        weightStatus: calc.weightStatus,
        remarks: row.remarks || '',
        recordedById: currentUser.id,
        recordedByName: currentUser.fullName,
        recordedByDesignation: currentUser.designation,
      });
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save batch
    setIsSubmitting(true);
    setTimeout(() => {
      onSaveBatch(validatedRecords);
      setIsSubmitting(false);
      setSaveSuccessMessage(
        `Successfully logged ${validatedRecords.length} production items for ${formatDateDDMMYYYY(productionDate)}!`
      );
      // Reset rows with 1 blank row
      setRows([
        {
          rowId: `row_${Date.now()}`,
          itemId: items[0]?.id || '',
          batchNumber: `B-01`,
          quantity: '',
          actualUnitWeight: items[0] ? items[0].approvedIdealWeight : '',
          rejectedQuantity: 0,
          wastageWeight: 0,
          remarks: '',
        },
      ]);
    }, 400);
  };

  // Grand totals across rows
  const sessionTotalQty = rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const sessionTotalActualKg = rows.reduce((s, r) => {
    const q = Number(r.quantity) || 0;
    const w = Number(r.actualUnitWeight) || 0;
    return s + (q * w) / 1000;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Title & Fast Workflow Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Feature 1: Quick Daily Production Entry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            High-Speed Multi-Product Entry
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Record multiple products in seconds. Set shared date, shift, and line once, then enter items and weights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Session Total Qty</p>
            <p className="text-xl font-black text-emerald-400">
              {sessionTotalQty.toLocaleString('en-IN')} pcs
            </p>
            <p className="text-[11px] text-slate-300">
              Est. Weight: <strong>{sessionTotalActualKg.toFixed(2)} kg</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 font-bold"
            >
              View on Dashboard
            </button>
            <button onClick={() => setSaveSuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Notifications */}
      {formErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Please resolve the following input issues before saving:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sticky Shared Context Card (Date, Shift, Line) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Shared Session Header (Applied to All Items Below)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Production Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Production Shift <span className="text-rose-500">*</span>
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-emerald-500"
            >
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Production Line / Machine <span className="text-rose-500">*</span>
            </label>
            <select
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-emerald-500"
            >
              {PRODUCTION_LINES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Entry Multi-Product Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Packaging Products Table ({rows.length} rows)
            </h3>
          </div>
          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 min-w-[260px]">Packaging Item (Auto-loads Specs)</th>
                <th className="py-3 px-3 w-28">Batch / Lot</th>
                <th className="py-3 px-3 w-32 text-right">Quantity (pcs)</th>
                <th className="py-3 px-3 w-28 text-right">Ideal Unit Wt</th>
                <th className="py-3 px-3 w-32 text-right">Actual Unit Wt</th>
                <th className="py-3 px-3 w-28 text-right">Ideal Total</th>
                <th className="py-3 px-3 w-28 text-right">Actual Total</th>
                <th className="py-3 px-3 w-28 text-right">Variance</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
                <th className="py-3 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((row, idx) => {
                const item = items.find((i) => i.id === row.itemId);
                const calc = getRowCalculations(row);

                return (
                  <React.Fragment key={row.rowId}>
                    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Item Selector */}
                      <td className="py-3 px-3">
                        <select
                          value={row.itemId}
                          onChange={(e) => handleUpdateRow(row.rowId, { itemId: e.target.value })}
                          className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-emerald-500"
                        >
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              [{i.itemCode}] {i.itemName} (Ideal: {i.approvedIdealWeight}g)
                            </option>
                          ))}
                        </select>

                        {/* Component weights toggle button */}
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Tol: ±{item?.toleranceLimits.percentage || 2.5}%
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRow(row.rowId, {
                                showComponentDetails: !row.showComponentDetails,
                              })
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>
                              {row.showComponentDetails ? 'Hide Components' : 'Enter Component Wts'}
                            </span>
                            {row.showComponentDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.batchNumber}
                          placeholder="e.g. B-01"
                          onChange={(e) => handleUpdateRow(row.rowId, { batchNumber: e.target.value })}
                          className="w-full text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="1"
                          placeholder="0 pcs"
                          value={row.quantity}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              quantity: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-bold text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-emerald-500"
                        />
                      </td>

                      {/* Ideal Unit Weight (Auto) */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {item ? `${item.approvedIdealWeight.toFixed(2)} g` : '—'}
                      </td>

                      {/* Actual Unit Weight Input */}
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          placeholder="0.00 g"
                          value={row.actualUnitWeight}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              actualUnitWeight: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-bold text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-emerald-500"
                        />
                      </td>

                      {/* Ideal Total */}
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300 font-medium">
                        {calc ? formatKgOnly(calc.totalIdealWeight) : '—'}
                      </td>

                      {/* Actual Total */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {calc ? formatKgOnly(calc.totalActualWeight) : '—'}
                      </td>

                      {/* Variance */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {calc ? (
                          <span className={calc.totalWeightDifference > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {formatVariance(calc.unitDifference)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {calc ? (
                          <ToleranceBadge
                            status={calc.weightStatus}
                            percentageDiff={calc.percentageDeviation}
                            compact
                          />
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.rowId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Component Breakdown Sub-row */}
                    {row.showComponentDetails && item && (
                      <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-200/50 dark:border-emerald-900/50">
                        <td colSpan={11} className="p-3 pl-12">
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                              Component Weights for {item.itemName} (Entering components auto-sums unit weight)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                              {item.jarWeight !== null && (
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                    Jar (Ideal: {item.jarWeight}g)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={`${item.jarWeight}`}
                                    value={row.actualJarWeight ?? ''}
                                    onChange={(e) =>
                                      handleUpdateRow(row.rowId, {
                                        actualJarWeight: e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded"
                                  />
                                </div>
                              )}
                              {item.capWeight !== null && (
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                    Cap (Ideal: {item.capWeight}g)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={`${item.capWeight}`}
                                    value={row.actualCapWeight ?? ''}
                                    onChange={(e) =>
                                      handleUpdateRow(row.rowId, {
                                        actualCapWeight: e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded"
                                  />
                                </div>
                              )}
                              {item.plasticHandleWeight !== null && (
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                    Plastic Handle ({item.plasticHandleWeight}g)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={row.actualPlasticHandleWeight ?? ''}
                                    onChange={(e) =>
                                      handleUpdateRow(row.rowId, {
                                        actualPlasticHandleWeight: e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded"
                                  />
                                </div>
                              )}
                              {item.steelHandleWeight !== null && (
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                    Steel Handle ({item.steelHandleWeight}g)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={row.actualSteelHandleWeight ?? ''}
                                    onChange={(e) =>
                                      handleUpdateRow(row.rowId, {
                                        actualSteelHandleWeight: e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                                  Rejections (pcs)
                                </label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={row.rejectedQuantity}
                                  onChange={(e) =>
                                    handleUpdateRow(row.rowId, {
                                      rejectedQuantity: e.target.value === '' ? '' : Number(e.target.value),
                                    })
                                  }
                                  className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border rounded"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Row</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmitBatch}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving All Production...' : `Save & Log ${rows.length} Items`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
