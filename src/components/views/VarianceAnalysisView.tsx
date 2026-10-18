'use client';

import React, { useState } from 'react';
import {
  Category,
  DatePreset,
  Item,
  ProductionRecord,
  Subcategory,
  UserProfile,
} from '@/types';
import { MetricCard } from '../MetricCard';
import { ToleranceBadge } from '../ToleranceBadge';
import { getDateRangeForPreset, formatDateDDMMYYYY } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart,
  Calendar,
} from 'lucide-react';

interface VarianceAnalysisViewProps {
  records: ProductionRecord[];
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: UserProfile;
}

export const VarianceAnalysisView: React.FC<VarianceAnalysisViewProps> = ({
  records,
  items,
  categories,
  subcategories,
  currentUser,
}) => {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_7_days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute active date range
  const { start, end, label: dateRangeLabel } = getDateRangeForPreset(datePreset, customStart, customEnd);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (r.productionDate < start || r.productionDate > end) return false;
    if (selectedCategory !== 'all' && r.categorySnapshot !== selectedCategory) return false;
    if (selectedItem !== 'all' && r.itemId !== selectedItem) return false;
    if (statusFilter !== 'all' && r.weightStatus !== statusFilter) return false;
    return true;
  });

  // Material Usage Calculations (Feature 2)
  const totalIdealWeightG = filteredRecords.reduce((s, r) => s + r.totalIdealWeight, 0);
  const totalActualWeightG = filteredRecords.reduce((s, r) => s + r.totalActualWeight, 0);
  const netWeightVarianceG = totalActualWeightG - totalIdealWeightG;
  const netDeviationPct = totalIdealWeightG > 0 ? (netWeightVarianceG / totalIdealWeightG) * 100 : 0;

  // Breakdown of excess vs shortfall
  const excessMaterialG = filteredRecords
    .filter((r) => r.totalWeightDifference > 0)
    .reduce((s, r) => s + r.totalWeightDifference, 0);

  const shortfallMaterialG = filteredRecords
    .filter((r) => r.totalWeightDifference < 0)
    .reduce((s, r) => s + Math.abs(r.totalWeightDifference), 0);

  // Out-of-tolerance count
  const outsideTolRecords = filteredRecords.filter((r) => r.weightStatus === 'outside_tolerance');
  const warningRecords = filteredRecords.filter((r) => r.weightStatus === 'warning');
  const incompleteRecords = filteredRecords.filter((r) => r.weightStatus === 'incomplete');

  // Aggregate by Item for Item-level Efficiency Matrix
  const itemMap = new Map<
    string,
    {
      itemCode: string;
      itemName: string;
      category: string;
      totalQty: number;
      idealWeightG: number;
      actualWeightG: number;
      unitIdealAvg: number;
      unitActualAvg: number;
      recordsCount: number;
      outOfTolCount: number;
      // Component variances
      jarDiffSum: number;
      capDiffSum: number;
      handleDiffSum: number;
      componentCount: number;
    }
  >();

  filteredRecords.forEach((r) => {
    const existing = itemMap.get(r.itemCodeSnapshot) || {
      itemCode: r.itemCodeSnapshot,
      itemName: r.itemNameSnapshot,
      category: r.categorySnapshot,
      totalQty: 0,
      idealWeightG: 0,
      actualWeightG: 0,
      unitIdealAvg: r.approvedIdealWeightSnapshot,
      unitActualAvg: 0,
      recordsCount: 0,
      outOfTolCount: 0,
      jarDiffSum: 0,
      capDiffSum: 0,
      handleDiffSum: 0,
      componentCount: 0,
    };

    existing.totalQty += r.productionQuantity;
    existing.idealWeightG += r.totalIdealWeight;
    existing.actualWeightG += r.totalActualWeight;
    existing.recordsCount += 1;
    if (r.weightStatus === 'outside_tolerance') existing.outOfTolCount += 1;

    // Component tracking if recorded
    if (r.actualComponentWeights) {
      if (r.actualComponentWeights.jarWeight && r.idealComponentWeightsSnapshot.jarWeight) {
        existing.jarDiffSum += r.actualComponentWeights.jarWeight - r.idealComponentWeightsSnapshot.jarWeight;
        existing.componentCount += 1;
      }
      if (r.actualComponentWeights.capWeight && r.idealComponentWeightsSnapshot.capWeight) {
        existing.capDiffSum += r.actualComponentWeights.capWeight - r.idealComponentWeightsSnapshot.capWeight;
      }
      if (r.actualComponentWeights.plasticHandleWeight && r.idealComponentWeightsSnapshot.plasticHandleWeight) {
        existing.handleDiffSum += r.actualComponentWeights.plasticHandleWeight - r.idealComponentWeightsSnapshot.plasticHandleWeight;
      }
      if (r.actualComponentWeights.steelHandleWeight && r.idealComponentWeightsSnapshot.steelHandleWeight) {
        existing.handleDiffSum += r.actualComponentWeights.steelHandleWeight - r.idealComponentWeightsSnapshot.steelHandleWeight;
      }
    }

    itemMap.set(r.itemCodeSnapshot, existing);
  });

  const itemSummaries = Array.from(itemMap.values()).map((it) => {
    const diffG = it.actualWeightG - it.idealWeightG;
    const pct = it.idealWeightG > 0 ? (diffG / it.idealWeightG) * 100 : 0;
    const avgActualUnit = it.totalQty > 0 ? it.actualWeightG / it.totalQty : 0;
    const unitDiff = avgActualUnit - it.unitIdealAvg;

    // Find dominant component variance if recorded
    let dominantComp = 'Total Body';
    const compMax = Math.max(
      Math.abs(it.jarDiffSum),
      Math.abs(it.capDiffSum),
      Math.abs(it.handleDiffSum)
    );
    if (compMax > 0) {
      if (Math.abs(it.jarDiffSum) === compMax) dominantComp = 'Jar Body';
      else if (Math.abs(it.capDiffSum) === compMax) dominantComp = 'Cap Closure';
      else if (Math.abs(it.handleDiffSum) === compMax) dominantComp = 'Handle';
    }

    return {
      ...it,
      diffG,
      pct,
      avgActualUnit,
      unitDiff,
      dominantComp,
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-900/40 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Feature 2: Weight Variance & Material Usage Tracking
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Material Consumption & Variance Analysis
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Audit ideal vs actual resin consumption, detect overweight packaging, and identify dominant component deviations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
            {dateRangeLabel}
          </span>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Period:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last_3_days', label: '3 Days' },
              { id: 'last_7_days', label: '7 Days' },
              { id: 'current_month', label: 'This Month' },
              { id: 'previous_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id as DatePreset)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  datePreset === p.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5"
              />
            </div>
          )}
        </div>

        {/* Category, Item, and Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
            >
              <option value="all">All Product Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
            >
              <option value="all">All Packaging Items</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.itemCode}] {i.itemName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Tolerance Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
            >
              <option value="all">All Weight Statuses</option>
              <option value="within_tolerance">Within Approved Tolerance</option>
              <option value="warning">Warning / Approaching</option>
              <option value="outside_tolerance">Outside Tolerance (Out of Spec)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature 2 Material Usage Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Ideal Material"
          value={formatKgOnly(totalIdealWeightG)}
          subtitle={`${formatGramsOnly(totalIdealWeightG)} engineering ideal`}
          icon={Layers}
          variant="default"
        />

        <MetricCard
          title="Total Actual Material"
          value={formatKgOnly(totalActualWeightG)}
          subtitle={`${formatGramsOnly(totalActualWeightG)} raw resin used`}
          icon={Scale}
          variant="emerald"
        />

        <MetricCard
          title="Net Weight Variance"
          value={`${netWeightVarianceG >= 0 ? '+' : ''}${formatKgOnly(netWeightVarianceG)}`}
          subtitle={`${netDeviationPct >= 0 ? '+' : ''}${netDeviationPct.toFixed(2)}% net deviation`}
          icon={netWeightVarianceG > 0 ? TrendingUp : TrendingDown}
          variant={netWeightVarianceG > 0 ? 'amber' : 'emerald'}
          badge={{
            text: netWeightVarianceG > 0 ? 'Excess Consumption' : 'Material Saving',
            variant: netWeightVarianceG > 0 ? 'warning' : 'positive',
          }}
        />

        <MetricCard
          title="Out of Tolerance Runs"
          value={outsideTolRecords.length}
          subtitle={`+ ${warningRecords.length} approaching limit`}
          icon={AlertOctagon}
          variant={outsideTolRecords.length > 0 ? 'rose' : 'emerald'}
          badge={{
            text: outsideTolRecords.length === 0 ? '100% In Spec' : 'Action Required',
            variant: outsideTolRecords.length === 0 ? 'positive' : 'negative',
          }}
        />

        <MetricCard
          title="Excess Resin Weight"
          value={formatKgOnly(excessMaterialG)}
          subtitle={`Shortfall: ${formatKgOnly(shortfallMaterialG)}`}
          icon={TrendingUp}
          variant="amber"
          badge={{
            text: 'Material Impact',
            variant: 'warning',
          }}
        />
      </div>

      {/* Item-Wise Material Efficiency Matrix Table (Feature 2) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Packaging Item Material Consumption Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated efficiency for {itemSummaries.length} packaging products in selected period
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {filteredRecords.length} total records evaluated
          </span>
        </div>

        {itemSummaries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No production records match the selected period and criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3.5">Product Item & Code</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5 text-right">Production Qty</th>
                  <th className="py-3 px-3.5 text-right">Ideal Spec (g)</th>
                  <th className="py-3 px-3.5 text-right">Avg Actual (g)</th>
                  <th className="py-3 px-3.5 text-right">Unit Diff (g)</th>
                  <th className="py-3 px-3.5 text-right">Ideal Total (kg)</th>
                  <th className="py-3 px-3.5 text-right">Actual Total (kg)</th>
                  <th className="py-3 px-3.5 text-right">Variance (kg)</th>
                  <th className="py-3 px-3.5 text-right">Deviation %</th>
                  <th className="py-3 px-3.5 text-center">Dominant Driver</th>
                  <th className="py-3 px-3.5 text-center">Quality Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {itemSummaries.map((it) => {
                  const status =
                    it.outOfTolCount > 0
                      ? 'outside_tolerance'
                      : Math.abs(it.pct) > 2.0
                      ? 'warning'
                      : 'within_tolerance';

                  return (
                    <tr
                      key={it.itemCode}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3.5">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                          {it.itemName}
                        </p>
                        <p className="font-mono text-[10px] text-emerald-600 font-semibold">
                          [{it.itemCode}]
                        </p>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                        {it.category}
                      </td>

                      <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                        {it.totalQty.toLocaleString('en-IN')} pcs
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                        {it.unitIdealAvg.toFixed(2)} g
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {it.avgActualUnit.toFixed(2)} g
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold">
                        {formatVariance(it.unitDiff)}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                        {formatKgOnly(it.idealWeightG)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatKgOnly(it.actualWeightG)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold">
                        <span className={it.diffG > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {it.diffG >= 0 ? '+' : ''}{formatKgOnly(it.diffG)}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold">
                        <span className={Math.abs(it.pct) > 2.5 ? 'text-rose-600' : Math.abs(it.pct) > 1.5 ? 'text-amber-600' : 'text-emerald-600'}>
                          {it.pct >= 0 ? '+' : ''}{it.pct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {it.dominantComp}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <ToleranceBadge status={status} percentageDiff={it.pct} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
