import { useState, useCallback, useMemo } from "react";
import { Plus, RefreshCw, CreditCard } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  PaymentLinksGrid,
  PaymentLinksFilters,
  PaymentLinksPagination,
  CreatePaymentLinkModal,
  usePaymentLinks,
  useCreatePaymentLink,
  useSendPaymentLinkNotification,
  PAYMENTS_CONSTANTS
} from "../features/payments";
import type {
  PaymentLinkItem,
  PaymentLinkQueryParams,
  CreatePaymentLinkInput
} from "../features/payments";

export function PaymentsPage() {
  const [queryParams, setQueryParams] = useState<PaymentLinkQueryParams>({
    page: 1,
    limit: PAYMENTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    status: "",
    sortField: "createDate",
    sortOrder: "desc"
  });

  const [dateRangeDays, setDateRangeDays] = useState<number | null>(30);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const resolvedParams = useMemo((): PaymentLinkQueryParams => {
    const p = { ...queryParams };
    if (dateRangeDays !== null) {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - dateRangeDays);
      p.dateFrom = from.toISOString().split("T")[0];
      p.dateTo = to.toISOString().split("T")[0];
    }
    return p;
  }, [queryParams, dateRangeDays]);

  const { data, isLoading, isFetching, refetch } = usePaymentLinks(resolvedParams);
  const createMutation = useCreatePaymentLink();
  const notifyMutation = useSendPaymentLinkNotification();

  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleDateRangeChange = useCallback((days: number | null) => {
    setDateRangeDays(days);
    setQueryParams((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setQueryParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      status: "",
      page: 1
    }));
    setDateRangeDays(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleCreateClick = useCallback(() => {
    setCreatedUrl(null);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreatePaymentLinkInput) => {
      createMutation.mutate(formData, {
        onSuccess: (res) => {
          setCreatedUrl(res.url);
        }
      });
    },
    [createMutation]
  );

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setCreatedUrl(null);
  }, []);

  const paymentBaseUrl =
    import.meta.env.VITE_PAYMENT_BASE_URL || window.location.origin;

  const handleCopyLink = useCallback(
    (item: PaymentLinkItem) => {
      const url = `${paymentBaseUrl}/odeme/${item.linkId}`;
      navigator.clipboard.writeText(url);
    },
    [paymentBaseUrl]
  );

  const handleResendNotify = useCallback((item: PaymentLinkItem) => {
    notifyMutation.mutate(item.linkId);
  }, [notifyMutation]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <CreditCard className="h-5 w-5" />,
    title: "Online Ödemeler",
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
        <button
          type="button"
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Ödeme Linki
        </button>
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
        <button
          type="button"
          onClick={handleCreateClick}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <PaymentLinksFilters
        search={queryParams.search || ""}
        dateRangeDays={dateRangeDays}
        status={queryParams.status || ""}
        onSearchChange={handleSearchChange}
        onDateRangeChange={handleDateRangeChange}
        onStatusChange={handleStatusChange}
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

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <PaymentLinksGrid
            data={data?.data ?? []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onCopyLink={handleCopyLink}
            onResendNotify={handleResendNotify}
          />
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <PaymentLinksPagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>

      <CreatePaymentLinkModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        createdUrl={createdUrl}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
