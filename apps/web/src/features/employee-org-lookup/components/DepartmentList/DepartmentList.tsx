import { useState, useMemo, useCallback } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import {
  useOrgDepartments,
  useCreateOrgDepartment,
  useUpdateOrgDepartment,
  useDeleteOrgDepartment,
} from "../../hooks";
import { OrgLookupFormModal } from "../OrgLookupFormModal";
import type { OrgDepartment, OrgLookupQueryParams } from "../../types";

export function DepartmentList() {
  const [queryParams, setQueryParams] = useState<OrgLookupQueryParams>({
    page: 1,
    limit: 50,
    sortField: "sortOrder",
    sortOrder: "asc",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrgDepartment | null>(null);

  const { data, isLoading, refetch } = useOrgDepartments(queryParams);
  const createMutation = useCreateOrgDepartment();
  const updateMutation = useUpdateOrgDepartment();
  const deleteMutation = useDeleteOrgDepartment();

  const departments = data?.data || [];

  const handleEdit = useCallback((item: OrgDepartment) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedItem(null);
  }, []);

  const handleDelete = useCallback(
    async (item: OrgDepartment) => {
      if (!confirm(`"${item.name}" departmanını silmek istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deleteMutation.mutateAsync(item._id);
        toast.success("Departman silindi");
      } catch {
        toast.error("Departman silinirken bir hata oluştu");
      }
    },
    [deleteMutation]
  );

  const handleSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      try {
        if (selectedItem) {
          await updateMutation.mutateAsync({
            id: selectedItem._id,
            data: {
              code: formData.code as string,
              name: formData.name as string,
              isActive: formData.isActive as boolean,
              description: formData.description as string,
              sortOrder: formData.sortOrder as number,
            },
          });
          toast.success("Departman güncellendi");
        } else {
          await createMutation.mutateAsync({
            code: formData.code as string,
            name: formData.name as string,
            isActive: formData.isActive as boolean,
            description: formData.description as string,
            sortOrder: formData.sortOrder as number,
          });
          toast.success("Departman oluşturuldu");
        }
        handleCloseForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bir hata oluştu";
        toast.error(message);
      }
    },
    [selectedItem, createMutation, updateMutation, handleCloseForm]
  );

  const columns: GridColumnDef<OrgDepartment>[] = useMemo(
    () => [
      {
        id: "code",
        header: "Kod",
        accessorKey: "code",
        width: 120,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
      },
      {
        id: "name",
        header: "Ad",
        accessorKey: "name",
        width: 200,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 250,
        sortable: false,
        resizable: true,
        cell: (value) => (value as string) || "-",
      },
      {
        id: "sortOrder",
        header: "Sıra",
        accessorKey: "sortOrder",
        width: 80,
        align: "center",
        sortable: true,
      },
      {
        id: "isActive",
        header: "Durum",
        accessorKey: "isActive",
        width: 100,
        align: "center",
        sortable: true,
        cell: (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            size="small"
            variant="outlined"
            sx={
              value
                ? {
                    color: "var(--color-success-foreground)",
                    backgroundColor:
                      "color-mix(in oklab, var(--color-success) 18%, transparent)",
                    borderColor:
                      "color-mix(in oklab, var(--color-success) 45%, transparent)",
                  }
                : {
                    color: "var(--color-muted-foreground)",
                    backgroundColor: "var(--color-surface-hover)",
                    borderColor: "var(--color-border)",
                  }
            }
          />
        ),
      },
      {
        id: "_actions",
        header: "İşlemler",
        accessorKey: "_id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              title="Düzenle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-error)]"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              title="Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni Departman",
        icon: <Plus size={18} />,
        onClick: handleCreate,
        variant: "primary",
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "default",
      },
    ],
    [handleCreate, refetch]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: "var(--color-foreground)" }}>
          Departman Tanımları
        </Typography>
      </Box>

      <div style={{ height: 500 }}>
        <Grid<OrgDepartment>
          data={departments}
          columns={columns}
          loading={isLoading}
          height="100%"
          locale="tr"
          stateKey="org-departments-grid"
          getRowId={(row) => row._id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "departmanlar",
          }}
        />
      </div>

      {data?.meta && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
            Toplam {data.meta.total} kayıt
          </Typography>
        </Box>
      )}

      <OrgLookupFormModal
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        type="department"
        initialData={selectedItem as Record<string, unknown> | null}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Box>
  );
}

export default DepartmentList;
