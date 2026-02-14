import { useState, useMemo, useCallback } from "react";
import { Box, Typography, Chip, IconButton, Tooltip, Alert } from "@mui/material";
import { Plus, Shield, RefreshCw, Grid3X3 } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { useRoles, useDeleteRole, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import { AppSelector } from "../common";
import type { TRole } from "../../types";
import { RolePermissionMatrix } from "./RolePermissionMatrix";

export function RoleList() {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: applications = [] } = useApplications(true);
  const deleteRole = useDeleteRole();

  // Sadece uygulama seçilip "Getir" butonuna basıldığında veri çek
  const {
    data: roles = [],
    isLoading,
    refetch
  } = useRoles(
    shouldFetch && selectedAppId
      ? {
          appId: selectedAppId === "__all__" ? undefined : selectedAppId,
          all: selectedAppId === "__all__",
          includeInactive: true
        }
      : { appId: "__disabled__" } // Geçersiz bir değer vererek sorguyu devre dışı bırak
  );

  const { openRoleForm, setSelectedRole, openPermissionMatrix } = useSsoManagementStore();

  const getAppName = useCallback(
    (appId: string) => applications.find((a) => a.id === appId)?.name || appId,
    [applications]
  );

  const handleFetch = useCallback(() => {
    if (selectedAppId) {
      setShouldFetch(true);
      // Eğer zaten fetch edilmişse refetch yap
      if (shouldFetch) {
        refetch();
      }
    }
  }, [selectedAppId, shouldFetch, refetch]);

  const handleAppChange = useCallback((appId: string | null) => {
    setSelectedAppId(appId);
    setShouldFetch(false); // Uygulama değiştiğinde fetch'i sıfırla
  }, []);

  const handleEdit = useCallback(
    (role: TRole) => {
      setSelectedRole(role);
      openRoleForm({
        name: role.name,
        app_id: role.app_id,
        description: role.description,
        developer: role.developer,
        isActive: role.isActive
      });
    },
    [setSelectedRole, openRoleForm]
  );

  const handleDelete = useCallback(
    async (role: TRole) => {
      if (!confirm(`"${role.name}" rolünü silmek istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deleteRole.mutateAsync(role.id);
        toast.success("Rol başarıyla silindi");
      } catch {
        toast.error("Rol silinirken bir hata oluştu");
      }
    },
    [deleteRole]
  );

  const handleAdd = useCallback(() => {
    setSelectedRole(null);
    // Seçili uygulama varsa form'a geçir
    openRoleForm(selectedAppId && selectedAppId !== "__all__" ? { app_id: selectedAppId } : undefined);
  }, [setSelectedRole, openRoleForm, selectedAppId]);

  const columns: GridColumnDef<TRole>[] = useMemo(
    () => [
      {
        id: "app_id",
        header: "Uygulama",
        accessorKey: "app_id",
        width: 180,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value) => getAppName(value as string),
        cell: (value) => (
          <Chip label={getAppName(value as string)} size="small" variant="outlined" />
        )
      },
      {
        id: "name",
        header: "Rol Adı",
        accessorKey: "name",
        width: 200,
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
        id: "developer",
        header: "Geliştirici",
        accessorKey: "developer",
        width: 110,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value) => (value ? "Evet" : "Hayır"),
        cell: (value) => (
          <Chip
            label={value ? "Evet" : "Hayır"}
            color={value ? "primary" : "default"}
            size="small"
          />
        )
      },
      {
        id: "isActive",
        header: "Durum",
        accessorKey: "isActive",
        width: 100,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value) => (value ? "Aktif" : "Pasif"),
        cell: (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            color={value ? "success" : "default"}
            size="small"
          />
        )
      },
      {
        id: "permissions",
        header: "İzinler",
        accessorKey: "id",
        width: 80,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <Tooltip title="İzin Matrisi">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openPermissionMatrix(row);
              }}
            >
              <Shield size={16} />
            </IconButton>
          </Tooltip>
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
    [getAppName, openPermissionMatrix, handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni Rol",
        icon: <Plus size={18} />,
        onClick: handleAdd,
        variant: "primary"
      },
      {
        id: "matrix",
        label: "İzin Matrisi",
        icon: <Grid3X3 size={18} />,
        onClick: () => setIsMatrixOpen(true),
        variant: "secondary"
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

  // Görüntülenecek roller - sadece fetch yapıldıysa göster
  const displayRoles = shouldFetch ? roles : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Roller</Typography>
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
          Rolleri görüntülemek için önce bir uygulama seçin ve "Getir" butonuna tıklayın.
        </Alert>
      )}

      <div style={{ height: 550 }}>
        <Grid<TRole>
          data={displayRoles}
          columns={columns}
          loading={isLoading && shouldFetch}
          height="100%"
          locale="tr"
          stateKey="sso-roles-grid"
          getRowId={(row) => row.id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "roller"
          }}
        />
      </div>

      {/* Rol İzin Matrisi Modal */}
      <RolePermissionMatrix
        open={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        initialAppId={selectedAppId === "__all__" ? undefined : selectedAppId || undefined}
      />
    </Box>
  );
}

export default RoleList;
