import { useMemo, useCallback, useState } from "react";
import { Box, Typography, Chip, IconButton, Tooltip, Alert } from "@mui/material";
import { Key, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { useSsoUsers, useRemoveUser } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import { AppSelector } from "../common";
import type { TUser } from "../../types";

export function UserList() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: users = [],
    isLoading,
    refetch
  } = useSsoUsers(
    shouldFetch && selectedAppId
      ? {
          appId: selectedAppId === "__all__" ? undefined : selectedAppId,
          all: selectedAppId === "__all__"
        }
      : { appId: "__disabled__" }
  );

  const removeUser = useRemoveUser();

  const { openUserForm, setSelectedUser, openUserLicenseModal } = useSsoManagementStore();

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
    (user: TUser) => {
      setSelectedUser(user);
      openUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive
      });
    },
    [setSelectedUser, openUserForm]
  );

  const handleDelete = useCallback(
    async (user: TUser) => {
      if (
        !confirm(`"${user.name}" kullanıcısını uygulamadan kaldırmak istediğinize emin misiniz?`)
      ) {
        return;
      }

      try {
        await removeUser.mutateAsync(user.id);
        toast.success("Kullanıcı başarıyla kaldırıldı");
      } catch {
        toast.error("Kullanıcı kaldırılırken bir hata oluştu");
      }
    },
    [removeUser]
  );

  const columns: GridColumnDef<TUser>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Ad Soyad",
        accessorKey: "name",
        width: 200,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "email",
        header: "E-posta",
        accessorKey: "email",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "phone",
        header: "Telefon",
        accessorKey: "phone",
        width: 150,
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
        id: "licenses",
        header: "Lisanslar",
        accessorKey: "id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <Tooltip title="Lisans Yönetimi">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openUserLicenseModal(row);
              }}
            >
              <Key size={16} />
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
              title="Kaldır"
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
    [openUserLicenseModal, handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "secondary"
      }
    ],
    [refetch]
  );

  const displayUsers = shouldFetch ? users : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Kullanıcılar</Typography>
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
          Kullanıcıları görüntülemek için önce bir uygulama seçin ve "Getir" butonuna tıklayın.
        </Alert>
      )}

      <div style={{ height: 550 }}>
        <Grid<TUser>
          data={displayUsers}
          columns={columns}
          loading={isLoading && shouldFetch}
          height="100%"
          locale="tr"
          stateKey="sso-users-grid"
          getRowId={(row) => row.id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "kullanicilar"
          }}
        />
      </div>
    </Box>
  );
}

export default UserList;
