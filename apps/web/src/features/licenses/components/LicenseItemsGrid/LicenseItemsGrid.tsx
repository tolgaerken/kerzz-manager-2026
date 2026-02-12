import { useState, useCallback, useMemo } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Grid, type ToolbarButtonConfig, type ToolbarConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "./ProductAutocompleteEditor";
import { licenseItemColumns } from "./licenseItemColumns";
import { LicenseItemMobileList } from "./LicenseItemMobileList";

interface LicenseItemsGridProps {
  /** Mevcut lisans öğeleri */
  items: LicenseItem[];
  /** Öğe listesi değiştiğinde çağrılır */
  onItemsChange: (items: LicenseItem[]) => void;
  /** Ürün seçenekleri (software products) */
  products: ProductOption[];
  /** Yükleniyor durumu */
  loading?: boolean;
  /** Seçim modu: 'none' | 'single' | 'multiple' (varsayılan: 'multiple') */
  selectionMode?: "none" | "single" | "multiple";
  /** Silme işlemine izin verilip verilmeyeceği (varsayılan: false) */
  allowDelete?: boolean;
}

/**
 * Lisans modülleri ve SaaS öğeleri için paylaşılan düzenlenebilir grid bileşeni.
 * Ekleme, silme ve hücre düzenleme işlemlerini yönetir.
 */
export function LicenseItemsGrid({
  items,
  onItemsChange,
  products,
  loading = false,
  selectionMode = "multiple",
  allowDelete = false
}: LicenseItemsGridProps) {
  const isMobile = useIsMobile();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Grid'in selection change callback'i
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // Grid context: ürün listesini column renderer'a iletir
  const gridContext = useMemo(
    () => ({ products }),
    [products]
  );

  // Deferred new row: boş satır oluşturucu
  const createEmptyRow = useCallback((): LicenseItem => ({
    id: crypto.randomUUID(),
    moduleId: "",
    name: "",
    qty: 1,
    productId: ""
  }), []);

  // Kaydet tıklandığında pending satırları ekle
  const handleNewRowSave = useCallback((rows: LicenseItem[]) => {
    onItemsChange([...items, ...rows]);
  }, [items, onItemsChange]);

  // Pending satırdaki hücre değişikliği (moduleId -> name ilişkisi)
  const handlePendingCellChange = useCallback(
    (row: LicenseItem, columnId: string, newValue: unknown): LicenseItem => {
      const updated = { ...row, [columnId]: newValue };
      if (columnId === "moduleId") {
        const valStr = String(newValue);
        const product = products.find(
          (p) =>
            String(parseInt(p.pid, 10)) === valStr ||
            p.pid === valStr ||
            p.id === valStr ||
            p._id === valStr
        );
        if (product) {
          updated.name = product.name;
          updated.productId = product.id;
        }
      }
      return updated;
    },
    [products]
  );

  // Hücre değeri değiştiğinde
  const handleCellValueChange = useCallback(
    (row: LicenseItem, columnId: string, newValue: unknown) => {
      let updated = items.map((item) =>
        item.id === row.id ? { ...item, [columnId]: newValue } : item
      );

      // moduleId değiştiğinde, ürün adını da güncelle
      if (columnId === "moduleId") {
        const valStr = String(newValue);
        const product = products.find(
          (p) =>
            String(parseInt(p.pid, 10)) === valStr ||
            p.pid === valStr ||
            p.id === valStr ||
            p._id === valStr
        );
        if (product) {
          updated = updated.map((item) =>
            item.id === row.id ? { ...item, name: product.name, productId: product.id } : item
          );
        }
      }

      onItemsChange(updated);
    },
    [items, onItemsChange, products]
  );

  // Seçili satırları silme (çoklu silme desteği)
  const handleDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      onItemsChange(items.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    }
  }, [items, selectedIds, onItemsChange]);

  // Buton etiketi: tekse "Sil", çokluysa "Sil (N)"
  const deleteLabel = selectedIds.length > 1
    ? `Sil (${selectedIds.length})`
    : "Sil";

  // Toolbar yapılandırması
  const toolbarConfig = useMemo<ToolbarConfig<LicenseItem>>(() => {
    const customButtons: ToolbarButtonConfig[] = [];

    // Sadece allowDelete true ise silme butonu ekle
    if (allowDelete) {
      customButtons.push({
        id: "delete",
        label: deleteLabel,
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: selectedIds.length === 0,
        variant: "danger"
      });
    }

    return {
      showSearch: true,
      showExcelExport: false,
      showPdfExport: false,
      showColumnVisibility: false,
      showAddRow: true,
      customButtons
    };
  }, [allowDelete, deleteLabel, handleDelete, selectedIds.length]);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  // Mobil görünüm
  if (isMobile) {
    return (
      <div className="flex-1 min-h-0">
        <LicenseItemMobileList
          items={items}
          products={products}
          loading={loading}
          allowDelete={allowDelete}
          onItemsChange={onItemsChange}
        />
      </div>
    );
  }

  // Desktop grid görünümü
  return (
    <div className="flex-1 min-h-0">
      <Grid<LicenseItem>
        data={items}
        columns={licenseItemColumns}
        getRowId={(row) => row.id}
        onCellValueChange={handleCellValueChange}
        selectionMode={selectionMode}
        selectionCheckbox={selectionMode === "multiple"}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        createEmptyRow={createEmptyRow}
        onNewRowSave={handleNewRowSave}
        onPendingCellChange={handlePendingCellChange}
        context={gridContext}
        height="100%"
        locale="tr"
        toolbar={toolbarConfig}
      />
    </div>
  );
}
