import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, ChevronDown, Check, AlertCircle } from "lucide-react";
import { useCustomers } from "../../../customers";
import type { Customer } from "../../../customers";

interface EInvoicePriceFiltersProps {
  search: string;
  selectedCustomerErpId: string;
  isDirty: boolean;
  onSearchChange: (value: string) => void;
  onCustomerChange: (customerErpId: string, customerName: string) => void;
  onClearFilters: () => void;
}

export function EInvoicePriceFilters({
  search,
  selectedCustomerErpId,
  isDirty,
  onSearchChange,
  onCustomerChange,
  onClearFilters,
}: EInvoicePriceFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Musteri verilerini cek
  const { data: customersData } = useCustomers({ limit: 1000 });

  // erpId'si olan musterileri filtrele
  const filteredCustomers = useMemo(() => {
    const customers = customersData?.data ?? [];
    const withErpId = customers.filter(
      (c) => c.erpId && c.erpId.trim() !== "",
    );

    if (!customerSearch) return withErpId;

    const lower = customerSearch.toLowerCase();
    return withErpId.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.brand?.toLowerCase().includes(lower) ||
        c.erpId?.toLowerCase().includes(lower),
    );
  }, [customersData, customerSearch]);

  // Secili musteri ismini bul
  const selectedCustomerName = useMemo(() => {
    if (!selectedCustomerErpId) return "";
    const found = (customersData?.data ?? []).find(
      (c) => c.erpId === selectedCustomerErpId,
    );
    return found?.brand || found?.name || selectedCustomerErpId;
  }, [selectedCustomerErpId, customersData]);

  // Dropdown disina tiklanirsa kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setCustomerSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      onCustomerChange(customer.erpId, customer.brand || customer.name);
      setIsDropdownOpen(false);
      setCustomerSearch("");
    },
    [onCustomerChange],
  );

  const handleClearCustomer = useCallback(() => {
    onCustomerChange("", "");
    setCustomerSearch("");
  }, [onCustomerChange]);

  const hasFilters = !!search || !!selectedCustomerErpId;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Arama */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ürün adı veya ERP ID ile ara..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Musteri Secici */}
      <div className="relative min-w-[280px]" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        >
          <span className={selectedCustomerErpId ? "" : "text-[var(--color-muted-foreground)]"}>
            {selectedCustomerErpId
              ? selectedCustomerName
              : "Müşteri seçin (Master Liste)"}
          </span>
          <div className="flex items-center gap-1">
            {selectedCustomerErpId && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearCustomer();
                }}
                className="p-0.5 rounded hover:bg-[var(--color-border)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          </div>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl max-h-80 flex flex-col overflow-hidden">
            {/* Arama */}
            <div className="p-2 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Müşteri ara..."
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
                />
              </div>
            </div>

            {/* Liste */}
            <div className="overflow-y-auto flex-1">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--color-muted-foreground)]">
                  Müşteri bulunamadı
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--color-foreground)] truncate">
                        {customer.brand || customer.name}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] font-mono">
                        ERP: {customer.erpId}
                      </div>
                    </div>
                    {selectedCustomerErpId === customer.erpId && (
                      <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Secili musteri bilgisi */}
      {selectedCustomerErpId && (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-success)] font-medium">
          <Check className="w-3.5 h-3.5" />
          ERP: {selectedCustomerErpId}
        </span>
      )}

      {/* Kaydedilmemis degisiklikler uyarisi */}
      {isDirty && (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-warning)] font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          Kaydedilmemiş değişiklikler
        </span>
      )}

      {/* Temizle */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="w-4 h-4" />
          Temizle
        </button>
      )}
    </div>
  );
}
