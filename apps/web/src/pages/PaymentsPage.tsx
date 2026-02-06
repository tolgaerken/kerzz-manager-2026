import { useState, useCallback, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
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

  const { data, isLoading, error, refetch } = usePaymentLinks(resolvedParams);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Online Ödemeler
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Yeni Ödeme Linki
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <PaymentLinksFilters
          search={queryParams.search || ""}
          dateRangeDays={dateRangeDays}
          status={queryParams.status || ""}
          onSearchChange={handleSearchChange}
          onDateRangeChange={handleDateRangeChange}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50 dark:bg-red-900/20">
          Hata: {error.message}
        </div>
      )}

      <div className="flex-1 px-6 py-4 min-h-0">
        <PaymentLinksGrid
          data={data?.data ?? []}
          loading={isLoading}
          onSortChange={handleSortChange}
          onCopyLink={handleCopyLink}
          onResendNotify={handleResendNotify}
        />
      </div>

      {data?.pagination && (
        <PaymentLinksPagination
          pagination={data.pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

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
