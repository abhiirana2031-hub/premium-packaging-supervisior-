'use client';

import React, { useState } from 'react';
import {
  Category,
  Item,
  ProductionRecord,
  UserProfile,
} from '@/types';
import { MetricCard } from '../MetricCard';
import { ToleranceBadge } from '../ToleranceBadge';
import { formatDateDDMMYYYY } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import {
  Package,
  Layers,
  Scale,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Zap,
  History,
  FileSpreadsheet,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NavPage } from '../Sidebar';

interface DashboardViewProps {
  selectedDate: string;
  records: ProductionRecord[];
  items: Item[];
  categories: Category[];
  currentUser: UserProfile;
  onNavigate: (page: NavPage) => void;
  onOpenSlip: (record: ProductionRecord) => void;
  onInspectRecord: (record: ProductionRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedDate,
  records,
  items,
  categories,
  currentUser,
  onNavigate,
  onOpenSlip,
  onInspectRecord,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter records for the active selectedDate
  const dateRecords = records.filter((r) => r.productionDate === selectedDate);
  const filteredRecords =
    categoryFilter === 'all'
      ? dateRecords
      : dateRecords.filter((r) => r.categorySnapshot === categoryFilter);

  // Summary Card Metrics for the selected date
  const totalEntries = dateRecords.length;
  const totalQuantity = dateRecords.reduce((s, r) => s + r.productionQuantity, 0);
  const totalActualWeightG = dateRecords.reduce((s, r) => s + r.totalActualWeight, 0);
  const totalIdealWeightG = dateRecords.reduce((s, r) => s + r.totalIdealWeight, 0);
  const totalWeightDiffG = totalActualWeightG - totalIdealWeightG;
  const netDeviation = totalIdealWeightG > 0 ? (totalWeightDiffG / totalIdealWeightG) * 100 : 0;

  // Distinct items produced today
  const distinctItemCodes = new Set(dateRecords.map((r) => r.itemCodeSnapshot));
  const distinctItemsCount = distinctItemCodes.size;

  // Recent 5 entries across all dates
  const recentRecords = [...records].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Supervisor Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Shift Operations
            </span>
            <span className="text-xs text-slate-400">
              Production Date: <strong className="text-white">{formatDateDDMMYYYY(selectedDate)}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Plant Production Console
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Logged in as <strong className="text-white">{currentUser.fullName}</strong> —{' '}
            <span className="text-emerald-400 font-medium">{currentUser.designation}</span>
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('quick-entry')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs text-white shadow-sm transition-all hover:scale-102"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Multi-Entry</span>
          </button>

          <button
            onClick={() => onNavigate('add-entry')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-xs text-white border border-slate-600 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Single Entry</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 border border-slate-700 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Production Qty"
          value={totalQuantity.toLocaleString('en-IN')}
          unit="pcs"
          subtitle={`${distinctItemsCount} distinct product${distinctItemsCount === 1 ? '' : 's'}`}
          icon={Package}
          variant="indigo"
          badge={{
            text: `${totalEntries} entries recorded`,
            variant: totalEntries > 0 ? 'positive' : 'neutral',
          }}
        />

        <MetricCard
          title="Total Actual Weight"
          value={formatKgOnly(totalActualWeightG)}
          subtitle={formatGramsOnly(totalActualWeightG)}
          icon={Scale}
          variant="emerald"
          badge={{
            text: 'Measured Output',
            variant: 'neutral',
          }}
        />

        <MetricCard
          title="Total Ideal Weight"
          value={formatKgOnly(totalIdealWeightG)}
          subtitle={formatGramsOnly(totalIdealWeightG)}
          icon={Layers}
          variant="default"
          badge={{
            text: 'Engineering Spec',
            variant: 'neutral',
          }}
        />

        <MetricCard
          title="Total Weight Difference"
          value={`${totalWeightDiffG >= 0 ? '+' : ''}${formatKgOnly(totalWeightDiffG)}`}
          subtitle={`${netDeviation >= 0 ? '+' : ''}${netDeviation.toFixed(2)}% net deviation`}
          icon={totalWeightDiffG > 0 ? TrendingUp : TrendingDown}
          variant={Math.abs(netDeviation) > 2.5 ? 'rose' : Math.abs(netDeviation) > 1.5 ? 'amber' : 'emerald'}
          badge={{
            text: totalWeightDiffG > 0 ? 'Excess Resin' : totalWeightDiffG < 0 ? 'Weight Shortfall' : 'Exact Match',
            variant: Math.abs(netDeviation) > 2.5 ? 'negative' : Math.abs(netDeviation) > 1.5 ? 'warning' : 'positive',
          }}
          onClick={() => onNavigate('variance')}
        />
      </div>

      {/* Today's Production Table Section (Section 4) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Production for {formatDateDDMMYYYY(selectedDate)}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {dateRecords.length} records
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Item-level specifications, actual measured weights, and variance verification
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  categoryFilter === c.name
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Production Recorded for {formatDateDDMMYYYY(selectedDate)}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start recording packaging production for this date using either Quick Multi-Entry or the standard entry form.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onNavigate('quick-entry')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Launch Quick Multi-Entry
              </button>
              <button
                onClick={() => onNavigate('add-entry')}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Add Single Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Slip # / Shift</th>
                  <th className="py-3 px-3.5">Product Category</th>
                  <th className="py-3 px-3.5">Item Name & Code</th>
                  <th className="py-3 px-3.5 text-right">Production Qty</th>
                  <th className="py-3 px-3.5 text-right">Ideal Unit Wt</th>
                  <th className="py-3 px-3.5 text-right">Actual Unit Wt</th>
                  <th className="py-3 px-3.5 text-right">Unit Diff</th>
                  <th className="py-3 px-3.5 text-right">Total Ideal</th>
                  <th className="py-3 px-3.5 text-right">Total Actual</th>
                  <th className="py-3 px-3.5 text-right">Weight Diff</th>
                  <th className="py-3 px-3.5 text-center">Quality Status</th>
                  <th className="py-3 px-3.5 text-left">Recorded By</th>
                  <th className="py-3 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {r.slipNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {r.shift.split('(')[0].trim()}
                      </p>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.categorySnapshot}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {r.subcategorySnapshot}
                      </p>
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {r.itemNameSnapshot}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">
                        [{r.itemCodeSnapshot}]
                      </p>
                    </td>

                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                      {r.productionQuantity.toLocaleString('en-IN')} pcs
                    </td>

                    <td className="py-3 px-3.5 text-right font-medium text-slate-600 dark:text-slate-300">
                      {r.approvedIdealWeightSnapshot.toFixed(2)} g
                    </td>

                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {r.actualUnitWeight.toFixed(2)} g
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-semibold">
                      {formatVariance(r.unitDifference)}
                    </td>

                    <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                      {formatKgOnly(r.totalIdealWeight)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatKgOnly(r.totalActualWeight)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold">
                      <span className={r.totalWeightDifference > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {r.totalWeightDifference >= 0 ? '+' : ''}
                        {formatKgOnly(r.totalWeightDifference)}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <ToleranceBadge
                        status={r.weightStatus}
                        percentageDiff={r.percentageDeviation}
                        compact
                      />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.recordedByName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {r.recordedByDesignation}
                      </p>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenSlip(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Print Production Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onInspectRecord(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Production Records (Section 4) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Production Records Across All Dates
            </h3>
            <p className="text-xs text-slate-500">
              Quick audit view of the latest logged factory production
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentRecords.map((r) => (
            <div
              key={r.id}
              onClick={() => onInspectRecord(r)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {r.slipNumber}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {r.itemNameSnapshot}
                  </p>
                </div>
                <ToleranceBadge status={r.weightStatus} compact />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>{formatDateDDMMYYYY(r.productionDate)}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {r.productionQuantity.toLocaleString('en-IN')} pcs
                </span>
                <span className="font-mono font-medium">
                  {formatVariance(r.unitDifference)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
