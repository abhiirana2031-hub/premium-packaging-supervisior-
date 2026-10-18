import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductionRecord, UserProfile } from '@/types';
import { formatDateDDMMYYYY, formatDateTimeIST } from './dateUtils';
import { formatGramsOnly, formatKgOnly, formatVariance } from './calculations';

export interface PdfReportOptions {
  companyName: string;
  reportTitle: string;
  dateRangeDisplay: string;
  user: UserProfile;
  records: ProductionRecord[];
  includeComponentBreakdown?: boolean;
  includeMaterialUsage?: boolean;
  includeWastage?: boolean;
  includeSignatures?: boolean;
}

export function generatePdfReport(options: PdfReportOptions): { doc: jsPDF; reportNumber: string } {
  const {
    companyName,
    reportTitle,
    dateRangeDisplay,
    user,
    records,
    includeSignatures = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const reportNumber = `PPS-REP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
  const generatedAt = formatDateTimeIST(now);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryNavy = [15, 23, 42]; // #0f172a
  const emeraldGreen = [16, 149, 114]; // #109572
  const textDark = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b

  // 1. Header Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Company Name & App Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(companyName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('PREMIUM PACKAGING SUPERVISOR — PRODUCTION & WEIGHT VARIANCE AUDIT', 14, 19);

  // Report Reference & Timestamp on right
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${reportNumber}`, pageWidth - 14, 11, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${generatedAt}`, pageWidth - 14, 17, { align: 'right' });
  doc.text(`Period: ${dateRangeDisplay}`, pageWidth - 14, 23, { align: 'right' });

  // 2. Metadata Sub-header
  let currentY = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(reportTitle, 14, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Supervisor In-Charge: ${user.fullName} (${user.designation}) | Records Evaluated: ${records.length}`, 14, currentY);

  // 3. High-level Summary Metrics Cards
  currentY += 6;
  const totalQty = records.reduce((sum, r) => sum + r.productionQuantity, 0);
  const totalRej = records.reduce((sum, r) => sum + (r.rejectedQuantity || 0), 0);
  const totalWastage = records.reduce((sum, r) => sum + (r.wastageWeight || 0), 0);
  const totalIdealWeightG = records.reduce((sum, r) => sum + r.totalIdealWeight, 0);
  const totalActualWeightG = records.reduce((sum, r) => sum + r.totalActualWeight, 0);
  const totalWeightDiffG = totalActualWeightG - totalIdealWeightG;
  const netDeviation = totalIdealWeightG > 0 ? (totalWeightDiffG / totalIdealWeightG) * 100 : 0;

  const cardWidth = (pageWidth - 28 - 15) / 4;
  const cardHeight = 16;
  const cardX = 14;

  const cardsData = [
    { title: 'Total Quantity Produced', value: `${totalQty.toLocaleString('en-IN')} pcs`, sub: `Rejections: ${totalRej} pcs` },
    { title: 'Total Actual Material', value: formatKgOnly(totalActualWeightG), sub: `${formatGramsOnly(totalActualWeightG)}` },
    { title: 'Total Ideal Material', value: formatKgOnly(totalIdealWeightG), sub: `${formatGramsOnly(totalIdealWeightG)}` },
    { 
      title: 'Net Material Variance', 
      value: `${totalWeightDiffG >= 0 ? '+' : ''}${formatKgOnly(totalWeightDiffG)}`, 
      sub: `${netDeviation >= 0 ? '+' : ''}${netDeviation.toFixed(2)}% net deviation` 
    },
  ];

  cardsData.forEach((c, idx) => {
    const x = cardX + idx * (cardWidth + 5);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(c.title.toUpperCase(), x + 4, currentY + 5);

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(c.value, x + 4, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(c.title.includes('Variance') && totalWeightDiffG > 0 ? 180 : 100, 70, 70);
    doc.text(c.sub, x + 4, currentY + 14.2);
  });

  currentY += cardHeight + 8;

  // 4. Main Production Records Table
  const tableRows = records.map((r, i) => {
    const diffSign = r.unitDifference > 0 ? '+' : '';
    const devSign = r.percentageDeviation > 0 ? '+' : '';

    return [
      (i + 1).toString(),
      formatDateDDMMYYYY(r.productionDate),
      r.slipNumber,
      `${r.itemNameSnapshot}\n[${r.itemCodeSnapshot}]`,
      r.shift.split('(')[0].trim(),
      r.productionLine?.split('—')[0].trim() || '—',
      r.productionQuantity.toLocaleString('en-IN'),
      r.approvedIdealWeightSnapshot.toFixed(1),
      r.actualUnitWeight.toFixed(1),
      `${diffSign}${r.unitDifference.toFixed(2)}`,
      formatKgOnly(r.totalIdealWeight),
      formatKgOnly(r.totalActualWeight),
      `${r.totalWeightDifference >= 0 ? '+' : ''}${formatKgOnly(r.totalWeightDifference)}`,
      `${devSign}${r.percentageDeviation.toFixed(1)}%`,
      r.weightStatus === 'within_tolerance' ? 'PASS' : r.weightStatus === 'warning' ? 'WARN' : 'OUT-TOL',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      '#',
      'Date',
      'Slip Ref',
      'Packaging Item & Code',
      'Shift',
      'Line',
      'Qty (pcs)',
      'Ideal Wt (g)',
      'Actual Wt (g)',
      'Unit Diff (g)',
      'Total Ideal',
      'Total Actual',
      'Variance',
      'Dev %',
      'Status',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 16 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'left', cellWidth: 46 },
      4: { halign: 'left', cellWidth: 18 },
      5: { halign: 'left', cellWidth: 16 },
      6: { halign: 'right', cellWidth: 16 },
      7: { halign: 'right', cellWidth: 15 },
      8: { halign: 'right', cellWidth: 15 },
      9: { halign: 'right', cellWidth: 16 },
      10: { halign: 'right', cellWidth: 17 },
      11: { halign: 'right', cellWidth: 17 },
      12: { halign: 'right', cellWidth: 18 },
      13: { halign: 'right', cellWidth: 14 },
      14: { halign: 'center', cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 14) {
        const val = data.cell.raw;
        if (val === 'PASS') {
          data.cell.styles.textColor = [16, 149, 114];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'WARN') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'OUT-TOL') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Calculate table end position
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 160;

  // 5. Signatures Block if enabled
  if (includeSignatures) {
    let signY = finalY + 12;
    if (signY > pageHeight - 35) {
      doc.addPage();
      signY = 30;
    }

    const boxWidth = 75;
    const boxHeight = 22;

    // Prepared By (Supervisor)
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, signY, boxWidth, boxHeight, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('PREPARED & VERIFIED BY (SUPERVISOR)', 18, signY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Name: ${user.fullName}`, 18, signY + 11);
    doc.text(`Designation: ${user.designation}`, 18, signY + 15);
    doc.text(`Signature: __________________________`, 18, signY + 19);

    // Plant / Quality Manager Reviewer
    const rightBoxX = pageWidth - 14 - boxWidth;
    doc.roundedRect(rightBoxX, signY, boxWidth, boxHeight, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('APPROVED BY (PLANT / QUALITY MANAGER)', rightBoxX + 4, signY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Name: _______________________________', rightBoxX + 4, signY + 11);
    doc.text('Designation: ________________________', rightBoxX + 4, signY + 15);
    doc.text('Date & Stamp: ______________________', rightBoxX + 4, signY + 19);
  }

  // 6. Page Numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `Premium Packaging Supervisor | Report Ref: ${reportNumber} | Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  return { doc, reportNumber };
}

export async function exportProductionPdf(options: {
  reportTitle: string;
  companyName: string;
  dateRangeDisplay: string;
  records: ProductionRecord[];
  currentUser: UserProfile;
}) {
  const { doc, reportNumber } = generatePdfReport({
    companyName: options.companyName,
    reportTitle: options.reportTitle,
    dateRangeDisplay: options.dateRangeDisplay,
    user: options.currentUser,
    records: options.records,
  });
  doc.save(`${options.reportTitle.replace(/\s+/g, '_')}_${reportNumber}.pdf`);
}
