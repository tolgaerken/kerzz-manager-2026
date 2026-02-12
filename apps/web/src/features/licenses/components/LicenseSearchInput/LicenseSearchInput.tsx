import { Search, X } from "lucide-react";

interface LicenseSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function LicenseSearchInput({ value, onChange }: LicenseSearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Lisans no, tabela veya müşteri ara..."
        className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-10 pr-9 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        aria-label="Lisanslarda arama"
      />
      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
          aria-label="Aramayı temizle"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
