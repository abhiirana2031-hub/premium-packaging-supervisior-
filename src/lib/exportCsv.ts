import { ProductionRecord, UserProfile } from '@/types';
import { formatDateDDMMYYYY, formatDateTimeIST } from './dateUtils';

export function generateCsvExport(
  records: ProductionRecord[],
  user: UserProfile,
  companyName: string,
  dateRangeDisplay: string
): string {
  const headers = [
    'Slip Number',
    'Production Date',
    'Shift',
    'Production Line',
    'Batch Number',
    'Category',
    'Subcategory',
    'Item Code',
    'Item Name',
    'Production Quantity',
    'Rejected Quantity',
    'Wastage Weight (g)',
    'Approved Ideal Weight (g)',
    'Actual Unit Weight (g)',
    'Unit Difference (g)',
    'Total Ideal Weight (g)',
    'Total Actual Weight (g)',
    'Total Difference (g)',
    'Percentage Deviation (%)',
    'Weight Status',
    'Remarks',
    'Recorded By',
    'Designation',
  ];

  function escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  const rows = records.map((r) => [
    escapeCsv(r.slipNumber),
    escapeCsv(formatDateDDMMYYYY(r.productionDate)),
    escapeCsv(r.shift),
    escapeCsv(r.productionLine || ''),
    escapeCsv(r.batchNumber || ''),
    escapeCsv(r.categorySnapshot),
    escapeCsv(r.subcategorySnapshot),
    escapeCsv(r.itemCodeSnapshot),
    escapeCsv(r.itemNameSnapshot),
    escapeCsv(r.productionQuantity),
    escapeCsv(r.rejectedQuantity || 0),
    escapeCsv(r.wastageWeight || 0),
    escapeCsv(r.approvedIdealWeightSnapshot),
    escapeCsv(r.actualUnitWeight),
    escapeCsv(r.unitDifference),
    escapeCsv(r.totalIdealWeight),
    escapeCsv(r.totalActualWeight),
    escapeCsv(r.totalWeightDifference),
    escapeCsv(r.percentageDeviation.toFixed(2)),
    escapeCsv(r.weightStatus),
    escapeCsv(r.remarks || ''),
    escapeCsv(r.recordedByName),
    escapeCsv(r.recordedByDesignation),
  ].join(','));

  // CSV meta preamble
  const preamble = [
    `# Company: ${companyName}`,
    `# App: Premium Packaging Supervisor`,
    `# Generated At: ${formatDateTimeIST(new Date())}`,
    `# Supervisor: ${user.fullName} (${user.designation})`,
    `# Period: ${dateRangeDisplay}`,
    `# Records: ${records.length}`,
    '',
  ].join('\n');

  return preamble + headers.map(escapeCsv).join(',') + '\n' + rows.join('\n');
}

export function exportProductionCsv(options: {
  reportTitle: string;
  records: ProductionRecord[];
  currentUser?: UserProfile;
  companyName?: string;
  dateRangeDisplay?: string;
}) {
  const dummyUser: UserProfile = options.currentUser || {
    id: 'usr_sys',
    fullName: 'Production Supervisor',
    designation: 'Supervisor',
    phone: '',
    email: '',
    companyId: '',
    companyName: options.companyName || 'Premium Packaging',
    role: 'supervisor',
    createdAt: '',
    updatedAt: '',
  };

  const csvContent = generateCsvExport(
    options.records,
    dummyUser,
    options.companyName || 'Premium Packaging',
    options.dateRangeDisplay || 'Production Period'
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${options.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
