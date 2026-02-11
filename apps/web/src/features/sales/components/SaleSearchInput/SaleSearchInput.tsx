import { Search, X } from "lucide-react";

interface SaleSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SaleSearchInput({ value, onChange }: SaleSearchInputProps) {
  return (
    <div className="relative mt-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Satış ara (no, müşteri, satıcı...)"
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        </button>
      )}
    </div>
  );
}
