import { useState, useCallback, useMemo } from "react";
import { Trash2, User, Mail, Phone, Briefcase } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractUsers } from "../../../hooks/useContractDetail";
import {
  useCreateContractUser,
  useUpdateContractUser,
  useDeleteContractUser
} from "../../../hooks/useContractDetailMutations";
import type { ContractUser } from "../../../types";
import { contractUsersColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractUsersTabProps {
  contractId: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Sahip",
  admin: "Yönetici",
  user: "Kullanıcı",
  other: "Diğer"
};

export function ContractUsersTab({ contractId }: ContractUsersTabProps) {
  const isMobile = useIsMobile();
  const [selectedRow, setSelectedRow] = useState<ContractUser | null>(null);

  const { data, isLoading } = useContractUsers(contractId);
  const createMutation = useCreateContractUser(contractId);
  const updateMutation = useUpdateContractUser(contractId);
  const deleteMutation = useDeleteContractUser(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractUser => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    name: "",
    email: "",
    gsm: "",
    role: "other",
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback(async (rows: ContractUser[]) => {
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
    (row: ContractUser, columnId: string, newValue: unknown) => {
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
    (row: ContractUser) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractUser>>(() => {
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

  const mutationError =
    updateMutation.error || createMutation.error || deleteMutation.error;

  const errorBanner = mutationError ? (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
      {mutationError instanceof Error
        ? mutationError.message
        : "İşlem sırasında bir hata oluştu"}
    </div>
  ) : null;

  const users = data?.data || [];

  // Mobile card renderer
  const renderUserCard = useCallback((user: ContractUser) => (
    <div
      key={user.id || user._id}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-primary)]/10 p-1.5">
            <User className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          <span className="font-medium text-sm text-[var(--color-foreground)]">
            {user.name || "-"}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
          {ROLE_LABELS[user.role] || user.role}
        </span>
      </div>
      
      <div className="space-y-1.5 text-xs text-[var(--color-muted-foreground)]">
        {user.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        )}
        {user.gsm && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{user.gsm}</span>
          </div>
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
          data={users}
          loading={isLoading}
          renderCard={renderUserCard}
          emptyMessage="Kullanıcı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {errorBanner}
      <div className="flex-1 min-h-0">
        <Grid<ContractUser>
          data={users}
          columns={contractUsersColumns}
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
        />
      </div>
    </div>
  );
}
