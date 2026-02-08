import { useState, useCallback, useMemo } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelineRental } from "../../types/pipeline.types";
import {
  recalculateRentalItem,
  generateTempId,
} from "../../utils/lineItemCalculations";
import { rentalItemsColumns } from "../../columnDefs/rentalItemsColumns";
import { CatalogSelectModal, type CatalogItem } from "../CatalogSelectModal/CatalogSelectModal";
import { useSoftwareProducts } from "../../../software-products";
import type { SoftwareProduct } from "../../../software-products";
import type { PipelineProductOption } from "../cellEditors/PipelineProductAutocompleteEditor";

type RentalItem = Partial<PipelineRental>;

interface RentalItemsTableProps {
  items: RentalItem[];
  onItemsChange: (items: RentalItem[]) => void;
  readOnly?: boolean;
}

const RECALC_FIELDS = new Set([
  "qty",
  "price",
  "vatRate",
  "discountRate",
  "rentPeriod",
  "invoicePeriod",
]);

export function RentalItemsTable({
  items,
  onItemsChange,
  readOnly = false,
}: RentalItemsTableProps) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: productsData } = useSoftwareProducts({
    isSaas: true,
    saleActive: true,
    limit: 10000,
    sortField: "name",
    sortOrder: "asc",
  });

  const products = useMemo<PipelineProductOption[]>(() => {
    return (productsData?.data ?? []).map(mapSoftwareProductOption);
  }, [productsData?.data]);

  const getProductName = useCallback(
    (productId: string) => {
      const found = products.find((p) => p.id === productId);
      return found?.nameWithCode || found?.friendlyName || found?.name || "";
    },
    [products],
  );

  const getProductIdByCatalog = useCallback(
    (catalogId: string) => {
      const found = products.find((p) => p._id === catalogId);
      return found?.id || "";
    },
    [products],
  );

  const handleCellValueChange = useCallback(
    (row: RentalItem, columnId: string, newValue: unknown) => {
      onItemsChange(
        items.map((item) => {
          if (item._id !== row._id) return item;
          const nextValue =
            columnId === "rentPeriod" || columnId === "invoicePeriod"
              ? Number(newValue) || 1
              : newValue;
          const nextName =
            columnId === "productId" && typeof nextValue === "string"
              ? getProductName(nextValue)
              : item.name;
          const updated = {
            ...item,
            [columnId]: nextValue,
            ...(columnId === "productId" ? { name: nextName } : {}),
            ...(columnId === "rentPeriod"
              ? { yearly: (Number(nextValue) || 1) >= 12 }
              : {}),
          };
          return RECALC_FIELDS.has(columnId)
            ? recalculateRentalItem(updated as any)
            : updated;
        }),
      );
    },
    [items, onItemsChange, getProductName],
  );

  const handleCatalogSelect = useCallback(
    (selected: CatalogItem[]) => {
      const newItems: RentalItem[] = selected.map((cat) =>
        recalculateRentalItem({
          _id: generateTempId(),
          catalogId: cat.catalogId,
          erpId: cat.erpId,
          pid: cat.pid || "",
          productId: getProductIdByCatalog(cat.catalogId),
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
          yearly: false,
          rentPeriod: 1,
          invoicePeriod: 12,
          discountRate: 0,
        } as any),
      );
      onItemsChange([...items, ...newItems]);
    },
    [items, onItemsChange, getProductIdByCatalog],
  );

  const createEmptyRow = useCallback(
    (): RentalItem =>
      recalculateRentalItem({
        _id: generateTempId(),
        catalogId: "",
        erpId: "",
        pid: "",
        productId: "",
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
        yearly: false,
        rentPeriod: 1,
        invoicePeriod: 12,
        discountRate: 0,
      } as any),
    [],
  );

  const handleNewRowsSave = useCallback(
    (newRows: RentalItem[]) => {
      onItemsChange([...items, ...newRows]);
    },
    [items, onItemsChange],
  );

  const handlePendingCellChange = useCallback(
    (row: RentalItem, columnId: string, newValue: unknown): RentalItem => {
      const nextValue =
        columnId === "rentPeriod" || columnId === "invoicePeriod"
          ? Number(newValue) || 1
          : newValue;
      const nextName =
        columnId === "productId" && typeof nextValue === "string"
          ? getProductName(nextValue)
          : row.name;
      const updated = {
        ...row,
        [columnId]: nextValue,
        ...(columnId === "productId" ? { name: nextName } : {}),
        ...(columnId === "rentPeriod"
          ? { yearly: (Number(nextValue) || 1) >= 12 }
          : {}),
      };
      return RECALC_FIELDS.has(columnId)
        ? (recalculateRentalItem(updated as any) as RentalItem)
        : updated;
    },
    [getProductName],
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    onItemsChange(items.filter((i) => i._id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, onItemsChange]);

  const handleRowClick = useCallback((row: RentalItem) => {
    setSelectedId(row._id || null);
  }, []);

  const toolbarConfig = useMemo<ToolbarConfig<RentalItem>>(() => {
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
        <Grid<RentalItem>
          data={items}
          columns={rentalItemsColumns}
          getRowId={(row) => row._id || ""}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={readOnly ? undefined : createEmptyRow}
          onNewRowSave={handleNewRowsSave}
          onPendingCellChange={handlePendingCellChange}
          context={{ products }}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>

      <CatalogSelectModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalogType="software-rental"
        onSelect={handleCatalogSelect}
      />
    </div>
  );
}

function mapSoftwareProductOption(product: SoftwareProduct): PipelineProductOption {
  return {
    _id: product._id,
    id: product.id,
    name: product.name || "",
    friendlyName: product.friendlyName || "",
    nameWithCode: product.nameWithCode || "",
  };
}
