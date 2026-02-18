import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Tags, RefreshCw } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  CustomerSegmentsGrid,
  CustomerSegmentFormModal,
  DeleteSegmentConfirmModal,
  useCustomerSegments,
  useCreateCustomerSegment,
  useUpdateCustomerSegment,
  useDeleteCustomerSegment,
  CUSTOMER_SEGMENTS_CONSTANTS
} from "../features/customer-segments";
import type {
  CustomerSegment,
  CustomerSegmentQueryParams,
  CreateCustomerSegmentInput,
  UpdateCustomerSegmentInput
} from "../features/customer-segments";

export function CustomerSegmentsPage() {
  const [queryParams, setQueryParams] = useState<CustomerSegmentQueryParams>({
    page: 1,
    limit: CUSTOMER_SEGMENTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    sortField: "name",
    sortOrder: "asc"
  });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] =
    useState<CustomerSegment | null>(null);

  const { data, isLoading, error, refetch, isFetching } =
    useCustomerSegments(queryParams);
  const createMutation = useCreateCustomerSegment();
  const updateMutation = useUpdateCustomerSegment();
  const deleteMutation = useDeleteCustomerSegment();

  const collapsible = CollapsibleSection({
    icon: <Tags className="h-5 w-5" />,
    title: "Müşteri Segmentleri",
    count: data?.meta.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Yenile
        </button>
        <button
          onClick={() => {
            setSelectedSegment(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Segment
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
        <button
          onClick={() => {
            setSelectedSegment(null);
            setIsFormModalOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: null
  });

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setIsFormModalOpen(true);
  }, []);

  const handleEditClick = useCallback((segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setIsDeleteModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateCustomerSegmentInput | UpdateCustomerSegmentInput) => {
      if (selectedSegment) {
        updateMutation.mutate(
          { id: selectedSegment._id, input: formData },
          {
            onSuccess: () => {
              setIsFormModalOpen(false);
              setSelectedSegment(null);
            }
          }
        );
      } else {
        createMutation.mutate(formData as CreateCustomerSegmentInput, {
          onSuccess: () => {
            setIsFormModalOpen(false);
          }
        });
      }
    },
    [selectedSegment, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedSegment) {
      deleteMutation.mutate(selectedSegment._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedSegment(null);
        }
      });
    }
  }, [selectedSegment, deleteMutation]);

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedSegment(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedSegment(null);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {error && (
          <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-[var(--color-error)]">
            <div>
              <p className="font-medium">Veri yüklenirken hata oluştu</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="ml-auto rounded-lg border border-[var(--color-error)]/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-error)]/20"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface">
          <CustomerSegmentsGrid
            data={data?.data || []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
      </div>

      {selectedSegment && !isFormModalOpen && !isDeleteModalOpen && (
        <div className="fixed bottom-20 right-6 flex gap-2">
          <button
            onClick={() => handleEditClick(selectedSegment)}
            className="rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-colors hover:bg-primary-hover"
            title="Düzenle"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(selectedSegment)}
            className="rounded-full bg-[var(--color-error)] p-2 text-[var(--color-error-foreground)] shadow-lg transition-opacity hover:opacity-90"
            title="Sil"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <CustomerSegmentFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        segment={selectedSegment}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteSegmentConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        segment={selectedSegment}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
