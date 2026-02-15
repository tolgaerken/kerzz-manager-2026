import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Alert,
  Autocomplete,
  TextField
} from "@mui/material";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  useBossLicensesByUser,
  useUpsertLicense,
  useDeleteLicense,
  useBossRoles
} from "../hooks/useBossUsers";
import { useLicenses } from "../../licenses/hooks/useLicenses";
import type { BossLicenseUser } from "../types";
import type { License } from "../../licenses/types";
import type { TRole } from "../../sso-management/types";

const normalizeRoleKey = (value: string): string => value.trim().toLowerCase();

const textFieldSx = {
  "& .MuiInputLabel-root": {
    color: "var(--color-muted-foreground)"
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-primary)"
  },
  "& .MuiOutlinedInput-root": {
    color: "var(--color-foreground)",
    bgcolor: "var(--color-surface)",
    "& fieldset": {
      borderColor: "var(--color-border)"
    },
    "&:hover fieldset": {
      borderColor: "var(--color-primary)"
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-primary)"
    }
  }
} as const;

const selectSx = {
  "& .MuiInputLabel-root": {
    color: "var(--color-muted-foreground)"
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-primary)"
  },
  "& .MuiOutlinedInput-root": {
    color: "var(--color-foreground)",
    bgcolor: "var(--color-surface)",
    "& fieldset": {
      borderColor: "var(--color-border)"
    },
    "&:hover fieldset": {
      borderColor: "var(--color-primary)"
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-primary)"
    }
  }
} as const;

interface BossLicenseManagerProps {
  userId: string;
  userName?: string;
  onLicenseSelect: (license: BossLicenseUser) => void;
}

export function BossLicenseManager({
  userId,
  userName,
  onLicenseSelect
}: BossLicenseManagerProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [licenseSearchQuery, setLicenseSearchQuery] = useState("");
  const [selectedLicenseOption, setSelectedLicenseOption] = useState<License | null>(null);

  // Kullanıcının mevcut Boss lisansları
  const { data: userLicenses = [], isLoading: licensesLoading } = useBossLicensesByUser(userId);

  // Kerzz Boss rolleri
  const { data: roles = [], isLoading: rolesLoading } = useBossRoles();

  // Rol ID -> Name map'i oluştur
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role: TRole) => {
      map.set(role.id, role.name);
      map.set(role.name, role.name); // name ile de eşleştir (eski veriler için)
      map.set(normalizeRoleKey(role.id), role.name);
      map.set(normalizeRoleKey(role.name), role.name);
    });
    return map;
  }, [roles]);

  // Rol ID'lerini isimlere çevir
  const getRoleName = useCallback((roleId: string) => {
    return roleMap.get(roleId) || roleMap.get(normalizeRoleKey(roleId)) || roleId;
  }, [roleMap]);

  // Lisanslar (kerzz-contract - LicensesPage ile aynı kaynak)
  const { data: licensesData, isLoading: licensesDataLoading } = useLicenses({ limit: 100000 });

  // Lisans arama (client-side filter)
  const searchedLicenses = useMemo(() => {
    if (!licensesData?.data || licenseSearchQuery.length < 2) return [];
    const query = licenseSearchQuery.toLowerCase();
    return licensesData.data
      .filter(
        (l) =>
          l.brandName?.toLowerCase().includes(query) ||
          String(l.licenseId).includes(query) ||
          l.customerName?.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [licensesData?.data, licenseSearchQuery]);

  const searchLoading = licensesDataLoading;

  const upsertLicense = useUpsertLicense();
  const deleteLicense = useDeleteLicense();

  // Lisans ekle
  const handleAddLicense = useCallback(async () => {
    if (!selectedLicenseOption) {
      toast.error("Lisans seçin");
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error("En az bir rol seçin");
      return;
    }

    // Aynı lisans zaten ekli mi kontrol et
    // Şube servisi LISANS_NO (licenseId) formatını bekliyor.
    const licenseId = String(selectedLicenseOption.licenseId);
    const contractLicenseId = selectedLicenseOption.id;
    const existing = userLicenses.find(
      (l) => l.licance_id === licenseId || l.licance_id === contractLicenseId
    );
    if (existing) {
      toast.error("Bu lisans zaten ekli");
      return;
    }

    try {
      await upsertLicense.mutateAsync({
        user_id: userId,
        user_name: userName,
        licance_id: licenseId,
        brand: selectedLicenseOption.brandName || "",
        roles: selectedRoles
      });
      toast.success("Lisans eklendi");
      setSelectedLicenseOption(null);
      setSelectedRoles([]);
      setLicenseSearchQuery("");
    } catch (error) {
      toast.error("Lisans eklenemedi");
    }
  }, [selectedLicenseOption, selectedRoles, userLicenses, userId, userName, upsertLicense]);

  // Lisans sil
  const handleDeleteLicense = useCallback(
    async (license: BossLicenseUser) => {
      if (!confirm(`"${license.brand}" lisansını silmek istediğinize emin misiniz?`)) {
        return;
      }
      try {
        await deleteLicense.mutateAsync(license.id);
        toast.success("Lisans silindi");
      } catch (error) {
        toast.error("Lisans silinemedi");
      }
    },
    [deleteLicense]
  );

  // Lisans seç (şube yönetimi için)
  const handleSelectLicense = useCallback(
    (license: BossLicenseUser) => {
      onLicenseSelect(license);
    },
    [onLicenseSelect]
  );

  const isAdding = upsertLicense.isPending;
  const isDeleting = deleteLicense.isPending;

  const handleRolesChange = useCallback((value: unknown) => {
    if (Array.isArray(value)) {
      setSelectedRoles(value.filter((role): role is string => typeof role === "string"));
      return;
    }

    if (typeof value === "string") {
      setSelectedRoles(value.split(",").filter(Boolean));
      return;
    }

    setSelectedRoles([]);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Lisans Ekleme Formu */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          bgcolor: "var(--color-surface)",
          borderRadius: 1,
          border: "1px solid var(--color-border)"
        }}
      >
        <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
          Yeni lisans ekle
        </Typography>

        {/* Lisans Seçici */}
        <Autocomplete
          options={searchedLicenses}
          getOptionLabel={(option) => `${option.brandName || ""} (${option.licenseId})`}
          value={selectedLicenseOption}
          onChange={(_, value) => setSelectedLicenseOption(value)}
          inputValue={licenseSearchQuery}
          onInputChange={(_, value) => setLicenseSearchQuery(value)}
          loading={searchLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Lisans Ara"
              placeholder="Marka veya lisans ID ile ara..."
              size="small"
              sx={textFieldSx}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Box>
                <Typography variant="body2">{option.brandName || "-"}</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-muted-foreground)" }}>
                  {option.licenseId} {option.customerName && `- ${option.customerName}`}
                </Typography>
              </Box>
            </li>
          )}
          noOptionsText="Lisans bulunamadı"
          loadingText="Aranıyor..."
          slotProps={{
            paper: {
              sx: {
                bgcolor: "var(--color-surface)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)"
              }
            }
          }}
        />

        {/* Rol Seçici */}
        <FormControl size="small" fullWidth sx={selectSx}>
          <InputLabel>Roller</InputLabel>
          <Select
            multiple
            value={selectedRoles}
            onChange={(e) => handleRolesChange(e.target.value)}
            label="Roller"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {Array.isArray(selected)
                  ? selected.map((roleId) => (
                      <Chip
                        key={String(roleId)}
                        label={getRoleName(String(roleId))}
                        size="small"
                        sx={{
                          bgcolor: "var(--color-surface-elevated)",
                          color: "var(--color-foreground)",
                          border: "1px solid var(--color-border)"
                        }}
                      />
                    ))
                  : null}
              </Box>
            )}
            disabled={rolesLoading}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "var(--color-surface)",
                  color: "var(--color-foreground)",
                  border: "1px solid var(--color-border)"
                }
              }
            }}
          >
            {roles.map((role: TRole) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ekle Butonu */}
        <Button
          variant="contained"
          onClick={handleAddLicense}
          disabled={isAdding || !selectedLicenseOption || selectedRoles.length === 0}
          startIcon={isAdding ? <CircularProgress size={16} /> : <Plus size={16} />}
          sx={{
            bgcolor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            "&:hover": {
              bgcolor: "var(--color-primary)"
            }
          }}
        >
          Lisans Ekle
        </Button>
      </Box>

      {/* Mevcut Lisanslar */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1, color: "var(--color-muted-foreground)" }}>
          Mevcut Lisanslar ({userLicenses.length})
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mb: 1, color: "var(--color-muted-foreground)" }}>
          Şube yetkilerini düzenlemek için lisans satırına tıklayın.
        </Typography>

        {licensesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : userLicenses.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              bgcolor: "var(--color-surface-elevated)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-info)"
            }}
          >
            Henüz lisans eklenmemiş
          </Alert>
        ) : (
          <List
            dense
            sx={{
              bgcolor: "var(--color-surface)",
              borderRadius: 1,
              border: "1px solid var(--color-border)"
            }}
          >
            {userLicenses.map((license) => (
              <ListItem
                key={license.id}
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--color-surface-hover)" },
                  borderBottom: "1px solid var(--color-border)"
                }}
                onClick={() => handleSelectLicense(license)}
              >
                <ListItemText
                  primaryTypographyProps={{ component: "div" }}
                  secondaryTypographyProps={{ component: "div" }}
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ color: "var(--color-foreground)" }}
                      >
                        {license.brand || license.licance_id}
                      </Typography>
                      {license.statusText && (
                        <Chip
                          label="Engelli"
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: "var(--color-error)",
                            color: "var(--color-error-foreground)"
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                      {(license.roles || []).map((roleId) => (
                        <Chip
                          key={roleId}
                          label={getRoleName(roleId)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            borderColor: "var(--color-border)",
                            color: "var(--color-muted-foreground)"
                          }}
                        />
                      ))}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLicense(license);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} color="var(--color-error)" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleSelectLicense(license)}
                    sx={{ color: "var(--color-muted-foreground)" }}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
