import { useState, useCallback, useMemo } from "react";
import { useContractSaas } from "../../../hooks/useContractDetail";
import {
  useCreateContractSaas,
  useUpdateContractSaas,
  useDeleteContractSaas
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import { useSoftwareProducts } from "../../../../software-products";
import type { ContractSaas } from "../../../types";
import { EditableGrid } from "../shared";
import { contractSaasColumns } from "../columnDefs";

interface ContractSaasTabProps {
  contractId: string;
}

export function ContractSaasTab({ contractId }: ContractSaasTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractSaas | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSaas(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });
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

  const saasList = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractSaas>
        data={saasList}
        columns={contractSaasColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
        addLabel="SaaS Ekle"
        context={gridContext}
      />
    </div>
  );
}
