import {
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  startOfDay
} from "date-fns";

type MonthBoundaries = {
  monthStart: Date;
  monthEnd: Date;
};

const getMonthBoundaries = (date: Date): MonthBoundaries => {
  return {
    monthStart: startOfMonth(date),
    monthEnd: endOfMonth(date)
  };
};

const getActiveContractFilter = (
  date: Date = new Date()
): Record<string, unknown> => {
  const { monthStart, monthEnd } = getMonthBoundaries(date);
  return {
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart }
  };
};

const getContractDateFilter = (
  flow: string,
  date: Date = new Date()
): Record<string, unknown> | null => {
  const { monthStart, monthEnd } = getMonthBoundaries(date);

  switch (flow) {
    case "active":
      return getActiveContractFilter(date);
    case "archive":
      return {
        endDate: { $lt: monthStart }
      };
    case "future":
      return {
        startDate: { $gt: monthEnd }
      };
    default:
      return null;
  }
};

const calculateRemainingDays = (
  endDate: Date | null | undefined,
  fromDate: Date = new Date()
): number => {
  if (!endDate) return 0;
  const today = startOfDay(fromDate);
  const end = endOfMonth(endDate);
  return Math.max(0, differenceInCalendarDays(end, today));
};

export {
  getMonthBoundaries,
  getActiveContractFilter,
  getContractDateFilter,
  calculateRemainingDays
};
