import { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Alert
} from "@mui/material";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { useBranches, useUpdateBranches } from "../hooks/useBossUsers";
import { useBossUsersStore } from "../store/bossUsersStore";
import { useLicenses } from "../../licenses/hooks/useLicenses";
import type { BossLicenseUser } from "../types";

interface BossBranchManagerProps {
  license: BossLicenseUser;
}

export function BossBranchManager({ license }: BossBranchManagerProps) {
  const { data: licensesData } = useLicenses({ limit: 100000 });

  // Bazı kayıtlarda sözleşme lisans id'si tutulmuş olabilir.
  // Helper endpoint LISANS_NO (licenseId) beklediğinden burada normalize ediyoruz.
  const resolvedLicenseId = useMemo(() => {
    const raw = (license.licance_id || "").trim();
    if (!raw || !licensesData?.data?.length) return raw;

    const directByLicenseNo = licensesData.data.find((l) => String(l.licenseId) === raw);
    if (directByLicenseNo) return raw;

    const mappedByContractId = licensesData.data.find((l) => l.id === raw);
    return mappedByContractId ? String(mappedByContractId.licenseId) : raw;
  }, [license.licance_id, licensesData?.data]);

  const { data: branches = [], isLoading: branchesLoading } = useBranches(resolvedLicenseId);
  const updateBranches = useUpdateBranches();

  const {
    selectedBranchCodes,
    setSelectedBranchCodes,
    toggleBranch,
    selectAllBranches,
    deselectAllBranches,
    setBranches
  } = useBossUsersStore();

  // Şubeleri store'a yükle
  useEffect(() => {
    if (branches.length > 0) {
      setBranches(branches.filter((branch) => branch.isActive));
    }
  }, [branches, setBranches]);

  // Mevcut yetkileri yükle
  useEffect(() => {
    if (license.branchCodes) {
      setSelectedBranchCodes(license.branchCodes);
    } else {
      setSelectedBranchCodes([]);
    }
  }, [license.branchCodes, setSelectedBranchCodes]);

  // Seçili şubeleri üstte göster
  const orderedBranches = useMemo(() => {
    return branches
      .filter((branch) => branch.isActive)
      .sort((a, b) => {
        const aSelected = selectedBranchCodes.includes(a.id);
        const bSelected = selectedBranchCodes.includes(b.id);

        if (aSelected !== bSelected) {
          return aSelected ? -1 : 1;
        }

        return a.name.localeCompare(b.name, "tr");
      });
  }, [branches, selectedBranchCodes]);

  const selectedVisibleCount = useMemo(
    () => orderedBranches.filter((branch) => selectedBranchCodes.includes(branch.id)).length,
    [orderedBranches, selectedBranchCodes]
  );

  // Tümü seçili mi?
  const allSelected = useMemo(
    () => orderedBranches.length > 0 && selectedVisibleCount === orderedBranches.length,
    [orderedBranches.length, selectedVisibleCount]
  );

  // Bazıları seçili mi?
  const someSelected = useMemo(
    () => selectedVisibleCount > 0 && selectedVisibleCount < orderedBranches.length,
    [orderedBranches.length, selectedVisibleCount]
  );

  // Tümünü seç/kaldır
  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      deselectAllBranches();
    } else {
      selectAllBranches();
    }
  }, [allSelected, selectAllBranches, deselectAllBranches]);

  // Kaydet
  const handleSave = useCallback(async () => {
    try {
      await updateBranches.mutateAsync({
        id: license.id,
        dto: { branchCodes: selectedBranchCodes }
      });
      toast.success("Şube yetkileri güncellendi");
    } catch (error) {
      toast.error("Şube yetkileri güncellenemedi");
    }
  }, [license.id, selectedBranchCodes, updateBranches]);

  const isSaving = updateBranches.isPending;

  if (branchesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (orderedBranches.length === 0) {
    return (
      <Alert
        severity="warning"
        sx={{
          bgcolor: "var(--color-surface-elevated)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-warning)"
        }}
      >
        Bu lisans için şube bilgisi bulunamadı
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Tümünü Seç */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          bgcolor: "var(--color-surface)",
          borderRadius: 1,
          border: "1px solid var(--color-border)"
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleToggleAll}
              sx={{
                color: "var(--color-muted-foreground)",
                "&.Mui-checked": {
                  color: "var(--color-primary)"
                },
                "&.MuiCheckbox-indeterminate": {
                  color: "var(--color-primary)"
                }
              }}
            />
          }
          label={
            <Typography variant="body2" fontWeight={500} sx={{ color: "var(--color-foreground)" }}>
              Tümünü Seç ({selectedVisibleCount}/{orderedBranches.length})
            </Typography>
          }
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : <Save size={16} />}
          sx={{
            bgcolor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            "&:hover": {
              bgcolor: "var(--color-primary)"
            }
          }}
        >
          Kaydet
        </Button>
      </Box>

      {/* Şube Listesi */}
      <List
        dense
        sx={{
          bgcolor: "var(--color-surface)",
          borderRadius: 1,
          border: "1px solid var(--color-border)",
          maxHeight: 300,
          overflow: "auto"
        }}
      >
        {orderedBranches.map((branch) => {
          const isSelected = selectedBranchCodes.includes(branch.id);
          return (
            <ListItem key={branch.id} disablePadding>
              <ListItemButton
                onClick={() => toggleBranch(branch.id)}
                dense
                sx={{
                  py: 0.5,
                  "&:hover": { bgcolor: "var(--color-surface-hover)" }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{
                      color: "var(--color-muted-foreground)",
                      "&.Mui-checked": {
                        color: "var(--color-primary)"
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={branch.name}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: {
                      fontWeight: isSelected ? 500 : 400,
                      color: branch.isActive
                        ? "var(--color-foreground)"
                        : "var(--color-muted-foreground)"
                    }
                  }}
                  secondary={!branch.isActive ? "Pasif" : undefined}
                  secondaryTypographyProps={{
                    variant: "caption",
                    sx: { color: "var(--color-error)" }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
