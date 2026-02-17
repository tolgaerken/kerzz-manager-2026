import { useState, useCallback, useMemo } from "react";
import { Trash2, Receipt, Calendar, CheckCircle2, XCircle, CircleDollarSign, FileText, List, Clock } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractPayments } from "../../../hooks/useContractDetail";
import {
  useCreateContractPayment,
  useUpdateContractPayment,
  useDeleteContractPayment
} from "../../../hooks/useContractDetailMutations";
import type { ContractPayment } from "../../../types";
import { contractPaymentsColumns } from "../columnDefs";
import { MobileCardList } from "./shared";
import { PaymentItemsModal } from "./PaymentItemsModal";

/** Kist (prorated) odeme mi kontrol eder */
const isProrated = (payment: ContractPayment): boolean => payment.type === "prorated";

interface ContractPaymentsTabProps {
  contractId: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(value);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR");
};

export function ContractPaymentsTab({ contractId }: ContractPaymentsTabProps) {
  const isMobile = useIsMobile();
  const [selectedRow, setSelectedRow] = useState<ContractPayment | null>(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

  const { data, isLoading } = useContractPayments(contractId);
  const createMutation = useCreateContractPayment(contractId);
  const updateMutation = useUpdateContractPayment(contractId);
  const deleteMutation = useDeleteContractPayment(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractPayment => ({
    id: crypto.randomUUID(),
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
    editUser: "",
    type: "regular"
  }), [contractId]);

  /** Kist satirlari icin satir sinifi dondurur */
  const getRowClassName = useCallback((row: ContractPayment) => {
    if (isProrated(row)) {
      return "bg-[var(--color-info)]/5";
    }
    return "";
  }, []);

  const handleNewRowSave = useCallback(async (rows: ContractPayment[]) => {
    for (const row of rows) {
      const { id, _id, ...data } = row;
      await createMutation.mutateAsync(data);
    }
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

  const handleShowItems = useCallback(() => {
    if (selectedRow) {
      setIsItemsModalOpen(true);
    }
  }, [selectedRow]);

  const toolbarConfig = useMemo<ToolbarConfig<ContractPayment>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "product-list",
        label: "Ürün Listesi",
        icon: <List className="w-3.5 h-3.5" />,
        onClick: handleShowItems,
        disabled: !selectedRow || isProcessing,
        variant: "default"
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
  }, [handleDelete, handleShowItems, selectedRow, isProcessing]);

  const mutationError =
    updateMutation.error || createMutation.error || deleteMutation.error;

  const errorBanner = mutationError ? (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
      {mutationError instanceof Error
        ? mutationError.message
        : "İşlem sırasında bir hata oluştu"}
    </div>
  ) : null;

  const payments = data?.data || [];

  // Mobile card renderer
  const renderPaymentCard = useCallback((payment: ContractPayment) => {
    const isProratedPayment = isProrated(payment);
    
    return (
      <div
        key={payment.id || payment._id}
        className={`rounded-lg border p-3 ${
          isProratedPayment
            ? "border-[var(--color-info)]/30 bg-[var(--color-info)]/5"
            : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-1.5 ${
              isProratedPayment
                ? "bg-[var(--color-info)]/10"
                : payment.paid 
                  ? "bg-[var(--color-success)]/10" 
                  : "bg-[var(--color-warning)]/10"
            }`}>
              {isProratedPayment ? (
                <Clock className="h-3.5 w-3.5 text-[var(--color-info)]" />
              ) : (
                <Receipt className={`h-3.5 w-3.5 ${
                  payment.paid 
                    ? "text-[var(--color-success)]" 
                    : "text-[var(--color-warning)]"
                }`} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
                  {payment.invoiceNo || "Fatura No Yok"}
                </p>
                {isProratedPayment && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-info)]/10 text-[var(--color-info)]">
                    Kıst
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--color-muted-foreground)]">
                {payment.brand || payment.company || "-"}
              </p>
            </div>
          </div>
          {payment.paid ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Calendar className="h-3 w-3" />
            <span>Fatura: {formatDate(payment.invoiceDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Calendar className="h-3 w-3" />
            <span>Dönem: {new Date(payment.payDate).toLocaleDateString("tr-TR", { month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {isProratedPayment && payment.proratedDays && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-info)] mb-2">
            <Clock className="h-3 w-3" />
            <span>{payment.proratedDays} gün kıst</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
            <FileText className="h-3 w-3" />
            <span>Toplam: {formatCurrency(payment.invoiceTotal)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-foreground)]">
            <CircleDollarSign className="h-3.5 w-3.5" />
            <span>{formatCurrency(payment.total)}</span>
          </div>
        </div>

        {payment.balance !== 0 && (
          <div className="mt-2 text-xs text-right">
            <span className={payment.balance > 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}>
              Bakiye: {formatCurrency(payment.balance)}
            </span>
          </div>
        )}
      </div>
    );
  }, []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {errorBanner}
        <MobileCardList
          data={payments}
          loading={isLoading}
          renderCard={renderPaymentCard}
          emptyMessage="Ödeme kaydı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {errorBanner}
      <div className="flex-1 min-h-0">
        <Grid<ContractPayment>
          data={payments}
          columns={contractPaymentsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={createEmptyRow}
          onNewRowSave={handleNewRowSave}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
          rowClassName={getRowClassName}
        />
      </div>

      <PaymentItemsModal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        items={selectedRow?.list || []}
        payDate={selectedRow?.payDate || ""}
      />
    </div>
  );
}
