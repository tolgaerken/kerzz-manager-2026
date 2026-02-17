import { useState, useCallback, useMemo } from "react";
import { Trash2, Headphones, Store, CircleDollarSign, CheckCircle2, XCircle, AlertCircle, CheckCheck } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractSupports } from "../../../hooks/useContractDetail";
import {
  useCreateContractSupport,
  useUpdateContractSupport,
  useDeleteContractSupport,
  useActivateContractSupport
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractSupport } from "../../../types";
import { contractSupportsColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractSupportsTabProps {
  contractId: string;
}

const formatCurrency = (value: number, currency: string = "tl") => {
  const currencyMap: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY"
  }).format(value);
};

export function ContractSupportsTab({ contractId }: ContractSupportsTabProps) {
  const isMobile = useIsMobile();
  const [selectedRow, setSelectedRow] = useState<ContractSupport | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSupports(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });

  // Mutation hooks
  const createMutation = useCreateContractSupport(contractId);
  const updateMutation = useUpdateContractSupport(contractId);
  const deleteMutation = useDeleteContractSupport(contractId);
  const activateMutation = useActivateContractSupport(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    activateMutation.isPending;

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
      onLicenseSelect: handleLicenseSelect
    }),
    [licenses, handleLicenseSelect]
  );

  const createEmptyRow = useCallback((): ContractSupport => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    price: 0,
    old_price: 0,
    currency: "tl",
    type: "",
    yearly: false,
    enabled: true,
    blocked: false,
    expired: false,
    lastOnlineDay: 0,
    calulatedPrice: 0,
    startDate: new Date().toISOString(),
    activated: false,
    activatedAt: undefined,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback(async (rows: ContractSupport[]) => {
    for (const row of rows) {
      const { id, _id, ...data } = row;
      await createMutation.mutateAsync(data);
    }
  }, [createMutation]);

  const handlePendingCellChange = useCallback(
    (row: ContractSupport, columnId: string, newValue: unknown): ContractSupport => {
      const updated = { ...row, [columnId]: newValue };
      if (columnId === "licanceId" && newValue) {
        const selectedLicense = licenses.find((l) => l.id === newValue);
        if (selectedLicense) {
          updated.brand = selectedLicense.brandName;
        }
      }
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

  const handleToggleActivation = useCallback(() => {
    if (selectedRow?.id) {
      if (selectedRow.activated) {
        // Kuruldu -> Kurulmadı
        updateMutation.mutate({
          id: selectedRow.id,
          data: {
            activated: false,
            activatedAt: undefined,
            editDate: new Date().toISOString()
          }
        });
      } else {
        // Kurulmadı -> Kuruldu (activate endpoint kullan)
        activateMutation.mutate(selectedRow.id);
      }
    }
  }, [selectedRow, activateMutation, updateMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractSupport, columnId: string, newValue: unknown) => {
      if (row?.id) {
        const { _id, id, contractId: cId, ...updateData } = row;

        if (columnId === "licanceId" && newValue) {
          const selectedLicense = licenses.find((l) => l.id === newValue);
          if (selectedLicense) {
            updateData.brand = selectedLicense.brandName;
          }
        }

        updateMutation.mutate({
          id: row.id,
          data: {
            ...updateData,
            [columnId]: newValue,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation, licenses]
  );

  const handleRowClick = useCallback(
    (row: ContractSupport) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractSupport>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "toggle-activation",
        label: selectedRow?.activated ? "Kurulmadı Olarak İşaretle" : "Kuruldu Olarak İşaretle",
        icon: <CheckCheck className="w-3.5 h-3.5" />,
        onClick: handleToggleActivation,
        disabled: !selectedRow || isProcessing,
        variant: selectedRow?.activated ? "default" : "primary"
      },
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
  }, [handleToggleActivation, handleDelete, selectedRow, isProcessing]);

  const mutationError =
    updateMutation.error || createMutation.error || deleteMutation.error || activateMutation.error;

  const errorBanner = mutationError ? (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
      {mutationError instanceof Error
        ? mutationError.message
        : "İşlem sırasında bir hata oluştu"}
    </div>
  ) : null;

  const supports = data?.data || [];

  // Mobile card renderer
  const renderSupportCard = useCallback((support: ContractSupport) => (
    <div
      key={support.id || support._id}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-info)]/10 p-1.5">
            <Headphones className="h-3.5 w-3.5 text-[var(--color-info)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
              {support.brand || "-"}
            </p>
            {support.type && (
              <p className="text-[10px] text-[var(--color-muted-foreground)]">{support.type}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {support.enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />
          )}
          {support.blocked && (
            <AlertCircle className="h-3.5 w-3.5 text-[var(--color-warning)]" />
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
          <Store className="h-3 w-3" />
          <span>Lisans: {support.licanceId || "-"}</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-[var(--color-foreground)]">
          <CircleDollarSign className="h-3 w-3" />
          <span>{formatCurrency(support.price, support.currency)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          support.yearly 
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
            : "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
        }`}>
          {support.yearly ? "Yıllık" : "Aylık"}
        </span>
        {support.expired && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
            Süresi Dolmuş
          </span>
        )}
      </div>
    </div>
  ), []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {errorBanner}
        <MobileCardList
          data={supports}
          loading={isLoading}
          renderCard={renderSupportCard}
          emptyMessage="Destek kaydı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {errorBanner}
      <div className="flex-1 min-h-0">
        <Grid<ContractSupport>
          data={supports}
          columns={contractSupportsColumns}
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
