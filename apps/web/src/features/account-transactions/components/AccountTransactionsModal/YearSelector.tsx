import { useMemo } from "react";
import { Calendar } from "lucide-react";

interface YearSelectorProps {
  year: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({ year, onYearChange }: YearSelectorProps) {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i + 1);
  }, []);

  return (
    <div className="w-full md:w-32">
      <label className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-foreground-muted)] mb-1">
        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
        Yıl
      </label>
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm md:text-base text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
