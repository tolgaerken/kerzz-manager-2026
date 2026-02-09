import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, User } from "lucide-react";
import type { Account } from "../../types";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  loading?: boolean;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onSelect,
  loading,
}: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredAccounts = useMemo(() => {
    if (!search) return accounts;
    const searchLower = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.ID.toLowerCase().includes(searchLower) ||
        a.name.toLowerCase().includes(searchLower)
    );
  }, [accounts, search]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.ID === selectedAccountId),
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (loading) {
    return (
      <div className="flex-1">
        <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)] mb-1">
          <User className="w-4 h-4" />
          Cari Hesap
        </label>
        <div className="w-full h-10 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)] mb-1">
        <User className="w-4 h-4" />
        Cari Hesap
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-left text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent flex items-center justify-between"
        >
          <span className={selectedAccount ? "" : "text-[var(--color-foreground-muted)]"}>
            {selectedAccount
              ? `${selectedAccount.ID} - ${selectedAccount.name}`
              : "Cari hesap seçin..."}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ara..."
                  className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredAccounts.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-[var(--color-foreground-muted)]">
                  Sonuç bulunamadı
                </div>
              ) : (
                filteredAccounts.map((account) => (
                  <button
                    key={account.ID}
                    type="button"
                    onClick={() => {
                      onSelect(account.ID);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-elevated)] transition-colors ${
                      account.ID === selectedAccountId
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-foreground)]"
                    }`}
                  >
                    <span className="font-medium">{account.ID}</span>
                    <span className="text-[var(--color-foreground-muted)]"> - </span>
                    <span>{account.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
