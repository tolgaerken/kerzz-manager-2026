import { useState, useCallback, useMemo } from "react";
import { CalendarDays, MessageSquare, Plus, RefreshCw, Repeat, FileText } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../hooks/useIsMobile";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  useOffers,
  useCreateOffer,
  useUpdateOffer,
} from "../features/offers/hooks/useOffers";
import { OffersGrid } from "../features/offers/components/OffersGrid/OffersGrid";
import { OffersFilters } from "../features/offers/components/OffersFilters/OffersFilters";
import { OfferFormModal } from "../features/offers/components/OfferFormModal/OfferFormModal";
import { OfferSearchInput } from "../features/offers/components/OfferSearchInput/OfferSearchInput";
import type {
  Offer,
  OfferQueryParams,
  CreateOfferInput,
} from "../features/offers/types/offer.types";
import { useCustomerLookup } from "../features/lookup";
import { useConvertOfferToSale } from "../features/pipeline/hooks/usePipelineItems";
import { useAuth } from "../features/auth";
import { useRevertSale } from "../features/sales";
import { useLogPanelStore } from "../features/manager-log";

const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getDefaultDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

export function OffersPage() {
  // Mobile detection
  const isMobile = useIsMobile();

  // No pagination - fetch all data for virtual scroll
  const [queryParams, setQueryParams] = useState<OfferQueryParams>(() => ({
    sortField: "createdAt",
    sortOrder: "desc",
    limit: 99999,
    ...getDefaultDateRange(),
  }));

  // Mobile search state
  const [mobileSearch, setMobileSearch] = useState("");

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const { data: rawData, isLoading, isFetching, refetch } = useOffers(queryParams);

  // Frontend'de mobil arama filtrelemesi
  const filteredOffers = useMemo(() => {
    if (!rawData?.data) return [];
    
    const normalizedSearch = mobileSearch.trim().toLocaleLowerCase("tr-TR");
    if (!isMobile || normalizedSearch.length === 0) {
      return rawData.data;
    }

    return rawData.data.filter((offer) => {
      const no = String(offer.no || "").toLocaleLowerCase("tr-TR");
      const pipelineRef = (offer.pipelineRef || "").toLocaleLowerCase("tr-TR");
      const customerName = (offer.customerName || "").toLocaleLowerCase("tr-TR");
      const sellerName = (offer.sellerName || "").toLocaleLowerCase("tr-TR");

      return (
        no.includes(normalizedSearch) ||
        pipelineRef.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        sellerName.includes(normalizedSearch)
      );
    });
  }, [rawData?.data, isMobile, mobileSearch]);

  // data objesini oluştur (eski yapıyla uyumlu)
  const data = useMemo(() => {
    if (!rawData) return undefined;
    return {
      ...rawData,
      data: filteredOffers
    };
  }, [rawData, filteredOffers]);
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  const convertMutation = useConvertOfferToSale();
  const { userInfo } = useAuth();
  const revertSaleMutation = useRevertSale();
  const { getCustomerName } = useCustomerLookup();
  const { openPipelinePanel } = useLogPanelStore();

  const enrichedOffers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((offer) => ({
      ...offer,
      customerName: getCustomerName(offer.customerId) !== "-"
        ? getCustomerName(offer.customerId)
        : offer.customerName || "-",
    }));
  }, [data, getCustomerName]);

  const totalAmount = useMemo(() => {
    return enrichedOffers.reduce(
      (sum, offer) => sum + (offer.totals?.overallGrandTotal || 0),
      0
    );
  }, [enrichedOffers]);

  const handleFilterChange = useCallback(
    (filters: Partial<OfferQueryParams>) => {
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

  const handleRowDoubleClick = useCallback((offer: Offer) => {
    setEditingOffer(offer);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(
    async (input: CreateOfferInput) => {
      await createMutation.mutateAsync(input);
      setIsFormOpen(false);
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    async (input: CreateOfferInput) => {
      if (!editingOffer) return;
      await updateMutation.mutateAsync({
        id: editingOffer._id,
        input,
      });
      setIsFormOpen(false);
      setEditingOffer(null);
    },
    [editingOffer, updateMutation]
  );

  const handleConvertOffer = useCallback(async () => {
    if (!selectedOffer || !userInfo) return;
    await convertMutation.mutateAsync({
      offerId: selectedOffer._id,
      data: { userId: userInfo.id, userName: userInfo.name },
    });
    await refetch();
  }, [selectedOffer, userInfo, convertMutation, refetch]);

  const handleRevertOffer = useCallback(async () => {
    if (!selectedOffer?.conversionInfo?.saleId) return;
    await revertSaleMutation.mutateAsync(selectedOffer.conversionInfo.saleId);
    await refetch();
  }, [selectedOffer, revertSaleMutation, refetch]);

  const handleOpenLogs = useCallback(() => {
    if (!selectedOffer) return;
    openPipelinePanel({
      pipelineRef: selectedOffer.pipelineRef,
      customerId: selectedOffer.customerId,
      offerId: selectedOffer._id,
      title: `Teklif: ${selectedOffer.no || selectedOffer.pipelineRef}`,
    });
  }, [selectedOffer, openPipelinePanel]);

  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      id: "add",
      label: "Yeni Teklif",
      icon: <Plus size={14} />,
      onClick: () => {
        setEditingOffer(null);
        setIsFormOpen(true);
      },
    },
    {
      id: "logs",
      label: "Loglar",
      icon: <MessageSquare size={14} />,
      onClick: handleOpenLogs,
      disabled: !selectedOffer,
    },
    {
      id: "convert",
      label: "Satışa Çevir",
      icon: <Repeat size={14} />,
      onClick: handleConvertOffer,
      variant: "primary",
      disabled:
        !selectedOffer ||
        selectedOffer.status === "converted" ||
        selectedOffer.status === "lost" ||
        convertMutation.isPending ||
        !userInfo,
    },
    {
      id: "revert",
      label: "Satıştan Geri Al",
      icon: <Repeat size={14} />,
      onClick: handleRevertOffer,
      disabled:
        !selectedOffer ||
        selectedOffer.status !== "converted" ||
        !selectedOffer.conversionInfo?.saleId ||
        revertSaleMutation.isPending,
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
    icon: <FileText className="h-5 w-5" />,
    title: "Teklifler",
    count: data?.meta?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="date"
            value={queryParams.startDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="bg-transparent text-xs font-medium text-foreground outline-none"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={queryParams.endDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, endDate: e.target.value }))
            }
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
            setEditingOffer(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Teklif
        </button>
      </>
    ),
    mobileActions: (
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
            setEditingOffer(null);
            setIsFormOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <>
        <OffersFilters filters={queryParams} onFilterChange={handleFilterChange} />
        {isMobile && (
          <OfferSearchInput value={mobileSearch} onChange={setMobileSearch} />
        )}
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

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <OffersGrid
            data={enrichedOffers}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChanged={setSelectedOffer}
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

      <OfferFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOffer(null);
        }}
        editItem={editingOffer}
        onSubmit={editingOffer ? handleUpdate : handleCreate}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
