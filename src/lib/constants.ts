import { 
  Category, 
  Company, 
  Item, 
  ProductionRecord, 
  ReportTemplate, 
  Subcategory, 
  UserProfile 
} from '@/types';
import { calculateProductionWeights } from './calculations';
import { getTodayString } from './dateUtils';
import { 
  REAL_CATEGORIES, 
  REAL_SUBCATEGORIES, 
  REAL_FACTORY_ITEMS, 
  FACTORY_COMPANY_ID 
} from './factoryCatalog';

export const DEFAULT_COMPANY: Company = {
  id: FACTORY_COMPANY_ID,
  name: 'Premium Packaging',
  code: 'PREM-PKG',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: '9b4c860f-4700-4ffe-83ba-0c52b424b0d4',
  fullName: 'Abhay Rana',
  designation: 'General Works Manager / Admin',
  phone: '',
  email: 'abhayrana8272@gmail.com',
  companyId: DEFAULT_COMPANY.id,
  companyName: DEFAULT_COMPANY.name,
  employeeId: 'EMP-5977',
  role: 'admin',
  status: 'active',
  preferences: {
    defaultShift: 'Day Shift',
    defaultLine: 'Line 1',
    weightUnit: 'g',
    status: 'active',
  },
  createdAt: '2026-10-18T18:13:45.476Z',
  updatedAt: new Date().toISOString(),
};

export const SEED_USERS: UserProfile[] = [DEFAULT_ADMIN_USER];

export const SEED_CATEGORIES: Category[] = REAL_CATEGORIES;
export const SEED_SUBCATEGORIES: Subcategory[] = REAL_SUBCATEGORIES;
export const SEED_ITEMS: Item[] = REAL_FACTORY_ITEMS;

export const SHIFT_OPTIONS = [
  'Day Shift',
  'Night Shift',
];

export const PRODUCTION_LINES = [
  'Line 1 — ASB Blow-Stretch 01',
  'Line 2 — Ferromatik Injection 02',
  'Line 3 — Windsor Blow Molding 03',
  'Line 4 — Automated Assembly & Wadding',
  'Line 5 — High Precision Closures',
];

/**
 * Production records start clean with zero demo data.
 * Ready for real factory data entry.
 */
export function generateSeedProductionRecords(): ProductionRecord[] {
  return [];
}

export const SEED_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl_daily_production',
    name: 'Daily Production Report',
    description: 'Summary of all items, quantities, and weight variances recorded today.',
    datePreset: 'today',
    includeWeightComparison: true,
    includeComponentBreakdown: true,
    includeMaterialUsage: true,
    includeWastage: true,
    includeSignatures: true,
    defaultFormat: 'pdf',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_shift_wise',
    name: 'Shift-wise Production Report',
    description: 'Breakdown of production volume and quality metrics per operating shift.',
    datePreset: 'today',
    includeWeightComparison: true,
    includeComponentBreakdown: false,
    includeMaterialUsage: true,
    includeWastage: true,
    includeSignatures: true,
    defaultFormat: 'pdf',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_weekly_variance',
    name: 'Weekly Weight Variance Report',
    description: 'Detailed analysis of actual vs ideal weights over the last 7 days.',
    datePreset: 'last_7_days',
    includeWeightComparison: true,
    includeComponentBreakdown: true,
    includeMaterialUsage: true,
    includeWastage: true,
    includeSignatures: true,
    defaultFormat: 'excel',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_monthly_material',
    name: 'Monthly Material Consumption Report',
    description: 'Comprehensive material consumption, net deviation, and resin wastage tracking for the month.',
    datePreset: 'current_month',
    includeWeightComparison: true,
    includeComponentBreakdown: true,
    includeMaterialUsage: true,
    includeWastage: true,
    includeSignatures: true,
    defaultFormat: 'excel',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_category_summary',
    name: 'Category-wise Production Summary',
    description: 'Aggregated totals grouped by packaging category for production planning.',
    datePreset: 'current_month',
    includeWeightComparison: true,
    includeComponentBreakdown: false,
    includeMaterialUsage: true,
    includeWastage: false,
    includeSignatures: true,
    defaultFormat: 'pdf',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl_out_of_tolerance',
    name: 'Out-of-Tolerance Audit Report',
    description: 'Critical quality alert listing all production runs with deviations exceeding approved limits.',
    datePreset: 'last_30_days',
    weightStatuses: ['outside_tolerance', 'warning'],
    includeWeightComparison: true,
    includeComponentBreakdown: true,
    includeMaterialUsage: true,
    includeWastage: true,
    includeSignatures: true,
    defaultFormat: 'pdf',
    isSystemTemplate: true,
    createdBy: 'System',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
