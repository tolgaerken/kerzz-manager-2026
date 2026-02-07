import { useState, useCallback, useMemo } from "react";
import { useContractSupports } from "../../../hooks/useContractDetail";
import {
  useCreateContractSupport,
  useUpdateContractSupport,
  useDeleteContractSupport
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractSupport } from "../../../types";
import { EditableGrid } from "../shared";
import { contractSupportsColumns } from "../columnDefs";

interface ContractSupportsTabProps {
  contractId: string;
}

export function ContractSupportsTab({ contractId }: ContractSupportsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractSupport | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSupports(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });

  // Mutation hooks
  const createMutation = useCreateContractSupport(contractId);
  const updateMutation = useUpdateContractSupport(contractId);
  const deleteMutation = useDeleteContractSupport(contractId);

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
    const newSupport: Omit<ContractSupport, "_id" | "id"> = {
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
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newSupport);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

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

  const supports = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractSupport>
        data={supports}
        columns={contractSupportsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
        addLabel="Destek Ekle"
        context={gridContext}
      />
    </div>
  );
}
