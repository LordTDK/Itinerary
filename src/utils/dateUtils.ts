/**
 * Date utility helpers for holiday itinerary management
 */

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseFlexibleDate(dateStr: string, referenceYear = new Date().getFullYear()): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (!clean) return null;

  // Pattern: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Pattern: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const ukMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ukMatch) {
    const d = ukMatch[1].padStart(2, '0');
    const m = ukMatch[2].padStart(2, '0');
    const y = ukMatch[3];
    // If first number > 12, it's definitely DD/MM/YYYY
    // Default assumption for international travel is DD/MM/YYYY or MM/DD/YYYY
    if (parseInt(ukMatch[1], 10) > 12) {
      return `${y}-${m}-${d}`;
    }
    // Try natural interpretation (DD/MM/YYYY is standard international)
    return `${y}-${m}-${d}`;
  }

  // Try standard Date.parse
  const timestamp = Date.parse(clean);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    return formatISODate(d);
  }

  // Pattern: 18 Sep 2026 or 18 September 2026
  const textMonthMatch = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s*(\d{4})?$/);
  if (textMonthMatch) {
    const day = textMonthMatch[1].padStart(2, '0');
    const monthName = textMonthMatch[2].toLowerCase();
    const year = textMonthMatch[3] || String(referenceYear);
    const months: Record<string, string> = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    };
    const m = months[monthName.substring(0, 3)];
    if (m) {
      return `${year}-${m}-${day}`;
    }
  }

  return null;
}

export function formatFriendlyDate(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

export function formatShortDate(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

export function daysBetween(dateA: string, dateB: string): number {
  const [y1, m1, d1] = dateA.split('-').map(Number);
  const [y2, m2, d2] = dateB.split('-').map(Number);
  const dt1 = new Date(y1, m1 - 1, d1).getTime();
  const dt2 = new Date(y2, m2 - 1, d2).getTime();
  const diffTime = dt2 - dt1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}
