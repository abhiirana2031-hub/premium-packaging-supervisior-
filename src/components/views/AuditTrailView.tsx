'use client';

import React from 'react';
import { ProductionAuditLog } from '@/types';
import { formatDateTimeIST } from '@/lib/dateUtils';
import { ShieldCheck, Plus, Edit3, Trash2, FileSpreadsheet } from 'lucide-react';

interface AuditTrailViewProps {
  logs: ProductionAuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CREATED</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">UPDATED</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">DELETED</span>;
      case 'REPORT_GENERATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">REPORT EXPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Data Integrity & Compliance (Section 12)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            System Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable log of all production entries, modifications, deletions, and report exports.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chronological Audit History ({logs.length} entries)
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit log entries recorded yet. As supervisors record and manage production, all actions will be permanently tracked here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Slip / Ref</th>
                  <th className="py-3 px-3.5">Audit Reason / Description</th>
                  <th className="py-3 px-3.5">Performed By</th>
                  <th className="py-3 px-3.5">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600">
                      {log.slipNumber || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-800 dark:text-slate-200 max-w-md">
                      {log.reason || 'Operation logged'}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 dark:text-white">{log.performedByName}</p>
                      <p className="text-[10px] text-slate-500">{log.performedByDesignation}</p>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                      {formatDateTimeIST(log.performedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
