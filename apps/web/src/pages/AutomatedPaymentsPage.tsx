import { useState, useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash2, X, AlertTriangle, CheckCircle, Repeat, Receipt } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  AutoPaymentTokensGrid,
  PaymentPlanGrid,
  CollectionActionBar,
  AutoPaymentFilters,
  useAutoPaymentTokens,
  usePaymentPlans,
  useCollectPayment,
  useDeleteToken,
  autoPaymentKeys,
} from "../features/automated-payments";
import { useMongoChangeStream } from "../hooks/useMongoChangeStream";
import type {
  AutoPaymentTokenItem,
  AutoPaymentQueryParams,
  PaymentPlanItem,
} from "../features/automated-payments";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

export function AutomatedPaymentsPage() {
  // ── Query State ──
  const [queryParams, setQueryParams] = useState<AutoPaymentQueryParams>({
    search: "",
    companyId: "",
    sortField: "createDate",
    sortOrder: "desc",
  });

  // ── Collapsible Section State ──
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

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
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useAutoPaymentTokens(queryParams);
  const { data: paymentPlans, isLoading: plansLoading } =
    usePaymentPlans(selectedErpId);

  // ── MongoDB Change Stream ──
  useMongoChangeStream("contract-payments", (event) => {
    const doc = event.fullDocument;
    const fields = event.updatedFields;

    console.log(
      `[AutomatedPayments] Change event: op=${event.operationType}, docId=${event.documentId}, docCompanyId=${doc?.companyId ?? "?"}, selectedErpId=${selectedErpId ?? "yok"}`
    );

    // Secili musteri ile ilgili bir degisiklik varsa planları yenile
    if (
      selectedErpId &&
      (doc?.companyId === selectedErpId ||
        fields?.onlinePaymentId !== undefined ||
        fields?.paid !== undefined)
    ) {
      console.log(
        `[AutomatedPayments] Odeme planlari yenileniyor (erpId=${selectedErpId})`
      );
      queryClient.invalidateQueries({
        queryKey: autoPaymentKeys.plan(selectedErpId),
      });
    }
  });

  // ── Account transactions store ──
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // ── Mutations ──
  const collectMutation = useCollectPayment();
  const deleteMutation = useDeleteToken();

  // ── Loading states ──
  const [itemLoading, setItemLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  // ── Payment result notification ──
  const [paymentNotification, setPaymentNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Bildirimi 8 saniye sonra otomatik kapat
  useEffect(() => {
    if (!paymentNotification) return;
    const timer = setTimeout(() => setPaymentNotification(null), 8000);
    return () => clearTimeout(timer);
  }, [paymentNotification]);

  // ── Handlers ──
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, []);

  const handleCompanyChange = useCallback((companyId: string) => {
    setQueryParams((prev) => ({ ...prev, companyId }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      companyId: "",
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
    if (selectedPlan.invoiceTotal <= 0) {
      setPaymentNotification({
        type: "error",
        message: "Tahsilat tutarı 0 TL veya negatif olamaz",
      });
      return;
    }
    setItemLoading(true);
    try {
      const result = await collectMutation.mutateAsync({
        customerId: selectedCustomer.customerId,
        amount: selectedPlan.invoiceTotal,
        mode: "item",
        paymentPlanId: selectedPlan._id,
      });
      if (!result.success) {
        setPaymentNotification({
          type: "error",
          message: result.paymentError || result.message,
        });
      } else {
        setPaymentNotification({
          type: "success",
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Tahsilat sırasında hata oluştu";
      setPaymentNotification({ type: "error", message: errorMessage });
    } finally {
      setItemLoading(false);
    }
  }, [selectedCustomer, selectedPlan, collectMutation]);

  // Cari bakiyeyi tahsil et
  const handleCollectBalance = useCallback(async () => {
    if (!selectedCustomer) return;

    // Gercek ERP cari bakiyesini kullan
    const erpBalance = selectedCustomer.balance ?? 0;

    if (erpBalance <= 0) return;

    setBalanceLoading(true);
    try {
      const result = await collectMutation.mutateAsync({
        customerId: selectedCustomer.customerId,
        amount: erpBalance,
        mode: "balance",
      });
      if (!result.success) {
        setPaymentNotification({
          type: "error",
          message: result.paymentError || result.message,
        });
      } else {
        setPaymentNotification({
          type: "success",
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Tahsilat sırasında hata oluştu";
      setPaymentNotification({ type: "error", message: errorMessage });
    } finally {
      setBalanceLoading(false);
    }
  }, [selectedCustomer, collectMutation]);

  // Ozel tahsilat
  const handleCollectCustomAmount = useCallback(
    async (amount: number) => {
      if (!selectedCustomer || amount <= 0) return;
      setCustomLoading(true);
      try {
        const result = await collectMutation.mutateAsync({
          customerId: selectedCustomer.customerId,
          amount,
          mode: "custom",
        });
        if (!result.success) {
          setPaymentNotification({
            type: "error",
            message: result.paymentError || result.message,
          });
        } else {
          setPaymentNotification({
            type: "success",
            message: result.message,
          });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Tahsilat sırasında hata oluştu";
        setPaymentNotification({ type: "error", message: errorMessage });
      } finally {
        setCustomLoading(false);
      }
    },
    [selectedCustomer, collectMutation]
  );

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedCustomer?.erpId) return;
    openAccountTransactionsModal(selectedCustomer.erpId, selectedCustomer.companyId || "VERI");
  }, [selectedCustomer, openAccountTransactionsModal]);

  // Token sil
  const handleDeleteSelected = useCallback(() => {
    if (selectedTokens.length === 0) return;
    if (!confirm("Seçili token(lar) silinecek. Emin misiniz?")) return;

    selectedTokens.forEach((token) => {
      deleteMutation.mutate(token.id || token._id);
    });
    setSelectedTokens([]);
  }, [selectedTokens, deleteMutation]);

  // ERP cari bakiyesi (gercek bakiye)
  const customerBalance = selectedCustomer?.balance ?? 0;

  // Grid toolbar custom buttons
  const toolbarCustomButtons = useMemo(
    () => [
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="w-4 h-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: !selectedCustomer?.erpId || selectedTokens.length > 1,
      },
    ],
    [selectedCustomer, selectedTokens.length, handleOpenAccountTransactions],
  );

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Repeat className="h-5 w-5" />,
    title: "Otomatik Ödemeler",
    count: data?.pagination?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        {selectedTokens.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-error)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {selectedTokens.length} Sil
          </button>
        )}
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
        </button>
        {selectedTokens.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--color-error)]/10 px-3 py-2 text-xs font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {selectedTokens.length}
          </button>
        )}
      </div>
    ),
    children: (
      <AutoPaymentFilters
        search={queryParams.search || ""}
        companyId={queryParams.companyId || ""}
        onSearchChange={handleSearchChange}
        onCompanyChange={handleCompanyChange}
        onClearFilters={handleClearFilters}
      />
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Payment Notification */}
      {paymentNotification && (
        <div
          className="flex items-center gap-3 mx-0 mb-3 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 12%, var(--color-surface))"
                : "color-mix(in oklch, var(--color-success) 12%, var(--color-surface))",
            color:
              paymentNotification.type === "error"
                ? "var(--color-error-foreground)"
                : "var(--color-success-foreground)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 30%, var(--color-border))"
                : "color-mix(in oklch, var(--color-success) 30%, var(--color-border))",
          }}
        >
          {paymentNotification.type === "error" ? (
            <AlertTriangle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--color-error)" }}
            />
          ) : (
            <CheckCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--color-success)" }}
            />
          )}
          <span className="flex-1 font-medium">{paymentNotification.message}</span>
          <button
            type="button"
            onClick={() => setPaymentNotification(null)}
            className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-3 px-4 py-3 rounded-lg border border-border bg-surface-elevated">
        <CollectionActionBar
          selectedCustomerId={selectedCustomer?.customerId || null}
          balance={customerBalance}
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
      <div className="flex-1 flex min-h-0 gap-3">
        {/* Sol Panel: Token Listesi */}
        <div className="flex-[3] min-w-0 flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground border-b border-border bg-surface-elevated">
            Kayıtlı Kart Tokenleri
            {data?.pagination && (
              <span className="ml-2 text-foreground">
                ({data.pagination.total})
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <AutoPaymentTokensGrid
              data={data?.data ?? []}
              loading={isLoading}
              onSelectionChanged={handleTokenSelectionChanged}
              customButtons={toolbarCustomButtons}
            />
          </div>
        </div>

        {/* Sag Panel: Odeme Planlari */}
        <div className="flex-[2] min-w-0 flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground border-b border-border bg-surface-elevated">
            Ödeme Planları
            {selectedCustomer && (
              <span className="ml-2 text-foreground">
                - {selectedCustomer.customerName || selectedCustomer.erpId || selectedCustomer.customerId}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            {selectedErpId ? (
              <PaymentPlanGrid
                data={paymentPlans ?? []}
                loading={plansLoading}
                onSelectionChanged={handlePlanSelectionChanged}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Ödeme planlarını görmek için sol taraftan bir token seçin
              </div>
            )}
          </div>
        </div>
      </div>
      <AccountTransactionsModal />
    </div>
  );
}
