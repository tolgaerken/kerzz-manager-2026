import { useState, useCallback, useMemo } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelineProduct } from "../../types/pipeline.types";
import { recalculateItem, generateTempId } from "../../utils/lineItemCalculations";
import { productItemsColumns } from "../../columnDefs/productItemsColumns";
import { CatalogSelectModal, type CatalogItem } from "../CatalogSelectModal/CatalogSelectModal";
import { useHardwareProducts } from "../../../hardware-products";
import type { HardwareProduct } from "../../../hardware-products";
import type { PipelineProductOption } from "../cellEditors/PipelineProductAutocompleteEditor";

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
  const { data: productsData } = useHardwareProducts({
    saleActive: true,
    limit: 10000,
    sortField: "name",
    sortOrder: "asc",
  });

  const products = useMemo<PipelineProductOption[]>(() => {
    return (productsData?.data ?? []).map(mapHardwareProductOption);
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
    (row: ProductItem, columnId: string, newValue: unknown) => {
      onItemsChange(
        items.map((item) => {
          if (item._id !== row._id) return item;
          const nextName =
            columnId === "productId" && typeof newValue === "string"
              ? getProductName(newValue)
              : item.name;
          const updated = {
            ...item,
            [columnId]: newValue,
            ...(columnId === "productId" ? { name: nextName } : {}),
          };
          return RECALC_FIELDS.has(columnId)
            ? recalculateItem(updated as any)
            : updated;
        }),
      );
    },
    [items, onItemsChange, getProductName],
  );

  const handleCatalogSelect = useCallback(
    (selected: CatalogItem[]) => {
      const newItems: ProductItem[] = selected.map((cat) =>
        recalculateItem({
          _id: generateTempId(),
          catalogId: cat.catalogId,
          erpId: cat.erpId,
          productId: getProductIdByCatalog(cat.catalogId),
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
    [items, onItemsChange, getProductIdByCatalog],
  );

  const createEmptyRow = useCallback(
    (): ProductItem =>
      recalculateItem({
        _id: generateTempId(),
        catalogId: "",
        erpId: "",
        productId: "",
        name: "",
        description: "",
        qty: 1,
        unit: "",
        purchasePrice: 0,
        salePrice: 0,
        price: 0,
        currency: "tl",
        vatRate: 0,
        discountRate: 0,
      } as any),
    [],
  );

  const handleNewRowsSave = useCallback(
    (newRows: ProductItem[]) => {
      onItemsChange([...items, ...newRows]);
    },
    [items, onItemsChange],
  );

  const handlePendingCellChange = useCallback(
    (row: ProductItem, columnId: string, newValue: unknown): ProductItem => {
      const nextName =
        columnId === "productId" && typeof newValue === "string"
          ? getProductName(newValue)
          : row.name;
      const updated = {
        ...row,
        [columnId]: newValue,
        ...(columnId === "productId" ? { name: nextName } : {}),
      };
      return RECALC_FIELDS.has(columnId)
        ? (recalculateItem(updated as any) as ProductItem)
        : updated;
    },
    [getProductName],
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
      showAddRow: !readOnly,
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
        catalogType="hardware"
        onSelect={handleCatalogSelect}
      />
    </div>
  );
}

function mapHardwareProductOption(product: HardwareProduct): PipelineProductOption {
  return {
    _id: product._id,
    id: product.id,
    name: product.name || "",
    friendlyName: product.friendlyName || "",
    nameWithCode: "",
  };
}
