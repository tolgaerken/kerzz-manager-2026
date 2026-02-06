import { useState, useCallback, useMemo } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  AutoPaymentTokensGrid,
  PaymentPlanGrid,
  CollectionActionBar,
  AutoPaymentFilters,
  useAutoPaymentTokens,
  usePaymentPlans,
  useCollectPayment,
  useDeleteToken,
  AUTOMATED_PAYMENTS_CONSTANTS,
} from "../features/automated-payments";
import type {
  AutoPaymentTokenItem,
  AutoPaymentQueryParams,
  PaymentPlanItem,
} from "../features/automated-payments";

export function AutomatedPaymentsPage() {
  // ── Query State ──
  const [queryParams, setQueryParams] = useState<AutoPaymentQueryParams>({
    page: 1,
    limit: AUTOMATED_PAYMENTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    companyId: "",
    sortField: "createDate",
    sortOrder: "desc",
  });

  // ── Selection State ──
  const [selectedTokens, setSelectedTokens] = useState<
    AutoPaymentTokenItem[]
  >([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanItem | null>(
    null
  );

  // ── Derived Values ──
  const selectedCustomer = selectedTokens.length > 0 ? selectedTokens[0] : null;
  const selectedErpId = selectedCustomer?.erpId || null;

  // ── Queries ──
  const { data, isLoading, refetch } = useAutoPaymentTokens(queryParams);
  const { data: paymentPlans, isLoading: plansLoading } =
    usePaymentPlans(selectedErpId);

  // ── Mutations ──
  const collectMutation = useCollectPayment();
  const deleteMutation = useDeleteToken();

  // ── Loading states ──
  const [itemLoading, setItemLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  // ── Handlers ──
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleCompanyChange = useCallback((companyId: string) => {
    setQueryParams((prev) => ({ ...prev, companyId, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      companyId: "",
      page: 1,
    }));
  }, []);

  const handleTokenSelectionChanged = useCallback(
    (items: AutoPaymentTokenItem[]) => {
      setSelectedTokens(items);
      setSelectedPlan(null);
    },
    []
  );

  const handlePlanSelectionChanged = useCallback(
    (plan: PaymentPlanItem | null) => {
      setSelectedPlan(plan);
    },
    []
  );

  // Secili satiri tahsil et
  const handleCollectItem = useCallback(async () => {
    if (!selectedCustomer || !selectedPlan) return;
    setItemLoading(true);
    try {
      await collectMutation.mutateAsync({
        customerId: selectedCustomer.customerId,
        amount: selectedPlan.invoiceTotal,
        mode: "item",
        paymentPlanId: selectedPlan._id,
        description: `Fatura tahsilatı: ${selectedPlan.invoiceNo}`,
      });
    } finally {
      setItemLoading(false);
    }
  }, [selectedCustomer, selectedPlan, collectMutation]);

  // Cari bakiyeyi tahsil et
  const handleCollectBalance = useCallback(async () => {
    if (!selectedCustomer) return;

    // Odenmemis planlarin toplam tutarini hesapla
    const unpaidTotal = (paymentPlans || [])
      .filter((p) => !p.paid)
      .reduce((sum, p) => sum + (p.invoiceTotal || 0), 0);

    if (unpaidTotal <= 0) return;

    setBalanceLoading(true);
    try {
      await collectMutation.mutateAsync({
        customerId: selectedCustomer.customerId,
        amount: unpaidTotal,
        mode: "balance",
        description: "Cari bakiye tahsilatı",
      });
    } finally {
      setBalanceLoading(false);
    }
  }, [selectedCustomer, paymentPlans, collectMutation]);

  // Ozel tahsilat
  const handleCollectCustomAmount = useCallback(
    async (amount: number) => {
      if (!selectedCustomer || amount <= 0) return;
      setCustomLoading(true);
      try {
        await collectMutation.mutateAsync({
          customerId: selectedCustomer.customerId,
          amount,
          mode: "custom",
          description: `Özel tahsilat: ${amount} TL`,
        });
      } finally {
        setCustomLoading(false);
      }
    },
    [selectedCustomer, collectMutation]
  );

  // Token sil
  const handleDeleteSelected = useCallback(() => {
    if (selectedTokens.length === 0) return;
    if (!confirm("Seçili token(lar) silinecek. Emin misiniz?")) return;

    selectedTokens.forEach((token) => {
      deleteMutation.mutate(token.id || token._id);
    });
    setSelectedTokens([]);
  }, [selectedTokens, deleteMutation]);

  // Balance hesaplama
  const unpaidBalance = useMemo(() => {
    if (!paymentPlans) return 0;
    return paymentPlans
      .filter((p) => !p.paid)
      .reduce((sum, p) => sum + (p.invoiceTotal || 0), 0);
  }, [paymentPlans]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Otomatik Ödemeler
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          {selectedTokens.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Seçilenleri Sil"
            >
              <Trash2 className="w-4 h-4" />
              <span>{selectedTokens.length} Sil</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[var(--color-border)]">
        <AutoPaymentFilters
          search={queryParams.search || ""}
          companyId={queryParams.companyId || ""}
          onSearchChange={handleSearchChange}
          onCompanyChange={handleCompanyChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Action Bar */}
      <div className="px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <CollectionActionBar
          selectedCustomerId={selectedCustomer?.customerId || null}
          balance={unpaidBalance}
          selectedPlanAmount={
            selectedPlan ? selectedPlan.invoiceTotal : null
          }
          onCollectItem={handleCollectItem}
          onCollectBalance={handleCollectBalance}
          onCollectCustomAmount={handleCollectCustomAmount}
          itemLoading={itemLoading}
          balanceLoading={balanceLoading}
          customLoading={customLoading}
        />
      </div>

      {/* Split Panel */}
      <div className="flex-1 flex min-h-0">
        {/* Sol Panel: Token Listesi */}
        <div className="flex-[3] min-w-0 border-r border-[var(--color-border)]">
          <div className="px-4 py-2 text-xs font-medium uppercase text-[var(--color-muted-foreground)] border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            Kayıtlı Kart Tokenleri
            {data?.pagination && (
              <span className="ml-2 text-[var(--color-foreground)]">
                ({data.pagination.total})
              </span>
            )}
          </div>
          <div className="h-[calc(100%-33px)]">
            <AutoPaymentTokensGrid
              data={data?.data ?? []}
              loading={isLoading}
              onSelectionChanged={handleTokenSelectionChanged}
            />
          </div>
        </div>

        {/* Sag Panel: Odeme Planlari */}
        <div className="flex-[2] min-w-0">
          <div className="px-4 py-2 text-xs font-medium uppercase text-[var(--color-muted-foreground)] border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            Ödeme Planları
            {selectedCustomer && (
              <span className="ml-2 text-[var(--color-foreground)]">
                - {selectedCustomer.erpId || selectedCustomer.customerId}
              </span>
            )}
          </div>
          <div className="h-[calc(100%-33px)]">
            {selectedErpId ? (
              <PaymentPlanGrid
                data={paymentPlans ?? []}
                loading={plansLoading}
                onSelectionChanged={handlePlanSelectionChanged}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--color-muted-foreground)]">
                Ödeme planlarını görmek için sol taraftan bir token seçin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
