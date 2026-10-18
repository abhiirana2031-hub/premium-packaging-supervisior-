'use client';

import React, { useState } from 'react';
import { Item, ProductionRecord, UserProfile } from '@/types';
import { generatePdfReport } from '@/lib/exportPdf';
import { generateExcelWorkbook } from '@/lib/exportExcel';
import { generateCsvExport } from '@/lib/exportCsv';
import { formatDateDDMMYYYY, formatDateTimeIST } from '@/lib/dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from '@/lib/calculations';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ToleranceBadge } from './ToleranceBadge';

interface ReportPreviewModalProps {
  reportTitle: string;
  dateRangeDisplay: string;
  records: ProductionRecord[];
  items: Item[];
  currentUser: UserProfile;
  companyName: string;
  onClose: () => void;
  onLogReport: (format: 'pdf' | 'excel' | 'csv' | 'slip', reportNo: string) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  reportTitle,
  dateRangeDisplay,
  records,
  items,
  currentUser,
  companyName,
  onClose,
  onLogReport,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Totals
  const totalQty = records.reduce((s, r) => s + r.productionQuantity, 0);
  const totalRej = records.reduce((s, r) => s + (r.rejectedQuantity || 0), 0);
  const totalIdealG = records.reduce((s, r) => s + r.totalIdealWeight, 0);
  const totalActualG = records.reduce((s, r) => s + r.totalActualWeight, 0);
  const netVarianceG = totalActualG - totalIdealG;
  const netDeviation = totalIdealG > 0 ? (netVarianceG / totalIdealG) * 100 : 0;

  // Handle PDF Export
  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      const { doc, reportNumber } = generatePdfReport({
        companyName,
        reportTitle,
        dateRangeDisplay,
        user: currentUser,
        records,
        includeSignatures: true,
      });

      doc.save(`PPS_${reportTitle.replace(/\s+/g, '_')}_${reportNumber}.pdf`);
      onLogReport('pdf', reportNumber);
      setShareFeedback(`PDF Report #${reportNumber} downloaded successfully!`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const { buffer, filename } = await generateExcelWorkbook({
        companyName,
        reportTitle,
        dateRangeDisplay,
        user: currentUser,
        records,
        items,
      });

      const blob = new Blob([buffer as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const reportNumber = `PPS-XLS-${Date.now().toString().slice(-4)}`;
      onLogReport('excel', reportNumber);
      setShareFeedback(`Excel workbook "${filename}" generated with 5 detailed sheets!`);
    } catch (err) {
      console.error('Excel generation error:', err);
      alert('Failed to generate Excel workbook.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const csv = generateCsvExport(records, currentUser, companyName, dateRangeDisplay);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PPS_Records_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const reportNumber = `PPS-CSV-${Date.now().toString().slice(-4)}`;
      onLogReport('csv', reportNumber);
      setShareFeedback('CSV export downloaded successfully!');
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const summaryText = `*${companyName.toUpperCase()} — PRODUCTION AUDIT REPORT*\n` +
      `📋 *Title:* ${reportTitle}\n` +
      `📅 *Period:* ${dateRangeDisplay}\n` +
      `👤 *Supervisor:* ${currentUser.fullName} (${currentUser.designation})\n` +
      `📦 *Total Quantity:* ${totalQty.toLocaleString('en-IN')} pcs\n` +
      `⚖️ *Actual Material:* ${formatKgOnly(totalActualG)}\n` +
      `⚖️ *Ideal Material:* ${formatKgOnly(totalIdealG)}\n` +
      `📊 *Net Variance:* ${netVarianceG >= 0 ? '+' : ''}${formatKgOnly(netVarianceG)} (${netDeviation >= 0 ? '+' : ''}${netDeviation.toFixed(2)}%)\n` +
      `🚫 *Rejections:* ${totalRej} pcs\n` +
      `Generated via Premium Packaging Supervisor on ${formatDateTimeIST(new Date())}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
  };

  // Native Web Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${companyName} - ${reportTitle}`,
          text: `Production Report for ${dateRangeDisplay}: ${totalQty.toLocaleString('en-IN')} units produced with net material variance of ${formatKgOnly(netVarianceG)}. Prepared by ${currentUser.fullName} (${currentUser.designation}).`,
          url: window.location.href,
        });
        setShareFeedback('Report shared successfully!');
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy Secure Link
  const handleCopyLink = () => {
    const secureLink = `${window.location.origin}?report=${encodeURIComponent(reportTitle)}&period=${encodeURIComponent(dateRangeDisplay)}&user=${encodeURIComponent(currentUser.fullName)}`;
    navigator.clipboard.writeText(secureLink);
    setCopiedLink(true);
    setShareFeedback('Secure access link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-600 text-white tracking-wider">
                REPORT PREVIEW & EXPORT CENTER
              </span>
              <span className="text-xs text-slate-500">
                Period: <strong className="text-slate-800 dark:text-slate-200">{dateRangeDisplay}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {reportTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified by Supervisor: <strong className="text-emerald-700 dark:text-emerald-400">{currentUser.fullName}</strong> ({currentUser.designation})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if action completed */}
        {shareFeedback && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{shareFeedback}</span>
            <button onClick={() => setShareFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase text-slate-500">Total Quantity</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalQty.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-500">pcs</span>
              </p>
              <p className="text-[11px] text-slate-500">Rejections: {totalRej} pcs</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase text-slate-500">Actual Production Weight</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatKgOnly(totalActualG)}
              </p>
              <p className="text-[11px] text-slate-500">{formatGramsOnly(totalActualG)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase text-slate-500">Ideal Production Weight</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatKgOnly(totalIdealG)}
              </p>
              <p className="text-[11px] text-slate-500">{formatGramsOnly(totalIdealG)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase text-slate-500">Net Weight Variance</p>
              <p className={`text-xl font-extrabold mt-1 ${netVarianceG > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {netVarianceG >= 0 ? '+' : ''}{formatKgOnly(netVarianceG)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {netDeviation >= 0 ? '+' : ''}{netDeviation.toFixed(2)}% net deviation
              </p>
            </div>
          </div>

          {/* Records Table Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Included Production Records ({records.length})
              </h4>
              <span className="text-slate-500">
                Sorted chronologically by production date & slip
              </span>
            </div>

            {records.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
                No production records match the selected date range and filter criteria. Adjust your date range or filters.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Slip #</th>
                      <th className="py-2.5 px-3">Item Name & Code</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Ideal Unit</th>
                      <th className="py-2.5 px-3 text-right">Actual Unit</th>
                      <th className="py-2.5 px-3 text-right">Diff / Unit</th>
                      <th className="py-2.5 px-3 text-right">Total Ideal</th>
                      <th className="py-2.5 px-3 text-right">Total Actual</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 whitespace-nowrap">{formatDateDDMMYYYY(r.productionDate)}</td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-600">{r.slipNumber}</td>
                        <td className="py-2 px-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                            {r.itemNameSnapshot}
                          </p>
                          <p className="text-[10px] text-slate-500">{r.categorySnapshot}</p>
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {r.shift.split('(')[0].trim()}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {r.productionQuantity.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right">{r.approvedIdealWeightSnapshot.toFixed(1)} g</td>
                        <td className="py-2 px-3 text-right font-medium">{r.actualUnitWeight.toFixed(1)} g</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatVariance(r.unitDifference)}
                        </td>
                        <td className="py-2 px-3 text-right">{formatKgOnly(r.totalIdealWeight)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatKgOnly(r.totalActualWeight)}</td>
                        <td className="py-2 px-3 text-center">
                          <ToleranceBadge status={r.weightStatus} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Native Share / Copy Link */}
            <button
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share / Copy Link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* CSV Export Button */}
            <button
              onClick={handleExportCsv}
              disabled={records.length === 0 || isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Excel (.xlsx) Export Button */}
            <button
              onClick={handleExportExcel}
              disabled={records.length === 0 || isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={records.length === 0 || isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
