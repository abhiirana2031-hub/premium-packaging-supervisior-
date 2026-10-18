// Type definitions for Premium Packaging Supervisor

export type UserRole = 'supervisor' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  designation: string; // e.g. "Production Supervisor", "Senior Supervisor", "Production Manager"
  phone: string;
  email: string;
  companyId: string;
  companyName: string;
  employeeId?: string;
  role: UserRole;
  status?: 'active' | 'inactive';
  password?: string;
  avatarUrl?: string;
  preferences?: {
    defaultShift?: string;
    defaultLine?: string;
    weightUnit?: 'g' | 'kg';
    status?: 'active' | 'inactive';
    password?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ComponentWeights {
  jarWeight?: number | null;
  capWeight?: number | null;
  plasticHandleWeight?: number | null;
  steelHandleWeight?: number | null;
  otherComponentWeight?: number | null;
  otherComponentName?: string;
}

export type IdealWeightMode = 'calculated' | 'manual';

export interface ToleranceLimits {
  percentage: number; // e.g. 2.5 means +/- 2.5%
  minWeight?: number | null;
  maxWeight?: number | null;
}

export interface Item {
  id: string;
  companyId: string;
  categoryId: string;
  subcategoryId: string;
  itemCode: string; // e.g. "JAR-PET-500"
  itemName: string;
  itemDescription?: string;
  
  // Component Weights in grams
  jarWeight: number | null;
  capWeight: number | null;
  plasticHandleWeight: number | null;
  steelHandleWeight: number | null;
  otherComponentWeight: number | null;
  otherComponentName?: string;

  // Ideal weight specifications
  idealWeightMode: IdealWeightMode;
  approvedIdealWeight: number; // The official active ideal weight used for calculations
  calculatedComponentTotal: number; // Sum of defined components

  // Tolerances
  toleranceLimits: ToleranceLimits;
  
  targetProductionQty?: number | null;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WeightStatus = 'within_tolerance' | 'warning' | 'outside_tolerance' | 'incomplete';

export interface ProductionRecord {
  id: string;
  companyId: string;
  slipNumber: string; // e.g. "SLIP-20261018-001"
  productionDate: string; // YYYY-MM-DD
  shift: string; // "Day Shift" | "Night Shift"
  productionLine?: string; // "Line 1 (BBM-01)"
  batchNumber?: string; // "B2610-A"
  itemId: string;

  // Historical Specification Snapshot (Preserved forever!)
  itemNameSnapshot: string;
  itemCodeSnapshot: string;
  categorySnapshot: string;
  subcategorySnapshot: string;
  idealComponentWeightsSnapshot: ComponentWeights;
  approvedIdealWeightSnapshot: number;
  toleranceSnapshot: ToleranceLimits;

  // Actual Measurements
  actualComponentWeights: ComponentWeights;
  actualUnitWeight: number;
  measurementMode: 'unit_only' | 'components_entered';
  hasIncompleteComponents: boolean;

  // Production Volume
  productionQuantity: number;
  rejectedQuantity?: number;
  wastageWeight?: number; // In grams

  // Computed Values
  unitDifference: number; // actualUnitWeight - approvedIdealWeightSnapshot
  totalIdealWeight: number; // approvedIdealWeightSnapshot * productionQuantity (grams)
  totalActualWeight: number; // actualUnitWeight * productionQuantity (grams)
  totalWeightDifference: number; // totalActualWeight - totalIdealWeight (grams)
  percentageDeviation: number; // ((actualUnitWeight - approvedIdeal) / approvedIdeal) * 100
  weightStatus: WeightStatus;

  // Audit and metadata
  remarks?: string;
  recordedById: string;
  recordedByName: string;
  recordedByDesignation: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'REPORT_GENERATED';

export interface ProductionAuditLog {
  id: string;
  productionRecordId?: string;
  slipNumber?: string;
  action: AuditAction;
  previousValues?: Record<string, unknown> | null;
  updatedValues?: Record<string, unknown> | null;
  performedById: string;
  performedByName: string;
  performedByDesignation: string;
  performedAt: string;
  reason?: string;
}

export type DatePreset = 
  | 'today'
  | 'yesterday'
  | 'last_2_days'
  | 'last_3_days'
  | 'last_7_days'
  | 'current_week'
  | 'previous_week'
  | 'current_month'
  | 'previous_month'
  | 'last_30_days'
  | 'current_year'
  | 'previous_year'
  | 'custom';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  datePreset: DatePreset;
  defaultStartDate?: string;
  defaultEndDate?: string;
  categoryIds?: string[];
  itemIds?: string[];
  shifts?: string[];
  productionLines?: string[];
  supervisors?: string[];
  weightStatuses?: WeightStatus[];
  includeWeightComparison: boolean;
  includeComponentBreakdown: boolean;
  includeMaterialUsage: boolean;
  includeWastage: boolean;
  includeSignatures: boolean;
  defaultFormat: 'pdf' | 'excel' | 'csv';
  isSystemTemplate: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ReportGenerationRecord {
  id: string;
  reportNumber: string;
  templateName: string;
  dateRangeDisplay: string;
  generatedByName: string;
  generatedByDesignation: string;
  format: 'pdf' | 'excel' | 'csv' | 'slip';
  recordCount: number;
  generatedAt: string;
}

export interface FilterState {
  datePreset: DatePreset;
  startDate: string;
  endDate: string;
  categoryId: string;
  subcategoryId: string;
  itemId: string;
  shift: string;
  productionLine: string;
  batchNumber: string;
  supervisor: string;
  weightStatus: string;
  searchQuery: string;
}
