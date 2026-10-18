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
import { ToleranceBadge } from '../ToleranceBadge';
import { getDateRangeForPreset, formatDateDDMMYYYY, formatDateTimeIST } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import {
  History,
  Calendar as CalendarIcon,
  Table as TableIcon,
  Search,
  Filter,
  Eye,
  Printer,
  Trash2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface HistoryViewProps {
  records: ProductionRecord[];
  items: Item[];
  categories: Category[];
  subcategories: Subcategory[];
  currentUser: UserProfile;
  onOpenSlip: (record: ProductionRecord) => void;
  onInspectRecord: (record: ProductionRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTriggerExport: (records: ProductionRecord[]) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  items,
  categories,
  subcategories,
  currentUser,
  onOpenSlip,
  onInspectRecord,
  onDeleteRecord,
  onTriggerExport,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30_days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Compute active date range
  const { start, end, label: dateRangeLabel } = getDateRangeForPreset(datePreset, customStart, customEnd);

  // Filter records
  const filteredRecords = records.filter((r) => {
    // Date filter
    if (r.productionDate < start || r.productionDate > end) return false;

    // Category
    if (categoryFilter !== 'all' && r.categorySnapshot !== categoryFilter) return false;

    // Subcategory
    if (subcategoryFilter !== 'all' && r.subcategorySnapshot !== subcategoryFilter) return false;

    // Item
    if (itemFilter !== 'all' && r.itemId !== itemFilter) return false;

    // Shift
    if (shiftFilter !== 'all' && !r.shift.includes(shiftFilter)) return false;

    // Status
    if (statusFilter !== 'all' && r.weightStatus !== statusFilter) return false;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.slipNumber.toLowerCase().includes(q) ||
        r.itemNameSnapshot.toLowerCase().includes(q) ||
        r.itemCodeSnapshot.toLowerCase().includes(q) ||
        (r.batchNumber && r.batchNumber.toLowerCase().includes(q)) ||
        r.recordedByName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Group by date for Calendar view
  const recordsByDate = new Map<string, ProductionRecord[]>();
  records.forEach((r) => {
    const list = recordsByDate.get(r.productionDate) || [];
    list.push(r);
    recordsByDate.set(r.productionDate, list);
  });

  // Calendar dates for current month
  const today = typeof window !== 'undefined' ? new Date() : new Date('2026-10-18T10:00:00.000Z');
  const currentMonthYear = `${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <History className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Audit & Record Vault
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Production History & Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical records preserve original specifications snapshot permanently.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          <button
            onClick={() => onTriggerExport(filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Filtered ({filteredRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Date Presets Ribbon (Section 8) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 mr-1">Quick Presets:</span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'last_2_days', label: '2 Days' },
            { id: 'last_3_days', label: '3 Days' },
            { id: 'last_7_days', label: '7 Days' },
            { id: 'current_week', label: 'This Week' },
            { id: 'previous_week', label: 'Last Week' },
            { id: 'current_month', label: 'This Month' },
            { id: 'previous_month', label: 'Last Month' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'current_year', label: 'This Year' },
            { id: 'custom', label: 'Custom Range' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setDatePreset(preset.id as DatePreset);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                datePreset === preset.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs if 'custom' is active */}
        {datePreset === 'custom' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <span className="font-semibold text-slate-600 dark:text-slate-300">End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        )}

        {/* Multi-field Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search slip#, item name, code, batch, supervisor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <select
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="all">All Shifts</option>
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="within_tolerance">In Tolerance (Pass)</option>
              <option value="warning">Warning / Near Limit</option>
              <option value="outside_tolerance">Outside Spec (Failed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Calendar */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Showing {paginatedRecords.length} of {filteredRecords.length} records matching {dateRangeLabel}
            </span>
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {paginatedRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No production records found matching your query and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Slip #</th>
                    <th className="py-3 px-3.5">Packaging Item & Code</th>
                    <th className="py-3 px-3.5">Shift & Line</th>
                    <th className="py-3 px-3.5 text-right">Quantity</th>
                    <th className="py-3 px-3.5 text-right">Ideal Spec</th>
                    <th className="py-3 px-3.5 text-right">Actual Wt</th>
                    <th className="py-3 px-3.5 text-right">Diff / Unit</th>
                    <th className="py-3 px-3.5 text-right">Total Actual</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-left">Recorded By</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {formatDateDDMMYYYY(r.productionDate)}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-emerald-600">
                        {r.slipNumber}
                      </td>

                      <td className="py-3 px-3.5">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {r.itemNameSnapshot}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          [{r.itemCodeSnapshot}] • {r.categorySnapshot}
                        </p>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {r.shift.split('(')[0].trim()}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {r.productionLine?.split('—')[0].trim() || 'Line 1'}
                        </p>
                      </td>

                      <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                        {r.productionQuantity.toLocaleString('en-IN')} pcs
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300">
                        {r.approvedIdealWeightSnapshot.toFixed(2)} g
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {r.actualUnitWeight.toFixed(2)} g
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold">
                        {formatVariance(r.unitDifference)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatKgOnly(r.totalActualWeight)}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <ToleranceBadge
                          status={r.weightStatus}
                          percentageDiff={r.percentageDeviation}
                          compact
                        />
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            title="Print Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onInspectRecord(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Inspect Snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete production record ${r.slipNumber}? An audit log entry will be created.`)) {
                                  onDeleteRecord(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold ${
                      p === currentPage
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View (Section 8) */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Production Calendar ({currentMonthYear})
              </h3>
              <p className="text-xs text-slate-500">
                Click any calendar day to inspect production records and weight compliance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs">
            {monthDates.map((dateStr) => {
              const dayRecords = recordsByDate.get(dateStr) || [];
              const dayQty = dayRecords.reduce((s, r) => s + r.productionQuantity, 0);
              const dayHasOutTol = dayRecords.some((r) => r.weightStatus === 'outside_tolerance');
              const dayNum = dateStr.split('-')[2];

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (dayRecords.length > 0) {
                      onInspectRecord(dayRecords[0]);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all ${
                    dayRecords.length > 0
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 cursor-pointer hover:shadow-md hover:scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-base">{dayNum}</span>
                    {dayRecords.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                        {dayRecords.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayRecords.length > 0 ? (
                      <>
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {dayQty.toLocaleString('en-IN')} pcs
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {dayRecords.length} batches
                        </p>
                        {dayHasOutTol && (
                          <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-1 rounded">
                            Out of Tol
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400">No output</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
