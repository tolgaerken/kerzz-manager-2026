import { useState, useCallback } from "react";
import type { DatePreset } from "../components/DateRangeFilter";

/** Günün başlangıcını ISO string olarak döner */
function startOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Günün sonunu ISO string olarak döner */
function endOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/** Haftanın Pazartesi gününü döner */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/** Ayın ilk gününü döner */
function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getPresetDates(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    }
    case "thisWeek": {
      const monday = getMonday(now);
      return {
        startDate: startOfDay(monday),
        endDate: endOfDay(now),
      };
    }
    case "thisMonth": {
      const firstDay = getFirstDayOfMonth(now);
      return {
        startDate: startOfDay(firstDay),
        endDate: endOfDay(now),
      };
    }
  }
}

export function useDatePreset(initialPreset: DatePreset = "today") {
  const initial = getPresetDates(initialPreset);

  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [activePreset, setActivePreset] = useState<DatePreset | null>(
    initialPreset,
  );

  const handlePresetChange = useCallback((preset: DatePreset) => {
    const dates = getPresetDates(preset);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
    setActivePreset(preset);
  }, []);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
    setActivePreset(null);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
    setActivePreset(null);
  }, []);

  return {
    startDate,
    endDate,
    activePreset,
    handlePresetChange,
    handleStartDateChange,
    handleEndDateChange,
  };
}
