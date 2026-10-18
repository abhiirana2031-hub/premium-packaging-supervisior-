'use client';

import {
  Category,
  Company,
  Item,
  ProductionAuditLog,
  ProductionRecord,
  ReportGenerationRecord,
  ReportTemplate,
  Subcategory,
  UserProfile,
} from '@/types';
import {
  DEFAULT_COMPANY,
  generateSeedProductionRecords,
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_REPORT_TEMPLATES,
  SEED_SUBCATEGORIES,
  SEED_USERS,
} from './constants';
import { getTodayString } from './dateUtils';
import { db } from './db';
import { syncEngine } from './syncEngine';

const STORAGE_KEYS = {
  CURRENT_USER: 'pps_current_user_v2',
  USERS: 'pps_users_v2',
  COMPANY: 'pps_company_v1',
  CATEGORIES: 'pps_categories_v1',
  SUBCATEGORIES: 'pps_subcategories_v1',
  ITEMS: 'pps_items_v1',
  PRODUCTION_RECORDS: 'pps_production_records_v1',
  AUDIT_LOGS: 'pps_audit_logs_v1',
  REPORT_TEMPLATES: 'pps_report_templates_v1',
  REPORT_LOGS: 'pps_report_logs_v1',
  INITIALIZED: 'pps_seed_initialized_v9_abhay_admin_whitelist',
};

// Safe localStorage accessor
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export class PackagingStorage {
  private static instance: PackagingStorage;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): PackagingStorage {
    if (!PackagingStorage.instance) {
      PackagingStorage.instance = new PackagingStorage();
    }
    return PackagingStorage.instance;
  }

  public ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); // Requires explicit login!
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(SEED_SUBCATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(SEED_ITEMS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REPORT_TEMPLATES, JSON.stringify(SEED_REPORT_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REPORT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    // Also clear Dexie IndexedDB records for clean slate
    db.productionRecords.clear().catch(() => {});
    db.syncQueue.clear().catch(() => {});
  }

  // --- User & Auth ---

  public getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    return getItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public clearCurrentUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public setCurrentUser(user: UserProfile): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    // Also update in all users list
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setItem(STORAGE_KEYS.USERS, users);
  }

  public getUsers(): UserProfile[] {
    return getItem<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      const merged: UserProfile = {
        ...users[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      users[idx] = merged;
      setItem(STORAGE_KEYS.USERS, users);
      const curr = this.getCurrentUser();
      if (curr && curr.id === userId) {
        setItem(STORAGE_KEYS.CURRENT_USER, merged);
      }
      return merged;
    }
    return null;
  }

  public deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    setItem(STORAGE_KEYS.USERS, filtered);
    const curr = this.getCurrentUser();
    if (curr && curr.id === userId) {
      this.clearCurrentUser();
    }
    return true;
  }

  public updateUserProfile(updated: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser() || SEED_USERS[0];
    const merged: UserProfile = {
      ...current,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.setCurrentUser(merged);
    return merged;
  }

  // --- Company ---
  public getCompany(): Company {
    return getItem<Company>(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
  }

  public updateCompany(name: string): Company {
    const current = this.getCompany();
    const updated = { ...current, name };
    setItem(STORAGE_KEYS.COMPANY, updated);
    return updated;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
  }

  public saveCategory(category: Partial<Category> & { name: string }): Category {
    const categories = this.getCategories();
    let cat: Category;
    if (category.id) {
      const idx = categories.findIndex((c) => c.id === category.id);
      cat = {
        ...categories[idx],
        ...category,
      };
      categories[idx] = cat;
    } else {
      cat = {
        id: `cat_${Date.now()}`,
        companyId: DEFAULT_COMPANY.id,
        name: category.name,
        code: category.code || category.name.substring(0, 4).toUpperCase(),
        sortOrder: categories.length + 1,
        isActive: category.isActive ?? true,
      };
      categories.push(cat);
    }
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const categories = this.getCategories().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return true;
  }

  // --- Subcategories ---
  public getSubcategories(categoryId?: string): Subcategory[] {
    const list = getItem<Subcategory[]>(STORAGE_KEYS.SUBCATEGORIES, SEED_SUBCATEGORIES);
    if (categoryId) {
      return list.filter((s) => s.categoryId === categoryId);
    }
    return list;
  }

  public saveSubcategory(sub: Partial<Subcategory> & { categoryId: string; name: string }): Subcategory {
    const list = this.getSubcategories();
    let saved: Subcategory;
    if (sub.id) {
      const idx = list.findIndex((s) => s.id === sub.id);
      saved = { ...list[idx], ...sub };
      list[idx] = saved;
    } else {
      saved = {
        id: `sub_${Date.now()}`,
        categoryId: sub.categoryId,
        name: sub.name,
        sortOrder: list.length + 1,
        isActive: sub.isActive ?? true,
      };
      list.push(saved);
    }
    setItem(STORAGE_KEYS.SUBCATEGORIES, list);
    return saved;
  }

  // --- Items (Product Master) ---
  public getItems(): Item[] {
    return getItem<Item[]>(STORAGE_KEYS.ITEMS, SEED_ITEMS);
  }

  public getItemById(id: string): Item | undefined {
    return this.getItems().find((i) => i.id === id);
  }

  public saveItem(itemData: Partial<Item> & { itemName: string; itemCode: string; categoryId: string; subcategoryId: string }): Item {
    const items = this.getItems();
    const now = new Date().toISOString();

    // Calculate component sum
    const compTotal = 
      (Number(itemData.jarWeight) || 0) +
      (Number(itemData.capWeight) || 0) +
      (Number(itemData.plasticHandleWeight) || 0) +
      (Number(itemData.steelHandleWeight) || 0) +
      (Number(itemData.otherComponentWeight) || 0);

    const approvedIdealWeight = itemData.idealWeightMode === 'manual' && Number(itemData.approvedIdealWeight) > 0
      ? Number(itemData.approvedIdealWeight)
      : compTotal;

    let saved: Item;
    if (itemData.id) {
      const idx = items.findIndex((i) => i.id === itemData.id);
      const prev = items[idx];
      saved = {
        ...prev,
        ...itemData,
        calculatedComponentTotal: compTotal,
        approvedIdealWeight,
        updatedAt: now,
      } as Item;
      items[idx] = saved;

      // Audit item edit
      this.addAuditLog({
        action: 'UPDATE',
        previousValues: prev as unknown as Record<string, unknown>,
        updatedValues: saved as unknown as Record<string, unknown>,
        reason: `Item specification updated for ${saved.itemName} (${saved.itemCode})`,
      });
    } else {
      saved = {
        id: `item_${Date.now()}`,
        companyId: DEFAULT_COMPANY.id,
        categoryId: itemData.categoryId,
        subcategoryId: itemData.subcategoryId,
        itemCode: itemData.itemCode.trim().toUpperCase(),
        itemName: itemData.itemName.trim(),
        itemDescription: itemData.itemDescription || '',
        jarWeight: itemData.jarWeight !== undefined ? itemData.jarWeight : null,
        capWeight: itemData.capWeight !== undefined ? itemData.capWeight : null,
        plasticHandleWeight: itemData.plasticHandleWeight !== undefined ? itemData.plasticHandleWeight : null,
        steelHandleWeight: itemData.steelHandleWeight !== undefined ? itemData.steelHandleWeight : null,
        otherComponentWeight: itemData.otherComponentWeight !== undefined ? itemData.otherComponentWeight : null,
        otherComponentName: itemData.otherComponentName || '',
        idealWeightMode: itemData.idealWeightMode || 'calculated',
        approvedIdealWeight,
        calculatedComponentTotal: compTotal,
        toleranceLimits: itemData.toleranceLimits || { percentage: 2.5 },
        targetProductionQty: itemData.targetProductionQty || null,
        notes: itemData.notes || '',
        isActive: itemData.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      items.push(saved);

      this.addAuditLog({
        action: 'CREATE',
        updatedValues: saved as unknown as Record<string, unknown>,
        reason: `New packaging item created: ${saved.itemName} (${saved.itemCode})`,
      });
    }

    setItem(STORAGE_KEYS.ITEMS, items);
    return saved;
  }

  // --- Production Records ---
  public getProductionRecords(): ProductionRecord[] {
    return getItem<ProductionRecord[]>(STORAGE_KEYS.PRODUCTION_RECORDS, []);
  }

  public getProductionRecordById(id: string): ProductionRecord | undefined {
    return this.getProductionRecords().find((r) => r.id === id);
  }

  public generateNextSlipNumber(dateStr?: string): string {
    const today = dateStr || getTodayString();
    const compactDate = today.replace(/-/g, '');
    const records = this.getProductionRecords().filter((r) => r.productionDate === today);
    const nextSeq = String(records.length + 1).padStart(3, '0');
    return `SLIP-${compactDate}-${nextSeq}`;
  }

  public addProductionRecord(record: Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'>): ProductionRecord {
    const records = this.getProductionRecords();
    const user = this.getCurrentUser() || SEED_USERS[0];
    const now = new Date().toISOString();
    const slipNumber = this.generateNextSlipNumber(record.productionDate);

    const newRecord: ProductionRecord = {
      ...record,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slipNumber,
      recordedById: user.id,
      recordedByName: user.fullName,
      recordedByDesignation: user.designation,
      createdAt: now,
      updatedAt: now,
    };

    records.unshift(newRecord);
    setItem(STORAGE_KEYS.PRODUCTION_RECORDS, records);

    // Local-First IndexedDB and Cloud Sync Queue
    if (typeof window !== 'undefined') {
      db.productionRecords.put({
        ...newRecord,
        syncStatus: 'pending',
      }).catch((err) => console.error('IndexedDB write error:', err));
      syncEngine.enqueueChange('production_records', newRecord.id, 'INSERT', newRecord);
    }

    this.addAuditLog({
      productionRecordId: newRecord.id,
      slipNumber: newRecord.slipNumber,
      action: 'CREATE',
      updatedValues: newRecord as unknown as Record<string, unknown>,
      reason: `Recorded daily production of ${newRecord.productionQuantity} units for ${newRecord.itemNameSnapshot}`,
    });

    return newRecord;
  }

  /**
   * Fast batch creation for Advanced Feature 1: Quick Daily Production Entry
   */
  public addBatchProductionRecords(
    recordsList: Array<Omit<ProductionRecord, 'id' | 'slipNumber' | 'createdAt' | 'updatedAt'>>
  ): ProductionRecord[] {
    const existing = this.getProductionRecords();
    const user = this.getCurrentUser() || SEED_USERS[0];
    const now = new Date().toISOString();
    const created: ProductionRecord[] = [];

    recordsList.forEach((rec, idx) => {
      const compactDate = rec.productionDate.replace(/-/g, '');
      const seq = String(existing.length + idx + 1).padStart(3, '0');
      const slipNumber = `SLIP-${compactDate}-${seq}`;

      const newRec: ProductionRecord = {
        ...rec,
        id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
        slipNumber,
        recordedById: user.id,
        recordedByName: user.fullName,
        recordedByDesignation: user.designation,
        createdAt: now,
        updatedAt: now,
      };

      created.push(newRec);
      existing.unshift(newRec);

      // Local-First IndexedDB and Cloud Sync Queue
      if (typeof window !== 'undefined') {
        db.productionRecords.put({
          ...newRec,
          syncStatus: 'pending',
        }).catch((err) => console.error('IndexedDB batch write error:', err));
        syncEngine.enqueueChange('production_records', newRec.id, 'INSERT', newRec);
      }
    });

    setItem(STORAGE_KEYS.PRODUCTION_RECORDS, existing);

    this.addAuditLog({
      action: 'CREATE',
      reason: `Quick multi-entry recorded: ${created.length} production items in single session`,
      updatedValues: { count: created.length, slips: created.map((c) => c.slipNumber) },
    });

    return created;
  }

  public updateProductionRecord(id: string, updates: Partial<ProductionRecord>, reason?: string): ProductionRecord | null {
    const records = this.getProductionRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx === 0 || idx > 0) {
      const prev = records[idx];
      const user = this.getCurrentUser() || SEED_USERS[0];
      const updated: ProductionRecord = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      records[idx] = updated;
      setItem(STORAGE_KEYS.PRODUCTION_RECORDS, records);

      // Local-First IndexedDB and Cloud Sync Queue
      if (typeof window !== 'undefined') {
        db.productionRecords.put({
          ...updated,
          syncStatus: 'pending',
        }).catch((err) => console.error('IndexedDB update error:', err));
        syncEngine.enqueueChange('production_records', updated.id, 'UPDATE', updated);
      }

      this.addAuditLog({
        productionRecordId: id,
        slipNumber: updated.slipNumber,
        action: 'UPDATE',
        previousValues: prev as unknown as Record<string, unknown>,
        updatedValues: updated as unknown as Record<string, unknown>,
        reason: reason || `Updated production record ${updated.slipNumber} by ${user.fullName}`,
      });

      return updated;
    }
    return null;
  }

  public deleteProductionRecord(id: string, reason?: string): boolean {
    const records = this.getProductionRecords();
    const toDelete = records.find((r) => r.id === id);
    if (!toDelete) return false;

    const filtered = records.filter((r) => r.id !== id);
    setItem(STORAGE_KEYS.PRODUCTION_RECORDS, filtered);

    // Local-First IndexedDB and Cloud Sync Queue
    if (typeof window !== 'undefined') {
      db.productionRecords.delete(id).catch((err) => console.error('IndexedDB delete error:', err));
      syncEngine.enqueueChange('production_records', id, 'DELETE', { id });
    }

    this.addAuditLog({
      productionRecordId: id,
      slipNumber: toDelete.slipNumber,
      action: 'DELETE',
      previousValues: toDelete as unknown as Record<string, unknown>,
      reason: reason || `Deleted production record ${toDelete.slipNumber} for ${toDelete.itemNameSnapshot}`,
    });

    return true;
  }

  // --- Report Templates (Advanced Feature 3) ---
  public getReportTemplates(): ReportTemplate[] {
    return getItem<ReportTemplate[]>(STORAGE_KEYS.REPORT_TEMPLATES, SEED_REPORT_TEMPLATES);
  }

  public saveReportTemplate(template: Partial<ReportTemplate> & { name: string }): ReportTemplate {
    const list = this.getReportTemplates();
    const user = this.getCurrentUser() || SEED_USERS[0];
    let saved: ReportTemplate;

    if (template.id) {
      const idx = list.findIndex((t) => t.id === template.id);
      saved = { ...list[idx], ...template } as ReportTemplate;
      list[idx] = saved;
    } else {
      saved = {
        id: `tpl_${Date.now()}`,
        name: template.name,
        description: template.description || '',
        datePreset: template.datePreset || 'today',
        defaultStartDate: template.defaultStartDate,
        defaultEndDate: template.defaultEndDate,
        categoryIds: template.categoryIds,
        itemIds: template.itemIds,
        shifts: template.shifts,
        productionLines: template.productionLines,
        supervisors: template.supervisors,
        weightStatuses: template.weightStatuses,
        includeWeightComparison: template.includeWeightComparison ?? true,
        includeComponentBreakdown: template.includeComponentBreakdown ?? true,
        includeMaterialUsage: template.includeMaterialUsage ?? true,
        includeWastage: template.includeWastage ?? true,
        includeSignatures: template.includeSignatures ?? true,
        defaultFormat: template.defaultFormat || 'pdf',
        isSystemTemplate: false,
        createdBy: user.fullName,
        createdAt: new Date().toISOString(),
      };
      list.push(saved);
    }
    setItem(STORAGE_KEYS.REPORT_TEMPLATES, list);
    return saved;
  }

  public deleteReportTemplate(id: string): boolean {
    const list = this.getReportTemplates().filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.REPORT_TEMPLATES, list);
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(): ProductionAuditLog[] {
    return getItem<ProductionAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public addAuditLog(log: Omit<ProductionAuditLog, 'id' | 'performedById' | 'performedByName' | 'performedByDesignation' | 'performedAt'>): void {
    const logs = this.getAuditLogs();
    const user = this.getCurrentUser() || SEED_USERS[0];
    const entry: ProductionAuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      performedById: user.id,
      performedByName: user.fullName,
      performedByDesignation: user.designation,
      performedAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    // Keep last 500 logs
    if (logs.length > 500) logs.pop();
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- Report Generation Logs ---
  public getReportLogs(): ReportGenerationRecord[] {
    return getItem<ReportGenerationRecord[]>(STORAGE_KEYS.REPORT_LOGS, []);
  }

  public logReportGeneration(log: Omit<ReportGenerationRecord, 'id' | 'generatedAt' | 'generatedByName' | 'generatedByDesignation'>): void {
    const logs = this.getReportLogs();
    const user = this.getCurrentUser() || SEED_USERS[0];
    const entry: ReportGenerationRecord = {
      ...log,
      id: `replog_${Date.now()}`,
      generatedByName: user.fullName,
      generatedByDesignation: user.designation,
      generatedAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    setItem(STORAGE_KEYS.REPORT_LOGS, logs);

    this.addAuditLog({
      action: 'REPORT_GENERATED',
      reason: `Generated ${log.format.toUpperCase()} report: "${log.templateName}" (#${log.reportNumber}) for ${log.dateRangeDisplay}`,
      updatedValues: entry as unknown as Record<string, unknown>,
    });
  }
}

export const storage = PackagingStorage.getInstance();
