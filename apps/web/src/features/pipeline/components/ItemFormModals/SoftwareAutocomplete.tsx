import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, Key, Cloud, ChevronDown, Check } from "lucide-react";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { useSoftwareProducts } from "../../../software-products";
import type { SoftwareProduct } from "../../../software-products";

export interface SoftwareOption {
  _id: string;
  id: string;
  name: string;
  friendlyName?: string;
  nameWithCode?: string;
  erpId?: string;
  salePrice: number;
  vatRate: number;
  currency: string;
  unit?: string;
  type?: string;
  isSaas?: boolean;
}

interface SoftwareAutocompleteProps {
  value?: string;
  displayName?: string;
  onChange: (product: SoftwareOption | null) => void;
  error?: string;
  placeholder?: string;
  /** "license" için sadece lisanslar, "rental" için sadece SaaS/kiralama */
  productType: "license" | "rental";
}

export function SoftwareAutocomplete({
  value,
  displayName,
  onChange,
  error,
  placeholder,
  productType,
}: SoftwareAutocompleteProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Lisans için isSaas: false, Kiralama için isSaas: true
  const { data: productsData } = useSoftwareProducts({
    saleActive: true,
    isSaas: productType === "rental",
    limit: 10000,
    sortField: "name",
    sortOrder: "asc",
  });

  const products = useMemo<SoftwareOption[]>(() => {
    return (productsData?.data ?? []).map((p: SoftwareProduct) => ({
      _id: p._id,
      id: p.id,
      name: p.name,
      friendlyName: p.friendlyName,
      nameWithCode: p.nameWithCode,
      erpId: p.erpId,
      salePrice: p.salePrice,
      vatRate: p.vatRate,
      currency: p.currency || "tl",
      unit: p.unit,
      type: p.type,
      isSaas: p.isSaas,
    }));
  }, [productsData?.data]);

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lowerSearch = searchText.toLocaleLowerCase("tr-TR");
    return products.filter(
      (p) =>
        p.name?.toLocaleLowerCase("tr-TR").includes(lowerSearch) ||
        p.friendlyName?.toLocaleLowerCase("tr-TR").includes(lowerSearch) ||
        p.nameWithCode?.toLocaleLowerCase("tr-TR").includes(lowerSearch) ||
        p.id?.toLocaleLowerCase("tr-TR").includes(lowerSearch)
    );
  }, [products, searchText]);

  // Click outside handler - sadece dropdown açıkken ve desktop'ta çalışsın
  useEffect(() => {
    if (!isOpen || isMobile) return;
    
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
  }, [isOpen, isMobile]);

  // Mobilde modal açıldığında input'a focus
  useEffect(() => {
    if (isOpen && isMobile && mobileInputRef.current) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMobile]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && filteredProducts.length > 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, filteredProducts.length]);

  const handleSelect = useCallback(
    (product: SoftwareOption) => {
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

  const displayValue =
    selectedProduct?.nameWithCode ||
    selectedProduct?.friendlyName ||
    selectedProduct?.name ||
    displayName ||
    "";

  const Icon = productType === "license" ? Key : Cloud;
  const label = productType === "license" ? "Lisans Seçimi" : "Kiralama Seçimi";
  const defaultPlaceholder =
    productType === "license" ? "Lisans ara veya seç..." : "Kiralama ara veya seç...";

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex items-center border rounded-lg bg-[var(--color-surface)] transition-shadow ${
          error
            ? "border-[var(--color-error)]"
            : isOpen && !isMobile
            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40"
            : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-center gap-2 pl-3">
          <Icon className={`h-4 w-4 ${
            productType === "license" 
              ? "text-[var(--color-info)]" 
              : "text-[var(--color-warning)]"
          }`} />
        </div>
        {isMobile ? (
          // Mobilde tıklanabilir alan
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 px-2 py-2.5 text-sm text-left bg-transparent text-[var(--color-foreground)] focus:outline-none"
          >
            {displayValue || (
              <span className="text-[var(--color-muted-foreground)]">
                {placeholder || defaultPlaceholder}
              </span>
            )}
          </button>
        ) : (
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
            placeholder={placeholder || defaultPlaceholder}
            className="flex-1 px-2 py-2.5 text-sm bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none"
          />
        )}
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

      {/* Desktop Dropdown */}
      {isOpen && !isMobile && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        >
          {filteredProducts.length === 0 ? (
            <div className="px-3 py-4 text-sm text-center text-[var(--color-muted-foreground)]">
              {searchText ? "Sonuç bulunamadı" : `${productType === "license" ? "Lisans" : "Kiralama"} bulunamadı`}
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
                      {product.nameWithCode || product.friendlyName || product.name}
                    </span>
                    {product.type && (
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {product.type}
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

      {/* Mobile Full Screen Modal */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--color-surface)]">
          {/* Mobile Modal Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchText("");
              }}
              className="p-1.5 -ml-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={`${productType === "license" ? "Lisans" : "Kiralama"} ara...`}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
          </div>

          {/* Mobile Modal List */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="px-4 py-8 text-sm text-center text-[var(--color-muted-foreground)]">
                {searchText ? "Sonuç bulunamadı" : `${productType === "license" ? "Lisans" : "Kiralama"} bulunamadı`}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`w-full px-4 py-3 text-left transition-colors active:bg-[var(--color-surface-elevated)] ${
                      product.id === value ? "bg-[var(--color-primary)]/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                          {product.nameWithCode || product.friendlyName || product.name}
                        </span>
                        {product.type && (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {product.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {formatCurrency(product.salePrice, product.currency)}
                        </span>
                        {product.id === value && (
                          <Check className="w-4 h-4 text-[var(--color-primary)]" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
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
