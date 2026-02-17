import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCustomerLookup } from "../../../lookup";
import type { CustomerLookupItem } from "../../../lookup";
import { Search, X, ChevronDown } from "lucide-react";

export interface CustomerSelection {
  customerId: string;
  customerName: string;
}

interface CustomerAutocompleteProps {
  value: string;
  displayName: string;
  onChange: (selection: CustomerSelection) => void;
  error?: string;
  disabled?: boolean;
}

export function CustomerAutocomplete({
  value,
  displayName,
  onChange,
  error,
  disabled = false,
}: CustomerAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchCustomers, isLoading } = useCustomerLookup();

  const customers = useMemo(
    () => searchCustomers(searchTerm, 20),
    [searchCustomers, searchTerm],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (customer: CustomerLookupItem) => {
      const name = customer.name || customer.companyName || "";
      onChange({ customerId: customer.id, customerName: name });
      setSearchTerm("");
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange({ customerId: "", customerName: "" });
    setSearchTerm("");
    setIsOpen(false);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const getDisplayName = (customer: CustomerLookupItem): string => {
    return customer.name || customer.companyName || "";
  };

  const inputClassName =
    "w-full pl-9 pr-8 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow disabled:opacity-50";

  if (value && displayName) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
          Müşteri *
        </label>
        <div className="flex items-center gap-2 w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--color-surface-elevated)]">
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm text-[var(--color-foreground)] truncate block">
              {displayName}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              ID: {value}
            </span>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-1 rounded hover:bg-[var(--color-border)] transition-colors"
              title="Müşteri seçimini kaldır"
            >
              <X className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
        Müşteri *
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          placeholder="Müşteri adı veya ERP kodu ile arayın..."
          disabled={disabled}
          className={inputClassName}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
      </div>

      {error && (
        <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-[var(--color-muted-foreground)] text-center">
              Yükleniyor...
            </div>
          )}

          {!isLoading && customers.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-muted-foreground)] text-center">
              {searchTerm
                ? "Müşteri bulunamadı"
                : "Aramak için yazmaya başlayın"}
            </div>
          )}

          {!isLoading &&
            customers.map((customer) => (
              <button
                key={customer._id}
                type="button"
                onClick={() => handleSelect(customer)}
                className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface-elevated)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
              >
                <div className="text-sm font-medium text-[var(--color-foreground)] truncate">
                  {getDisplayName(customer)}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    ERP: {customer.erpId || "-"}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    VKN: {customer.taxNo || "-"}
                  </span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
