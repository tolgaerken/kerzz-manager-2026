import { useState, useCallback, useMemo } from "react";
import { Trash2, FolderOpen, Key, Plus, Pencil } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelineLicense } from "../../types/pipeline.types";
import { recalculateItem, generateTempId } from "../../utils/lineItemCalculations";
import { licenseItemsColumns } from "../../columnDefs/licenseItemsColumns";
import { CatalogSelectModal, type CatalogItem } from "../CatalogSelectModal/CatalogSelectModal";
import { useSoftwareProducts } from "../../../software-products";
import type { SoftwareProduct } from "../../../software-products";
import type { PipelineProductOption } from "../cellEditors/PipelineProductAutocompleteEditor";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { LicenseItemFormModal } from "../ItemFormModals";

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
  const isMobile = useIsMobile();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LicenseItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: productsData } = useSoftwareProducts({
    isSaas: false,
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
    (row: LicenseItem, columnId: string, newValue: unknown) => {
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
      const newItems: LicenseItem[] = selected.map((cat) =>
        recalculateItem({
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
          discountRate: 0,
        } as any),
      );
      onItemsChange([...items, ...newItems]);
    },
    [items, onItemsChange, getProductIdByCatalog],
  );

  const createEmptyRow = useCallback(
    (): LicenseItem =>
      recalculateItem({
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
        discountRate: 0,
      } as any),
    [],
  );

  const handleNewRowsSave = useCallback(
    (newRows: LicenseItem[]) => {
      onItemsChange([...items, ...newRows]);
    },
    [items, onItemsChange],
  );

  const handlePendingCellChange = useCallback(
    (row: LicenseItem, columnId: string, newValue: unknown): LicenseItem => {
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
        ? (recalculateItem(updated as any) as LicenseItem)
        : updated;
    },
    [getProductName],
  );

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

  // Form submit handler
  const handleFormSubmit = useCallback(
    (item: LicenseItem) => {
      if (editingItem) {
        onItemsChange(items.map((i) => (i._id === item._id ? item : i)));
      } else {
        onItemsChange([...items, item]);
      }
      setEditingItem(null);
    },
    [items, onItemsChange, editingItem]
  );

  // Mobil kart görünümü
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Mobil toolbar */}
        {!readOnly && (
          <div className="flex gap-2 pb-3 shrink-0">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              Katalog
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Manuel Ekle
            </button>
          </div>
        )}

        {/* Mobil kart listesi */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-8 w-8 text-[var(--color-muted-foreground)] mb-2" />
              <p className="text-sm text-[var(--color-muted-foreground)]">Lisans bulunamadı</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {items.map((item, index) => (
                <LicenseMobileCard
                  key={item._id || `license-${index}`}
                  item={item}
                  onEdit={readOnly ? undefined : () => {
                    setEditingItem(item);
                    setIsFormOpen(true);
                  }}
                  onDelete={readOnly ? undefined : () => {
                    onItemsChange(items.filter((i) => i._id !== item._id));
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <CatalogSelectModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          catalogType="software-license"
          onSelect={handleCatalogSelect}
        />

        <LicenseItemFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          editItem={editingItem}
        />
      </div>
    );
  }

  // Desktop grid görünümü
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<LicenseItem>
          data={items}
          columns={licenseItemsColumns}
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
        catalogType="software-license"
        onSelect={handleCatalogSelect}
      />
    </div>
  );
}

// Mobil lisans kartı bileşeni
interface LicenseMobileCardProps {
  item: Partial<PipelineLicense>;
  onEdit?: () => void;
  onDelete?: () => void;
}

function LicenseMobileCard({ item, onEdit, onDelete }: LicenseMobileCardProps) {
  const formatCurrency = (value: number | undefined, currency?: string) => {
    if (value === undefined || value === null) return "-";
    const curr = currency?.toUpperCase() || "TRY";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: curr === "TL" ? "TRY" : curr,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div 
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="rounded-full bg-[var(--color-info)]/10 p-1.5 shrink-0">
            <Key className="h-3.5 w-3.5 text-[var(--color-info)]" />
          </div>
          <span className="font-medium text-sm text-[var(--color-foreground)] truncate">
            {item.name || "-"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-md text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {item.type && (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)] mb-2">
          {item.type}
        </span>
      )}
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-[var(--color-muted-foreground)]">Miktar</span>
          <span className="text-[var(--color-foreground)] font-medium">
            {item.qty || 0} {item.unit || ""}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[var(--color-muted-foreground)]">Birim Fiyat</span>
          <span className="text-[var(--color-foreground)] font-medium">
            {formatCurrency(item.price, item.currency)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[var(--color-muted-foreground)]">KDV %</span>
          <span className="text-[var(--color-foreground)] font-medium">
            {item.vatRate || 0}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[var(--color-muted-foreground)]">Toplam</span>
          <span className="text-[var(--color-info)] font-semibold">
            {formatCurrency(item.grandTotal, item.currency)}
          </span>
        </div>
      </div>
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
