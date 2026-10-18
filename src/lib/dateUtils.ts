import { DatePreset } from '@/types';

/**
 * Helper to get current Indian Standard Time (Asia/Kolkata) date representation.
 */
export function getNowInKolkata(): Date {
  if (typeof window === 'undefined') {
    return new Date('2026-10-18T10:00:00.000Z');
  }
  const now = new Date();
  const kolkataTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(kolkataTimeStr);
}

/**
 * Returns YYYY-MM-DD for today in Asia/Kolkata timezone
 */
export function getTodayString(): string {
  if (typeof window === 'undefined') {
    return '2026-10-18';
  }
  const d = getNowInKolkata();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD into Indian standard DD-MM-YYYY
 */
export function formatDateDDMMYYYY(isoDateStr?: string | null): string {
  if (!isoDateStr) return '—';
  // Check if string is already YYYY-MM-DD
  const parts = isoDateStr.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Otherwise parse as Date
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return isoDateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export const formatDisplayDate = formatDateDDMMYYYY;

/**
 * Formats full timestamp into DD-MM-YYYY, hh:mm A IST
 */
export function formatDateTimeIST(timestamp?: string | number | Date | null): string {
  if (!timestamp) return '—';
  if (typeof window === 'undefined') {
    return '18-10-2026, 10:00 AM IST';
  }
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' IST';
}

/**
 * Calculates start and end ISO dates (YYYY-MM-DD) for any DatePreset.
 */
export function getDateRangeForPreset(preset: DatePreset, customStart?: string, customEnd?: string): { start: string; end: string; label: string } {
  const today = getNowInKolkata();
  const todayStr = getTodayString();

  function offsetDate(baseDate: Date, days: number): string {
    const copy = new Date(baseDate);
    copy.setDate(copy.getDate() + days);
    const y = copy.getFullYear();
    const m = String(copy.getMonth() + 1).padStart(2, '0');
    const d = String(copy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  switch (preset) {
    case 'today':
      return { start: todayStr, end: todayStr, label: `Today (${formatDateDDMMYYYY(todayStr)})` };

    case 'yesterday': {
      const yestStr = offsetDate(today, -1);
      return { start: yestStr, end: yestStr, label: `Yesterday (${formatDateDDMMYYYY(yestStr)})` };
    }

    case 'last_2_days': {
      const start = offsetDate(today, -1);
      return { start, end: todayStr, label: `Last 2 Days (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'last_3_days': {
      const start = offsetDate(today, -2);
      return { start, end: todayStr, label: `Last 3 Days (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'last_7_days': {
      const start = offsetDate(today, -6);
      return { start, end: todayStr, label: `Last 7 Days (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'current_week': {
      // Monday as week start
      const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      const start = offsetDate(monday, 0);
      return { start, end: todayStr, label: `Current Week (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'previous_week': {
      const dayOfWeek = today.getDay();
      const diffToPrevMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) - 7;
      const prevMonday = new Date(today);
      prevMonday.setDate(today.getDate() + diffToPrevMonday);
      const start = offsetDate(prevMonday, 0);
      const end = offsetDate(prevMonday, 6);
      return { start, end, label: `Previous Week (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(end)})` };
    }

    case 'current_month': {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      return { start, end: todayStr, label: `Current Month (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'previous_month': {
      const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const y = prevMonthDate.getFullYear();
      const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      const start = `${y}-${m}-01`;
      const end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      return { start, end, label: `Previous Month (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(end)})` };
    }

    case 'last_30_days': {
      const start = offsetDate(today, -29);
      return { start, end: todayStr, label: `Last 30 Days (${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(todayStr)})` };
    }

    case 'current_year': {
      const y = today.getFullYear();
      const start = `${y}-01-01`;
      return { start, end: todayStr, label: `Current Year (${y})` };
    }

    case 'previous_year': {
      const y = today.getFullYear() - 1;
      const start = `${y}-01-01`;
      const end = `${y}-12-31`;
      return { start, end, label: `Previous Year (${y})` };
    }

    case 'custom':
    default: {
      const start = customStart || todayStr;
      const end = customEnd || todayStr;
      return { start, end, label: `${formatDateDDMMYYYY(start)} to ${formatDateDDMMYYYY(end)}` };
    }
  }
}
