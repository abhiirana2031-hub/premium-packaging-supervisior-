'use client';

import { db, LocalProductionRecord, SyncQueueItem } from './db';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
  DEFAULT_COMPANY,
  generateSeedProductionRecords,
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_SUBCATEGORIES,
  SEED_USERS,
} from './constants';
import { ProductionRecord } from '@/types';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'pending' | 'unconfigured' | 'error';

export interface SyncStatusInfo {
  state: SyncState;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  isCloudConnected: boolean;
}

// Convert camelCase frontend ProductionRecord to snake_case PostgreSQL row
export function recordToRow(r: any) {
  return {
    id: r.id,
    company_id: r.companyId || 'comp_premium_pkg',
    slip_number: r.slipNumber,
    production_date: r.productionDate,
    shift: r.shift,
    production_line: r.productionLine || null,
    batch_number: r.batchNumber || null,
    item_id: r.itemId || null,
    item_name_snapshot: r.itemNameSnapshot || 'Packaging Item',
    item_code_snapshot: r.itemCodeSnapshot || 'ITEM',
    category_snapshot: r.categorySnapshot || 'Category',
    subcategory_snapshot: r.subcategorySnapshot || 'Subcategory',
    ideal_component_weights_snapshot: r.idealComponentWeightsSnapshot || {},
    ideal_unit_weight_snapshot: Number(r.approvedIdealWeightSnapshot || 0),
    tolerance_percentage_snapshot: Number(r.toleranceSnapshot?.percentage || 2.0),
    production_quantity: Number(r.productionQuantity || 0),
    actual_jar_weight: Number(r.actualComponentWeights?.jarWeight || 0),
    actual_cap_weight: Number(r.actualComponentWeights?.capWeight || 0),
    actual_plastic_handle_weight: Number(r.actualComponentWeights?.plasticHandleWeight || 0),
    actual_steel_handle_weight: Number(r.actualComponentWeights?.steelHandleWeight || 0),
    actual_unit_weight: Number(r.actualUnitWeight || 0),
    unit_weight_difference: Number(r.unitDifference || 0),
    percentage_deviation: Number(r.percentageDeviation || 0),
    status: r.weightStatus || 'within_tolerance',
    total_ideal_weight_kg: Number(((r.totalIdealWeight || 0) / 1000).toFixed(3)),
    total_actual_weight_kg: Number(((r.totalActualWeight || 0) / 1000).toFixed(3)),
    total_weight_difference_kg: Number(((r.totalWeightDifference || 0) / 1000).toFixed(3)),
    rejection_quantity: Number(r.rejectedQuantity || 0),
    wastage_material_grams: Number(r.wastageWeight || 0),
    remarks: r.remarks || '',
    supervisor_id: r.recordedById || null,
    supervisor_name: r.recordedByName || 'Supervisor',
    synced_at: new Date().toISOString(),
    updated_at: r.updatedAt || new Date().toISOString(),
  };
}

// Convert snake_case PostgreSQL row back to camelCase frontend ProductionRecord
export function rowToRecord(row: any): ProductionRecord {
  return {
    id: row.id,
    companyId: row.company_id || 'comp_premium_pkg',
    slipNumber: row.slip_number,
    productionDate: row.production_date,
    shift: row.shift,
    productionLine: row.production_line || undefined,
    batchNumber: row.batch_number || undefined,
    itemId: row.item_id || 'item_real_1',
    itemNameSnapshot: row.item_name_snapshot,
    itemCodeSnapshot: row.item_code_snapshot,
    categorySnapshot: row.category_snapshot,
    subcategorySnapshot: row.subcategory_snapshot,
    idealComponentWeightsSnapshot: row.ideal_component_weights_snapshot || {
      jarWeight: 0,
      capWeight: 0,
      plasticHandleWeight: 0,
      steelHandleWeight: 0,
    },
    approvedIdealWeightSnapshot: Number(row.ideal_unit_weight_snapshot || 0),
    toleranceSnapshot: {
      percentage: Number(row.tolerance_percentage_snapshot || 2),
      minWeight: Number(row.ideal_unit_weight_snapshot || 0) * (1 - Number(row.tolerance_percentage_snapshot || 2) / 100),
      maxWeight: Number(row.ideal_unit_weight_snapshot || 0) * (1 + Number(row.tolerance_percentage_snapshot || 2) / 100),
    },
    actualComponentWeights: {
      jarWeight: Number(row.actual_jar_weight || 0),
      capWeight: Number(row.actual_cap_weight || 0),
      plasticHandleWeight: Number(row.actual_plastic_handle_weight || 0),
      steelHandleWeight: Number(row.actual_steel_handle_weight || 0),
    },
    actualUnitWeight: Number(row.actual_unit_weight || 0),
    measurementMode:
      Number(row.actual_jar_weight || 0) > 0 || Number(row.actual_cap_weight || 0) > 0
        ? 'components_entered'
        : 'unit_only',
    hasIncompleteComponents: false,
    productionQuantity: Number(row.production_quantity || 0),
    rejectedQuantity: Number(row.rejection_quantity || 0),
    wastageWeight: Number(row.wastage_material_grams || 0),
    unitDifference: Number(row.unit_weight_difference || 0),
    totalIdealWeight: Number(row.total_ideal_weight_kg || 0) * 1000,
    totalActualWeight: Number(row.total_actual_weight_kg || 0) * 1000,
    totalWeightDifference: Number(row.total_weight_difference_kg || 0) * 1000,
    percentageDeviation: Number(row.percentage_deviation || 0),
    weightStatus: row.status,
    remarks: row.remarks || '',
    recordedById: row.supervisor_id || 'usr_supervisor_1',
    recordedByName: row.supervisor_name || 'Supervisor',
    recordedByDesignation: 'Production Supervisor',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing = false;
  private listeners: Array<(info: SyncStatusInfo) => void> = [];
  private lastSyncedAt: string | null = null;
  private lastError: string | null = null;
  private hasBootstrappedCloud = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Auto-trigger initial sync after short delay
      setTimeout(() => {
        if (navigator.onLine && isSupabaseConfigured()) {
          this.syncNow();
        }
      }, 1500);

      // Auto-sync every 45s when online
      setInterval(() => {
        if (navigator.onLine && isSupabaseConfigured()) {
          this.syncNow();
        }
      }, 45000);
    }
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  public subscribe(listener: (info: SyncStatusInfo) => void): () => void {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notify(): Promise<void> {
    const info = await this.getStatus();
    this.listeners.forEach((listener) => listener(info));
  }

  public async getStatus(): Promise<SyncStatusInfo> {
    if (typeof window === 'undefined') {
      return {
        state: 'offline',
        pendingCount: 0,
        lastSyncedAt: null,
        errorMessage: null,
        isCloudConnected: false,
      };
    }

    const pendingCount = await db.syncQueue.count();
    const isOnline = navigator.onLine;
    const hasCloud = isSupabaseConfigured();

    let state: SyncState = 'synced';
    if (!isOnline) {
      state = 'offline';
    } else if (!hasCloud) {
      state = 'unconfigured';
    } else if (this.isSyncing) {
      state = 'syncing';
    } else if (this.lastError) {
      state = 'error';
    } else if (pendingCount > 0) {
      state = 'pending';
    }

    return {
      state,
      pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.lastError,
      isCloudConnected: hasCloud,
    };
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      this.syncNow();
    } else {
      this.notify();
    }
  }

  /**
   * If remote Supabase items table is empty, auto-seeds factory items, categories, and initial records
   */
  private async bootstrapRemoteIfEmpty(supabase: any): Promise<void> {
    if (this.hasBootstrappedCloud) return;

    try {
      const { count } = await supabase.from('items').select('*', { count: 'exact', head: true });

      if (count === 0 || count === null) {
        console.log('Bootstrapping real factory catalog into Supabase PostgreSQL...');

        // 1. Company
        await supabase.from('companies').upsert({
          id: DEFAULT_COMPANY.id,
          name: DEFAULT_COMPANY.name,
          legal_name: 'Premium Packaging Ltd.',
          plant_location: 'GIDC Industrial Estate, Sector 4, Vadodara, Gujarat',
          gst_number: '24AAACP1234F1Z5',
        }, { onConflict: 'id' });

        // 2. Users
        for (const u of SEED_USERS) {
          await supabase.from('users').upsert({
            id: u.id,
            company_id: DEFAULT_COMPANY.id,
            full_name: u.fullName,
            designation: u.designation,
            phone: u.phone,
            email: u.email,
            employee_id: u.employeeId,
            role: u.role,
            preferences: u.preferences,
          }, { onConflict: 'id' });
        }

        // 3. Categories
        for (const c of SEED_CATEGORIES) {
          await supabase.from('categories').upsert({
            id: c.id,
            company_id: DEFAULT_COMPANY.id,
            name: c.name,
            code: c.code || c.id,
            description: c.name,
            display_order: c.sortOrder || 0,
          }, { onConflict: 'id' });
        }

        // 4. Subcategories
        for (const s of SEED_SUBCATEGORIES) {
          await supabase.from('subcategories').upsert({
            id: s.id,
            category_id: s.categoryId,
            name: s.name,
            code: s.id,
            description: s.name,
          }, { onConflict: 'id' });
        }

        // 5. Items (~70 real factory items)
        for (const i of SEED_ITEMS) {
          await supabase.from('items').upsert({
            id: i.id,
            company_id: DEFAULT_COMPANY.id,
            category_id: i.categoryId,
            subcategory_id: i.subcategoryId,
            name: i.itemName,
            code: i.itemCode,
            description: i.itemDescription || null,
            image_url: null,
            unit_of_measure: 'pcs',
            ideal_jar_weight: i.jarWeight || 0,
            ideal_cap_weight: i.capWeight || 0,
            ideal_plastic_handle_weight: i.plasticHandleWeight || 0,
            ideal_steel_handle_weight: i.steelHandleWeight || 0,
            ideal_unit_weight: i.approvedIdealWeight,
            tolerance_percentage: i.toleranceLimits?.percentage || 2.0,
            is_active: true,
          }, { onConflict: 'id' });
        }

        console.log('Supabase cloud database seeded successfully with factory catalog items & categories!');
      }

      this.hasBootstrappedCloud = true;
    } catch (bootstrapErr) {
      console.warn('Supabase bootstrap check encountered an issue (non-fatal):', bootstrapErr);
    }
  }

  /**
   * Enqueues an action to be pushed to Supabase when online
   */
  public async enqueueChange(
    tableName: SyncQueueItem['tableName'],
    recordId: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    payload: any
  ): Promise<void> {
    await db.syncQueue.add({
      tableName,
      recordId,
      action,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });

    this.notify();

    // If online and cloud configured, trigger immediate sync
    if (typeof window !== 'undefined' && navigator.onLine && isSupabaseConfigured()) {
      this.syncNow();
    }
  }

  /**
   * Performs bidirectional sync between local IndexedDB and Supabase PostgreSQL
   */
  public async syncNow(): Promise<void> {
    if (this.isSyncing) return;
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.notify();
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      this.notify();
      return;
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    try {
      // Bootstrap remote if needed
      await this.bootstrapRemoteIfEmpty(supabase);

      // 1. Drain the outbound queue (local -> cloud)
      const queueItems = await db.syncQueue.orderBy('id').toArray();

      for (const item of queueItems) {
        let success = false;

        try {
          if (item.action === 'INSERT' || item.action === 'UPDATE') {
            const rowPayload =
              item.tableName === 'production_records'
                ? recordToRow(item.payload)
                : item.payload;

            const { error } = await supabase
              .from(item.tableName)
              .upsert(rowPayload, { onConflict: 'id' });

            if (!error) {
              success = true;
              if (item.tableName === 'production_records') {
                await db.productionRecords.update(item.recordId, {
                  syncStatus: 'synced',
                  syncedAt: new Date().toISOString(),
                });
              }
            } else {
              console.warn(`Supabase upsert error on ${item.tableName}:`, error);
              this.lastError = error.message;
            }
          } else if (item.action === 'DELETE') {
            const { error } = await supabase
              .from(item.tableName)
              .delete()
              .eq('id', item.recordId);

            if (!error) {
              success = true;
            } else {
              console.warn(`Supabase delete error on ${item.tableName}:`, error);
            }
          }
        } catch (itemErr: any) {
          console.error(`Sync error on queue item ${item.id}:`, itemErr);
          await db.syncQueue.update(item.id!, {
            attempts: item.attempts + 1,
            lastError: itemErr?.message || 'Unknown network error',
          });
        }

        if (success && item.id) {
          await db.syncQueue.delete(item.id);
        }
      }

      // 2. Inbound sync: Fetch latest production records from Supabase
      try {
        const { data: remoteRecords, error: fetchErr } = await supabase
          .from('production_records')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(100);

        if (!fetchErr && remoteRecords && remoteRecords.length > 0) {
          for (const rem of remoteRecords) {
            const mapped = rowToRecord(rem);
            const local = await db.productionRecords.get(rem.id);
            if (!local || local.syncStatus === 'synced') {
              await db.productionRecords.put({
                ...mapped,
                syncStatus: 'synced',
                syncedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (inboundErr) {
        console.warn('Inbound sync check skipped:', inboundErr);
      }

      this.lastSyncedAt = new Date().toISOString();
    } catch (err: any) {
      console.error('Sync failed:', err);
      this.lastError = err?.message || 'Sync encountered an error';
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const syncEngine = SyncEngine.getInstance();
