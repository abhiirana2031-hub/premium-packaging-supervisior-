'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Plus, FileText, ChevronRight } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { ReportTemplate, ProductionRecord } from '@/types';

interface MobileReportCenterScreenProps {
  templates: ReportTemplate[];
  records: ProductionRecord[];
  onBack: () => void;
  onOpenGenerateTab: () => void;
  onSelectTemplate: (template: ReportTemplate) => void;
  onCreateTemplate: () => void;
}

export function MobileReportCenterScreen({
  templates,
  records,
  onBack,
  onOpenGenerateTab,
  onSelectTemplate,
  onCreateTemplate,
}: MobileReportCenterScreenProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'generate'>('templates');

  const handleTabClick = (tab: 'templates' | 'generate') => {
    setActiveTab(tab);
    if (tab === 'generate') {
      onOpenGenerateTab();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      <MobileStatusBar />

      {/* Top App Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-bold text-slate-900">Report Center</h1>

        <button type="button" className="p-1.5 -mr-1 text-slate-500 hover:text-slate-800">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-3 border-b border-slate-100">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center">
          <button
            type="button"
            onClick={() => handleTabClick('templates')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Saved Templates
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('generate')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Templates Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Create Template Button */}
        <button
          type="button"
          onClick={onCreateTemplate}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Template</span>
        </button>

        {/* Templates List */}
        <div className="space-y-2.5 pt-1">
          {templates.map((tpl) => {
            const isExcel = tpl.defaultFormat === 'excel';
            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isExcel
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    }`}
                  >
                    <FileText className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                      {tpl.description}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
