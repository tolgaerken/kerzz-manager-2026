import { useState, useCallback, useMemo } from "react";
import { Wallet, Receipt, MessageSquare } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../hooks/useIsMobile";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import { ReceivablesGrid, ReceivablesSummary } from "../features/receivables";
import { useErpBalances, type ErpBalance } from "../features/erp-balances";
import { useUnpaidInvoiceSummaryByErp } from "../features/invoices";
import {
  AccountTransactionsModal,
  useAccountTransactionsStore,
} from "../features/account-transactions";
import { useLogPanelStore } from "../features/manager-log";
import { useCustomerLookup } from "../features/lookup";

/** Grup şirketlerinin cari kodları */
const GROUP_COMPANY_IDS = new Set(["M0002", "M1246", "E0061", "M0072", "M2186", "A0001"]);

export function ReceivablesPage() {
  const isMobile = useIsMobile();

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ErpBalance | null>(null);

  // Grup şirketleri filtresi (default: hariç)
  const [includeGroupCompanies, setIncludeGroupCompanies] = useState(false);

  // Veri çekme - tüm veriyi çek
  const { data: erpBalancesData, isLoading } = useErpBalances({ limit: 5000 });

  // Ödenmemiş fatura özeti (erpId = CariKodu bazında)
  const { unpaidMap, isLoading: isUnpaidLoading } = useUnpaidInvoiceSummaryByErp();

  // Grup şirketleri filtrelenmiş veri (Summary + Grid için ortak)
  const filteredErpData = useMemo(() => {
    const raw = erpBalancesData?.data || [];
    if (includeGroupCompanies) return raw;
    return raw.filter((row) => !GROUP_COMPANY_IDS.has(row.CariKodu));
  }, [erpBalancesData?.data, includeGroupCompanies]);

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Customer lookup (erpId -> customerId çözümlemesi için)
  const { customers } = useCustomerLookup();

  /** erpId -> CustomerLookupItem reverse map */
  const erpIdToCustomerMap = useMemo(() => {
    const map = new Map<string, { _id: string; name?: string; companyName?: string }>();
    for (const c of customers) {
      if (c.erpId) map.set(c.erpId, c);
    }
    return map;
  }, [customers]);

  // Satır çift tıklama -> cari hareketleri aç
  const handleRowDoubleClick = useCallback(
    (row: ErpBalance) => {
      openAccountTransactionsModal(row.CariKodu, row.internalFirm || "VERI");
    },
    [openAccountTransactionsModal]
  );

  // Selection değişikliği
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
      // Son seçilen item'ı selectedItem olarak ayarla
      if (ids.length > 0 && filteredErpData.length > 0) {
        const lastSelectedId = ids[ids.length - 1];
        const item = filteredErpData.find((p) => p._id === lastSelectedId);
        if (item) {
          setSelectedItem(item);
        }
      } else if (ids.length === 0) {
        setSelectedItem(null);
      }
    },
    [filteredErpData]
  );

  // Cari hareketleri modalını aç (toolbar butonu)
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedItem) return;
    openAccountTransactionsModal(selectedItem.CariKodu, selectedItem.internalFirm || "VERI");
  }, [selectedItem, openAccountTransactionsModal]);

  // Log panelini aç (toolbar butonu)
  const handleOpenLogs = useCallback(() => {
    if (!selectedItem) return;
    const customer = erpIdToCustomerMap.get(selectedItem.CariKodu);
    if (!customer) return;
    openEntityPanel({
      customerId: customer._id,
      activeTab: "contract",
      title: `Cari: ${selectedItem.CariUnvan || selectedItem.CariKodu}`,
    });
  }, [selectedItem, erpIdToCustomerMap, openEntityPanel]);

  // Seçili kaydın müşteri eşleşmesi var mı?
  const hasCustomerId = useMemo(() => {
    if (!selectedItem) return false;
    return erpIdToCustomerMap.has(selectedItem.CariKodu);
  }, [selectedItem, erpIdToCustomerMap]);

  // Seçili kayıtların toplamı
  const selectedTotal = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    return filteredErpData
      .filter((p) => selectedIds.includes(p._id))
      .reduce((sum, p) => sum + (p.CariBakiye || 0), 0);
  }, [filteredErpData, selectedIds]);

  // Grup şirketleri toggle
  const toggleGroupCompanies = useCallback(() => {
    setIncludeGroupCompanies((prev) => !prev);
  }, []);

  // Toolbar custom butonları
  const toolbarCustomButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const buttons: ToolbarButtonConfig[] = [];

    // Grup şirketleri toggle butonu
    buttons.push({
      id: "toggle-group-companies",
      label: "Grup Şirketlerini Dahil Et",
      onClick: toggleGroupCompanies,
      variant: includeGroupCompanies ? "primary" : undefined,
    });

    // Seçili toplam bilgisi
    if (selectedIds.length > 0) {
      const formattedTotal = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(selectedTotal);
      buttons.push({
        id: "selected-total",
        label: `Seçili Toplam: ${formattedTotal}`,
        onClick: () => {},
        disabled: true,
        variant: "default",
      });
    }

    // Loglar
    buttons.push({
      id: "open-logs",
      label: "Log",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      onClick: handleOpenLogs,
      disabled: !selectedItem || selectedIds.length > 1 || !hasCustomerId,
      variant: "default",
      title: "Seçili carinin loglarını görüntüle",
    });

    // Cari Hareketleri
    buttons.push({
      id: "account-transactions",
      label: "Cari Hareket",
      icon: <Receipt className="w-3.5 h-3.5" />,
      onClick: handleOpenAccountTransactions,
      disabled: !selectedItem || selectedIds.length > 1,
      variant: "primary",
    });

    return buttons;
  }, [includeGroupCompanies, toggleGroupCompanies, selectedIds.length, selectedTotal, selectedItem, handleOpenAccountTransactions, handleOpenLogs, hasCustomerId]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Wallet className="h-5 w-5" />,
    title: "Alacak Listesi",
    count: filteredErpData.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: !isMobile && (
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
        <span>
          Son güncelleme:{" "}
          {erpBalancesData?.data?.[0]?.fetchedAt
            ? new Date(erpBalancesData.data[0].fetchedAt).toLocaleString("tr-TR")
            : "—"}
        </span>
      </div>
    ),
    children: (
      <ReceivablesSummary
        data={filteredErpData}
        isLoading={isLoading || isUnpaidLoading}
        unpaidMap={unpaidMap}
      />
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Summary Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden mx-3 mb-3">
          <ReceivablesGrid
            data={filteredErpData}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
            toolbarCustomButtons={toolbarCustomButtons}
            unpaidMap={unpaidMap}
          />
        </div>
      </div>

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
