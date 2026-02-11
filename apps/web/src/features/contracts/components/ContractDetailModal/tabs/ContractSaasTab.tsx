import { useState, useCallback, useMemo } from "react";
import { Trash2, Cloud, Store, CircleDollarSign, CheckCircle2, XCircle, AlertCircle, Package, Hash } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractSaas } from "../../../hooks/useContractDetail";
import {
  useCreateContractSaas,
  useUpdateContractSaas,
  useDeleteContractSaas
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import { useSoftwareProducts } from "../../../../software-products";
import type { ContractSaas } from "../../../types";
import { contractSaasColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractSaasTabProps {
  contractId: string;
}

const formatCurrency = (value: number, currency: string = "tl") => {
  const currencyMap: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY"
  }).format(value);
};

export function ContractSaasTab({ contractId }: ContractSaasTabProps) {
  const isMobile = useIsMobile();
  const [selectedRow, setSelectedRow] = useState<ContractSaas | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSaas(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });
  const { data: productsData } = useSoftwareProducts({ limit: 10000, isSaas: true, sortField: "name", sortOrder: "asc" });

  // Mutation hooks
  const createMutation = useCreateContractSaas(contractId);
  const updateMutation = useUpdateContractSaas(contractId);
  const deleteMutation = useDeleteContractSaas(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Lisansları grid için hazırla
  const licenses = useMemo(() => {
    return licensesData?.data
      ?.filter((lic) => lic.id != null)
      .map((lic) => ({
        _id: lic._id,
        id: lic.id,
        brandName: lic.brandName,
        SearchItem: lic.SearchItem || lic.brandName
      })) || [];
  }, [licensesData]);

  // SaaS ürünlerini grid için hazırla
  const products = useMemo(() => {
    return productsData?.data
      ?.map((p) => ({
        _id: p._id,
        id: p.id,
        name: p.name,
        friendlyName: p.friendlyName,
        nameWithCode: p.nameWithCode
      })) || [];
  }, [productsData]);

  // Lisans seçildiğinde brand'ı güncelle
  const handleLicenseSelect = useCallback(
    (rowId: string, license: { id: string; brandName: string } | null) => {
      if (rowId) {
        updateMutation.mutate({
          id: rowId,
          data: {
            brand: license?.brandName || "",
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation]
  );

  // Grid context
  const gridContext = useMemo(
    () => ({
      licenses,
      products,
      onLicenseSelect: handleLicenseSelect
    }),
    [licenses, products, handleLicenseSelect]
  );

  const createEmptyRow = useCallback((): ContractSaas => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    description: "",
    price: 0,
    old_price: 0,
    qty: 1,
    currency: "tl",
    yearly: false,
    enabled: true,
    expired: false,
    blocked: false,
    productId: "",
    total: 0,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractSaas[]) => {
    rows.forEach((row) => {
      const { id, _id, ...data } = row;
      createMutation.mutate(data);
    });
  }, [createMutation]);

  const handlePendingCellChange = useCallback(
    (row: ContractSaas, columnId: string, newValue: unknown): ContractSaas => {
      const updated = { ...row, [columnId]: newValue };
      if (columnId === "licanceId" && newValue) {
        const selectedLicense = licenses.find((l) => l.id === newValue);
        if (selectedLicense) {
          updated.brand = selectedLicense.brandName;
        }
      }
      const price = columnId === "price" ? (newValue as number) : updated.price;
      const qty = columnId === "qty" ? (newValue as number) : updated.qty;
      updated.total = price * qty;
      return updated;
    },
    [licenses]
  );

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractSaas, columnId: string, newValue: unknown) => {
      if (row?.id) {
        const { _id, id, contractId: cId, ...updateData } = row;

        if (columnId === "licanceId" && newValue) {
          const selectedLicense = licenses.find((l) => l.id === newValue);
          if (selectedLicense) {
            updateData.brand = selectedLicense.brandName;
          }
        }

        const price = columnId === "price" ? (newValue as number) : updateData.price;
        const qty = columnId === "qty" ? (newValue as number) : updateData.qty;

        updateMutation.mutate({
          id: row.id,
          data: {
            ...updateData,
            [columnId]: newValue,
            total: price * qty,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation, licenses]
  );

  const handleRowClick = useCallback(
    (row: ContractSaas) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractSaas>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !selectedRow || isProcessing,
        variant: "danger"
      }
    ];

    return {
      showSearch: true,
      showExcelExport: true,
      showPdfExport: false,
      showColumnVisibility: true,
      showAddRow: true,
      customButtons
    };
  }, [handleDelete, selectedRow, isProcessing]);

  const saasList = data?.data || [];

  // Mobile card renderer
  const renderSaasCard = useCallback((saas: ContractSaas) => {
    const product = products.find(p => p.id === saas.productId);
    
    return (
      <div
        key={saas.id || saas._id}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[var(--color-primary)]/10 p-1.5">
              <Cloud className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
                {saas.brand || "-"}
              </p>
              {saas.description && (
                <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">
                  {saas.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {saas.enabled ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />
            )}
            {saas.blocked && (
              <AlertCircle className="h-3.5 w-3.5 text-[var(--color-warning)]" />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Store className="h-3 w-3" />
            <span className="truncate">Lisans: {saas.licanceId || "-"}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Package className="h-3 w-3" />
            <span className="truncate">{product?.friendlyName || product?.name || "-"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              saas.yearly 
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                : "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
            }`}>
              {saas.yearly ? "Yıllık" : "Aylık"}
            </span>
            {saas.qty > 1 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-info)]/10 text-[var(--color-info)] flex items-center gap-1">
                <Hash className="h-2.5 w-2.5" />
                {saas.qty} adet
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 font-medium text-sm text-[var(--color-foreground)]">
            <CircleDollarSign className="h-3.5 w-3.5" />
            <span>{formatCurrency(saas.total || saas.price * saas.qty, saas.currency)}</span>
          </div>
        </div>
      </div>
    );
  }, [products]);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileCardList
          data={saasList}
          loading={isLoading}
          renderCard={renderSaasCard}
          emptyMessage="SaaS kaydı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractSaas>
          data={saasList}
          columns={contractSaasColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
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
    </div>
  );
}
