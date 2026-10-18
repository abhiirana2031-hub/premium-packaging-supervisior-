'use client';

import React from 'react';
import { ProductionRecord, UserProfile } from '@/types';
import { formatDateDDMMYYYY, formatDateTimeIST } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import { ToleranceBadge } from '../ToleranceBadge';
import {
  X,
  Printer,
  ShieldCheck,
  Scale,
  Package,
  Layers,
  Clock,
  User,
  Info,
} from 'lucide-react';

interface InspectRecordModalProps {
  record: ProductionRecord | null;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenSlip: (record: ProductionRecord) => void;
}

export const InspectRecordModal: React.FC<InspectRecordModalProps> = ({
  record,
  currentUser,
  onClose,
  onOpenSlip,
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Historical Production Record Inspection
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  {record.slipNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audited record preserves original engineering specifications snapshot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSlip(record)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Production Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-900 dark:text-slate-100">
          {/* Key Identification Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Production Date</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {formatDateDDMMYYYY(record.productionDate)}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Shift & Line</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {record.shift.split('(')[0].trim()}
              </p>
              <p className="text-slate-500 text-[10px] truncate">{record.productionLine || 'Line 1'}</p>
            </div>

            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Batch / Lot #</p>
              <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {record.batchNumber || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Quality Compliance</p>
              <div className="mt-1">
                <ToleranceBadge status={record.weightStatus} percentageDiff={record.percentageDeviation} />
              </div>
            </div>
          </div>

          {/* Preserved Item Specification Snapshot (Section 12) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Preserved Specification Snapshot (Historical Integrity)
              </span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Item Snapshot</p>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {record.itemNameSnapshot}
                </p>
                <p className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  [{record.itemCodeSnapshot}]
                </p>
                <p className="text-slate-500 text-[11px] mt-1">
                  Category: {record.categorySnapshot} • Subcategory: {record.subcategorySnapshot}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Approved Ideal Weight</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {record.approvedIdealWeightSnapshot.toFixed(2)} g
                </p>
                <p className="text-slate-500 text-[11px] mt-1">
                  Tolerance Limit: ±{record.toleranceSnapshot.percentage}% (Min: {record.toleranceSnapshot.minWeight || '—'}g, Max: {record.toleranceSnapshot.maxWeight || '—'}g)
                </p>
              </div>
            </div>
          </div>

          {/* Component Weights: Ideal Snapshot vs Actual Measured */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Weight Variance Inspection
            </h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Metric / Component</th>
                    <th className="py-2.5 px-3 text-right">Ideal Spec Snapshot</th>
                    <th className="py-2.5 px-3 text-right">Actual Measured</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {record.idealComponentWeightsSnapshot.jarWeight && (
                    <tr>
                      <td className="py-2 px-3">Jar / Body Component</td>
                      <td className="py-2 px-3 text-right">{record.idealComponentWeightsSnapshot.jarWeight.toFixed(2)} g</td>
                      <td className="py-2 px-3 text-right font-medium">
                        {record.actualComponentWeights.jarWeight ? `${record.actualComponentWeights.jarWeight.toFixed(2)} g` : 'Not recorded separately'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium">
                        {record.actualComponentWeights.jarWeight ? formatVariance(record.actualComponentWeights.jarWeight - record.idealComponentWeightsSnapshot.jarWeight) : '—'}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400">—</td>
                    </tr>
                  )}
                  {record.idealComponentWeightsSnapshot.capWeight && (
                    <tr>
                      <td className="py-2 px-3">Cap / Closure Component</td>
                      <td className="py-2 px-3 text-right">{record.idealComponentWeightsSnapshot.capWeight.toFixed(2)} g</td>
                      <td className="py-2 px-3 text-right font-medium">
                        {record.actualComponentWeights.capWeight ? `${record.actualComponentWeights.capWeight.toFixed(2)} g` : 'Not recorded separately'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium">
                        {record.actualComponentWeights.capWeight ? formatVariance(record.actualComponentWeights.capWeight - record.idealComponentWeightsSnapshot.capWeight) : '—'}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400">—</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2.5 px-3">Total Assembled Unit Weight</td>
                    <td className="py-2.5 px-3 text-right">{record.approvedIdealWeightSnapshot.toFixed(2)} g</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white">
                      {record.actualUnitWeight.toFixed(2)} g
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatVariance(record.unitDifference)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <ToleranceBadge status={record.weightStatus} compact />
                    </td>
                  </tr>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 font-bold">
                    <td className="py-2.5 px-3">
                      Production Run ({record.productionQuantity.toLocaleString('en-IN')} pcs)
                    </td>
                    <td className="py-2.5 px-3 text-right">{formatKgOnly(record.totalIdealWeight)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white">
                      {formatKgOnly(record.totalActualWeight)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {record.totalWeightDifference >= 0 ? '+' : ''}{formatKgOnly(record.totalWeightDifference)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {record.percentageDeviation >= 0 ? '+' : ''}{record.percentageDeviation.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejections, Wastage & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-500">Good Quantity</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {record.productionQuantity.toLocaleString('en-IN')} pcs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-500">Rejected Quantity</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {record.rejectedQuantity || 0} pcs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-500">Purge / Wastage</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatGramsOnly(record.wastageWeight || 0)}
              </p>
            </div>
          </div>

          {record.remarks && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200">
              <p className="font-bold uppercase text-[10px]">Supervisor Observation:</p>
              <p className="mt-0.5">{record.remarks}</p>
            </div>
          )}

          {/* Audit Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Recorded By: <strong className="text-slate-800 dark:text-slate-200">{record.recordedByName}</strong> ({record.recordedByDesignation})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Created: {formatDateTimeIST(record.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
