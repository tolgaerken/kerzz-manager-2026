/**
 * Geçerli ayın başlangıç ve bitiş tarihlerini YYYY-MM-DD formatında döndürür.
 */
export function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

/**
 * Geçerli ayı YYYY-MM formatında döndürür.
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * YYYY-MM formatındaki ay string'inden o ayın başlangıç ve bitiş tarihlerini döndürür.
 */
export function getMonthRangeFromString(monthStr: string): {
  startDate: string;
  endDate: string;
} {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
