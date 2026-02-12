import { memo } from "react";
import { Package, Hash, Trash2 } from "lucide-react";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "./ProductAutocompleteEditor";

interface LicenseItemCardProps {
  item: LicenseItem;
  products: ProductOption[];
  selected?: boolean;
  onSelect?: (item: LicenseItem) => void;
  onEdit?: (item: LicenseItem) => void;
  onDelete?: (item: LicenseItem) => void;
  allowDelete?: boolean;
}

export const LicenseItemCard = memo(function LicenseItemCard({
  item,
  products,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  allowDelete = false
}: LicenseItemCardProps) {
  // Ürün adını bul
  const getProductName = (moduleId: string): string => {
    if (!moduleId) return "Ürün seçilmedi";
    const valueStr = String(moduleId);
    const found = products.find(
      (p) =>
        String(parseInt(p.pid, 10)) === valueStr ||
        p.pid === valueStr ||
        p.id === valueStr ||
        p._id === valueStr
    );
    return found?.nameWithCode || found?.friendlyName || found?.name || String(moduleId);
  };

  const productName = getProductName(item.moduleId);

  const handleClick = () => {
    onSelect?.(item);
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleEdit();
        } else if (e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`relative rounded-lg border p-3 transition-all active:scale-[0.98] ${
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Ürün bilgisi */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`rounded-lg p-2 shrink-0 ${
            selected
              ? "bg-[var(--color-primary)]/10"
              : "bg-[var(--color-surface-elevated)]"
          }`}>
            <Package className={`h-4 w-4 ${
              selected
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-muted-foreground)]"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {productName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--color-muted-foreground)]">
              <Hash className="h-3 w-3" />
              <span>Adet: {item.qty || 1}</span>
            </div>
          </div>
        </div>

        {/* Silme butonu */}
        {allowDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors shrink-0"
            aria-label="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
});
