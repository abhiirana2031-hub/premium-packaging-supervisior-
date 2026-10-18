'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProductionRecord, UserProfile } from '@/types';
import { formatDateDDMMYYYY, formatDateTimeIST } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ToleranceBadge } from './ToleranceBadge';

interface ProductionSlipModalProps {
  record: ProductionRecord | null;
  currentUser: UserProfile;
  companyName: string;
  onClose: () => void;
}

export const ProductionSlipModal: React.FC<ProductionSlipModalProps> = ({
  record,
  currentUser,
  companyName,
  onClose,
}) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const [printTimestamp, setPrintTimestamp] = useState('18-10-2026, 10:00 AM IST');

  React.useEffect(() => {
    setPrintTimestamp(formatDateTimeIST(new Date()));
  }, []);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const hasComponents =
    record.actualComponentWeights &&
    (record.actualComponentWeights.jarWeight ||
      record.actualComponentWeights.capWeight ||
      record.actualComponentWeights.plasticHandleWeight ||
      record.actualComponentWeights.steelHandleWeight ||
      record.actualComponentWeights.otherComponentWeight);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Production Batch Slip
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or file with production crate / shipping lot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Production Slip Body */}
        <div ref={slipRef} id="printable-production-slip" className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white tracking-wider">
                  PRODUCTION VERIFIED
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Unit 1 — Packaging Division
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white mt-1">
                {companyName.toUpperCase()}
              </h1>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                PREMIUM PACKAGING SUPERVISOR — PRODUCTION INSPECTION SLIP
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase text-slate-400">Slip Reference #</p>
              <p className="text-base sm:text-lg font-mono font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                {record.slipNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {formatDateDDMMYYYY(record.productionDate)}
              </p>
            </div>
          </div>

          {/* Item & Lot Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                Product Category
              </p>
              <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                {record.categorySnapshot}
              </p>
              <p className="text-slate-500 text-[10px] truncate">{record.subcategorySnapshot}</p>
            </div>

            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                Item Name & Code
              </p>
              <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate">
                {record.itemNameSnapshot}
              </p>
              <p className="text-emerald-600 font-mono text-[10px] font-bold">
                [{record.itemCodeSnapshot}]
              </p>
            </div>

            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                Shift & Line
              </p>
              <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                {record.shift.split('(')[0].trim()}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {record.productionLine || 'Standard Line'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                Batch / Lot #
              </p>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                {record.batchNumber || 'N/A'}
              </p>
              <p className="text-slate-500 text-[10px]">
                Qty: <span className="font-bold text-slate-800 dark:text-slate-200">{record.productionQuantity.toLocaleString('en-IN')} pcs</span>
              </p>
            </div>
          </div>

          {/* Component-level Breakdown if recorded */}
          {hasComponents && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Component Weight Breakdown (Grams)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-left">Component</th>
                      <th className="py-2 px-3 text-right">Ideal Spec</th>
                      <th className="py-2 px-3 text-right">Actual Measured</th>
                      <th className="py-2 px-3 text-right">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {record.idealComponentWeightsSnapshot.jarWeight && (
                      <tr>
                        <td className="py-1.5 px-3">Jar / Body</td>
                        <td className="py-1.5 px-3 text-right">{record.idealComponentWeightsSnapshot.jarWeight.toFixed(2)} g</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          {record.actualComponentWeights.jarWeight?.toFixed(2) || '—'} g
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {record.actualComponentWeights.jarWeight
                            ? formatVariance(record.actualComponentWeights.jarWeight - record.idealComponentWeightsSnapshot.jarWeight)
                            : '—'}
                        </td>
                      </tr>
                    )}
                    {record.idealComponentWeightsSnapshot.capWeight && (
                      <tr>
                        <td className="py-1.5 px-3">Cap / Closure</td>
                        <td className="py-1.5 px-3 text-right">{record.idealComponentWeightsSnapshot.capWeight.toFixed(2)} g</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          {record.actualComponentWeights.capWeight?.toFixed(2) || '—'} g
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {record.actualComponentWeights.capWeight
                            ? formatVariance(record.actualComponentWeights.capWeight - record.idealComponentWeightsSnapshot.capWeight)
                            : '—'}
                        </td>
                      </tr>
                    )}
                    {record.idealComponentWeightsSnapshot.plasticHandleWeight && (
                      <tr>
                        <td className="py-1.5 px-3">Plastic Handle</td>
                        <td className="py-1.5 px-3 text-right">{record.idealComponentWeightsSnapshot.plasticHandleWeight.toFixed(2)} g</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          {record.actualComponentWeights.plasticHandleWeight?.toFixed(2) || '—'} g
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {record.actualComponentWeights.plasticHandleWeight
                            ? formatVariance(record.actualComponentWeights.plasticHandleWeight - record.idealComponentWeightsSnapshot.plasticHandleWeight)
                            : '—'}
                        </td>
                      </tr>
                    )}
                    {record.idealComponentWeightsSnapshot.steelHandleWeight && (
                      <tr>
                        <td className="py-1.5 px-3">Steel Wire Handle</td>
                        <td className="py-1.5 px-3 text-right">{record.idealComponentWeightsSnapshot.steelHandleWeight.toFixed(2)} g</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          {record.actualComponentWeights.steelHandleWeight?.toFixed(2) || '—'} g
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {record.actualComponentWeights.steelHandleWeight
                            ? formatVariance(record.actualComponentWeights.steelHandleWeight - record.idealComponentWeightsSnapshot.steelHandleWeight)
                            : '—'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weight Totals & Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unit & Total Production Weights Comparison
            </h4>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Metric Specification</th>
                    <th className="py-2.5 px-3 text-right">Ideal Spec</th>
                    <th className="py-2.5 px-3 text-right">Actual Measured</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3 text-center">Quality Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Weight Per Unit</td>
                    <td className="py-2.5 px-3 text-right font-medium">{record.approvedIdealWeightSnapshot.toFixed(2)} g</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {record.actualUnitWeight.toFixed(2)} g
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {formatVariance(record.unitDifference)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <ToleranceBadge status={record.weightStatus} compact />
                    </td>
                  </tr>

                  <tr className="bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold">
                      Total Production Weight ({record.productionQuantity.toLocaleString('en-IN')} pcs)
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatKgOnly(record.totalIdealWeight)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatKgOnly(record.totalActualWeight)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {record.totalWeightDifference >= 0 ? '+' : ''}
                      {formatKgOnly(record.totalWeightDifference)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-xs">
                      {record.percentageDeviation >= 0 ? '+' : ''}
                      {record.percentageDeviation.toFixed(2)}% dev
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">Rejections & Wastage</td>
                    <td colSpan={4} className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      Rejected Qty: <strong className="text-slate-900 dark:text-white">{record.rejectedQuantity || 0} pcs</strong>
                      {' | '}
                      Purge / Trim Wastage: <strong className="text-slate-900 dark:text-white">{record.wastageWeight || 0} g</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          {record.remarks && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Supervisor Remarks: </span>
              {record.remarks}
            </div>
          )}

          {/* Signatures & Auditor Signoff */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <p className="font-bold uppercase text-[10px] text-slate-500">Recorded By (Supervisor)</p>
              <p className="font-bold text-slate-900 dark:text-white">{record.recordedByName}</p>
              <p className="text-slate-500 text-[11px]">{record.recordedByDesignation}</p>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <span className="text-[10px] text-slate-400">Supervisor Signature & Date</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold uppercase text-[10px] text-slate-500">Plant / QA Reviewer</p>
              <p className="font-bold text-slate-900 dark:text-white">Authorized Signature</p>
              <p className="text-slate-500 text-[11px]">Quality Control Department</p>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <span className="text-[10px] text-slate-400">Manager Signature & Stamp</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2">
            Generated via Premium Packaging Supervisor • Validated System Slip • {printTimestamp}
          </div>
        </div>
      </div>
    </div>
  );
};
