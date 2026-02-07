import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, List } from "lucide-react";
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
  DateRange,
  ErpStatus,
} from "../features/bank-transactions";

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

  // Gizlenmesi gereken banka hesaplarini filtrele
  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.filter(
      (t) => !EXCLUDED_BANK_ACC_IDS.includes(t.bankAccId),
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
        />
      )}
    </div>
  );
}
