import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, List, Receipt } from "lucide-react";
import {
  BankSummaryCards,
  BankTransactionFilters,
  BankTransactionsGrid,
  useBankTransactions,
  useBankSummary,
  useUpdateBankTransaction,
  useErpBankMaps,
  BANK_TRANSACTIONS_CONSTANTS,
} from "../features/bank-transactions";
import type {
  BankTransactionQueryParams,
  BankTransaction,
  DateRange,
  ErpStatus,
} from "../features/bank-transactions";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

const { EXCLUDED_BANK_ACC_IDS, QUERY_KEYS } = BANK_TRANSACTIONS_CONSTANTS;

type TabId = "dashboard" | "list";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "list", label: "Liste", icon: List },
];

function toISODateString(date: Date): string {
  return date.toISOString();
}

export function BankTransactionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Seçim state'i
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

  // Tarih araligi state'i (varsayilan: bugun)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  });

  const [selectedStatus, setSelectedStatus] = useState<string>("waiting");

  const queryClient = useQueryClient();

  // Query parametreleri
  const queryParams: BankTransactionQueryParams = useMemo(
    () => ({
      startDate: toISODateString(dateRange.startDate),
      endDate: toISODateString(dateRange.endDate),
      erpStatus: selectedStatus || undefined,
    }),
    [dateRange, selectedStatus],
  );

  // Veri hook'lari
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
  } = useBankTransactions(queryParams);

  const {
    data: summaryData,
    isLoading: summaryLoading,
  } = useBankSummary(
    toISODateString(dateRange.startDate),
    toISODateString(dateRange.endDate),
  );

  const { data: bankAccounts = [] } = useErpBankMaps();

  const updateMutation = useUpdateBankTransaction();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // Gizlenmesi gereken banka hesaplarini filtrele
  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.filter(
      (t) => !(EXCLUDED_BANK_ACC_IDS as readonly string[]).includes(t.bankAccId),
    );
  }, [transactionsData?.data]);

  // Yenile
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.BANK_TRANSACTIONS],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.BANK_SUMMARY],
    });
  }, [queryClient]);

  // Status degistir
  const handleStatusChange = useCallback(
    (id: string, status: ErpStatus) => {
      updateMutation.mutate({ id, data: { erpStatus: status } });
    },
    [updateMutation],
  );

  // Baglanti kal (unlink)
  const handleUnlink = useCallback(
    (id: string) => {
      updateMutation.mutate({
        id,
        data: { erpAccountCode: "", erpGlAccountCode: "" },
      });
    },
    [updateMutation],
  );

  // Seçim değişikliği
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      setSelectedCount(ids.length);
      if (ids.length === 1) {
        const transaction = filteredTransactions.find((t) => t.id === ids[0]);
        setSelectedTransaction(transaction ?? null);
      } else {
        setSelectedTransaction(null);
      }
    },
    [filteredTransactions],
  );

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedTransaction?.erpAccountCode) return;
    const bankAccount = bankAccounts.find(
      (b) => b.bankAccId === selectedTransaction.bankAccId,
    );
    const company = bankAccount?.erpCompanyId || "VERI";
    openAccountTransactionsModal(selectedTransaction.erpAccountCode, company);
  }, [selectedTransaction, bankAccounts, openAccountTransactionsModal]);

  // Grid toolbar custom buttons
  const toolbarCustomButtons = useMemo(
    () => [
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="w-4 h-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: !selectedTransaction?.erpAccountCode || selectedCount > 1,
      },
    ],
    [selectedTransaction, selectedCount, handleOpenAccountTransactions],
  );

  return (
    <div className="flex flex-col h-full p-4 gap-0">
      {/* Baslik + Tab'lar */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Banka İşlemleri
          </h1>
          <p className="text-sm text-muted mt-1">
            Banka hesap hareketleri ve ERP entegrasyonu
          </p>
        </div>

        {/* Tab Butonlari */}
        <div className="flex rounded-lg border border-border bg-surface-elevated p-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtreler - her iki tab'da da gorunur */}
      <BankTransactionFilters
        dateRange={dateRange}
        selectedStatus={selectedStatus}
        onDateRangeChange={setDateRange}
        onStatusChange={setSelectedStatus}
        onRefresh={handleRefresh}
        isLoading={transactionsLoading}
      />

      {/* Tab Icerikleri */}
      {activeTab === "dashboard" && (
        <BankSummaryCards data={summaryData} isLoading={summaryLoading} />
      )}

      {activeTab === "list" && (
        <BankTransactionsGrid
          data={filteredTransactions}
          loading={transactionsLoading}
          bankAccounts={bankAccounts}
          onStatusChange={handleStatusChange}
          onUnlink={handleUnlink}
          customButtons={toolbarCustomButtons}
          onSelectionChange={handleSelectionChange}
        />
      )}

      <AccountTransactionsModal />
    </div>
  );
}
