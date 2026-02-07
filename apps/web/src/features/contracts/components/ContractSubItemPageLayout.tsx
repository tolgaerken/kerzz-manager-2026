import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, X, RefreshCw } from "lucide-react";
import { useContracts } from "../hooks/useContracts";
import type { Contract } from "../types";

const ALL_CONTRACTS_VALUE = "__all__";

interface ContractSubItemPageLayoutProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: (contractId: string | undefined, shouldFetch: boolean) => React.ReactNode;
}

export function ContractSubItemPageLayout({
  title,
  icon: Icon,
  children,
}: ContractSubItemPageLayoutProps) {
  const [selectedContractId, setSelectedContractId] = useState<string>(ALL_CONTRACTS_VALUE);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tüm aktif kontratları çek
  const { data: contractsData, isLoading: contractsLoading } = useContracts({
    flow: "active",
    sortField: "brand",
    sortOrder: "asc",
  });

  const contracts = contractsData?.data ?? [];

  // Seçili kontratı bul
  const selectedContract = useMemo(() => {
    if (selectedContractId === ALL_CONTRACTS_VALUE) return null;
    return contracts.find((c) => c.id === selectedContractId) ?? null;
  }, [contracts, selectedContractId]);

  // Arama sonuçlarını filtrele
  const filteredContracts = useMemo(() => {
    if (!searchTerm.trim()) return contracts;
    const term = searchTerm.toLowerCase();
    return contracts.filter(
      (c) =>
        c.brand.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        String(c.no).includes(term)
    );
  }, [contracts, searchTerm]);

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((contractId: string) => {
    setSelectedContractId(contractId);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setShouldFetch(false);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedContractId(ALL_CONTRACTS_VALUE);
    setSearchTerm("");
    setShouldFetch(false);
  }, []);

  const handleLoad = useCallback(() => {
    setShouldFetch(true);
  }, []);

  const isAllSelected = selectedContractId === ALL_CONTRACTS_VALUE;
  const contractIdForQuery = isAllSelected ? undefined : selectedContractId;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex-shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-col gap-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[var(--color-primary)]" />
              <h1 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h1>
            </div>
          </div>

          {/* Contract Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Kontrat:</span>
            <div className="relative flex-1 max-w-lg" ref={dropdownRef}>
              {/* Selected Value Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)]/50"
              >
                <span className="truncate">
                  {isAllSelected
                    ? "Tüm Kontratlar"
                    : selectedContract
                      ? `${selectedContract.brand} - ${selectedContract.company} (No: ${selectedContract.no})`
                      : "Kontrat seçin..."}
                </span>
                <div className="flex items-center gap-1">
                  {!isAllSelected && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          handleClear();
                        }
                      }}
                      className="rounded p-0.5 hover:bg-[var(--color-surface-hover)]"
                    >
                      <X className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-[var(--color-muted-foreground)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {/* Search Input */}
                  <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
                    <Search className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                    <input
                      type="text"
                      placeholder="Kontrat ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Options */}
                  <div className="max-h-60 overflow-y-auto py-1">
                    {/* Tüm Kontratlar option */}
                    <button
                      type="button"
                      onClick={() => handleSelect(ALL_CONTRACTS_VALUE)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-hover)] ${
                        isAllSelected
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                          : "text-[var(--color-foreground)]"
                      }`}
                    >
                      Tüm Kontratlar
                    </button>

                    {/* Separator */}
                    <div className="mx-3 my-1 border-t border-[var(--color-border)]" />

                    {/* Contract list */}
                    {contractsLoading ? (
                      <div className="px-3 py-4 text-center text-sm text-[var(--color-muted-foreground)]">
                        Yükleniyor...
                      </div>
                    ) : filteredContracts.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-[var(--color-muted-foreground)]">
                        Kontrat bulunamadı
                      </div>
                    ) : (
                      filteredContracts.map((contract) => (
                        <ContractOption
                          key={contract.id}
                          contract={contract}
                          isSelected={selectedContractId === contract.id}
                          onSelect={handleSelect}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Yükle butonu */}
            <button
              type="button"
              onClick={handleLoad}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Yükle
            </button>

            {/* Seçili kontrat bilgi özeti */}
            {selectedContract && (
              <div className="hidden items-center gap-2 text-xs text-[var(--color-muted-foreground)] sm:flex">
                <span className="rounded bg-[var(--color-primary)]/10 px-2 py-0.5 font-medium text-[var(--color-primary)]">
                  No: {selectedContract.no}
                </span>
                <span>{selectedContract.contractFlow === "active" ? "Aktif" : selectedContract.contractFlow}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {shouldFetch ? (
          children(contractIdForQuery, shouldFetch)
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[var(--color-muted-foreground)]">
              <Icon className="h-12 w-12 opacity-30" />
              <p className="text-sm">
                {isAllSelected
                  ? "Tüm kayıtları görüntülemek için \"Yükle\" butonuna tıklayın."
                  : "Seçili kontratın kayıtlarını görüntülemek için \"Yükle\" butonuna tıklayın."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Kontrat seçenek bileşeni
interface ContractOptionProps {
  contract: Contract;
  isSelected: boolean;
  onSelect: (contractId: string) => void;
}

function ContractOption({ contract, isSelected, onSelect }: ContractOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(contract.id)}
      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-hover)] ${
        isSelected
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
          : "text-[var(--color-foreground)]"
      }`}
    >
      <div className="flex flex-col min-w-0">
        <span className="truncate font-medium">{contract.brand}</span>
        <span className="truncate text-xs text-[var(--color-muted-foreground)]">{contract.company}</span>
      </div>
      <span className="ml-2 flex-shrink-0 text-xs text-[var(--color-muted-foreground)]">
        No: {contract.no}
      </span>
    </button>
  );
}
