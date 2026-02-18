import { useState, useCallback, useMemo } from "react";
import { Trash2, Monitor, Store, CircleDollarSign, CheckCircle2, XCircle, CreditCard, Hash, CheckCheck } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractCashRegisters } from "../../../hooks/useContractDetail";
import {
  useCreateContractCashRegister,
  useUpdateContractCashRegister,
  useDeleteContractCashRegister,
  useActivateContractCashRegister
} from "../../../hooks/useContractDetailMutations";
import { useActiveEftPosModels } from "../../../hooks/useEftPosModels";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractCashRegister } from "../../../types";
import { contractCashRegistersColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractCashRegistersTabProps {
  contractId: string;
}

const formatCurrency = (value: number, currency: string = "tl") => {
  const currencyMap: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY"
  }).format(value);
};

const TYPE_LABELS: Record<string, string> = {
  tsm: "TSM",
  eft: "EFT",
  pos: "POS"
};

export function ContractCashRegistersTab({ contractId }: ContractCashRegistersTabProps) {
  const isMobile = useIsMobile();
  const [selectedRows, setSelectedRows] = useState<ContractCashRegister[]>([]);

  // Data hooks
  const { data, isLoading } = useContractCashRegisters(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });
  const { data: eftPosModelsData } = useActiveEftPosModels();

  // Mutation hooks
  const createMutation = useCreateContractCashRegister(contractId);
  const updateMutation = useUpdateContractCashRegister(contractId);
  const deleteMutation = useDeleteContractCashRegister(contractId);
  const activateMutation = useActivateContractCashRegister(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    activateMutation.isPending;

  const cashRegisters = data?.data || [];

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

  // EftPos modellerini grid için hazırla
  const eftPosModels = useMemo(() => {
    return (
      eftPosModelsData?.data?.map((model) => ({
        id: model.id,
        name: model.name
      })) || []
    );
  }, [eftPosModelsData]);

  // Grid context
  const gridContext = useMemo(
    () => ({
      licenses,
      eftPosModels
    }),
    [licenses, eftPosModels]
  );

  const createEmptyRow = useCallback((): ContractCashRegister => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    legalId: "",
    model: "",
    type: "tsm",
    price: 0,
    old_price: 0,
    currency: "tl",
    yearly: false,
    enabled: true,
    expired: false,
    eftPosActive: false,
    folioClose: false,
    startDate: new Date().toISOString(),
    activated: false,
    activatedAt: undefined,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback(async (rows: ContractCashRegister[]) => {
    for (const row of rows) {
      const { id, _id, ...data } = row;
      await createMutation.mutateAsync(data);
    }
  }, [createMutation]);

  const handlePendingCellChange = useCallback(
    (row: ContractCashRegister, columnId: string, newValue: unknown): ContractCashRegister => {
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

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      const rows = cashRegisters.filter((r) => selectedIds.includes(r.id || r._id));
      setSelectedRows(rows);
    },
    [cashRegisters]
  );

  const handleDelete = useCallback(() => {
    for (const row of selectedRows) {
      if (row?.id) {
        deleteMutation.mutate(row.id);
      }
    }
  }, [selectedRows, deleteMutation]);

  const handleToggleActivation = useCallback(() => {
    for (const row of selectedRows) {
      if (row?.id) {
        if (row.activated) {
          // Kuruldu -> Kurulmadı
          updateMutation.mutate({
            id: row.id,
            data: {
              activated: false,
              activatedAt: undefined,
              editDate: new Date().toISOString()
            }
          });
        } else {
          // Kurulmadı -> Kuruldu (activate endpoint kullan)
          activateMutation.mutate(row.id);
        }
      }
    }
  }, [selectedRows, activateMutation, updateMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractCashRegister, columnId: string, newValue: unknown) => {
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

  const toolbarConfig = useMemo<ToolbarConfig<ContractCashRegister>>(() => {
    const hasSelected = selectedRows.length > 0;
    const allActivated = selectedRows.every((r) => r.activated);
    const allDeactivated = selectedRows.every((r) => !r.activated);

    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "toggle-activation",
        label:
          selectedRows.length === 0
            ? "Kuruldu Olarak İşaretle"
            : allActivated
              ? "Kurulmadı Olarak İşaretle"
              : allDeactivated
                ? "Kuruldu Olarak İşaretle"
                : "Kuruldu/Kurulmadı Değiştir",
        icon: <CheckCheck className="w-3.5 h-3.5" />,
        onClick: handleToggleActivation,
        disabled: !hasSelected || isProcessing,
        variant: allActivated ? "default" : "primary"
      },
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !hasSelected || isProcessing,
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
  }, [handleToggleActivation, handleDelete, selectedRows, isProcessing]);

  const mutationError =
    updateMutation.error || createMutation.error || deleteMutation.error || activateMutation.error;

  const errorBanner = mutationError ? (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
      {mutationError instanceof Error
        ? mutationError.message
        : "İşlem sırasında bir hata oluştu"}
    </div>
  ) : null;

  // Mobile card renderer
  const renderCashRegisterCard = useCallback((cr: ContractCashRegister) => (
    <div
      key={cr.id || cr._id}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-primary)]/10 p-1.5">
            <Monitor className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
              {cr.brand || "-"}
            </p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {cr.model || TYPE_LABELS[cr.type] || cr.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {cr.enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
          <Store className="h-3 w-3" />
          <span className="truncate">Lisans: {cr.licanceId || "-"}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
          <Hash className="h-3 w-3" />
          <span className="truncate">Legal: {cr.legalId || "-"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            cr.yearly 
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
              : "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
          }`}>
            {cr.yearly ? "Yıllık" : "Aylık"}
          </span>
          {cr.eftPosActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-info)]/10 text-[var(--color-info)] flex items-center gap-1">
              <CreditCard className="h-2.5 w-2.5" />
              EFT-POS
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 font-medium text-sm text-[var(--color-foreground)]">
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>{formatCurrency(cr.price, cr.currency)}</span>
        </div>
      </div>
    </div>
  ), []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {errorBanner}
        <MobileCardList
          data={cashRegisters}
          loading={isLoading}
          renderCard={renderCashRegisterCard}
          emptyMessage="Yazar kasa kaydı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {errorBanner}
      <div className="flex-1 min-h-0">
        <Grid<ContractCashRegister>
          data={cashRegisters}
          columns={contractCashRegistersColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChange={handleCellValueChange}
          onSelectionChange={handleSelectionChange}
          createEmptyRow={createEmptyRow}
          onNewRowSave={handleNewRowSave}
          onPendingCellChange={handlePendingCellChange}
          context={gridContext}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="multiple"
        />
      </div>
    </div>
  );
}
