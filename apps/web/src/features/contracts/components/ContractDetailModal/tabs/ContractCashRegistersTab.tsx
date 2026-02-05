import { useState, useCallback, useMemo } from "react";
import { CreditCard } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractCashRegisters } from "../../../hooks/useContractDetail";
import {
  useCreateContractCashRegister,
  useUpdateContractCashRegister,
  useDeleteContractCashRegister
} from "../../../hooks/useContractDetailMutations";
import { useActiveEftPosModels } from "../../../hooks/useEftPosModels";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractCashRegister } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractCashRegistersColumns } from "../columnDefs";

interface ContractCashRegistersTabProps {
  contractId: string;
}

export function ContractCashRegistersTab({ contractId }: ContractCashRegistersTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractCashRegister | null>(null);

  // Data hooks
  const { data, isLoading } = useContractCashRegisters(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });
  const { data: eftPosModelsData } = useActiveEftPosModels();

  // Mutation hooks
  const createMutation = useCreateContractCashRegister(contractId);
  const updateMutation = useUpdateContractCashRegister(contractId);
  const deleteMutation = useDeleteContractCashRegister(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Lisansları grid için hazırla
  const licenses = useMemo(() => {
    const result = licensesData?.data
      ?.filter((lic) => lic.id != null)
      .map((lic) => ({
        _id: lic._id,
        id: lic.id,
        brandName: lic.brandName,
        SearchItem: lic.SearchItem || lic.brandName
      })) || [];
    return result;
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
      eftPosModels,
      onLicenseSelect: handleLicenseSelect
    }),
    [licenses, eftPosModels, handleLicenseSelect]
  );

  const handleAdd = useCallback(() => {
    const newCashRegister: Omit<ContractCashRegister, "_id" | "id"> = {
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
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newCashRegister);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractCashRegister>) => {
      if (event.data?.id) {
        const { _id, id, contractId: cId, ...updateData } = event.data;

        // Eğer licanceId değiştiyse ve brand zaten güncellenmemişse
        // (LicenseAutocompleteEditor'dan onLicenseSelect çağrılır, bu durumda brand zaten güncellenir)
        // Ancak direkt licanceId değişikliği için de brand'ı güncelle
        if (event.column.getColId() === "licanceId" && event.newValue) {
          const selectedLicense = licenses.find((l) => l.id === event.newValue);
          if (selectedLicense) {
            updateData.brand = selectedLicense.brandName;
          }
        }

        updateMutation.mutate({
          id: event.data.id,
          data: {
            ...updateData,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation, licenses]
  );

  const handleSelectionChanged = useCallback(
    (row: ContractCashRegister | null) => {
      setSelectedRow(row);
    },
    []
  );

  const cashRegisters = data?.data || [];

  if (!isLoading && cashRegisters.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Yazarkasa Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait yazarkasa kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni yazarkasa eklemek için "Yazarkasa Ekle" butonuna tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DetailGridToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        loading={isProcessing}
        addLabel="Yazarkasa Ekle"
      />
      <div className="flex-1 min-h-0">
        <EditableGrid<ContractCashRegister>
          data={cashRegisters}
          columnDefs={contractCashRegistersColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          context={gridContext}
        />
      </div>
    </div>
  );
}
