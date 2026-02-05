import { useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractPayments } from "../../../hooks/useContractDetail";
import {
  useCreateContractPayment,
  useUpdateContractPayment,
  useDeleteContractPayment
} from "../../../hooks/useContractDetailMutations";
import type { ContractPayment } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractPaymentsColumns } from "../columnDefs";

interface ContractPaymentsTabProps {
  contractId: string;
}

export function ContractPaymentsTab({ contractId }: ContractPaymentsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractPayment | null>(null);

  const { data, isLoading } = useContractPayments(contractId);
  const createMutation = useCreateContractPayment(contractId);
  const updateMutation = useUpdateContractPayment(contractId);
  const deleteMutation = useDeleteContractPayment(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleAdd = useCallback(() => {
    const newPayment: Omit<ContractPayment, "_id" | "id"> = {
      contractId,
      company: "",
      brand: "",
      customerId: "",
      licanceId: "",
      invoiceNo: "",
      paid: false,
      payDate: new Date().toISOString(),
      paymentDate: "",
      invoiceDate: new Date().toISOString(),
      total: 0,
      invoiceTotal: 0,
      balance: 0,
      list: [],
      yearly: false,
      eInvoice: false,
      uuid: "",
      ref: "",
      taxNo: "",
      internalFirm: "",
      contractNumber: 0,
      segment: "",
      block: false,
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newPayment);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractPayment>) => {
      if (event.data?.id) {
        const { _id, id, contractId: cId, ...updateData } = event.data;
        updateMutation.mutate({
          id: event.data.id,
          data: {
            ...updateData,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation]
  );

  const handleSelectionChanged = useCallback(
    (row: ContractPayment | null) => {
      setSelectedRow(row);
    },
    []
  );

  const payments = data?.data || [];

  if (!isLoading && payments.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Ödeme Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait ödeme kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni ödeme eklemek için "Ödeme Ekle" butonuna tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DetailGridToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        loading={isProcessing}
        addLabel="Ödeme Ekle"
      />
      <EditableGrid<ContractPayment>
        data={payments}
        columnDefs={contractPaymentsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        height="400px"
      />
    </div>
  );
}
