import { useState, useCallback, useEffect } from "react";
import { X, FileSpreadsheet, Loader2 } from "lucide-react";
import { useAccountTransactionsStore } from "../../store/accountTransactionsStore";
import { useAccounts, useAccountTransactions, useDocumentDetail } from "../../hooks";
import { YearSelector } from "./YearSelector";
import { AccountSelector } from "./AccountSelector";
import { BalanceSummary } from "./BalanceSummary";
import { TransactionsTable } from "./TransactionsTable";
import { DocumentDetailModal } from "./DocumentDetailModal";
import type { AccountTransaction } from "../../types";

export function AccountTransactionsModal() {
  const { isOpen, erpId, erpCompany, year, closeModal, setYear, setErpId } =
    useAccountTransactionsStore();

  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const queryParams = { year, company: erpCompany };

  const { data: accounts = [], isLoading: accountsLoading } = useAccounts(
    queryParams,
    isOpen
  );

  const { data: transactions = [], isLoading: transactionsLoading } = useAccountTransactions(
    erpId,
    queryParams,
    isOpen && !!erpId
  );

  const { data: documentDetails = [], isLoading: detailsLoading } = useDocumentDetail(
    selectedTransaction?.BELGE_NO || "",
    queryParams,
    isOpen && !!selectedTransaction?.BELGE_NO && isDetailOpen
  );

  // ESC tuşu ile kapatma (detay modalı açık değilse)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isDetailOpen) {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDetailOpen, closeModal]);

  // Modal açıldığında body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleRowClick = useCallback((transaction: AccountTransaction) => {
    setSelectedTransaction(transaction);
    // Fatura veya irsaliye ise detay panelini aç
    if (["B", "C"].includes(transaction.HAREKET_TURU)) {
      setIsDetailOpen(true);
    } else {
      setIsDetailOpen(false);
    }
  }, []);

  const handleYearChange = useCallback(
    (newYear: number) => {
      setYear(newYear);
      setSelectedTransaction(null);
      setIsDetailOpen(false);
    },
    [setYear]
  );

  const handleAccountChange = useCallback(
    (accountId: string) => {
      setErpId(accountId);
      setSelectedTransaction(null);
      setIsDetailOpen(false);
    },
    [setErpId]
  );

  const handleClose = useCallback(() => {
    setSelectedTransaction(null);
    setIsDetailOpen(false);
    closeModal();
  }, [closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl md:mx-4 bg-[var(--color-surface)] md:rounded-lg shadow-xl flex flex-col h-full md:h-auto md:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 md:gap-3">
            <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-primary)]" />
            <h2 className="text-base md:text-lg font-semibold text-[var(--color-foreground)]">
              Cari Hesap Hareketleri
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 md:p-6">
          {/* Filters - Mobilde dikey, masaüstünde yatay */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-3 md:mb-4 flex-shrink-0">
            <YearSelector year={year} onYearChange={handleYearChange} />
            <AccountSelector
              accounts={accounts}
              selectedAccountId={erpId}
              onSelect={handleAccountChange}
              loading={accountsLoading}
            />
          </div>

          {/* Balance Summary */}
          <div className="flex-shrink-0">
            <BalanceSummary
              transactions={transactions}
              loading={transactionsLoading && !!erpId}
            />
          </div>

          {/* Transactions Table */}
          {erpId ? (
            <div className="mt-3 md:mt-4">
              <TransactionsTable
                transactions={transactions}
                loading={transactionsLoading}
                selectedBelgeNo={
                  selectedTransaction
                    ? `${selectedTransaction.BELGE_NO}-${selectedTransaction.TARIH}-${selectedTransaction.BORC}-${selectedTransaction.ALACAK}`
                    : null
                }
                onRowClick={handleRowClick}
                height="calc(100vh - 280px) md:calc(90vh - 320px)"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--color-foreground-muted)] px-4">
              {accountsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span className="text-sm md:text-base">Cari hesaplar yükleniyor...</span>
                </div>
              ) : (
                <span className="text-sm md:text-base text-center">
                  Hareketleri görüntülemek için bir cari hesap seçin
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleClose}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-elevated)]/80 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        documentId={selectedTransaction?.BELGE_NO || ""}
        details={documentDetails}
        loading={detailsLoading}
      />
    </div>
  );
}
