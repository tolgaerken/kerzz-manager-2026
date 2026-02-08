import { useState, useCallback, useMemo } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelineLicense } from "../../types/pipeline.types";
import { recalculateItem, generateTempId } from "../../utils/lineItemCalculations";
import { licenseItemsColumns } from "../../columnDefs/licenseItemsColumns";
import { CatalogSelectModal, type CatalogItem } from "../CatalogSelectModal/CatalogSelectModal";

type LicenseItem = Partial<PipelineLicense>;

interface LicenseItemsTableProps {
  items: LicenseItem[];
  onItemsChange: (items: LicenseItem[]) => void;
  readOnly?: boolean;
}

const RECALC_FIELDS = new Set(["qty", "price", "vatRate", "discountRate"]);

export function LicenseItemsTable({
  items,
  onItemsChange,
  readOnly = false,
}: LicenseItemsTableProps) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCellValueChange = useCallback(
    (row: LicenseItem, columnId: string, newValue: unknown) => {
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
      const newItems: LicenseItem[] = selected.map((cat) =>
        recalculateItem({
          _id: generateTempId(),
          catalogId: cat.catalogId,
          erpId: cat.erpId,
          pid: cat.pid || "",
          name: cat.name,
          description: cat.description,
          type: cat.type || "",
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

  const handleAdd = useCallback(() => {
    const newItem: LicenseItem = recalculateItem({
      _id: generateTempId(),
      catalogId: "",
      erpId: "",
      pid: "",
      name: "",
      description: "",
      type: "",
      qty: 1,
      unit: "",
      purchasePrice: 0,
      salePrice: 0,
      price: 0,
      currency: "tl",
      vatRate: 0,
      discountRate: 0,
    } as any);
    onItemsChange([...items, newItem]);
  }, [items, onItemsChange]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    onItemsChange(items.filter((i) => i._id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, onItemsChange]);

  const handleRowClick = useCallback((row: LicenseItem) => {
    setSelectedId(row._id || null);
  }, []);

  const toolbarConfig = useMemo<ToolbarConfig<LicenseItem>>(() => {
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
      showAddRow: !readOnly,
      customButtons,
    };
  }, [readOnly, handleDelete, selectedId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<LicenseItem>
          data={items}
          columns={licenseItemsColumns}
          getRowId={(row) => row._id || ""}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          onRowAdd={readOnly ? undefined : handleAdd}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>

      <CatalogSelectModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalogType="software-license"
        onSelect={handleCatalogSelect}
      />
    </div>
  );
}
