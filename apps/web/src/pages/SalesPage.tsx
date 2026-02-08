import { useState, useCallback, useMemo } from "react";
import { CalendarDays, Plus, RefreshCw } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  useSales,
  useCreateSale,
  useUpdateSale,
} from "../features/sales/hooks/useSales";
import { SalesGrid } from "../features/sales/components/SalesGrid/SalesGrid";
import { SalesFilters } from "../features/sales/components/SalesFilters/SalesFilters";
import { SaleFormModal } from "../features/sales/components/SaleFormModal/SaleFormModal";
import { getMonthRange } from "../features/sales/utils/dateUtils";
import type {
  Sale,
  SaleQueryParams,
  CreateSaleInput,
} from "../features/sales/types/sale.types";
import { useCustomerLookup } from "../features/lookup";

export function SalesPage() {
  const defaultRange = useMemo(() => getMonthRange(), []);

  // No pagination - fetch all data for virtual scroll
  const [queryParams, setQueryParams] = useState<SaleQueryParams>({
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const { data, isLoading, refetch } = useSales(queryParams);
  const createMutation = useCreateSale();
  const updateMutation = useUpdateSale();
  const { getCustomerName } = useCustomerLookup();

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
      id: "refresh",
      label: "Yenile",
      icon: <RefreshCw size={14} />,
      onClick: () => refetch(),
    },
  ];

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            Satışlar
          </h1>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            Satışlarınızı yönetin, onaylayın ve takip edin
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

      <SalesFilters filters={queryParams} onFilterChange={handleFilterChange} />

      <div className="flex-1 min-h-0 mt-4">
        <SalesGrid
          data={enrichedSales}
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
          <span className="text-sm font-semibold text-[var(--color-foreground)]">
            Genel Toplam:{" "}
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              minimumFractionDigits: 2,
            }).format(totalAmount)}
          </span>
        </div>
      )}

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
    </div>
  );
}
