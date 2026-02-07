import { useState, useCallback } from "react";
import { useContractPayments } from "../../../hooks/useContractDetail";
import {
  useCreateContractPayment,
  useUpdateContractPayment,
  useDeleteContractPayment
} from "../../../hooks/useContractDetailMutations";
import type { ContractPayment } from "../../../types";
import { EditableGrid } from "../shared";
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

  const createEmptyRow = useCallback((): ContractPayment => ({
    id: "",
    _id: "",
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
  }), [contractId]);

  const handleSaveNewRows = useCallback((rows: ContractPayment[]) => {
    rows.forEach((row) => {
      const { _id, id, ...data } = row;
      createMutation.mutate(data);
    });
  }, [createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractPayment, columnId: string, newValue: unknown) => {
      if (row?.id) {
        const { _id, id, contractId: cId, ...updateData } = row;
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
    [updateMutation]
  );

  const handleRowClick = useCallback(
    (row: ContractPayment) => {
      setSelectedRow(row);
    },
    []
  );

  const payments = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractPayment>
        data={payments}
        columns={contractPaymentsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        createEmptyRow={createEmptyRow}
        onSaveNewRows={handleSaveNewRows}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
      />
    </div>
  );
}
