import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { FileText, MessageSquare, Receipt, FileCheck, CheckCircle } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
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
import { useLogPanelStore, useLastLogDatesByContexts } from "../features/manager-log";
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

  // Plan ve Contract ID'lerini topla (son log tarihleri için)
  const {
    planIds,
    contractIds,
    legacyContractNumbers,
    customerIds,
    contractNumberToContractIdMap,
    customerIdToContractIdMap,
  } = useMemo(() => {
    const plans = data?.data ?? [];

    // contractNumber -> contractId mapping (legacy sonuçlarını dönüştürmek için)
    const numberToIdMap = new Map<string, string>();
    // customerId -> contractId mapping (legacy customerId sonuçlarını dönüştürmek için)
    const customerToContractMap = new Map<string, string>();

    for (const p of plans) {
      if (p.contractNumber && p.contractNumber > 0 && p.contractId) {
        numberToIdMap.set(String(p.contractNumber), p.contractId);
      }
      // Her customerId için en son contractId'yi sakla
      if (p.customerId && p.contractId) {
        customerToContractMap.set(p.customerId, p.contractId);
      }
    }

    return {
      planIds: plans.map((p) => p._id),
      contractIds: [...new Set(plans.map((p) => p.contractId).filter(Boolean))],
      // Legacy log sisteminde contractId olarak contractNumber (no) kullanılıyor
      legacyContractNumbers: [
        ...new Set(
          plans
            .map((p) => p.contractNumber)
            .filter((n) => n && n > 0)
            .map((n) => String(n))
        ),
      ],
      // Legacy log sisteminde customerId ile de log tutulmuş olabilir
      customerIds: [...new Set(plans.map((p) => p.customerId).filter(Boolean))],
      contractNumberToContractIdMap: numberToIdMap,
      customerIdToContractIdMap: customerToContractMap,
    };
  }, [data?.data]);

  // Son log tarihlerini batch olarak getir (yeni + legacy)
  const { data: rawLastLogDates } = useLastLogDatesByContexts({
    contexts: [
      { type: "payment-plan", ids: planIds },
      { type: "contract", ids: contractIds },
    ],
    // Legacy için hem contractNumber hem customerId gönder
    legacyContractIds: legacyContractNumbers,
    legacyCustomerIds: customerIds,
    includeLegacy: true,
    groupByField: "contractId",
  });

  // Legacy sonuçlarını contractId'ye dönüştür
  const lastLogDatesByContractId = useMemo(() => {
    if (!rawLastLogDates) return undefined;
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawLastLogDates)) {
      // 1. Eğer key bir contractNumber ise, contractId'ye dönüştür
      const contractIdFromNumber = contractNumberToContractIdMap.get(key);
      if (contractIdFromNumber) {
        if (!result[contractIdFromNumber] || value > result[contractIdFromNumber]) {
          result[contractIdFromNumber] = value;
        }
      }

      // 2. Eğer key bir customerId ise, ilgili contractId'ye dönüştür
      const contractIdFromCustomer = customerIdToContractIdMap.get(key);
      if (contractIdFromCustomer) {
        if (!result[contractIdFromCustomer] || value > result[contractIdFromCustomer]) {
          result[contractIdFromCustomer] = value;
        }
      }

      // 3. Orijinal key'i de koru (yeni log sistemi için)
      if (!result[key] || value > result[key]) {
        result[key] = value;
      }
    }

    return result;
  }, [rawLastLogDates, contractNumberToContractIdMap, customerIdToContractIdMap]);

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

  // Log panelini aç (toolbar butonu için)
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

  // Log panelini aç (grid satırındaki ikon için)
  const handleOpenLogsForPlan = useCallback(
    (plan: EnrichedPaymentPlan) => {
      openEntityPanel({
        customerId: plan.customerId,
        activeTab: "payment-plan",
        paymentPlanId: plan._id,
        contractId: plan.contractId || undefined,
        title: `Ödeme Planı: ${plan.company || plan.brand}`,
      });
    },
    [openEntityPanel]
  );

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

  // Toolbar custom butonları
  const toolbarCustomButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const buttons: ToolbarButtonConfig[] = [];

    // Seçili toplam bilgisi
    if (selectedIds.length > 0) {
      const formattedTotal = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(selectedTotal);
      buttons.push({
        id: "selected-total",
        label: `Toplam: ${formattedTotal}`,
        onClick: () => {},
        disabled: true,
        variant: "default",
      });
    }

    // Fatura Oluştur
    buttons.push({
      id: "create-invoices",
      label: "Fatura Oluştur",
      icon: <FileCheck className="w-3.5 h-3.5" />,
      onClick: handleCreateInvoices,
      disabled: selectedIds.length === 0 || createInvoicesMutation.isPending,
      variant: "primary",
    });

    // Kontrat Kontrol
    buttons.push({
      id: "check-contracts",
      label: "Kontrat Kontrol",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      onClick: handleCheckContracts,
      disabled: selectedIds.length === 0 || checkContractsMutation.isPending,
      variant: "default",
    });

    // Loglar
    buttons.push({
      id: "open-logs",
      label: "Log",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      onClick: handleOpenLogs,
      disabled: !selectedPlan || selectedIds.length > 1,
      variant: "default",
    });

    // Cari Hareketleri
    buttons.push({
      id: "account-transactions",
      label: "Cari Hareket",
      icon: <Receipt className="w-3.5 h-3.5" />,
      onClick: handleOpenAccountTransactions,
      disabled: !selectedPlan || selectedIds.length > 1 || !hasErpId,
      variant: "default",
    });

    return buttons;
  }, [
    selectedIds.length,
    selectedTotal,
    selectedPlan,
    hasErpId,
    handleCreateInvoices,
    handleCheckContracts,
    handleOpenLogs,
    handleOpenAccountTransactions,
    createInvoicesMutation.isPending,
    checkContractsMutation.isPending,
  ]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileText className="h-5 w-5" />,
    title: "Sözleşme Faturaları",
    count: data?.data?.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
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
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden mx-3 mb-3">
          <ContractInvoicesGrid
            data={data?.data || []}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
            lastLogDatesByPlanId={lastLogDatesByContractId}
            onOpenLogs={handleOpenLogsForPlan}
            toolbarCustomButtons={toolbarCustomButtons}
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
