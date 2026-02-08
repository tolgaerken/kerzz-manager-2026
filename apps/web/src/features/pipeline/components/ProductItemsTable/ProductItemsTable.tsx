import { useState, useCallback, useMemo } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelineProduct } from "../../types/pipeline.types";
import { recalculateItem, generateTempId } from "../../utils/lineItemCalculations";
import { productItemsColumns } from "../../columnDefs/productItemsColumns";
import { CatalogSelectModal, type CatalogItem } from "../CatalogSelectModal/CatalogSelectModal";

type ProductItem = Partial<PipelineProduct>;

interface ProductItemsTableProps {
  items: ProductItem[];
  onItemsChange: (items: ProductItem[]) => void;
  readOnly?: boolean;
}

const RECALC_FIELDS = new Set(["qty", "price", "vatRate", "discountRate"]);

export function ProductItemsTable({
  items,
  onItemsChange,
  readOnly = false,
}: ProductItemsTableProps) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCellValueChange = useCallback(
    (row: ProductItem, columnId: string, newValue: unknown) => {
      onItemsChange(
        items.map((item) => {
          if (item._id !== row._id) return item;
          const updated = { ...item, [columnId]: newValue };
          return RECALC_FIELDS.has(columnId)
            ? recalculateItem(updated as any)
            : updated;
        }),
      );
    },
    [items, onItemsChange],
  );

  const handleCatalogSelect = useCallback(
    (selected: CatalogItem[]) => {
      const newItems: ProductItem[] = selected.map((cat) =>
        recalculateItem({
          _id: generateTempId(),
          catalogId: cat.catalogId,
          erpId: cat.erpId,
          name: cat.name,
          description: cat.description,
          qty: 1,
          unit: cat.unit,
          purchasePrice: cat.purchasePrice,
          salePrice: cat.salePrice,
          price: cat.price,
          currency: cat.currency,
          vatRate: cat.vatRate,
          discountRate: 0,
        } as any),
      );
      onItemsChange([...items, ...newItems]);
    },
    [items, onItemsChange],
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    onItemsChange(items.filter((i) => i._id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, onItemsChange]);

  const handleRowClick = useCallback((row: ProductItem) => {
    setSelectedId(row._id || null);
  }, []);

  const toolbarConfig = useMemo<ToolbarConfig<ProductItem>>(() => {
    const customButtons: ToolbarButtonConfig[] = [];

    if (!readOnly) {
      customButtons.push(
        {
          id: "catalog",
          label: "Katalogdan Ekle",
          icon: <FolderOpen className="w-3.5 h-3.5" />,
          onClick: () => setIsCatalogOpen(true),
          variant: "primary",
        },
        {
          id: "delete",
          label: "Sil",
          icon: <Trash2 className="w-3.5 h-3.5" />,
          onClick: handleDelete,
          disabled: !selectedId,
          variant: "danger",
        },
      );
    }

    return {
      showSearch: false,
      showExcelExport: false,
      showPdfExport: false,
      showColumnVisibility: false,
      showAddRow: false,
      customButtons,
    };
  }, [readOnly, handleDelete, selectedId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ProductItem>
          data={items}
          columns={productItemsColumns}
          getRowId={(row) => row._id || ""}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>

      <CatalogSelectModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalogType="hardware"
        onSelect={handleCatalogSelect}
      />
    </div>
  );
}
