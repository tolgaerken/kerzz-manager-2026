import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import {
  ContractInvoicesGrid,
  ContractInvoicesToolbar,
  InvoiceDetailModal,
  usePaymentPlans,
  useCreateInvoices,
  useCheckContracts,
} from "../features/contract-invoices";
import type {
  PeriodType,
  EnrichedPaymentPlan,
  PaymentListItem,
} from "../features/contract-invoices";
import { useLogPanelStore } from "../features/manager-log";

export function ContractInvoicesPage() {
  // Donem ve tarih state
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM"));
  const [shouldFetch, setShouldFetch] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<EnrichedPaymentPlan | null>(null);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<PaymentListItem[]>([]);

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // API query params
  const queryParams = useMemo(
    () => ({
      period,
      date: `${date}-01`,
    }),
    [period, date],
  );

  // Queries & Mutations
  const { data, isLoading, isRefetching } = usePaymentPlans(
    queryParams,
    shouldFetch,
  );
  const createInvoicesMutation = useCreateInvoices();
  const checkContractsMutation = useCheckContracts();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Kayitlari getir
  const handleLoadRecords = useCallback(() => {
    setShouldFetch(true);
    setSelectedIds([]);
    setNotification(null);
  }, []);

  // Donem degisikligi
  const handlePeriodChange = useCallback((newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    setShouldFetch(false);
    setSelectedIds([]);
  }, []);

  // Tarih degisikligi
  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setShouldFetch(false);
    setSelectedIds([]);
  }, []);

  // Satir cift tiklama -> detay modal
  const handleRowDoubleClick = useCallback((row: EnrichedPaymentPlan) => {
    setDetailItems(row.list || []);
    setDetailModalOpen(true);
  }, []);

  // Fatura olustur
  const handleCreateInvoices = useCallback(() => {
    if (selectedIds.length === 0) return;

    // Negatif tutar kontrolu
    const selectedPlans = (data?.data || []).filter((p) =>
      selectedIds.includes(p.id),
    );
    const hasNegative = selectedPlans.some((p) => p.total < 0);

    if (hasNegative) {
      setNotification({
        type: "error",
        message:
          "Negatif tutarlı ödeme planlarından fatura oluşturulamaz. Lütfen seçiminizi kontrol edin.",
      });
      return;
    }

    createInvoicesMutation.mutate(selectedIds, {
      onSuccess: (results) => {
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        if (failCount === 0) {
          setNotification({
            type: "success",
            message: `${successCount} fatura başarıyla oluşturuldu.`,
          });
        } else {
          setNotification({
            type: "error",
            message: `${successCount} başarılı, ${failCount} başarısız fatura.`,
          });
        }
        setSelectedIds([]);
      },
      onError: (error) => {
        setNotification({
          type: "error",
          message: error.message || "Fatura oluşturulurken hata oluştu.",
        });
      },
    });
  }, [selectedIds, data, createInvoicesMutation]);

  // Kontrat kontrol
  const handleCheckContracts = useCallback(() => {
    if (selectedIds.length === 0) return;

    checkContractsMutation.mutate(selectedIds, {
      onSuccess: (results) => {
        const successCount = results.filter((r) => r.success).length;
        setNotification({
          type: "success",
          message: `${successCount} kontrat başarıyla kontrol edildi.`,
        });
        setSelectedIds([]);
      },
      onError: (error) => {
        setNotification({
          type: "error",
          message: error.message || "Kontrat kontrolü sırasında hata oluştu.",
        });
      },
    });
  }, [selectedIds, checkContractsMutation]);

  // Selection
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    // Son seçilen planı selectedPlan olarak ayarla
    if (ids.length > 0 && data?.data) {
      const lastSelectedId = ids[ids.length - 1];
      const plan = data.data.find((p) => p.id === lastSelectedId);
      if (plan) {
        setSelectedPlan(plan);
      }
    } else if (ids.length === 0) {
      setSelectedPlan(null);
    }
  }, [data?.data]);

  // Log panelini aç
  const handleOpenLogs = useCallback(() => {
    if (!selectedPlan) return;
    openEntityPanel({
      customerId: selectedPlan.customerId,
      activeTab: "payment-plan",
      paymentPlanId: selectedPlan._id,
      contractId: selectedPlan.contractId || undefined,
      title: `Ödeme Planı: ${selectedPlan.company || selectedPlan.brand}`,
    });
  }, [selectedPlan, openEntityPanel]);

  // Secili kayitlarin toplamı
  const selectedTotal = useMemo(() => {
    if (!data?.data || selectedIds.length === 0) return 0;
    return data.data
      .filter((p) => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + (p.total || 0), 0);
  }, [data, selectedIds]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Sözleşme Faturaları
        </h1>
        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && (
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Seçili Toplam:{" "}
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(selectedTotal)}
            </span>
          )}
          <button
            onClick={handleOpenLogs}
            disabled={!selectedPlan || selectedIds.length > 1}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Loglar"
          >
            <MessageSquare className="w-4 h-4" />
            Loglar
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)] text-sm cursor-pointer"
          onClick={() => setNotification(null)}
          style={{
            backgroundColor:
              notification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 12%, var(--color-surface))"
                : "color-mix(in oklch, var(--color-success) 12%, var(--color-surface))",
            color:
              notification.type === "error"
                ? "var(--color-error-foreground)"
                : "var(--color-success-foreground)",
          }}
        >
          <span className="flex-1 font-medium">{notification.message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <ContractInvoicesToolbar
          period={period}
          date={date}
          selectedCount={selectedIds.length}
          loading={isLoading || isRefetching}
          onPeriodChange={handlePeriodChange}
          onDateChange={handleDateChange}
          onLoadRecords={handleLoadRecords}
          onCreateInvoices={handleCreateInvoices}
          onCheckContracts={handleCheckContracts}
          isCreating={createInvoicesMutation.isPending}
          isChecking={checkContractsMutation.isPending}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <ContractInvoicesGrid
          data={data?.data || []}
          loading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        items={detailItems}
      />
    </div>
  );
}
