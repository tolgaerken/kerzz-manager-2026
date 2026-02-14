import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Stack
} from "@mui/material";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import toast from "react-hot-toast";
import { SsoModal } from "../common";
import {
  useAppLicensesByUser,
  useApplications,
  useRoles,
  useCreateAppLicense,
  useUpdateAppLicense,
  useDeleteAppLicense
} from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { TAppLicense } from "../../types";

export function UserLicenseModal() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditRolesDialogOpen, setIsEditRolesDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<TAppLicense | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { isUserLicenseModalOpen, closeUserLicenseModal, selectedUser } = useSsoManagementStore();

  const { data: licenses = [], isLoading: licensesLoading } = useAppLicensesByUser(
    selectedUser?.id || null
  );
  const { data: applications = [] } = useApplications(true);
  const { data: roles = [] } = useRoles({ all: true });

  const createAppLicense = useCreateAppLicense();
  const updateAppLicense = useUpdateAppLicense();
  const deleteAppLicense = useDeleteAppLicense();

  // Get apps that user doesn't have license for
  const availableApps = useMemo(() => {
    const licensedAppIds = new Set(licenses.map((l) => l.app_id));
    return applications.filter((app) => !licensedAppIds.has(app.id));
  }, [applications, licenses]);

  // Get app name by id, with fallback to license's app_name field
  const getAppName = useCallback(
    (appId: string, license?: TAppLicense) => {
      const fromList = applications.find((a) => a.id === appId)?.name;
      if (fromList) return fromList;
      if (license?.app_name) return license.app_name;
      return appId;
    },
    [applications]
  );

  // Get role names by ids
  const getRoleNames = useCallback(
    (roleIds: string[]) => {
      return roleIds.map((id) => roles.find((r) => r.id === id)?.name || id);
    },
    [roles]
  );

  // Get license/brand display text
  const getLicenseInfo = useCallback(
    (license: TAppLicense) => {
      const parts: string[] = [];
      if (license.brand) parts.push(license.brand);
      if (license.license_type) parts.push(license.license_type);
      return parts.length > 0 ? parts.join(" - ") : null;
    },
    []
  );

  const handleAddLicense = useCallback(async () => {
    if (!selectedUser || !selectedAppId) return;

    try {
      await createAppLicense.mutateAsync({
        app_id: selectedAppId,
        user_id: selectedUser.id,
        user_name: selectedUser.name,
        app_name: getAppName(selectedAppId),
        roles: []
      });
      toast.success("Lisans başarıyla eklendi");
      setIsAddDialogOpen(false);
      setSelectedAppId("");
    } catch (error) {
      toast.error("Lisans eklenirken hata oluştu");
    }
  }, [selectedUser, selectedAppId, createAppLicense, getAppName]);

  const handleEditRoles = useCallback((license: TAppLicense) => {
    setSelectedLicense(license);
    setSelectedRoles(license.roles || []);
    setIsEditRolesDialogOpen(true);
  }, []);

  const handleSaveRoles = useCallback(async () => {
    if (!selectedLicense?.id) return;

    try {
      await updateAppLicense.mutateAsync({
        id: selectedLicense.id,
        data: { roles: selectedRoles }
      });
      toast.success("Roller başarıyla güncellendi");
      setIsEditRolesDialogOpen(false);
      setSelectedLicense(null);
      setSelectedRoles([]);
    } catch (error) {
      toast.error("Roller güncellenirken hata oluştu");
    }
  }, [selectedLicense, selectedRoles, updateAppLicense]);

  const handleDeleteLicense = useCallback(
    async (license: TAppLicense) => {
      if (!confirm(`Bu lisansı kaldırmak istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deleteAppLicense.mutateAsync(license.id!);
        toast.success("Lisans başarıyla kaldırıldı");
      } catch (error) {
        toast.error("Lisans kaldırılırken hata oluştu");
      }
    },
    [deleteAppLicense]
  );

  const handleToggleRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      return [...prev, roleId];
    });
  }, []);

  const columns: GridColumnDef<TAppLicense>[] = useMemo(
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
        cell: (value: unknown, row: TAppLicense) => (
          <Chip label={getAppName(value as string, row)} size="small" />
        )
      },
      {
        id: "brand",
        header: "Lisans",
        accessorKey: "brand",
        width: 200,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (_: unknown, row: TAppLicense) => {
          const info = getLicenseInfo(row);
          return info ? (
            <span>{info}</span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        }
      },
      {
        id: "roles",
        header: "Roller",
        accessorKey: "roles",
        width: 300,
        sortable: false,
        resizable: true,
        cell: (value: unknown) => {
          const roleIds = (value as string[]) || [];
          if (roleIds.length === 0) {
            return <span className="text-gray-400">Rol atanmamış</span>;
          }
          const names = getRoleNames(roleIds);
          return (
            <div className="flex flex-wrap gap-1">
              {names.map((name, idx) => (
                <Chip key={idx} label={name} size="small" variant="outlined" />
              ))}
            </div>
          );
        }
      },
      {
        id: "_actions",
        header: "İşlemler",
        accessorKey: "id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_: unknown, row: TAppLicense) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                handleEditRoles(row);
              }}
              title="Rolleri Düzenle"
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteLicense(row);
              }}
              title="Lisansı Kaldır"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [getAppName, getRoleNames, getLicenseInfo, handleEditRoles, handleDeleteLicense]
  );

  return (
    <>
      <SsoModal
        open={isUserLicenseModalOpen}
        onClose={closeUserLicenseModal}
        title={`Lisans Yönetimi - ${selectedUser?.name || ""}`}
        maxWidth="md"
        actions={
          <>
            <Button onClick={closeUserLicenseModal}>Kapat</Button>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setIsAddDialogOpen(true)}
              disabled={availableApps.length === 0}
            >
              Lisans Ekle
            </Button>
          </>
        }
      >
        {licensesLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : licenses.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">Bu kullanıcının henüz lisansı yok</Typography>
          </Box>
        ) : (
          <div style={{ height: 400 }}>
            <Grid<TAppLicense>
              data={licenses}
              columns={columns}
              loading={licensesLoading}
              height="100%"
              locale="tr"
              stateKey="sso-user-licenses-grid"
              getRowId={(row) => row.id}
            />
          </div>
        )}
      </SsoModal>

      {/* Add License Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Lisans Ekle</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Uygulama</InputLabel>
            <Select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              label="Uygulama"
            >
              {availableApps.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleAddLicense}
            disabled={!selectedAppId || createAppLicense.isPending}
          >
            {createAppLicense.isPending ? "Ekleniyor..." : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Roles Dialog */}
      <Dialog
        open={isEditRolesDialogOpen}
        onClose={() => setIsEditRolesDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Rolleri Düzenle
          {selectedLicense && (
            <Typography variant="body2" color="text.secondary">
              {getAppName(selectedLicense.app_id, selectedLicense)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {(() => {
              const appRoles = selectedLicense
                ? roles.filter((r) => r.app_id === selectedLicense.app_id)
                : roles;

              if (appRoles.length === 0) {
                return (
                  <Typography color="text.secondary">
                    Bu uygulama için tanımlı rol bulunamadı
                  </Typography>
                );
              }

              return appRoles.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleToggleRole(role.id)}
                    />
                  }
                  label={role.name}
                />
              ));
            })()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditRolesDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSaveRoles}
            disabled={updateAppLicense.isPending}
          >
            {updateAppLicense.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserLicenseModal;
