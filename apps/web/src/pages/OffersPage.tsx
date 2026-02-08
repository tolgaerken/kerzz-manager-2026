import { useState, useCallback, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  useOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
} from "../features/offers/hooks/useOffers";
import { OffersGrid } from "../features/offers/components/OffersGrid/OffersGrid";
import { OffersFilters } from "../features/offers/components/OffersFilters/OffersFilters";
import { OfferFormModal } from "../features/offers/components/OfferFormModal/OfferFormModal";
import type {
  Offer,
  OfferQueryParams,
  CreateOfferInput,
} from "../features/offers/types/offer.types";
import { useCustomerLookup } from "../features/lookup";

export function OffersPage() {
  // No pagination - fetch all data for virtual scroll
  const [queryParams, setQueryParams] = useState<OfferQueryParams>({
    sortField: "createdAt",
    sortOrder: "desc",
    limit: 99999,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const { data, isLoading, refetch } = useOffers(queryParams);
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  const { getCustomerName } = useCustomerLookup();

  const enrichedOffers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((offer) => ({
      ...offer,
      customerName: getCustomerName(offer.customerId) !== "-"
        ? getCustomerName(offer.customerId)
        : offer.customerName || "-",
    }));
  }, [data, getCustomerName]);

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

  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      key: "add",
      label: "Yeni Teklif",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      onClick: () => {
        setEditingOffer(null);
        setIsFormOpen(true);
      },
    },
    {
      key: "refresh",
      label: "Yenile",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
      onClick: () => refetch(),
    },
  ];

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            Teklifler
          </h1>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            Teklif oluşturun, yönetin ve satışa dönüştürün
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <input
            type="date"
            value={queryParams.startDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="bg-transparent text-xs font-medium text-[var(--color-foreground)] outline-none"
          />
          <span className="text-xs text-[var(--color-muted-foreground)]">—</span>
          <input
            type="date"
            value={queryParams.endDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="bg-transparent text-xs font-medium text-[var(--color-foreground)] outline-none"
          />
        </div>
      </div>

      <OffersFilters filters={queryParams} onFilterChange={handleFilterChange} />

      <div className="flex-1 min-h-0 mt-4">
        <OffersGrid
          data={enrichedOffers}
          loading={isLoading}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
          toolbarButtons={toolbarButtons}
        />
      </div>

      {data?.meta && (
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-sm text-[var(--color-foreground-muted)]">
            Toplam: {data.meta.total} kayıt
          </span>
        </div>
      )}

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
