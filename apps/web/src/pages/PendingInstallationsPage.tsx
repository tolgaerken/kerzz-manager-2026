import { useState, useCallback, useMemo } from "react";
import { Package, RefreshCw, AlertCircle, Eye, Loader2 } from "lucide-react";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import {
  usePendingInstallations,
  ContractDetailModal,
  type Contract,
  type PendingInstallationItem,
  type PendingInstallationType
} from "../features/contracts";
import { useCustomerLookup } from "../features/lookup";
import { fetchContractById } from "../features/contracts/api/contractsApi";

// Type badge renkleri (tema değişkenleri ile)
const TYPE_STYLES: Record<PendingInstallationType, { bg: string; text: string; label: string }> = {
  "cash-register": {
    bg: "bg-[var(--color-warning)]/10",
    text: "text-[var(--color-warning)]",
    label: "Yazarkasa"
  },
  saas: {
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
    label: "SaaS"
  },
  support: {
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
    label: "Destek"
  }
};

// Tab ID mapping (type -> modal tab)
const TYPE_TO_TAB: Record<PendingInstallationType, string> = {
  "cash-register": "cash-registers",
  saas: "saas",
  support: "supports"
};

// Para birimi formatter
function formatCurrency(value: number, currency: string): string {
  const currencyMap: Record<string, string> = {
    tl: "TRY",
    usd: "USD",
    eur: "EUR"
  };

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY",
    minimumFractionDigits: 2
  }).format(value);
}

// Tarih formatter
function formatDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(value as string);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function PendingInstallationsPage() {
  // Modal state
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  // Selection state
  const [selectedItem, setSelectedItem] = useState<PendingInstallationItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Data fetching
  const { data, isLoading, isError, error, refetch, isFetching } = usePendingInstallations();

  // Customer lookup
  const { customerMap } = useCustomerLookup();

  // Müşteri adlarını ekle
  const enrichedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      ...item,
      customerName: item.customerId ? customerMap.get(item.customerId)?.name || "-" : "-"
    }));
  }, [data?.data, customerMap]);

  // Ön izle handler
  const handlePreview = useCallback(async () => {
    if (!selectedItem) return;

    setIsLoadingContract(true);
    try {
      const contract = await fetchContractById(selectedItem.contractId);
      setSelectedContract(contract);
      setInitialTab(TYPE_TO_TAB[selectedItem.type]);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Kontrat yüklenirken hata:", err);
    } finally {
      setIsLoadingContract(false);
    }
  }, [selectedItem]);

  // Modal close handler
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedContract(null);
    setInitialTab(undefined);
  }, []);

  // Selection change handler
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    if (ids.length > 0 && enrichedData.length > 0) {
      const lastSelectedId = ids[ids.length - 1];
      const item = enrichedData.find((i) => i.id === lastSelectedId);
      if (item) {
        setSelectedItem(item);
      }
    } else if (ids.length === 0) {
      setSelectedItem(null);
    }
  }, [enrichedData]);

  // Row double click handler
  const handleRowDoubleClick = useCallback(async (item: PendingInstallationItem) => {
    setIsLoadingContract(true);
    try {
      const contract = await fetchContractById(item.contractId);
      setSelectedContract(contract);
      setInitialTab(TYPE_TO_TAB[item.type]);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Kontrat yüklenirken hata:", err);
    } finally {
      setIsLoadingContract(false);
    }
  }, []);

  // Column definitions
  const columns: GridColumnDef<PendingInstallationItem & { customerName: string }>[] = useMemo(
    () => [
      {
        id: "type",
        header: "Tip",
        accessorKey: "type",
        width: 120,
        sortable: true,
        resizable: true,
        cell: (value) => {
          const style = TYPE_STYLES[value as PendingInstallationType];
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
            >
              {style.label}
            </span>
          );
        },
        filter: {
          type: "dropdown",
          options: [
            { value: "cash-register", label: "Yazarkasa" },
            { value: "saas", label: "SaaS" },
            { value: "support", label: "Destek" }
          ]
        }
      },
      {
        id: "contractNo",
        header: "Kontrat No",
        accessorKey: "contractNo",
        width: 110,
        sortable: true,
        resizable: true,
        align: "right",
        cell: (value) => <span className="font-mono">{String(value ?? "-")}</span>
      },
      {
        id: "customerName",
        header: "Müşteri",
        accessorKey: "customerName",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "brand",
        header: "Marka",
        accessorKey: "brand",
        width: 180,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 200,
        sortable: true,
        resizable: true,
        cell: (value) => String(value || "-"),
        filter: { type: "input", conditions: ["contains"] }
      },
      {
        id: "model",
        header: "Model",
        accessorKey: "model",
        width: 120,
        sortable: true,
        resizable: true,
        cell: (value) => String(value || "-"),
        filter: { type: "input", conditions: ["contains", "equals"] }
      },
      {
        id: "yearly",
        header: "Dönem",
        accessorKey: "yearly",
        width: 100,
        sortable: true,
        resizable: true,
        cell: (value) => (value ? "Yıllık" : "Aylık"),
        filter: {
          type: "dropdown",
          options: [
            { value: true, label: "Yıllık" },
            { value: false, label: "Aylık" }
          ]
        }
      },
      {
        id: "price",
        header: "Tutar",
        accessorKey: "price",
        width: 130,
        sortable: true,
        resizable: true,
        align: "right",
        cell: (value, row) => formatCurrency(value as number, row.currency)
      },
      {
        id: "currency",
        header: "Para Birimi",
        accessorKey: "currency",
        width: 110,
        sortable: true,
        resizable: true,
        cell: (value) => {
          const labels: Record<string, string> = { tl: "TL", usd: "USD", eur: "EUR" };
          return labels[value as string] || String(value);
        },
        filter: {
          type: "dropdown",
          options: [
            { value: "tl", label: "TL" },
            { value: "usd", label: "USD" },
            { value: "eur", label: "EUR" }
          ]
        }
      },
      {
        id: "startDate",
        header: "Başlangıç",
        accessorKey: "startDate",
        width: 120,
        sortable: true,
        resizable: true,
        cell: (value) => formatDate(value),
        filter: { type: "dateTree" }
      }
    ],
    []
  );

  // Toolbar buttons
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    const hasSelection = selectedIds.length > 0 || selectedItem;

    return [
      {
        id: "preview",
        label: "Ön İzle",
        icon: isLoadingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />,
        onClick: handlePreview,
        disabled: !hasSelection || isLoadingContract,
        variant: "primary"
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />,
        onClick: () => refetch(),
        disabled: isFetching
      }
    ];
  }, [selectedIds.length, selectedItem, isLoadingContract, isFetching, handlePreview, refetch]);

  // Error state
  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-[var(--color-error)]" />
        <p className="text-[var(--color-error)]">
          Veriler yüklenirken hata oluştu: {error?.message || "Bilinmeyen hata"}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[var(--color-primary)]" />
          <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
            Kurulum Bekleyen Ürünler
          </h1>
          {data?.counts && (
            <div className="ml-4 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <span className={`rounded-full px-2 py-0.5 ${TYPE_STYLES["cash-register"].bg} ${TYPE_STYLES["cash-register"].text}`}>
                Yazarkasa: {data.counts.cashRegister}
              </span>
              <span className={`rounded-full px-2 py-0.5 ${TYPE_STYLES.saas.bg} ${TYPE_STYLES.saas.text}`}>
                SaaS: {data.counts.saas}
              </span>
              <span className={`rounded-full px-2 py-0.5 ${TYPE_STYLES.support.bg} ${TYPE_STYLES.support.text}`}>
                Destek: {data.counts.support}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <Grid
          data={enrichedData}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          onRowDoubleClick={(row) => handleRowDoubleClick(row)}
          onSelectionChange={handleSelectionChange}
          selectedIds={selectedIds}
          toolbar={{
            customButtons: toolbarButtons,
            showExcelExport: true,
            exportFileName: "kurulum-bekleyen-urunler"
          }}
          rowHeight={40}
          headerHeight={44}
        />
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          contract={selectedContract}
          initialTab={initialTab}
        />
      )}
    </div>
  );
}
