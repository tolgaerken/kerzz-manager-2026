import type { UninvoicedItemsSummary, UninvoicedItemCategory } from "../types/uninvoiced-items.types";
import { CATEGORY_INFO } from "../types/uninvoiced-items.types";

interface UninvoicedItemsSummaryCardsProps {
  summary: UninvoicedItemsSummary | undefined;
  selectedCategory: UninvoicedItemCategory | "all";
  onCategoryChange: (category: UninvoicedItemCategory | "all") => void;
}

export function UninvoicedItemsSummaryCards({
  summary,
  selectedCategory,
  onCategoryChange,
}: UninvoicedItemsSummaryCardsProps) {
  const categories: Array<{ key: UninvoicedItemCategory | "all"; label: string; count: number }> = [
    { key: "all", label: "Tümü", count: summary?.total ?? 0 },
    { key: "eftpos", label: CATEGORY_INFO.eftpos.label, count: summary?.eftpos?.length ?? 0 },
    { key: "saas", label: CATEGORY_INFO.saas.label, count: summary?.saas?.length ?? 0 },
    { key: "support", label: CATEGORY_INFO.support.label, count: summary?.support?.length ?? 0 },
    { key: "item", label: CATEGORY_INFO.item.label, count: summary?.item?.length ?? 0 },
    { key: "version", label: CATEGORY_INFO.version.label, count: summary?.version?.length ?? 0 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={`
            flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors
            ${
              selectedCategory === cat.key
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
            }
          `}
        >
          <span>{cat.label}</span>
          <span
            className={`
              rounded-full px-2 py-0.5 text-xs
              ${
                selectedCategory === cat.key
                  ? "bg-[var(--color-primary)]/20"
                  : "bg-[var(--color-muted-foreground)]/10"
              }
            `}
          >
            {cat.count}
          </span>
        </button>
      ))}
    </div>
  );
}
