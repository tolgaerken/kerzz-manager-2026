import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, Package, ChevronDown } from "lucide-react";
import { useHardwareProducts } from "../../../hardware-products";
import type { HardwareProduct } from "../../../hardware-products";

export interface ProductOption {
  _id: string;
  id: string;
  name: string;
  friendlyName?: string;
  erpId?: string;
  salePrice: number;
  vatRate: number;
  currency: string;
  unit?: string;
}

interface ProductAutocompleteProps {
  value?: string;
  displayName?: string;
  onChange: (product: ProductOption | null) => void;
  error?: string;
  placeholder?: string;
}

export function ProductAutocomplete({
  value,
  displayName,
  onChange,
  error,
  placeholder = "Ürün ara veya seç...",
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: productsData } = useHardwareProducts({
    saleActive: true,
    limit: 10000,
    sortField: "name",
    sortOrder: "asc",
  });

  const products = useMemo<ProductOption[]>(() => {
    return (productsData?.data ?? []).map((p: HardwareProduct) => ({
      _id: p._id,
      id: p.id,
      name: p.name,
      friendlyName: p.friendlyName,
      erpId: p.erpId,
      salePrice: p.salePrice,
      vatRate: p.vatRate,
      currency: p.currency || "tl",
      unit: p.unit,
    }));
  }, [productsData?.data]);

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lowerSearch = searchText.toLocaleLowerCase("tr-TR");
    return products.filter(
      (p) =>
        p.name?.toLocaleLowerCase("tr-TR").includes(lowerSearch) ||
        p.friendlyName?.toLocaleLowerCase("tr-TR").includes(lowerSearch) ||
        p.id?.toLocaleLowerCase("tr-TR").includes(lowerSearch)
    );
  }, [products, searchText]);

  // Click outside handler - sadece dropdown açıkken çalışsın
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    // Küçük bir gecikme ile ekle, böylece açılış tıklaması yakalanmaz
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && filteredProducts.length > 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, filteredProducts.length]);

  const handleSelect = useCallback(
    (product: ProductOption) => {
      onChange(product);
      setSearchText("");
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setSearchText("");
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredProducts.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredProducts[highlightedIndex]) {
            handleSelect(filteredProducts[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filteredProducts, highlightedIndex, handleSelect]
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === value || p._id === value),
    [products, value]
  );

  const displayValue = selectedProduct?.friendlyName || selectedProduct?.name || displayName || "";

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
        Ürün Seçimi
      </label>
      <div
        className={`relative flex items-center border rounded-lg bg-[var(--color-surface)] transition-shadow ${
          error
            ? "border-[var(--color-error)]"
            : isOpen
            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40"
            : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-center gap-2 pl-3">
          <Package className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchText : displayValue}
          onChange={(e) => {
            setSearchText(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-2 py-2.5 text-sm bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border-l border-[var(--color-border)]"
        >
          <ChevronDown
            className={`h-4 w-4 text-[var(--color-muted-foreground)] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>
      )}

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        >
          {filteredProducts.length === 0 ? (
            <div className="px-3 py-4 text-sm text-center text-[var(--color-muted-foreground)]">
              {searchText ? "Sonuç bulunamadı" : "Ürün bulunamadı"}
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(product);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2.5 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-[var(--color-primary)]/10"
                    : "hover:bg-[var(--color-surface-elevated)]"
                } ${product.id === value ? "bg-[var(--color-primary)]/5" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                      {product.friendlyName || product.name}
                    </span>
                    {product.friendlyName && product.name !== product.friendlyName && (
                      <span className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {product.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-muted-foreground)] shrink-0 ml-2">
                    {formatCurrency(product.salePrice, product.currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number | undefined, currency?: string) {
  if (value === undefined || value === null) return "-";
  const curr = currency?.toUpperCase() || "TRY";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: curr === "TL" ? "TRY" : curr,
    minimumFractionDigits: 2,
  }).format(value);
}
