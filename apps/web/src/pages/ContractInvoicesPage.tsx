import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { FileText, MessageSquare, Receipt, RefreshCw, FileCheck, CheckCircle } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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
import { useCustomerLookup } from "../features/lookup";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

export function ContractInvoicesPage() {
  const isMobile = useIsMobile();

  // Donem ve tarih state
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM"));
  const [shouldFetch, setShouldFetch] = useState(false);

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

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

  // Customer lookup for erpId
  const { customerMap } = useCustomerLookup();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

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

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedPlan) return;
    const customer = customerMap.get(selectedPlan.customerId);
    if (!customer?.erpId) return;
    openAccountTransactionsModal(customer.erpId, selectedPlan.internalFirm || "VERI");
  }, [selectedPlan, customerMap, openAccountTransactionsModal]);

  // Check if selected plan has erpId via customer
  const hasErpId = useMemo(() => {
    if (!selectedPlan) return false;
    return !!customerMap.get(selectedPlan.customerId)?.erpId;
  }, [selectedPlan, customerMap]);

  // Secili kayitlarin toplamı
  const selectedTotal = useMemo(() => {
    if (!data?.data || selectedIds.length === 0) return 0;
    return data.data
      .filter((p) => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + (p.total || 0), 0);
  }, [data, selectedIds]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileText className="h-5 w-5" />,
    title: "Sözleşme Faturaları",
    count: data?.data?.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <div className="flex items-center gap-2">
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
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Loglar"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Loglar
        </button>
        <button
          onClick={handleOpenAccountTransactions}
          disabled={!selectedPlan || selectedIds.length > 1 || !hasErpId}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cari Hareketleri"
        >
          <Receipt className="w-3.5 h-3.5" />
          Cari Hareketleri
        </button>
      </div>
    ),
    mobileActions: (
      <div className="flex flex-col gap-2">
        {/* Seçili toplam - mobil */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-center rounded-md bg-[var(--color-primary)]/10 px-3 py-2">
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Seçili: {selectedIds.length} | {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(selectedTotal)}
            </span>
          </div>
        )}
        {/* Aksiyon butonları - mobil */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenLogs}
            disabled={!selectedPlan || selectedIds.length > 1}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Loglar"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenAccountTransactions}
            disabled={!selectedPlan || selectedIds.length > 1 || !hasErpId}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cari Hareketleri"
          >
            <Receipt className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCreateInvoices}
            disabled={selectedIds.length === 0 || createInvoicesMutation.isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--color-success)] px-3 py-2 text-xs font-medium text-[var(--color-success-foreground)] transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fatura Oluştur"
          >
            <FileCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCheckContracts}
            disabled={selectedIds.length === 0 || checkContractsMutation.isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kontrat Kontrol"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    ),
    children: (
      <>
        {/* Toolbar - hem mobil hem desktop */}
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
          isMobile={isMobile}
        />
      </>
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Notification */}
      {notification && (
        <div
          className="flex items-center gap-3 mx-3 mb-3 px-4 py-3 rounded-lg text-sm cursor-pointer"
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

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden mx-3 mb-3">
          <ContractInvoicesGrid
            data={data?.data || []}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        items={detailItems}
      />

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
