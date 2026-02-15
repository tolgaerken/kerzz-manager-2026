import { useState, useMemo, useCallback } from "react";
import { Box, Typography, Chip, Alert } from "@mui/material";
import { Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { usePermissions, useDeletePermission, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import { AppSelector } from "../common";
import type { TPermission } from "../../types";

export function PermissionList() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: applications = [] } = useApplications(true);
  const deletePermission = useDeletePermission();

  // Sadece uygulama seçilip "Getir" butonuna basıldığında veri çek
  const {
    data: permissions = [],
    isLoading,
    refetch
  } = usePermissions(
    shouldFetch && selectedAppId
      ? {
          appId: selectedAppId === "__all__" ? undefined : selectedAppId,
          all: selectedAppId === "__all__",
          includeInactive: true
        }
      : { appId: "__disabled__" }
  );

  const { openPermissionForm, setSelectedPermission } = useSsoManagementStore();

  const getAppName = useCallback(
    (appId: string) => applications.find((a) => a.id === appId)?.name || appId,
    [applications]
  );

  const handleFetch = useCallback(() => {
    if (selectedAppId) {
      setShouldFetch(true);
      if (shouldFetch) {
        refetch();
      }
    }
  }, [selectedAppId, shouldFetch, refetch]);

  const handleAppChange = useCallback((appId: string | null) => {
    setSelectedAppId(appId);
    setShouldFetch(false);
  }, []);

  const handleEdit = useCallback(
    (perm: TPermission) => {
      setSelectedPermission(perm);
      openPermissionForm({
        app_id: perm.app_id,
        group: perm.group,
        permission: perm.permission,
        description: perm.description,
        parentId: perm.parentId,
        isActive: perm.isActive
      });
    },
    [setSelectedPermission, openPermissionForm]
  );

  const handleDelete = useCallback(
    async (perm: TPermission) => {
      if (!confirm(`"${perm.permission}" iznini silmek istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deletePermission.mutateAsync(perm.id);
        toast.success("İzin başarıyla silindi");
      } catch {
        toast.error("İzin silinirken bir hata oluştu");
      }
    },
    [deletePermission]
  );

  const handleAdd = useCallback(() => {
    setSelectedPermission(null);
    openPermissionForm(selectedAppId && selectedAppId !== "__all__" ? { app_id: selectedAppId, group: "", permission: "" } : undefined);
  }, [setSelectedPermission, openPermissionForm, selectedAppId]);

  const columns: GridColumnDef<TPermission>[] = useMemo(
    () => [
      {
        id: "app_id",
        header: "Uygulama",
        accessorKey: "app_id",
        width: 180,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value: unknown) => getAppName(value as string),
        cell: (value) => (
          <Chip label={getAppName(value as string)} size="small" variant="outlined" />
        )
      },
      {
        id: "group",
        header: "Grup",
        accessorKey: "group",
        width: 150,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown", showCounts: true },
        cell: (value) => (
          <Chip label={value as string} size="small" color="primary" variant="outlined" />
        )
      },
      {
        id: "permission",
        header: "İzin Adı",
        accessorKey: "permission",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 300,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] }
      },
      {
        id: "isActive",
        header: "Durum",
        accessorKey: "isActive",
        width: 100,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value: unknown) => (value ? "Aktif" : "Pasif"),
        cell: (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            color={value ? "success" : "default"}
            size="small"
          />
        )
      },
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
    [getAppName, handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni İzin",
        icon: <Plus size={18} />,
        onClick: handleAdd,
        variant: "primary"
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "default"
      }
    ],
    [handleAdd, refetch]
  );

  const displayPermissions = shouldFetch ? permissions : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">İzinler</Typography>
      </Box>

      {/* Uygulama Seçici */}
      <AppSelector
        selectedAppId={selectedAppId}
        onAppChange={handleAppChange}
        onFetch={handleFetch}
        loading={isLoading}
        showAllOption
        label="Uygulama Seçin"
      />

      {!shouldFetch && (
        <Alert severity="info" sx={{ mb: 2 }}>
          İzinleri görüntülemek için önce bir uygulama seçin ve "Getir" butonuna tıklayın.
        </Alert>
      )}

      <div style={{ height: 550 }}>
        <Grid<TPermission>
          data={displayPermissions}
          columns={columns}
          loading={isLoading && shouldFetch}
          height="100%"
          locale="tr"
          stateKey="sso-permissions-grid"
          getRowId={(row) => row.id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "izinler"
          }}
        />
      </div>
    </Box>
  );
}

export default PermissionList;
