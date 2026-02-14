import { useMemo, useCallback } from "react";
import { Box, Button, Typography, Chip } from "@mui/material";
import { Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { useApplications, useDeleteApplication } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { TApplication } from "../../types";

export function ApplicationList() {
  // includeInactive=true ile tüm uygulamaları getir (aktif ve pasif)
  const { data: applications = [], isLoading, refetch } = useApplications(true);
  const deleteApplication = useDeleteApplication();

  const { openApplicationForm, setSelectedApplication } = useSsoManagementStore();

  const columns: GridColumnDef<TApplication>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Uygulama Adı",
        accessorKey: "name",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 400,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] }
      },
      {
        id: "isActive",
        header: "Durum",
        accessorKey: "isActive",
        width: 120,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        cell: (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            color={value ? "success" : "default"}
            size="small"
          />
        )
      }
    ],
    []
  );

  const handleEdit = useCallback(
    (app: TApplication) => {
      setSelectedApplication(app);
      openApplicationForm({
        name: app.name,
        description: app.description,
        isActive: app.isActive
      });
    },
    [setSelectedApplication, openApplicationForm]
  );

  const handleDelete = useCallback(
    async (app: TApplication) => {
      if (!confirm(`"${app.name}" uygulamasını silmek istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deleteApplication.mutateAsync(app.id);
        toast.success("Uygulama başarıyla silindi");
      } catch {
        toast.error("Uygulama silinirken bir hata oluştu");
      }
    },
    [deleteApplication]
  );

  const handleAdd = useCallback(() => {
    setSelectedApplication(null);
    openApplicationForm();
  }, [setSelectedApplication, openApplicationForm]);

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni Uygulama",
        icon: <Plus size={18} />,
        onClick: handleAdd,
        variant: "primary"
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "secondary"
      }
    ],
    [handleAdd, refetch]
  );

  // Actions column
  const columnsWithActions: GridColumnDef<TApplication>[] = useMemo(
    () => [
      ...columns,
      {
        id: "_actions",
        header: "İşlemler",
        accessorKey: "id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
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
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              title="Sil"
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </div>
        )
      }
    ],
    [columns, handleEdit, handleDelete]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Uygulamalar</Typography>
      </Box>

      <div style={{ height: 600 }}>
        <Grid<TApplication>
          data={applications}
          columns={columnsWithActions}
          loading={isLoading}
          height="100%"
          locale="tr"
          stateKey="sso-applications-grid"
          getRowId={(row) => row.id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "uygulamalar"
          }}
        />
      </div>
    </Box>
  );
}

export default ApplicationList;
