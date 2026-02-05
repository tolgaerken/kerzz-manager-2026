import { useState, useCallback, useMemo } from "react";
import { Cloud } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractSaas } from "../../../hooks/useContractDetail";
import {
  useCreateContractSaas,
  useUpdateContractSaas,
  useDeleteContractSaas
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractSaas } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractSaasColumns } from "../columnDefs";

interface ContractSaasTabProps {
  contractId: string;
}

export function ContractSaasTab({ contractId }: ContractSaasTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractSaas | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSaas(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });

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

  const handleAdd = useCallback(() => {
    const newSaas: Omit<ContractSaas, "_id" | "id"> = {
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
    };
    createMutation.mutate(newSaas);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractSaas>) => {
      if (event.data?.id) {
        const { _id, id, contractId: cId, ...updateData } = event.data;

        // licanceId değiştiğinde brand'ı da güncelle
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
            total: updateData.price * updateData.qty,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation, licenses]
  );

  const handleSelectionChanged = useCallback(
    (row: ContractSaas | null) => {
      setSelectedRow(row);
    },
    []
  );

  const saasList = data?.data || [];

  if (!isLoading && saasList.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="SaaS Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <Cloud className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait SaaS kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni SaaS eklemek için "SaaS Ekle" butonuna tıklayın.</p>
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
        addLabel="SaaS Ekle"
      />
      <div className="flex-1 min-h-0">
        <EditableGrid<ContractSaas>
          data={saasList}
          columnDefs={contractSaasColumns}
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
