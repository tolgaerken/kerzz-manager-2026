import { useState, useMemo, useCallback } from "react";
import { FileQuestion } from "lucide-react";
import {
  UninvoicedItemsGrid,
  UninvoicedItemsSummaryCards,
  UninvoicedItemsDateFilter,
  useAllUninvoicedItems,
} from "../features/uninvoiced-items";
import type {
  UninvoicedItemCategory,
  UninvoicedItem,
  DateRangeFilter,
} from "../features/uninvoiced-items";
import { ContractDetailModal } from "../features/contracts/components/ContractDetailModal/ContractDetailModal";
import { useContractById } from "../features/contracts/hooks/useContracts";

/** Kategori -> ContractDetailModal tab eşleştirmesi */
const CATEGORY_TO_TAB: Record<UninvoicedItemCategory, string> = {
  eftpos: "cash-registers",
  saas: "saas",
  support: "supports",
  item: "items",
  version: "versions",
};

export function UninvoicedItemsPage() {
  const [selectedCategory, setSelectedCategory] = useState<UninvoicedItemCategory | "all">("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeFilter>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectContractId, setInspectContractId] = useState<string | null>(null);
  const [inspectTab, setInspectTab] = useState<string>("summary");

  const { data: summary, isLoading } = useAllUninvoicedItems(appliedDateRange);
  const { data: inspectContract } = useContractById(inspectContractId ?? undefined);

  // Tarih aralığı seçildi mi?
  const hasDateFilter = !!(dateRange.startDate || dateRange.endDate);
  // Veri getirildi mi?
  const hasAppliedFilter = !!(appliedDateRange.startDate || appliedDateRange.endDate);

  // Verileri getir butonuna basıldığında
  const handleFetch = () => {
    setAppliedDateRange(dateRange);
  };

  // Seçili kategoriye göre filtrelenmiş liste
  const filteredItems = useMemo<UninvoicedItem[]>(() => {
    if (!summary) return [];

    if (selectedCategory === "all") {
      return [
        ...summary.eftpos,
        ...summary.saas,
        ...summary.support,
        ...summary.item,
        ...summary.version,
      ];
    }

    return summary[selectedCategory] ?? [];
  }, [summary, selectedCategory]);

  // İnceleme butonuna tıklandığında
  const handleInspect = useCallback((item: UninvoicedItem) => {
    setInspectContractId(item.contractId);
    setInspectTab(CATEGORY_TO_TAB[item.category] || "summary");
  }, []);

  // Satıra çift tıklandığında
  const handleRowDoubleClick = useCallback((item: UninvoicedItem) => {
    handleInspect(item);
  }, [handleInspect]);

  // Modal kapatıldığında
  const handleCloseModal = useCallback(() => {
    setInspectContractId(null);
  }, []);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileQuestion className="h-5 w-5 text-[var(--color-primary)]" />
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
          Faturaya Dahil Edilmemiş Kalemler
        </h1>
      </div>

      {/* Tarih Filtresi */}
      <UninvoicedItemsDateFilter
        dateRange={dateRange}
        onChange={setDateRange}
        onFetch={handleFetch}
        loading={isLoading}
      />

      {/* Özet Kartları - sadece veri getirildikten sonra göster */}
      {hasAppliedFilter && (
        <UninvoicedItemsSummaryCards
          summary={summary}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Tarih seçilmedi uyarısı */}
      {!hasAppliedFilter && (
        <div className="rounded-lg border border-[var(--color-info)]/30 bg-[var(--color-info)]/10 p-4 text-sm text-[var(--color-foreground)]">
          <strong>Bilgi:</strong> Listeyi görüntülemek için tarih aralığı seçin ve "Verileri Getir" butonuna tıklayın.
          Kalemler oluşturma tarihine göre filtrelenecektir.
        </div>
      )}

      {/* Bilgi Notu */}
      {hasAppliedFilter && summary && summary.total > 0 && (
        <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-3 text-sm text-[var(--color-foreground)]">
          <strong>Not:</strong> Bu liste, aktif (enabled) olup henüz hiçbir faturaya dahil edilmemiş
          kontrat kalemlerini gösterir. Kıst planları, normal ödeme planları ve legacy veriler
          kontrol edilmiştir.
        </div>
      )}

      {/* Grid - sadece veri getirildikten sonra göster */}
      {hasAppliedFilter && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <UninvoicedItemsGrid
            data={filteredItems}
            loading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowDoubleClick={handleRowDoubleClick}
            onInspect={handleInspect}
          />
        </div>
      )}

      {/* Kontrat Detay Modal */}
      {inspectContract && (
        <ContractDetailModal
          isOpen={!!inspectContractId}
          onClose={handleCloseModal}
          contract={inspectContract}
          initialTab={inspectTab}
        />
      )}
    </div>
  );
}
