import { useState, useCallback, useMemo } from "react";
import { CalendarDays, MessageSquare, Plus, RefreshCw, ShoppingCart, Send, CheckCircle } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import toast from "react-hot-toast";
import {
  useSales,
  useCreateSale,
  useUpdateSale,
  useRequestSaleApproval,
  useApproveSale,
  useRejectSale,
} from "../features/sales/hooks/useSales";
import { useSalesSocket } from "../features/sales/hooks/useSalesSocket";
import { SalesGrid } from "../features/sales/components/SalesGrid/SalesGrid";
import { SalesFilters } from "../features/sales/components/SalesFilters/SalesFilters";
import { SaleFormModal } from "../features/sales/components/SaleFormModal/SaleFormModal";
import { ApprovalRequestDialog } from "../features/sales/components/ApprovalRequestDialog";
import { ApprovalActionDialog } from "../features/sales/components/ApprovalActionDialog";
import {
  getMonthRange,
  getCurrentMonth,
  getMonthRangeFromString,
} from "../features/sales/utils/dateUtils";
import type {
  Sale,
  SaleQueryParams,
  CreateSaleInput,
} from "../features/sales/types/sale.types";
import { useCustomerLookup } from "../features/lookup";
import { useLogPanelStore } from "../features/manager-log";
import { useAuth } from "../features/auth";

export function SalesPage() {
  const defaultRange = useMemo(() => getMonthRange(), []);

  // Ay/Yıl seçici state
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonth());

  // No pagination - fetch all data for virtual scroll
  const [queryParams, setQueryParams] = useState<SaleQueryParams>({
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
  });

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const month = e.target.value;
      setSelectedMonth(month);
      const range = getMonthRangeFromString(month);
      setQueryParams((prev) => ({
        ...prev,
        startDate: range.startDate,
        endDate: range.endDate,
      }));
    },
    []
  );

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Çoklu seçim state'i
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  
  // Onay dialog state'leri
  const [isApprovalRequestOpen, setIsApprovalRequestOpen] = useState(false);
  const [isApprovalActionOpen, setIsApprovalActionOpen] = useState(false);
  const [saleForApproval, setSaleForApproval] = useState<Sale | null>(null);

  const { data, isLoading, isFetching, refetch } = useSales(queryParams);
  
  // Auth bilgisi
  const { isManager, isAdmin } = useAuth();
  const isApprover = isManager || isAdmin;

  const createMutation = useCreateSale();
  const updateMutation = useUpdateSale();
  const requestApprovalMutation = useRequestSaleApproval();
  const approveMutation = useApproveSale();
  const rejectMutation = useRejectSale();
  
  const { getCustomerName } = useCustomerLookup();
  const { openPipelinePanel } = useLogPanelStore();
  
  // WebSocket ile gerçek zamanlı güncellemeler
  useSalesSocket();

  const enrichedSales = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((sale) => ({
      ...sale,
      customerName: getCustomerName(sale.customerId) !== "-"
        ? getCustomerName(sale.customerId)
        : sale.customerName || "-",
    }));
  }, [data, getCustomerName]);

  const totalAmount = useMemo(() => {
    return enrichedSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
  }, [enrichedSales]);

  const handleFilterChange = useCallback(
    (filters: Partial<SaleQueryParams>) => {
      setQueryParams((prev) => ({ ...prev, ...filters }));
    },
    []
  );

  const handleSortChange = useCallback(
    (field: string, order: "asc" | "desc") => {
      setQueryParams((prev) => ({
        ...prev,
        sortField: field,
        sortOrder: order,
      }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((sale: Sale) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  }, []);

  const handleOpenLogs = useCallback(() => {
    if (!selectedSale) return;
    openPipelinePanel({
      pipelineRef: selectedSale.pipelineRef,
      customerId: selectedSale.customerId,
      saleId: selectedSale._id,
      title: `Satış: ${selectedSale.no || selectedSale.pipelineRef}`,
    });
  }, [selectedSale, openPipelinePanel]);

  const handleCreate = useCallback(
    async (input: CreateSaleInput) => {
      await createMutation.mutateAsync(input);
      setIsFormOpen(false);
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    async (input: CreateSaleInput) => {
      if (!editingSale) return;
      await updateMutation.mutateAsync({
        id: editingSale._id,
        input,
      });
      setIsFormOpen(false);
      setEditingSale(null);
    },
    [editingSale, updateMutation]
  );

  // Seçili satışları al
  const selectedSales = useMemo(() => {
    return enrichedSales.filter((s) => selectedSaleIds.includes(s._id));
  }, [enrichedSales, selectedSaleIds]);

  // Onay isteği gönder
  const handleRequestApproval = useCallback(
    async (note?: string) => {
      try {
        const result = await requestApprovalMutation.mutateAsync({
          saleIds: selectedSaleIds,
          note,
        });
        toast.success(result.message);
        setIsApprovalRequestOpen(false);
        setSelectedSaleIds([]);
      } catch (error: any) {
        toast.error(error?.message || "Onay isteği gönderilemedi");
      }
    },
    [selectedSaleIds, requestApprovalMutation]
  );

  // Satış onayla
  const handleApprove = useCallback(
    async (note?: string) => {
      if (!saleForApproval) return;
      try {
        const result = await approveMutation.mutateAsync({
          id: saleForApproval._id,
          note,
        });
        toast.success(result.message);
        setIsApprovalActionOpen(false);
        setSaleForApproval(null);
      } catch (error: any) {
        toast.error(error?.message || "Satış onaylanamadı");
      }
    },
    [saleForApproval, approveMutation]
  );

  // Satış reddet
  const handleReject = useCallback(
    async (reason: string) => {
      if (!saleForApproval) return;
      try {
        const result = await rejectMutation.mutateAsync({
          id: saleForApproval._id,
          reason,
        });
        toast.success(result.message);
        setIsApprovalActionOpen(false);
        setSaleForApproval(null);
      } catch (error: any) {
        toast.error(error?.message || "Satış reddedilemedi");
      }
    },
    [saleForApproval, rejectMutation]
  );

  // Onay işlemi için satış seç
  const handleOpenApprovalAction = useCallback((sale: Sale) => {
    setSaleForApproval(sale);
    setIsApprovalActionOpen(true);
  }, []);

  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      id: "add",
      label: "Yeni Satış",
      icon: <Plus size={14} />,
      onClick: () => {
        setEditingSale(null);
        setIsFormOpen(true);
      },
    },
    {
      id: "request-approval",
      label: "Onaya Gönder",
      icon: <Send size={14} />,
      onClick: () => setIsApprovalRequestOpen(true),
      disabled: selectedSaleIds.length === 0,
    },
    ...(isApprover && selectedSale?.approvalStatus === "pending"
      ? [
          {
            id: "approve",
            label: "Onayla/Reddet",
            icon: <CheckCircle size={14} />,
            onClick: () => handleOpenApprovalAction(selectedSale),
          },
        ]
      : []),
    {
      id: "logs",
      label: "Loglar",
      icon: <MessageSquare size={14} />,
      onClick: handleOpenLogs,
      disabled: !selectedSale,
    },
    {
      id: "refresh",
      label: "Yenile",
      icon: <RefreshCw size={14} />,
      onClick: () => refetch(),
    },
  ];

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <ShoppingCart className="h-5 w-5" />,
    title: "Satışlar",
    count: data?.meta?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="bg-transparent text-xs font-medium text-foreground outline-none"
          />
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        <button
          onClick={() => {
            setEditingSale(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Satış
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="flex-1 bg-transparent text-xs font-medium text-foreground outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingSale(null);
              setIsFormOpen(true);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Yeni
          </button>
        </div>
      </div>
    ),
    children: (
      <SalesFilters filters={queryParams} onFilterChange={handleFilterChange} />
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <SalesGrid
            data={enrichedSales}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChanged={setSelectedSale}
            selectedIds={selectedSaleIds}
            onSelectionChange={setSelectedSaleIds}
            toolbarButtons={toolbarButtons}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
          />
        </div>

        {/* Footer Stats */}
        {data?.meta && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              Toplam: {data.meta.total} kayıt
            </span>
            <span className="text-sm font-semibold text-foreground">
              Genel Toplam:{" "}
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
                minimumFractionDigits: 2,
              }).format(totalAmount)}
            </span>
          </div>
        )}
      </div>

      <SaleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSale(null);
        }}
        editItem={editingSale}
        onSubmit={editingSale ? handleUpdate : handleCreate}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Onay İsteği Dialog */}
      <ApprovalRequestDialog
        open={isApprovalRequestOpen}
        onOpenChange={setIsApprovalRequestOpen}
        selectedSales={selectedSales}
        onSubmit={handleRequestApproval}
        isLoading={requestApprovalMutation.isPending}
      />

      {/* Onay/Red Dialog */}
      <ApprovalActionDialog
        open={isApprovalActionOpen}
        onOpenChange={setIsApprovalActionOpen}
        sale={saleForApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}
