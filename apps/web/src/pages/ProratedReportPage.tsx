import { useState, useMemo, useCallback, useEffect } from "react";
import { Calculator, Trash2 } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import toast from "react-hot-toast";
import {
  ProratedReportGrid,
  ProratedReportFilters,
  useRemoveProratedReportItem,
  useProratedReport,
} from "../features/prorated-report";
import type { ProratedReportFilter } from "../features/prorated-report";

export function ProratedReportPage() {
  const [filter, setFilter] = useState<ProratedReportFilter>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useProratedReport(filter);
  const { mutateAsync: removeProratedItem } = useRemoveProratedReportItem();

  const plans = response?.data ?? [];

  const totalAmount = useMemo(
    () => plans.reduce((sum, p) => sum + (p.total || 0), 0),
    [plans],
  );

  const selectedPlans = useMemo(() => {
    if (selectedIds.length === 0) return [];
    return plans.filter((plan) => selectedIds.includes(plan.id || plan._id));
  }, [plans, selectedIds]);

  const removablePlans = useMemo(
    () => selectedPlans.filter((plan) => !plan.invoiceNo),
    [selectedPlans],
  );
  const invoicedSelectedCount = selectedPlans.length - removablePlans.length;

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => plans.some((plan) => (plan.id || plan._id) === id)),
    );
  }, [plans]);

  const handleRefresh = () => {
    void refetch();
  };

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleRemoveSelected = useCallback(async () => {
    if (selectedPlans.length === 0) {
      toast.error("Önce en az bir kayıt seçin.");
      return;
    }

    if (removablePlans.length === 0) {
      toast.error("Seçili kayıtların tamamı faturalanmış, kısttan çıkarılamaz.");
      return;
    }

    const shouldRemove = window.confirm(
      `${removablePlans.length} kayıt kısttan çıkarılacak. Devam edilsin mi?`,
    );
    if (!shouldRemove) return;

    setIsRemoving(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const row of removablePlans) {
        try {
          await removeProratedItem(row.id);
          successCount += 1;
        } catch {
          failCount += 1;
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} kayıt kısttan çıkarıldı.`);
      } else if (successCount > 0 || failCount > 0) {
        toast.error(
          `Kısmi sonuç: ${successCount} başarılı, ${failCount} başarısız.`,
        );
      }

      if (invoicedSelectedCount > 0) {
        toast.error(
          `${invoicedSelectedCount} faturalanmış kayıt işlem dışı bırakıldı.`,
        );
      }
    } finally {
      setSelectedIds([]);
      setIsRemoving(false);
    }
  }, [
    selectedPlans.length,
    removablePlans,
    removeProratedItem,
    invoicedSelectedCount,
  ]);

  const toolbarButtons = useMemo<ToolbarButtonConfig[]>(
    () => [
      {
        id: "remove-selected-prorated",
        label: "Kısttan Çıkar",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        onClick: () => {
          void handleRemoveSelected();
        },
        disabled: selectedPlans.length === 0 || isRemoving,
        variant: "danger",
      },
    ],
    [handleRemoveSelected, selectedPlans.length, isRemoving],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 md:px-6 md:pt-6">
        <Calculator className="h-5 w-5 text-[var(--color-primary)]" />
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
          Kıst Raporu
        </h1>
      </div>

      {/* Filtreler + Özet */}
      <div className="px-3 pb-2 md:px-6">
        <ProratedReportFilters
          filter={filter}
          onChange={setFilter}
          onRefresh={handleRefresh}
          refreshing={isFetching}
          totalCount={plans.length}
          totalAmount={totalAmount}
        />
      </div>

      {/* Grid */}
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 md:px-6 md:pb-6">
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <ProratedReportGrid
            data={plans}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            toolbarButtons={toolbarButtons}
          />
        </div>
      </div>
    </div>
  );
}
