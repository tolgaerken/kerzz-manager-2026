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

const getActiveContractFilter = (
  date: Date = new Date(),
): Record<string, unknown> => {
  const today = utcStartOfDay(date);
  return {
    startDate: { $lte: today },
    endDate: { $gte: today, $ne: null },
  };
};

const getContractDateFilter = (
  flow: string,
  date: Date = new Date(),
): Record<string, unknown> | null => {
  const today = utcStartOfDay(date);

  switch (flow) {
    case "active":
      return getActiveContractFilter(date);
    case "archive":
      return {
        noEndDate: { $ne: true },
        endDate: { $lt: today, $ne: null },
      };
    case "future":
      return {
        startDate: { $gt: today },
      };
    default:
      return null;
  }
};

const calculateRemainingDays = (
  endDate: Date | null | undefined,
  fromDate: Date = new Date(),
): number => {
  if (!endDate) return 0;
  const today = utcStartOfDay(fromDate);
  const end = utcEndOfMonth(endDate);
  return Math.max(0, utcDifferenceInCalendarDays(end, today));
};

export {
  getMonthBoundaries,
  getActiveContractFilter,
  getContractDateFilter,
  calculateRemainingDays,
};
