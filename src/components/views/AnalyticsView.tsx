'use client';

import React, { useState } from 'react';
import { Category, DatePreset, Item, ProductionRecord, UserProfile } from '@/types';
import { getDateRangeForPreset, formatDateDDMMYYYY } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly } from '@/lib/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Scale,
  Calendar,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface AnalyticsViewProps {
  records: ProductionRecord[];
  items: Item[];
  categories: Category[];
  currentUser: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  items,
  categories,
  currentUser,
}) => {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30_days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const { start, end, label: dateRangeLabel } = getDateRangeForPreset(datePreset, customStart, customEnd);

  // Filter records
  const filteredRecords = records.filter(
    (r) => r.productionDate >= start && r.productionDate <= end
  );

  // Group by Date for Daily Trend
  const dateMap = new Map<string, { date: string; displayDate: string; quantity: number; actualKg: number; idealKg: number; varianceKg: number }>();

  // Group by Category for Pie Chart
  const categoryMap = new Map<string, number>();

  // Group by Item for Top Produced
  const itemMap = new Map<string, { name: string; code: string; qty: number; actualKg: number; idealKg: number; outOfTolCount: number }>();

  // Wastage & Rejections
  let totalRejections = 0;
  let totalWastageG = 0;

  filteredRecords.forEach((r) => {
    // By Date
    const dKey = r.productionDate;
    const existingDate = dateMap.get(dKey) || {
      date: dKey,
      displayDate: formatDateDDMMYYYY(dKey),
      quantity: 0,
      actualKg: 0,
      idealKg: 0,
      varianceKg: 0,
    };
    existingDate.quantity += r.productionQuantity;
    existingDate.actualKg += r.totalActualWeight / 1000;
    existingDate.idealKg += r.totalIdealWeight / 1000;
    existingDate.varianceKg += r.totalWeightDifference / 1000;
    dateMap.set(dKey, existingDate);

    // By Category
    const cCount = categoryMap.get(r.categorySnapshot) || 0;
    categoryMap.set(r.categorySnapshot, cCount + r.productionQuantity);

    // By Item
    const it = itemMap.get(r.itemCodeSnapshot) || {
      name: r.itemNameSnapshot,
      code: r.itemCodeSnapshot,
      qty: 0,
      actualKg: 0,
      idealKg: 0,
      outOfTolCount: 0,
    };
    it.qty += r.productionQuantity;
    it.actualKg += r.totalActualWeight / 1000;
    it.idealKg += r.totalIdealWeight / 1000;
    if (r.weightStatus === 'outside_tolerance') it.outOfTolCount += 1;
    itemMap.set(r.itemCodeSnapshot, it);

    totalRejections += r.rejectedQuantity || 0;
    totalWastageG += r.wastageWeight || 0;
  });

  // Sort daily data chronologically
  const dailyData = Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      ...d,
      actualKg: Number(d.actualKg.toFixed(2)),
      idealKg: Number(d.idealKg.toFixed(2)),
      varianceKg: Number(d.varianceKg.toFixed(2)),
    }));

  // Category Pie Data
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Top Items Data
  const topItemsData = Array.from(itemMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((i) => ({
      name: i.code,
      fullName: i.name,
      quantity: i.qty,
      actualKg: Number(i.actualKg.toFixed(1)),
      idealKg: Number(i.idealKg.toFixed(1)),
      outOfTolCount: i.outOfTolCount,
    }));

  // Items outside tolerance
  const outOfTolItems = Array.from(itemMap.values())
    .filter((i) => i.outOfTolCount > 0)
    .sort((a, b) => b.outOfTolCount - a.outOfTolCount);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Visual Analytics & Operational Insights
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Plant Performance Charts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real calculated trends based on verified packaging production logs.
          </p>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'last_7_days', label: '7 Days' },
            { id: 'current_month', label: 'This Month' },
            { id: 'previous_month', label: 'Last Month' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'current_year', label: 'This Year' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setDatePreset(p.id as DatePreset)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                datePreset === p.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Production Records for {dateRangeLabel}
          </h3>
          <p className="text-xs">
            Switch your reporting period or record new production entries to view interactive visual charts.
          </p>
        </div>
      ) : (
        <>
          {/* Chart 1: Daily Production Volume & Actual Material (Dual Axis) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daily Production Output & Material Consumption Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Compare total pieces produced against total actual resin weight in kilograms
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {dailyData.length} operating days
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="quantity" name="Quantity (pcs)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="actualKg" name="Actual Weight (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row of 2 Charts: Category Distribution & Ideal vs Actual Variance Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Share Donut */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Production Share by Category
                </h3>
                <p className="text-xs text-slate-500">
                  Volume distribution across packaging product lines
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ideal vs Actual Line Chart */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ideal Spec vs Actual Weight Trend (kg)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily tracking of material variance above or below engineering spec
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="idealKg" name="Ideal Spec (kg)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="actualKg" name="Actual Resin (kg)" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row of 2 Tables: Top Produced Items & Quality Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Produced Items */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Top Produced Packaging Items
              </h3>
              <div className="space-y-2">
                {topItemsData.map((item, idx) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {item.fullName}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-600 font-bold">
                        [{item.name}]
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        {item.quantity.toLocaleString('en-IN')} pcs
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {item.actualKg} kg resin
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Out-of-Tolerance Quality Alerts */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Quality Tolerance Compliance Summary</span>
                </h3>
              </div>

              {outOfTolItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    Zero Quality Deviations!
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    All recorded production runs were within approved weight tolerances.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {outOfTolItems.map((item) => (
                    <div
                      key={item.code}
                      className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-rose-950 dark:text-rose-200">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono text-rose-700">
                          [{item.code}]
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white">
                        {item.outOfTolCount} out-of-spec run{item.outOfTolCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rejections & Wastage summary */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>Total Rejections: <strong className="text-slate-800 dark:text-slate-200">{totalRejections} pcs</strong></span>
                <span>Purge Wastage: <strong className="text-slate-800 dark:text-slate-200">{formatGramsOnly(totalWastageG)}</strong></span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
