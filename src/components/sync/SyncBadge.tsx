'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudCheck, CloudOff, RefreshCw, Database, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { syncEngine, SyncStatusInfo } from '@/lib/syncEngine';
import { db } from '@/lib/db';

interface SyncBadgeProps {
  compact?: boolean;
}

export function SyncBadge({ compact = false }: SyncBadgeProps) {
  const [status, setStatus] = useState<SyncStatusInfo>({
    state: 'synced',
    pendingCount: 0,
    lastSyncedAt: null,
    errorMessage: null,
    isCloudConnected: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [localCount, setLocalCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Check count of records in IndexedDB
    if (typeof window !== 'undefined') {
      db.productionRecords.count().then(setLocalCount).catch(() => {});
    }

    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    await syncEngine.syncNow();
    if (typeof window !== 'undefined') {
      db.productionRecords.count().then(setLocalCount).catch(() => {});
    }
  };

  const renderBadgeContent = () => {
    if (status.state === 'syncing') {
      return (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          {!compact && <span>Syncing...</span>}
        </div>
      );
    }

    if (status.state === 'offline') {
      return (
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
          <WifiOff className="w-3.5 h-3.5" />
          {!compact && <span>Shop-Floor Offline</span>}
          {status.pendingCount > 0 && (
            <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {status.pendingCount}
            </span>
          )}
        </div>
      );
    }

    if (status.state === 'pending' || status.pendingCount > 0) {
      return (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          {!compact && <span>{status.pendingCount} Pending Sync</span>}
          {compact && (
            <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {status.pendingCount}
            </span>
          )}
        </div>
      );
    }

    if (status.state === 'unconfigured') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          {!compact && <span>Local-First (Offline Safe)</span>}
        </div>
      );
    }

    // Default: Cloud Synced
    return (
      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {!compact && <span>Cloud Synced</span>}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-2xs"
        title="Offline Storage & Cloud Sync Status"
      >
        {renderBadgeContent()}
      </button>

      {/* Sync Status & Offline Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Offline Storage & Sync</h3>
                  <p className="text-[11px] text-slate-500">IndexedDB Local-First Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Local Device Storage:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {localCount} records stored
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pending Cloud Sync:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {status.pendingCount} actions queued
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Network Status:</span>
                <span className={`font-bold ${status.state === 'offline' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {typeof navigator !== 'undefined' && navigator.onLine ? 'Connected (Online)' : 'Disconnected (Offline)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cloud Backend:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {status.isCloudConnected ? 'Supabase Connected' : 'Local-First Mode (100% Free)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every production slip is saved instantly to your phone or desktop hard drive without internet delay. When reconnected, data syncs to the cloud.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleManualSync}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status.state === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
