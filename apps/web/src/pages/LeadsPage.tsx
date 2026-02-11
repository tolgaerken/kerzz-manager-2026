import { useState, useCallback, useMemo } from "react";
import { CalendarDays, MessageSquare, Plus, RefreshCw, Repeat, UserPlus } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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
import { useConvertLeadToOffer, useRevertLeadToOffer } from "../features/pipeline/hooks/usePipelineItems";
import { useLogPanelStore } from "../features/manager-log";

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

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data, isLoading, isFetching, refetch } = useLeads(queryParams);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLeadToOffer();
  const revertMutation = useRevertLeadToOffer();
  const { openPipelinePanel } = useLogPanelStore();

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

  const handleConvertLead = useCallback(async () => {
    if (!selectedLead) return;
    await convertMutation.mutateAsync({ leadId: selectedLead._id });
    await refetch();
  }, [convertMutation, selectedLead, refetch]);

  const handleRevertLead = useCallback(async () => {
    if (!selectedLead) return;
    await revertMutation.mutateAsync(selectedLead._id);
    await refetch();
  }, [revertMutation, selectedLead, refetch]);

  const handleOpenLogs = useCallback(() => {
    if (!selectedLead) return;
    openPipelinePanel({
      pipelineRef: selectedLead.pipelineRef,
      customerId: selectedLead.customerId,
      leadId: selectedLead._id,
      title: `Lead: ${selectedLead.contactName || selectedLead.companyName || selectedLead.pipelineRef}`,
    });
  }, [selectedLead, openPipelinePanel]);


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
      id: "add",
      label: "Yeni Lead",
      icon: <Plus size={14} />,
      onClick: () => {
        setEditingLead(null);
        setIsFormOpen(true);
      },
    },
    {
      id: "logs",
      label: "Loglar",
      icon: <MessageSquare size={14} />,
      onClick: handleOpenLogs,
      disabled: !selectedLead,
    },
    {
      id: "convert",
      label: "Teklife Çevir",
      icon: <Repeat size={14} />,
      onClick: handleConvertLead,
      variant: "primary",
      disabled:
        !selectedLead ||
        selectedLead.status === "converted" ||
        selectedLead.status === "lost" ||
        convertMutation.isPending,
    },
    {
      id: "revert",
      label: "Tekliften Geri Al",
      icon: <Repeat size={14} />,
      onClick: handleRevertLead,
      disabled:
        !selectedLead ||
        selectedLead.status !== "converted" ||
        revertMutation.isPending,
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
    icon: <UserPlus className="h-5 w-5" />,
    title: "Potansiyeller (Leads)",
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
              setQueryParams((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))
            }
            className="bg-transparent text-xs font-medium text-foreground outline-none"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={queryParams.endDate ?? ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))
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
            setEditingLead(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Lead
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
            setEditingLead(null);
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
      <LeadsFilters filters={queryParams} onFilterChange={handleFilterChange} />
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
          <LeadsGrid
            data={data?.data || []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChanged={setSelectedLead}
            toolbarButtons={toolbarButtons}
          />
        </div>

        {/* Pagination */}
        {data?.meta && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              Toplam: {data.meta.total} kayıt
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
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
                className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
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
      </div>

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
