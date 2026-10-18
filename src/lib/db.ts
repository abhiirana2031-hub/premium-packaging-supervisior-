import Dexie, { type Table } from 'dexie';
import {
  Category,
  Company,
  Item,
  ProductionAuditLog,
  ProductionRecord,
  Subcategory,
  UserProfile,
} from '@/types';
import {
  DEFAULT_COMPANY,
  generateSeedProductionRecords,
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_SUBCATEGORIES,
  SEED_USERS,
} from './constants';

export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface LocalProductionRecord extends ProductionRecord {
  syncStatus?: SyncStatus;
  syncedAt?: string;
  isDeleted?: boolean;
}

export interface LocalItem extends Item {
  syncStatus?: SyncStatus;
  syncedAt?: string;
  isDeleted?: boolean;
}

export interface SyncQueueItem {
  id?: number;
  tableName: 'production_records' | 'items' | 'categories' | 'users' | 'audit_logs';
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export class PackagingDatabase extends Dexie {
  productionRecords!: Table<LocalProductionRecord, string>;
  items!: Table<LocalItem, string>;
  categories!: Table<Category, string>;
  subcategories!: Table<Subcategory, string>;
  users!: Table<UserProfile, string>;
  companies!: Table<Company, string>;
  auditLogs!: Table<ProductionAuditLog, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('PremiumPackagingDB');

    this.version(1).stores({
      productionRecords: 'id, slipNumber, productionDate, shift, productionLine, itemId, companyId, syncStatus, updatedAt, isDeleted',
      items: 'id, code, name, categoryId, subcategoryId, companyId, syncStatus, isDeleted',
      categories: 'id, code, name, companyId',
      subcategories: 'id, categoryId, code, name',
      users: 'id, email, employeeId, role, companyId',
      companies: 'id',
      auditLogs: 'id, recordId, action, performedBy, timestamp',
      syncQueue: '++id, tableName, recordId, action, createdAt, attempts',
    });
  }

  /**
   * Initializes local IndexedDB with default factory seed data if empty
   */
  async seedIfEmpty(): Promise<void> {
    const recordsCount = await this.productionRecords.count();
    if (recordsCount > 0) return;

    console.log('Seeding Local-First IndexedDB with factory catalog & initial records...');

    await this.transaction('rw', [
      this.companies,
      this.users,
      this.categories,
      this.subcategories,
      this.items,
      this.productionRecords,
    ], async () => {
      // 1. Company
      await this.companies.put(DEFAULT_COMPANY);

      // 2. Users
      for (const u of SEED_USERS) {
        await this.users.put(u);
      }

      // 3. Categories
      for (const c of SEED_CATEGORIES) {
        await this.categories.put(c);
      }

      // 4. Subcategories
      for (const s of SEED_SUBCATEGORIES) {
        await this.subcategories.put(s);
      }

      // 5. Items (~70 real factory items with exact weights)
      for (const i of SEED_ITEMS) {
        await this.items.put({
          ...i,
          syncStatus: 'synced',
          syncedAt: new Date().toISOString(),
        });
      }
    });

    console.log('IndexedDB initialization complete with items and categories. Ready for live shop-floor production.');
  }
}

// Singleton database instance
export const db = new PackagingDatabase();

// Auto-seed on client boot
if (typeof window !== 'undefined') {
  db.seedIfEmpty().catch((err) => {
    console.error('Error seeding IndexedDB:', err);
  });
}
