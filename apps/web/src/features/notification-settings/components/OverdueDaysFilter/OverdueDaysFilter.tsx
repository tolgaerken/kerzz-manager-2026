import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface OverdueDaysFilterProps {
  /** Genel ayarlardan gelen hatırlatma günleri (ör: [0] ve [3, 5, 10]) */
  dueDays: number[];
  overdueDays: number[];
  /** Seçili günler */
  selectedDays: number[];
  /** Seçim değiştiğinde çağrılır */
  onChange: (days: number[]) => void;
}

export function OverdueDaysFilter({
  dueDays,
  overdueDays,
  selectedDays,
  onChange,
}: OverdueDaysFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allOptions = [
    ...dueDays.map((d) => ({
      value: d,
      label: d === 0 ? "Vadesi bugün" : `Vadeden ${d} gün önce`,
      group: "due" as const,
    })),
    ...overdueDays
      .sort((a, b) => a - b)
      .map((d) => ({
        value: -d, // negatif değer: vadesi geçmiş günleri ayırt etmek için
        label: `${d} gün gecikmiş`,
        group: "overdue" as const,
      })),
  ];

  const toggleDay = (value: number) => {
    if (selectedDays.includes(value)) {
      onChange(selectedDays.filter((d) => d !== value));
    } else {
      onChange([...selectedDays, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  const selectedLabels = allOptions.filter((o) => selectedDays.includes(o.value));

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] min-w-[200px] justify-between"
      >
        <span className="truncate">
          {selectedLabels.length === 0
            ? "Hatırlatma Günleri"
            : selectedLabels.length === 1
              ? selectedLabels[0].label
              : `${selectedLabels.length} gün seçili`}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedDays.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="p-0.5 hover:bg-[var(--color-border)] rounded"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg py-1">
          {dueDays.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] uppercase">
                Son Ödeme Günü
              </div>
              {allOptions
                .filter((o) => o.group === "due")
                .map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--color-surface-elevated)] text-sm text-[var(--color-foreground)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(option.value)}
                      onChange={() => toggleDay(option.value)}
                      className="w-4 h-4 rounded border-[var(--color-border)]"
                    />
                    {option.label}
                  </label>
                ))}
            </>
          )}

          {overdueDays.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] uppercase border-t border-[var(--color-border)] mt-1 pt-2">
                Vadesi Geçmiş
              </div>
              {allOptions
                .filter((o) => o.group === "overdue")
                .map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--color-surface-elevated)] text-sm text-[var(--color-foreground)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(option.value)}
                      onChange={() => toggleDay(option.value)}
                      className="w-4 h-4 rounded border-[var(--color-border)]"
                    />
                    {option.label}
                  </label>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
