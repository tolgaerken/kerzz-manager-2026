import { memo, useCallback } from "react";

/** Ön tanımlı tarih aralığı seçenekleri */
export type DatePreset = "today" | "yesterday" | "thisWeek" | "thisMonth";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  activePreset: DatePreset | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onPresetChange: (preset: DatePreset) => void;
}

const PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Bugün" },
  { id: "yesterday", label: "Dün" },
  { id: "thisWeek", label: "Bu Hafta" },
  { id: "thisMonth", label: "Bu Ay" },
];

/** Tarih string'ini input[type=date] formatına çevir (YYYY-MM-DD) */
function toInputDate(isoDate: string): string {
  if (!isoDate) return "";
  return isoDate.slice(0, 10);
}

/** Input date'i ISO string'e çevir (günün başlangıcı) */
function toISOStart(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

/** Input date'i ISO string'e çevir (günün sonu) */
function toISOEnd(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(`${dateStr}T23:59:59.999Z`).toISOString();
}

export const DateRangeFilter = memo(function DateRangeFilter({
  startDate,
  endDate,
  activePreset,
  onStartDateChange,
  onEndDateChange,
  onPresetChange,
}: DateRangeFilterProps) {
  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onStartDateChange(toISOStart(e.target.value));
    },
    [onStartDateChange],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onEndDateChange(toISOEnd(e.target.value));
    },
    [onEndDateChange],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Preset butonları */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPresetChange(preset.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activePreset === preset.id
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Tarih input'ları */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="start-date"
            className="text-xs text-[var(--color-muted-foreground)]"
          >
            Başlangıç:
          </label>
          <input
            id="start-date"
            type="date"
            value={toInputDate(startDate)}
            onChange={handleStartChange}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="end-date"
            className="text-xs text-[var(--color-muted-foreground)]"
          >
            Bitiş:
          </label>
          <input
            id="end-date"
            type="date"
            value={toInputDate(endDate)}
            onChange={handleEndChange}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>
    </div>
  );
});
