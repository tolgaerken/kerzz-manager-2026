import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash2, X, AlertTriangle, CheckCircle } from "lucide-react";
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

export function AutomatedPaymentsPage() {
  // ── Query State ──
  const [queryParams, setQueryParams] = useState<AutoPaymentQueryParams>({
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
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useAutoPaymentTokens(queryParams);
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

      {/* Payment Notification */}
      {paymentNotification && (
        <div
          className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)] text-sm"
          style={{
            backgroundColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 12%, var(--color-surface))"
                : "color-mix(in oklch, var(--color-success) 12%, var(--color-surface))",
            color:
              paymentNotification.type === "error"
                ? "var(--color-error-foreground)"
                : "var(--color-success-foreground)",
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
                - {selectedCustomer.customerName || selectedCustomer.erpId || selectedCustomer.customerId}
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
