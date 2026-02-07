import { useState, useCallback, useMemo } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Grid, type ToolbarButtonConfig, type ToolbarConfig } from "@kerzz/grid";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "./ProductAutocompleteEditor";
import { licenseItemColumns } from "./licenseItemColumns";

interface LicenseItemsGridProps {
  /** Mevcut lisans öğeleri */
  items: LicenseItem[];
  /** Öğe listesi değiştiğinde çağrılır */
  onItemsChange: (items: LicenseItem[]) => void;
  /** Ürün seçenekleri (software products) */
  products: ProductOption[];
  /** Yükleniyor durumu */
  loading?: boolean;
}

/**
 * Lisans modülleri ve SaaS öğeleri için paylaşılan düzenlenebilir grid bileşeni.
 * Ekleme, silme ve hücre düzenleme işlemlerini yönetir.
 */
export function LicenseItemsGrid({
  items,
  onItemsChange,
  products,
  loading = false
}: LicenseItemsGridProps) {
  const [selectedRow, setSelectedRow] = useState<LicenseItem | null>(null);

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
    qty: 1
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
        const product = products.find((p) => p.id === newValue);
        if (product) {
          updated.name = product.name;
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
        const product = products.find((p) => p.id === newValue);
        if (product) {
          updated = updated.map((item) =>
            item.id === row.id ? { ...item, name: product.name } : item
          );
        }
      }

      onItemsChange(updated);
    },
    [items, onItemsChange, products]
  );

  // Satır seçme
  const handleRowClick = useCallback((row: LicenseItem) => {
    setSelectedRow(row);
  }, []);

  // Seçili satırı silme
  const handleDelete = useCallback(() => {
    if (selectedRow) {
      onItemsChange(items.filter((item) => item.id !== selectedRow.id));
      setSelectedRow(null);
    }
  }, [items, selectedRow, onItemsChange]);

  // Toolbar yapılandırması
  const toolbarConfig = useMemo<ToolbarConfig<LicenseItem>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !selectedRow,
        variant: "danger"
      }
    ];

    return {
      showSearch: true,
      showExcelExport: false,
      showPdfExport: false,
      showColumnVisibility: false,
      showAddRow: true,
      customButtons
    };
  }, [handleDelete, selectedRow]);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
      <Grid<LicenseItem>
        data={items}
        columns={licenseItemColumns}
        getRowId={(row) => row.id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        createEmptyRow={createEmptyRow}
        onNewRowSave={handleNewRowSave}
        onPendingCellChange={handlePendingCellChange}
        context={gridContext}
        height="100%"
        locale="tr"
        toolbar={toolbarConfig}
        selectionMode="single"
      />
    </div>
  );
}
