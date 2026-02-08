import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, Package, Monitor } from "lucide-react";
import { useHardwareProducts } from "../../../hardware-products";
import { useSoftwareProducts } from "../../../software-products";
import type { HardwareProduct } from "../../../hardware-products";
import type { SoftwareProduct } from "../../../software-products";

export type CatalogType = "hardware" | "software-license" | "software-rental";

interface CatalogSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogType: CatalogType;
  onSelect: (items: CatalogItem[]) => void;
}

/** Katalogdan seçilen ürünün normalize edilmiş hali */
export interface CatalogItem {
  catalogId: string;
  erpId: string;
  pid?: string;
  name: string;
  description: string;
  type?: string;
  purchasePrice: number;
  salePrice: number;
  price: number;
  currency: string;
  saleCurrency?: string;
  vatRate: number;
  unit: string;
  isSaas?: boolean;
}

const CATALOG_TITLES: Record<CatalogType, string> = {
  hardware: "Donanım Ürünü Seç",
  "software-license": "Lisans Ürünü Seç",
  "software-rental": "Kiralama (SaaS) Ürünü Seç",
};

const CATALOG_ICONS: Record<CatalogType, typeof Package> = {
  hardware: Package,
  "software-license": Monitor,
  "software-rental": Monitor,
};

export function CatalogSelectModal({
  isOpen,
  onClose,
  catalogType,
  onSelect,
}: CatalogSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setDebouncedSearch("");
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  // Hardware products query
  const hardwareQuery = useHardwareProducts(
    catalogType === "hardware"
      ? { search: debouncedSearch || undefined, saleActive: true, limit: 100, sortField: "name", sortOrder: "asc" as const }
      : { limit: 0 },
  );

  // Software products query
  const softwareQuery = useSoftwareProducts(
    catalogType !== "hardware"
      ? {
          search: debouncedSearch || undefined,
          saleActive: true,
          isSaas: catalogType === "software-rental",
          limit: 100,
          sortField: "name",
          sortOrder: "asc" as const,
        }
      : { limit: 0 },
  );

  const isLoading = catalogType === "hardware" ? hardwareQuery.isLoading : softwareQuery.isLoading;

  // Normalize items
  const items = useMemo(() => {
    if (catalogType === "hardware") {
      return (hardwareQuery.data?.data ?? []).map(mapHardwareProduct);
    }
    return (softwareQuery.data?.data ?? []).map(mapSoftwareProduct);
  }, [catalogType, hardwareQuery.data, softwareQuery.data]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selected = items.filter((item) => selectedIds.has(item.catalogId));
    onSelect(selected);
    onClose();
  }, [items, selectedIds, onSelect, onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const Icon = CATALOG_ICONS[catalogType];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4 bg-[var(--color-surface)] rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">
              {CATALOG_TITLES[catalogType]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[var(--color-border)] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün adı veya kodu ile arayın..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-[var(--color-muted-foreground)]">
              Yükleniyor...
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-[var(--color-muted-foreground)]">
              {debouncedSearch ? "Ürün bulunamadı" : "Ürün yok"}
            </div>
          )}

          {!isLoading &&
            items.map((item) => {
              const isSelected = selectedIds.has(item.catalogId);
              return (
                <button
                  key={item.catalogId}
                  type="button"
                  onClick={() => toggleSelect(item.catalogId)}
                  className={`w-full px-5 py-3 text-left border-b border-[var(--color-border)] last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-[var(--color-primary)]/10"
                      : "hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-foreground)] truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.erpId && (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            ERP: {item.erpId}
                          </span>
                        )}
                        {item.pid && (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            PID: {item.pid}
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          KDV: %{item.vatRate}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[var(--color-foreground)]">
                        {item.salePrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}
                        {item.currency?.toUpperCase()}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        Birim: {item.unit}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] shrink-0">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {selectedIds.size > 0
              ? `${selectedIds.size} ürün seçildi`
              : "Ürün seçin"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Ekle ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Mapping helpers ---

function mapHardwareProduct(p: HardwareProduct): CatalogItem {
  return {
    catalogId: p._id,
    erpId: p.erpId || "",
    name: p.name || p.friendlyName || "",
    description: p.description || "",
    purchasePrice: p.purchasePrice || 0,
    salePrice: p.salePrice || 0,
    price: p.salePrice || 0,
    currency: p.currency || p.saleCurrency || "tl",
    saleCurrency: p.saleCurrency || p.currency || "tl",
    vatRate: p.vatRate || 0,
    unit: p.unit || "AD",
  };
}

function mapSoftwareProduct(p: SoftwareProduct): CatalogItem {
  return {
    catalogId: p._id,
    erpId: p.erpId || "",
    pid: p.pid || "",
    name: p.name || p.friendlyName || "",
    description: p.description || "",
    type: p.type || "",
    purchasePrice: p.purchasePrice || 0,
    salePrice: p.salePrice || 0,
    price: p.salePrice || 0,
    currency: p.currency || "tl",
    vatRate: p.vatRate || 0,
    unit: p.unit || "AD",
    isSaas: p.isSaas,
  };
}
