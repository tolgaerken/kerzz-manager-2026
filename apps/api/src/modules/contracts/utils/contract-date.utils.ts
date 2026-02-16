import {
  utcStartOfMonth,
  utcEndOfMonth,
  utcStartOfDay,
  utcDifferenceInCalendarDays,
} from "../../contract-invoices/utils/date.utils";

type MonthBoundaries = {
  monthStart: Date;
  monthEnd: Date;
};

const getMonthBoundaries = (date: Date): MonthBoundaries => {
  return {
    monthStart: utcStartOfMonth(date),
    monthEnd: utcEndOfMonth(date),
  };
};

/**
 * Kontratın bitiş tarihini ay sonu olarak normalize eder.
 * Query/hesaplama katmanında kullanılır; DB'deki değer değişmez.
 */
const getContractEndBoundary = (endDate: Date): Date => {
  return utcEndOfMonth(endDate);
};

/**
 * MongoDB aggregation expression: endDate alanının ay sonunu hesaplar.
 * $dateFromParts ile endDate'in yıl/ay bilgisinden bir sonraki ayın 0. gününü alır (= bu ayın son günü).
 */
const getEndOfMonthExpr = (field: string): Record<string, unknown> => ({
  $dateFromParts: {
    year: { $year: field },
    month: { $add: [{ $month: field }, 1] },
    day: 0,
  },
});

/**
 * Aktif kontrat filtresi:
 * - startDate <= bugün
 * - endDate'in ay sonu >= bugün (endDate null değilse)
 * 
 * MongoDB $expr kullanarak endDate'i ay sonuna normalize eder.
 */
const getActiveContractFilter = (
  date: Date = new Date(),
): Record<string, unknown> => {
  const today = utcStartOfDay(date);
  return {
    startDate: { $lte: today },
    endDate: { $ne: null },
    $expr: {
      $gte: [getEndOfMonthExpr("$endDate"), today],
    },
  };
};

/**
 * Arşiv kontrat filtresi:
 * - endDate'in ay sonu < bugün (kontrat sona ermiş)
 * - noEndDate değilse ve endDate null değilse
 */
const getArchiveContractFilter = (
  date: Date = new Date(),
): Record<string, unknown> => {
  const today = utcStartOfDay(date);
  return {
    noEndDate: { $ne: true },
    endDate: { $ne: null },
    $expr: {
      $lt: [getEndOfMonthExpr("$endDate"), today],
    },
  };
};

/**
 * Flow bazlı kontrat filtresi döndürür.
 * active/archive için EOM (ay sonu) kuralı uygulanır.
 */
const getContractDateFilter = (
  flow: string,
  date: Date = new Date(),
): Record<string, unknown> | null => {
  const today = utcStartOfDay(date);

  switch (flow) {
    case "active":
      return getActiveContractFilter(date);
    case "archive":
      return getArchiveContractFilter(date);
    case "future":
      return {
        startDate: { $gt: today },
      };
    default:
      return null;
  }
};

/**
 * Kontratın bitiş tarihine göre kalan gün sayısını hesaplar.
 * endDate ay sonu olarak değerlendirilir.
 */
const calculateRemainingDays = (
  endDate: Date | null | undefined,
  fromDate: Date = new Date(),
): number => {
  if (!endDate) return 0;
  const today = utcStartOfDay(fromDate);
  const end = getContractEndBoundary(endDate);
  return Math.max(0, utcDifferenceInCalendarDays(end, today));
};

export {
  getMonthBoundaries,
  getContractEndBoundary,
  getEndOfMonthExpr,
  getActiveContractFilter,
  getArchiveContractFilter,
  getContractDateFilter,
  calculateRemainingDays,
};
