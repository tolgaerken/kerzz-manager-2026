import { useState, useCallback, useMemo } from "react";
import { Users, Plus, RefreshCw, ArrowRightCircle, CalendarDays } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
} from "../features/leads/hooks/useLeads";
import { LeadsGrid } from "../features/leads/components/LeadsGrid/LeadsGrid";
import { LeadsFilters } from "../features/leads/components/LeadsFilters/LeadsFilters";
import { LeadFormModal } from "../features/leads/components/LeadFormModal/LeadFormModal";
import type {
  Lead,
  LeadQueryParams,
  CreateLeadInput,
} from "../features/leads/types/lead.types";
import { getMonthRange } from "../features/sales/utils/dateUtils";
import { useConvertLeadToOffer } from "../features/pipeline/hooks/usePipelineItems";

export function LeadsPage() {
  const defaultRange = useMemo(() => getMonthRange(), []);

  const [queryParams, setQueryParams] = useState<LeadQueryParams>({
    page: 1,
    limit: 50,
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { data, isLoading, refetch } = useLeads(queryParams);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLeadToOffer();

  const handleFilterChange = useCallback(
    (filters: Partial<LeadQueryParams>) => {
      setQueryParams((prev) => ({ ...prev, ...filters, page: 1 }));
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

  const handleRowDoubleClick = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(async (input: CreateLeadInput) => {
    await createMutation.mutateAsync(input);
    setIsFormOpen(false);
  }, [createMutation]);

  const handleUpdate = useCallback(
    async (input: CreateLeadInput) => {
      if (!editingLead) return;
      await updateMutation.mutateAsync({
        id: editingLead._id,
        data: input,
      });
      setIsFormOpen(false);
      setEditingLead(null);
    },
    [editingLead, updateMutation]
  );

  const toolbarButtons: ToolbarButtonConfig[] = [
    {
      key: "add",
      label: "Yeni Lead",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      onClick: () => {
        setEditingLead(null);
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
            Potansiyeller (Leads)
          </h1>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            Potansiyel müşterilerinizi yönetin ve takip edin
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <input
            type="date"
            value={queryParams.startDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))
            }
            className="bg-transparent text-xs font-medium text-[var(--color-foreground)] outline-none"
          />
          <span className="text-xs text-[var(--color-muted-foreground)]">—</span>
          <input
            type="date"
            value={queryParams.endDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))
            }
            className="bg-transparent text-xs font-medium text-[var(--color-foreground)] outline-none"
          />
        </div>
      </div>

      <LeadsFilters filters={queryParams} onFilterChange={handleFilterChange} />

      <div className="flex-1 min-h-0 mt-4">
        <LeadsGrid
          data={data?.data || []}
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
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border border-[var(--color-border)] rounded disabled:opacity-50"
              disabled={!data.meta.hasPrevPage}
              onClick={() =>
                setQueryParams((p) => ({ ...p, page: (p.page || 1) - 1 }))
              }
            >
              Önceki
            </button>
            <span className="text-sm">
              {data.meta.page} / {data.meta.totalPages}
            </span>
            <button
              className="px-3 py-1 text-sm border border-[var(--color-border)] rounded disabled:opacity-50"
              disabled={!data.meta.hasNextPage}
              onClick={() =>
                setQueryParams((p) => ({ ...p, page: (p.page || 1) + 1 }))
              }
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead || undefined}
        onSubmit={editingLead ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
