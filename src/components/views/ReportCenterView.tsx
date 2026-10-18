'use client';

import React, { useState } from 'react';
import {
  Category,
  DatePreset,
  Item,
  ProductionRecord,
  ReportGenerationRecord,
  ReportTemplate,
  UserProfile,
} from '@/types';
import { getDateRangeForPreset, formatDateDDMMYYYY, formatDateTimeIST } from '@/lib/dateUtils';
import {
  FileSpreadsheet,
  FileText,
  Copy,
  Plus,
  Play,
  Trash2,
  Edit,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ReportCenterViewProps {
  templates: ReportTemplate[];
  records: ProductionRecord[];
  items: Item[];
  categories: Category[];
  currentUser: UserProfile;
  reportLogs: ReportGenerationRecord[];
  onOpenReportPreview: (title: string, dateRangeDisplay: string, filteredRecords: ProductionRecord[]) => void;
  onSaveTemplate: (template: Partial<ReportTemplate> & { name: string }) => void;
  onDeleteTemplate: (id: string) => void;
}

export const ReportCenterView: React.FC<ReportCenterViewProps> = ({
  templates,
  records,
  items,
  categories,
  currentUser,
  reportLogs,
  onOpenReportPreview,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Template editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ReportTemplate> | null>(null);

  // Quick 1-click execution of a template
  const handleRunTemplate = (template: ReportTemplate) => {
    // Resolve date range using template's preset or active chosen preset
    const presetToUse = template.datePreset || selectedPreset;
    const { start, end, label } = getDateRangeForPreset(presetToUse, customStart, customEnd);

    // Apply template filters
    const matchedRecords = records.filter((r) => {
      if (r.productionDate < start || r.productionDate > end) return false;
      if (template.categoryIds && template.categoryIds.length > 0) {
        // filter category
      }
      if (template.weightStatuses && template.weightStatuses.length > 0) {
        if (!template.weightStatuses.includes(r.weightStatus)) return false;
      }
      return true;
    });

    onOpenReportPreview(template.name, label, matchedRecords);
  };

  // Duplicate template
  const handleDuplicateTemplate = (template: ReportTemplate) => {
    onSaveTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      datePreset: template.datePreset,
      includeWeightComparison: template.includeWeightComparison,
      includeComponentBreakdown: template.includeComponentBreakdown,
      includeMaterialUsage: template.includeMaterialUsage,
      includeWastage: template.includeWastage,
      includeSignatures: template.includeSignatures,
      defaultFormat: template.defaultFormat,
      isSystemTemplate: false,
    });
  };

  // Open editor for new or existing
  const handleOpenEditor = (tpl?: ReportTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
    } else {
      setEditingTemplate({
        name: '',
        description: '',
        datePreset: 'today',
        includeWeightComparison: true,
        includeComponentBreakdown: true,
        includeMaterialUsage: true,
        includeWastage: true,
        includeSignatures: true,
        defaultFormat: 'pdf',
      });
    }
    setIsEditorOpen(true);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate?.name?.trim()) {
      alert('Template name is required.');
      return;
    }
    onSaveTemplate(editingTemplate as Partial<ReportTemplate> & { name: string });
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border border-emerald-900/40 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Feature 3: Reusable Report Templates & Export Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            One-Click Production Reporting
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Generate print-ready PDFs, genuine 5-sheet Excel workbooks, or CSVs with automated supervisor credentials and timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Template</span>
          </button>
        </div>
      </div>

      {/* Tabs: Templates vs History Log */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Saved Report Templates ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Export Generation Log ({reportLogs.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Stamping Supervisor: <strong className="text-slate-800 dark:text-slate-200">{currentUser.fullName}</strong>
        </span>
      </div>

      {activeTab === 'templates' ? (
        /* Template Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                    {tpl.defaultFormat === 'excel' ? (
                      <FileSpreadsheet className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {tpl.isSystemTemplate && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        System
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {tpl.defaultFormat.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1 text-[11px] text-slate-500">
                  <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Preset: {tpl.datePreset.replace(/_/g, ' ')}
                  </span>
                  {tpl.includeMaterialUsage && (
                    <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Material Analysis
                    </span>
                  )}
                  {tpl.includeSignatures && (
                    <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Signature Blocks
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateTemplate(tpl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Duplicate template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!tpl.isSystemTemplate && (
                    <>
                      <button
                        onClick={() => handleOpenEditor(tpl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Edit template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete template "${tpl.name}"?`)) onDeleteTemplate(tpl.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleRunTemplate(tpl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Report Generation Audit Log */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historical Export Generation Events
            </h3>
            <span className="text-xs text-slate-500">
              Audited by supervisor and plant authority
            </span>
          </div>

          {reportLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No report export events have been recorded yet. Select any template above to generate a report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3.5">Ref #</th>
                    <th className="py-3 px-3.5">Template Name</th>
                    <th className="py-3 px-3.5">Reporting Period</th>
                    <th className="py-3 px-3.5">Format</th>
                    <th className="py-3 px-3.5 text-right">Records</th>
                    <th className="py-3 px-3.5">Generated By</th>
                    <th className="py-3 px-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {reportLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-600">
                        {log.reportNumber}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                        {log.templateName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        {log.dateRangeDisplay}
                      </td>
                      <td className="py-3 px-3.5 uppercase font-bold text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">
                          {log.format}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold">
                        {log.recordCount}
                      </td>
                      <td className="py-3 px-3.5">
                        <p className="font-semibold text-slate-900 dark:text-white">{log.generatedByName}</p>
                        <p className="text-[10px] text-slate-500">{log.generatedByDesignation}</p>
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                        {formatDateTimeIST(log.generatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditorOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveEditor}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTemplate.id ? 'Edit Report Template' : 'Create Custom Report Template'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Plant Variance Audit"
                  value={editingTemplate.name || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  placeholder="Summarize the intent of this report..."
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Date Preset
                  </label>
                  <select
                    value={editingTemplate.datePreset || 'today'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, datePreset: e.target.value as DatePreset })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="current_week">Current Week</option>
                    <option value="current_month">Current Month</option>
                    <option value="previous_month">Previous Month</option>
                    <option value="last_30_days">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Export Format
                  </label>
                  <select
                    value={editingTemplate.defaultFormat || 'pdf'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultFormat: e.target.value as 'pdf' | 'excel' | 'csv' })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="pdf">PDF Document (Print-ready)</option>
                    <option value="excel">Excel Workbook (.xlsx 5-Sheet)</option>
                    <option value="csv">CSV Spreadsheet</option>
                  </select>
                </div>
              </div>

              {/* Inclusions */}
              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Included Sections & Data Tables:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeWeightComparison ?? true}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, includeWeightComparison: e.target.checked })}
                    />
                    <span>Weight Comparison Table</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeComponentBreakdown ?? true}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, includeComponentBreakdown: e.target.checked })}
                    />
                    <span>Component Breakdown</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeMaterialUsage ?? true}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, includeMaterialUsage: e.target.checked })}
                    />
                    <span>Material Usage Insights</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.includeSignatures ?? true}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, includeSignatures: e.target.checked })}
                    />
                    <span>Signatures Block</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
