import ExcelJS from 'exceljs';
import { Item, ProductionRecord, UserProfile } from '@/types';
import { formatDateDDMMYYYY, formatDateTimeIST } from './dateUtils';

export interface ExcelExportOptions {
  companyName: string;
  reportTitle: string;
  dateRangeDisplay: string;
  user: UserProfile;
  records: ProductionRecord[];
  items: Item[];
}

export async function generateExcelWorkbook(options: ExcelExportOptions): Promise<{ buffer: Uint8Array; filename: string }> {
  const { companyName, reportTitle, dateRangeDisplay, user, records, items } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Premium Packaging Supervisor';
  workbook.lastModifiedBy = user.fullName;
  workbook.created = new Date();
  workbook.modified = new Date();

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `PPS_Production_Report_${dateStr}.xlsx`;

  // Colors
  const darkNavy = 'FF0F172A';
  const headerGray = 'FFF1F5F9';
  const textDark = 'FF1E293B';
  const greenPass = 'FF10B981';
  const amberWarn = 'FFF59E0B';
  const redAlert = 'FFEF4444';

  // -------------------------------------------------------------
  // Sheet 1: Production Summary
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Production Summary', {
    views: [{ showGridLines: true }],
  });

  // Title Block
  summarySheet.mergeCells('A1:F1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `${companyName.toUpperCase()} — PRODUCTION MANAGEMENT REPORT`;
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 32;

  // Metadata Block
  const meta = [
    ['Report Title:', reportTitle, '', 'Supervisor:', `${user.fullName} (${user.designation})`],
    ['Period:', dateRangeDisplay, '', 'Company:', companyName],
    ['Generated At:', formatDateTimeIST(now), '', 'Total Records:', records.length],
  ];

  meta.forEach((row, i) => {
    const r = summarySheet.addRow(row);
    r.font = { name: 'Arial', size: 10 };
    r.getCell(1).font = { bold: true };
    r.getCell(4).font = { bold: true };
  });

  summarySheet.addRow([]); // Blank row

  // KPI Table
  const totalQty = records.reduce((s, r) => s + r.productionQuantity, 0);
  const totalRej = records.reduce((s, r) => s + (r.rejectedQuantity || 0), 0);
  const totalWastage = records.reduce((s, r) => s + (r.wastageWeight || 0), 0);
  const totalIdealG = records.reduce((s, r) => s + r.totalIdealWeight, 0);
  const totalActualG = records.reduce((s, r) => s + r.totalActualWeight, 0);
  const netVarG = totalActualG - totalIdealG;
  const netPct = totalIdealG > 0 ? (netVarG / totalIdealG) * 100 : 0;

  const kpiHeader = summarySheet.addRow(['Metric Indicator', 'Unit / Formula', 'Recorded Value']);
  kpiHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  kpiHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
    cell.alignment = { vertical: 'middle' };
  });

  const kpis: [string, string, number | string][] = [
    ['Total Production Quantity', 'Pieces (Units)', totalQty],
    ['Total Rejected Quantity', 'Pieces (Units)', totalRej],
    ['Rejection Rate', 'Percentage of Total', `${((totalRej / (totalQty || 1)) * 100).toFixed(2)}%`],
    ['Total Material Wastage', 'Grams (g)', totalWastage],
    ['Total Ideal Production Weight', 'Kilograms (kg)', Number((totalIdealG / 1000).toFixed(2))],
    ['Total Actual Production Weight', 'Kilograms (kg)', Number((totalActualG / 1000).toFixed(2))],
    ['Net Material Weight Variance', 'Kilograms (kg)', Number((netVarG / 1000).toFixed(2))],
    ['Net Weight Percentage Deviation', 'Percentage (%)', `${netPct >= 0 ? '+' : ''}${netPct.toFixed(2)}%`],
    ['Total Production Slips Generated', 'Records', records.length],
  ];

  kpis.forEach(([name, unit, val]) => {
    const row = summarySheet.addRow([name, unit, val]);
    row.font = { size: 10 };
    if (typeof val === 'number') {
      row.getCell(3).numFmt = '#,##0.00';
    }
  });

  summarySheet.columns = [
    { width: 34 },
    { width: 22 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ];

  // -------------------------------------------------------------
  // Sheet 2: Detailed Production Records
  // -------------------------------------------------------------
  const detailsSheet = workbook.addWorksheet('Detailed Records', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const detailCols = [
    'Slip Number',
    'Date (DD-MM-YYYY)',
    'Shift',
    'Production Line',
    'Batch / Lot',
    'Category',
    'Subcategory',
    'Item Code',
    'Item Name',
    'Quantity (pcs)',
    'Rejected Qty',
    'Wastage Wt (g)',
    'Ideal Unit Wt (g)',
    'Actual Unit Wt (g)',
    'Unit Diff (g)',
    'Total Ideal Wt (kg)',
    'Total Actual Wt (kg)',
    'Total Diff (kg)',
    'Deviation %',
    'Weight Status',
    'Recorded By',
    'Remarks',
  ];

  const detailHeaderRow = detailsSheet.addRow(detailCols);
  detailHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  detailHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  records.forEach((r) => {
    const row = detailsSheet.addRow([
      r.slipNumber,
      formatDateDDMMYYYY(r.productionDate),
      r.shift,
      r.productionLine || '—',
      r.batchNumber || '—',
      r.categorySnapshot,
      r.subcategorySnapshot,
      r.itemCodeSnapshot,
      r.itemNameSnapshot,
      r.productionQuantity,
      r.rejectedQuantity || 0,
      r.wastageWeight || 0,
      r.approvedIdealWeightSnapshot,
      r.actualUnitWeight,
      r.unitDifference,
      Number((r.totalIdealWeight / 1000).toFixed(3)),
      Number((r.totalActualWeight / 1000).toFixed(3)),
      Number((r.totalWeightDifference / 1000).toFixed(3)),
      Number(r.percentageDeviation.toFixed(2)),
      r.weightStatus.replace('_', ' ').toUpperCase(),
      `${r.recordedByName} (${r.recordedByDesignation})`,
      r.remarks || '',
    ]);

    // Format numbers
    row.getCell(10).numFmt = '#,##0'; // Qty
    row.getCell(11).numFmt = '#,##0'; // Rej
    row.getCell(12).numFmt = '#,##0.0'; // Wastage
    row.getCell(13).numFmt = '#,##0.00'; // Ideal Wt
    row.getCell(14).numFmt = '#,##0.00'; // Actual Wt
    row.getCell(15).numFmt = '+#,##0.00;-#,##0.00;0.00'; // Unit Diff
    row.getCell(16).numFmt = '#,##0.000'; // Total Ideal kg
    row.getCell(17).numFmt = '#,##0.000'; // Total Actual kg
    row.getCell(18).numFmt = '+#,##0.000;-#,##0.000;0.000'; // Total Diff kg
    row.getCell(19).numFmt = '+0.00%;-0.00%;0.00%'; // Deviation
  });

  // Total summary row with formulas
  if (records.length > 0) {
    const lastRowIdx = records.length + 1;
    const totalsRow = detailsSheet.addRow([
      'TOTALS / SUM',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      { formula: `SUM(J2:J${lastRowIdx})` },
      { formula: `SUM(K2:K${lastRowIdx})` },
      { formula: `SUM(L2:L${lastRowIdx})` },
      '',
      '',
      '',
      { formula: `SUM(P2:P${lastRowIdx})` },
      { formula: `SUM(Q2:Q${lastRowIdx})` },
      { formula: `SUM(R2:R${lastRowIdx})` },
      '',
      '',
      '',
      '',
    ]);
    totalsRow.font = { bold: true };
    totalsRow.getCell(10).numFmt = '#,##0';
    totalsRow.getCell(11).numFmt = '#,##0';
    totalsRow.getCell(12).numFmt = '#,##0.0';
    totalsRow.getCell(16).numFmt = '#,##0.000';
    totalsRow.getCell(17).numFmt = '#,##0.000';
    totalsRow.getCell(18).numFmt = '+#,##0.000;-#,##0.000;0.000';
  }

  detailsSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: detailCols.length },
  };

  detailsSheet.columns = [
    { width: 18 }, // slip
    { width: 14 }, // date
    { width: 22 }, // shift
    { width: 24 }, // line
    { width: 14 }, // batch
    { width: 18 }, // category
    { width: 22 }, // subcategory
    { width: 16 }, // code
    { width: 34 }, // name
    { width: 14 }, // qty
    { width: 12 }, // rej
    { width: 14 }, // wastage
    { width: 16 }, // ideal unit
    { width: 16 }, // act unit
    { width: 14 }, // diff unit
    { width: 18 }, // total ideal kg
    { width: 18 }, // total act kg
    { width: 18 }, // total diff kg
    { width: 14 }, // dev %
    { width: 18 }, // status
    { width: 30 }, // recorded by
    { width: 30 }, // remarks
  ];

  // -------------------------------------------------------------
  // Sheet 3: Item Specifications Master
  // -------------------------------------------------------------
  const itemsSheet = workbook.addWorksheet('Item Specifications', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const itemCols = [
    'Item Code',
    'Item Name',
    'Category',
    'Subcategory',
    'Jar Weight (g)',
    'Cap Weight (g)',
    'Plastic Handle (g)',
    'Steel Handle (g)',
    'Other Component (g)',
    'Other Component Name',
    'Component Sum (g)',
    'Approved Ideal Wt (g)',
    'Spec Mode',
    'Tolerance (±%)',
    'Min Wt (g)',
    'Max Wt (g)',
    'Target Production Qty',
    'Status',
  ];

  const itemHeaderRow = itemsSheet.addRow(itemCols);
  itemHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  itemHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  items.forEach((item) => {
    itemsSheet.addRow([
      item.itemCode,
      item.itemName,
      item.categoryId,
      item.subcategoryId,
      item.jarWeight || '—',
      item.capWeight || '—',
      item.plasticHandleWeight || '—',
      item.steelHandleWeight || '—',
      item.otherComponentWeight || '—',
      item.otherComponentName || '—',
      item.calculatedComponentTotal,
      item.approvedIdealWeight,
      item.idealWeightMode.toUpperCase(),
      item.toleranceLimits.percentage,
      item.toleranceLimits.minWeight || '—',
      item.toleranceLimits.maxWeight || '—',
      item.targetProductionQty || '—',
      item.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);
  });

  itemsSheet.columns = [
    { width: 16 },
    { width: 35 },
    { width: 18 },
    { width: 22 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 20 },
    { width: 18 },
    { width: 20 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 20 },
    { width: 12 },
  ];

  // -------------------------------------------------------------
  // Sheet 4: Ideal vs Actual Comparison
  // -------------------------------------------------------------
  const compSheet = workbook.addWorksheet('Ideal vs Actual Comparison', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const compCols = [
    'Slip Ref',
    'Item Name & Code',
    'Production Qty',
    'Ideal Unit (g)',
    'Actual Unit (g)',
    'Unit Variance (g)',
    'Ideal Total (kg)',
    'Actual Total (kg)',
    'Net Variance (kg)',
    'Percentage Dev',
    'Tolerance Status',
    'Evaluation / Audit',
  ];

  const compHeader = compSheet.addRow(compCols);
  compHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  compHeader.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  records.forEach((r) => {
    const evalText =
      r.weightStatus === 'within_tolerance'
        ? 'Within Approved Engineering Tolerance'
        : r.weightStatus === 'warning'
        ? 'Warning: Near Tolerance Boundary'
        : 'Outside Spec: Engineering Review Required';

    const row = compSheet.addRow([
      r.slipNumber,
      `${r.itemNameSnapshot} (${r.itemCodeSnapshot})`,
      r.productionQuantity,
      r.approvedIdealWeightSnapshot,
      r.actualUnitWeight,
      r.unitDifference,
      Number((r.totalIdealWeight / 1000).toFixed(3)),
      Number((r.totalActualWeight / 1000).toFixed(3)),
      Number((r.totalWeightDifference / 1000).toFixed(3)),
      Number((r.percentageDeviation / 100).toFixed(4)),
      r.weightStatus.replace('_', ' ').toUpperCase(),
      evalText,
    ]);

    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(6).numFmt = '+#,##0.00;-#,##0.00;0.00';
    row.getCell(7).numFmt = '#,##0.000';
    row.getCell(8).numFmt = '#,##0.000';
    row.getCell(9).numFmt = '+#,##0.000;-#,##0.000;0.000';
    row.getCell(10).numFmt = '+0.00%;-0.00%;0.00%';
  });

  compSheet.columns = [
    { width: 18 },
    { width: 38 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 14 },
    { width: 20 },
    { width: 36 },
  ];

  // -------------------------------------------------------------
  // Sheet 5: Category-wise Summary
  // -------------------------------------------------------------
  const catSheet = workbook.addWorksheet('Category-wise Summary', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const catCols = [
    'Category',
    'Total Entries',
    'Total Qty (pcs)',
    'Total Rejections',
    'Total Ideal (kg)',
    'Total Actual (kg)',
    'Variance (kg)',
    'Net Deviation %',
  ];

  const catHeader = catSheet.addRow(catCols);
  catHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catHeader.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkNavy } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Group by category
  const catMap = new Map<string, ProductionRecord[]>();
  records.forEach((r) => {
    const list = catMap.get(r.categorySnapshot) || [];
    list.push(r);
    catMap.set(r.categorySnapshot, list);
  });

  catMap.forEach((catRecords, catName) => {
    const cQty = catRecords.reduce((s, r) => s + r.productionQuantity, 0);
    const cRej = catRecords.reduce((s, r) => s + (r.rejectedQuantity || 0), 0);
    const cIdealG = catRecords.reduce((s, r) => s + r.totalIdealWeight, 0);
    const cActualG = catRecords.reduce((s, r) => s + r.totalActualWeight, 0);
    const cDiffG = cActualG - cIdealG;
    const cDev = cIdealG > 0 ? (cDiffG / cIdealG) : 0;

    const row = catSheet.addRow([
      catName,
      catRecords.length,
      cQty,
      cRej,
      Number((cIdealG / 1000).toFixed(2)),
      Number((cActualG / 1000).toFixed(2)),
      Number((cDiffG / 1000).toFixed(2)),
      Number(cDev.toFixed(4)),
    ]);

    row.getCell(2).numFmt = '#,##0';
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '#,##0';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(7).numFmt = '+#,##0.00;-#,##0.00;0.00';
    row.getCell(8).numFmt = '+0.00%;-0.00%;0.00%';
  });

  catSheet.columns = [
    { width: 24 },
    { width: 14 },
    { width: 18 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: new Uint8Array(buffer), filename };
}

export async function exportProductionExcel(options: {
  reportTitle: string;
  companyName: string;
  dateRangeDisplay: string;
  records: ProductionRecord[];
  currentUser: UserProfile;
  items?: Item[];
}) {
  const { buffer, filename } = await generateExcelWorkbook({
    companyName: options.companyName,
    reportTitle: options.reportTitle,
    dateRangeDisplay: options.dateRangeDisplay,
    user: options.currentUser,
    records: options.records,
    items: options.items || [],
  });
  const blob = new Blob([buffer as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
