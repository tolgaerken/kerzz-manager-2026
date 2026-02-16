import { useState, useCallback, useMemo } from "react";
import { MessageSquarePlus, Plus, RefreshCw } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  useFeedbacks,
  useCreateFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
} from "../features/feedback/hooks/useFeedbacks";
import { FeedbackGrid } from "../features/feedback/components/FeedbackGrid";
import { FeedbackFormModal } from "../features/feedback/components/FeedbackFormModal";
import type {
  Feedback,
  FeedbackQueryParams,
  CreateFeedbackInput,
  UpdateFeedbackInput,
  FeedbackStatus,
  FeedbackPriority,
} from "../features/feedback/types/feedback.types";
import { STATUS_LABELS, PRIORITY_LABELS } from "../features/feedback/types/feedback.types";

export function FeedbackPage() {
  const [queryParams, setQueryParams] = useState<FeedbackQueryParams>({
    page: 1,
    limit: 50,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { data, isLoading, isFetching, refetch } = useFeedbacks(queryParams);
  const createMutation = useCreateFeedback();
  const updateMutation = useUpdateFeedback();
  const deleteMutation = useDeleteFeedback();

  const handleFilterChange = useCallback(
    (field: keyof FeedbackQueryParams, value: string) => {
      setQueryParams((prev) => ({
        ...prev,
        [field]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const handleSortChange = useCallback(
    (field: string, order: "asc" | "desc") => {
      setQueryParams((prev) => ({
        ...prev,
        sortField: field,
        sortOrder: order,
      }));
    },
    [],
  );

  const handleRowDoubleClick = useCallback((feedback: Feedback) => {
    setEditingFeedback(feedback);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (input: CreateFeedbackInput | UpdateFeedbackInput) => {
      if (editingFeedback) {
        await updateMutation.mutateAsync({
          id: editingFeedback.id,
          data: input as UpdateFeedbackInput,
        });
        setEditingFeedback(null);
      } else {
        await createMutation.mutateAsync(input as CreateFeedbackInput);
      }
      setIsFormOpen(false);
    },
    [editingFeedback, createMutation, updateMutation],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedFeedback) return;
    if (!window.confirm("Bu geribildirimi silmek istediğinizden emin misiniz?")) {
      return;
    }
    await deleteMutation.mutateAsync(selectedFeedback.id);
    setSelectedFeedback(null);
  }, [selectedFeedback, deleteMutation]);

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni Geribildirim",
        icon: <Plus size={14} />,
        onClick: () => {
          setEditingFeedback(null);
          setIsFormOpen(true);
        },
      },
      {
        id: "delete",
        label: "Sil",
        icon: <RefreshCw size={14} />,
        onClick: handleDelete,
        disabled: !selectedFeedback || deleteMutation.isPending,
        variant: "danger",
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={14} />,
        onClick: () => refetch(),
      },
    ],
    [selectedFeedback, deleteMutation.isPending, handleDelete, refetch],
  );

  const collapsible = CollapsibleSection({
    icon: <MessageSquarePlus className="h-5 w-5" />,
    title: "Geribildirimler",
    count: data?.meta?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`}
          />
          Yenile
        </button>
        <button
          onClick={() => {
            setEditingFeedback(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Geribildirim
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
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`}
          />
        </button>
        <button
          onClick={() => {
            setEditingFeedback(null);
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
      <div className="flex flex-wrap gap-3">
        {/* Durum Filtresi */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Durum
          </label>
          <select
            value={queryParams.status || "all"}
            onChange={(e) =>
              handleFilterChange("status", e.target.value as FeedbackStatus | "all")
            }
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tümü</option>
            {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {/* Öncelik Filtresi */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Öncelik
          </label>
          <select
            value={queryParams.priority || "all"}
            onChange={(e) =>
              handleFilterChange("priority", e.target.value as FeedbackPriority | "all")
            }
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tümü</option>
            {(Object.keys(PRIORITY_LABELS) as FeedbackPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        {/* Arama */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Arama
          </label>
          <input
            type="text"
            placeholder="Başlık veya açıklama..."
            value={queryParams.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
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
          <FeedbackGrid
            data={data?.data || []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChanged={setSelectedFeedback}
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

      <FeedbackFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFeedback(null);
        }}
        feedback={editingFeedback || undefined}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
