import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Stack,
  Autocomplete,
  TextField
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
import { useLicenses, type License } from "../../../licenses";

export function UserLicenseModal() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditRolesDialogOpen, setIsEditRolesDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<TAppLicense | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Lisans arama için state
  const [licenseSearchQuery, setLicenseSearchQuery] = useState("");
  const [selectedContractLicense, setSelectedContractLicense] = useState<License | null>(null);

  const { 
    isUserLicenseModalOpen, 
    closeUserLicenseModal, 
    selectedUser,
    selectedAppIdForLicense 
  } = useSsoManagementStore();

  // Kullanıcının tüm lisanslarını çek, sonra aktif uygulamaya göre filtrele
  const { data: allUserLicenses = [], isLoading: licensesLoading } = useAppLicensesByUser(
    selectedUser?.id || null
  );
  
  // Aktif uygulamaya göre filtrele
  const licenses = useMemo(() => {
    if (!selectedAppIdForLicense) return allUserLicenses;
    return allUserLicenses.filter((l) => l.app_id === selectedAppIdForLicense);
  }, [allUserLicenses, selectedAppIdForLicense]);

  const { data: applications = [] } = useApplications(true);
  
  // Sadece aktif uygulamanın rollerini çek
  const { data: roles = [] } = useRoles(
    selectedAppIdForLicense 
      ? { appId: selectedAppIdForLicense } 
      : { appId: "__disabled__" }
  );

  // Lisans arama hook'u - ana lisans tablosundan (kerzz-contract)
  const { data: licensesResponse, isLoading: searchingLicenses } = useLicenses(
    licenseSearchQuery.length >= 2 
      ? { search: licenseSearchQuery, limit: 20 } 
      : { limit: 0 }
  );
  const searchedLicenses = licensesResponse?.data || [];

  const createAppLicense = useCreateAppLicense();
  const updateAppLicense = useUpdateAppLicense();
  const deleteAppLicense = useDeleteAppLicense();

  // Get app name by id
  const getAppName = useCallback(
    (appId: string) => {
      return applications.find((a) => a.id === appId)?.name || appId;
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
    if (!selectedUser || !selectedAppIdForLicense || !selectedContractLicense) return;

    try {
      await createAppLicense.mutateAsync({
        app_id: selectedAppIdForLicense,
        user_id: selectedUser.id,
        user_name: selectedUser.name,
        app_name: getAppName(selectedAppIdForLicense),
        licance_id: selectedContractLicense.id,
        brand: selectedContractLicense.brandName,
        license_type: selectedContractLicense.type,
        roles: []
      });
      toast.success("Lisans başarıyla eklendi");
      setIsAddDialogOpen(false);
      setSelectedContractLicense(null);
      setLicenseSearchQuery("");
    } catch {
      toast.error("Lisans eklenirken hata oluştu");
    }
  }, [selectedUser, selectedAppIdForLicense, selectedContractLicense, createAppLicense, getAppName]);

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
    } catch {
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
      } catch {
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

  const handleCloseAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setSelectedContractLicense(null);
    setLicenseSearchQuery("");
  }, []);

  // Grid sütunları - Uygulama sütunu kaldırıldı (tek uygulama bağlamında)
  const columns: GridColumnDef<TAppLicense>[] = useMemo(
    () => [
      {
        id: "brand",
        header: "Lisans",
        accessorKey: "brand",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (_: unknown, row: TAppLicense) => {
          const info = getLicenseInfo(row);
          return info ? (
            <span>{info}</span>
          ) : (
            <span className="text-[var(--color-muted-foreground)]">—</span>
          );
        }
      },
      {
        id: "roles",
        header: "Roller",
        accessorKey: "roles",
        width: 350,
        sortable: false,
        resizable: true,
        cell: (value: unknown) => {
          const roleIds = (value as string[]) || [];
          if (roleIds.length === 0) {
            return <span className="text-[var(--color-muted-foreground)]">Rol atanmamış</span>;
          }
          const names = getRoleNames(roleIds);
          return (
            <div className="flex flex-wrap gap-1">
              {names.map((name, idx) => (
                <Chip
                  key={idx}
                  label={name}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                />
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
              className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"
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
              className="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-error)]"
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
    [getRoleNames, getLicenseInfo, handleEditRoles, handleDeleteLicense]
  );

  // Modal başlığında uygulama adını göster
  const appName = selectedAppIdForLicense ? getAppName(selectedAppIdForLicense) : "";
  const modalTitle = `Lisans Yönetimi - ${selectedUser?.name || ""}${appName ? ` (${appName})` : ""}`;

  return (
    <>
      <SsoModal
        open={isUserLicenseModalOpen}
        onClose={closeUserLicenseModal}
        title={modalTitle}
        maxWidth="md"
        actions={
          <>
            <Button
              onClick={closeUserLicenseModal}
              sx={{
                color: "var(--color-muted-foreground)",
                "&:hover": { backgroundColor: "var(--color-surface-hover)" }
              }}
            >
              Kapat
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                "&:hover": { backgroundColor: "var(--color-primary)" }
              }}
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
            <Typography sx={{ color: "var(--color-muted-foreground)" }}>
              Bu kullanıcının {appName ? `"${appName}" uygulamasında` : ""} henüz lisansı yok
            </Typography>
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

      {/* Add License Dialog - Autocomplete ile lisans seçimi */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "var(--color-surface)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)"
          }
        }}
      >
        <DialogTitle sx={{ color: "var(--color-foreground)", borderBottom: "1px solid var(--color-border)" }}>
          Yeni Lisans Ekle
        </DialogTitle>
        <DialogContent sx={{ borderColor: "var(--color-border)" }}>
          <Box sx={{ mt: 2 }}>
            <Autocomplete<License>
              options={searchedLicenses}
              getOptionLabel={(option) => {
                const parts: string[] = [];
                if (option.brandName) parts.push(option.brandName);
                if (option.customerName) parts.push(option.customerName);
                return parts.join(" - ") || option._id;
              }}
              value={selectedContractLicense}
              onChange={(_, newValue) => setSelectedContractLicense(newValue)}
              inputValue={licenseSearchQuery}
              onInputChange={(_, newInputValue) => setLicenseSearchQuery(newInputValue)}
              loading={searchingLicenses}
              noOptionsText={
                licenseSearchQuery.length < 2 
                  ? "En az 2 karakter yazın..." 
                  : "Lisans bulunamadı"
              }
              loadingText="Aranıyor..."
              slotProps={{
                paper: {
                  sx: {
                    backgroundColor: "var(--color-surface-elevated)",
                    color: "var(--color-foreground)",
                    border: "1px solid var(--color-border)"
                  }
                },
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      backgroundColor: "var(--color-surface-elevated)",
                      color: "var(--color-foreground)"
                    },
                    "& .MuiAutocomplete-option:hover": {
                      backgroundColor: "var(--color-surface-hover)"
                    },
                    "& .MuiAutocomplete-option[aria-selected='true']": {
                      backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-elevated))"
                    },
                    "& .MuiAutocomplete-noOptions": {
                      color: "var(--color-muted-foreground)"
                    }
                  }
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "var(--color-surface-elevated)",
                  color: "var(--color-foreground)",
                  "& fieldset": { borderColor: "var(--color-border)" },
                  "&:hover fieldset": { borderColor: "var(--color-muted-foreground)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--color-primary)" }
                },
                "& .MuiInputLabel-root": { color: "var(--color-muted-foreground)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-primary)" }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lisans Ara"
                  placeholder="Marka veya müşteri adı ile arayın..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchingLicenses ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Box>
                    <Typography variant="body1" sx={{ color: "var(--color-foreground)" }}>
                      {option.brandName || "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
                      {option.customerName || option.email || ""} {option.type ? `(${option.type})` : ""}
                    </Typography>
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            
            {selectedContractLicense && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Seçilen Lisans Bilgileri:
                </Typography>
                <Typography variant="body2">
                  <strong>Marka:</strong> {selectedContractLicense.brandName || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Müşteri:</strong> {selectedContractLicense.customerName || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Tip:</strong> {selectedContractLicense.type || "—"}
                </Typography>
                {selectedContractLicense.address?.city && (
                  <Typography variant="body2">
                    <strong>Şehir:</strong> {selectedContractLicense.address.city}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid var(--color-border)", px: 3, py: 2 }}>
          <Button
            onClick={handleCloseAddDialog}
            sx={{
              color: "var(--color-muted-foreground)",
              "&:hover": { backgroundColor: "var(--color-surface-hover)" }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleAddLicense}
            disabled={!selectedContractLicense || createAppLicense.isPending}
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              "&:hover": { backgroundColor: "var(--color-primary)" },
              "&.Mui-disabled": {
                backgroundColor: "var(--color-surface-hover)",
                color: "var(--color-muted-foreground)"
              }
            }}
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
        PaperProps={{
          sx: {
            backgroundColor: "var(--color-surface)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)"
          }
        }}
      >
        <DialogTitle sx={{ color: "var(--color-foreground)", borderBottom: "1px solid var(--color-border)" }}>
          Rolleri Düzenle
          {selectedLicense && (
            <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
              {selectedLicense.brand || "Lisans"}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ borderColor: "var(--color-border)" }}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {roles.length === 0 ? (
              <Typography sx={{ color: "var(--color-muted-foreground)" }}>
                Bu uygulama için tanımlı rol bulunamadı
              </Typography>
            ) : (
              roles.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleToggleRole(role.id)}
                      sx={{
                        color: "var(--color-muted-foreground)",
                        "&.Mui-checked": { color: "var(--color-primary)" }
                      }}
                    />
                  }
                  label={role.name}
                  sx={{ color: "var(--color-foreground)" }}
                />
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid var(--color-border)", px: 3, py: 2 }}>
          <Button
            onClick={() => setIsEditRolesDialogOpen(false)}
            sx={{
              color: "var(--color-muted-foreground)",
              "&:hover": { backgroundColor: "var(--color-surface-hover)" }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRoles}
            disabled={updateAppLicense.isPending}
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              "&:hover": { backgroundColor: "var(--color-primary)" },
              "&.Mui-disabled": {
                backgroundColor: "var(--color-surface-hover)",
                color: "var(--color-muted-foreground)"
              }
            }}
          >
            {updateAppLicense.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserLicenseModal;
