import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider
} from "@mui/material";
import { X } from "lucide-react";
import { BossUserForm } from "./BossUserForm";
import { BossLicenseManager } from "./BossLicenseManager";
import { BossBranchDialog } from "./BossBranchDialog";
import { useBossUsersStore } from "../store/bossUsersStore";
import { useLicenses } from "../../licenses/hooks/useLicenses";
import type { BossLicenseUser, SsoUser } from "../types";

interface BossUserEditModalProps {
  open: boolean;
  onClose: () => void;
  license?: BossLicenseUser | null;
}

export function BossUserEditModal({ open, onClose, license }: BossUserEditModalProps) {
  const [currentUser, setCurrentUser] = useState<SsoUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: licensesData } = useLicenses({ limit: 100000 });

  const {
    selectedLicenseForBranch,
    setSelectedLicenseForBranch
  } = useBossUsersStore();

  // License değiştiğinde state'i güncelle
  useEffect(() => {
    if (license) {
      setCurrentUserId(license.user_id);
    } else {
      setCurrentUserId(null);
      setCurrentUser(null);
    }
  }, [license]);

  // Modal kapandığında temizle
  useEffect(() => {
    if (!open) {
      setCurrentUser(null);
      setCurrentUserId(null);
      setSelectedLicenseForBranch(null);
    }
  }, [open, setSelectedLicenseForBranch]);

  // Kullanıcı bulunduğunda
  const handleUserFound = useCallback((user: SsoUser) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
  }, []);

  // Kullanıcı oluşturulduğunda
  const handleUserCreated = useCallback((user: SsoUser) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
  }, []);

  // Lisans seçildiğinde (şube yönetimi için)
  const handleLicenseSelect = useCallback(
    (selectedLicense: BossLicenseUser) => {
      setSelectedLicenseForBranch(selectedLicense);
    },
    [setSelectedLicenseForBranch]
  );

  const handleCloseBranchDialog = useCallback(() => {
    setSelectedLicenseForBranch(null);
  }, [setSelectedLicenseForBranch]);

  const defaultCustomerId = useMemo(() => {
    if (!license?.licance_id || !licensesData?.data?.length) return undefined;
    const normalized = license.licance_id.trim();
    const matched = licensesData.data.find(
      (item) => String(item.licenseId) === normalized || item.id === normalized
    );
    return matched?.customerId;
  }, [license?.licance_id, licensesData?.data]);

  return (
    <>
      <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          bgcolor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)"
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span" sx={{ color: "var(--color-foreground)" }}>
            {license ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            sx={{ color: "var(--color-muted-foreground)" }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          bgcolor: "var(--color-surface)",
          borderColor: "var(--color-border)"
        }}
      >
        {/* Kullanıcı Formu */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, fontWeight: 600, color: "var(--color-foreground)" }}
          >
            Kullanıcı Bilgileri
          </Typography>
          <BossUserForm
            license={license}
            defaultCustomerId={defaultCustomerId}
            onUserFound={handleUserFound}
            onUserCreated={handleUserCreated}
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: "var(--color-border)" }} />

        {/* Lisans Yönetimi */}
        {currentUserId && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 600, color: "var(--color-foreground)" }}
            >
              Lisans Yönetimi
            </Typography>
            <BossLicenseManager
              userId={currentUserId}
              userName={currentUser?.name || license?.user_name}
              onLicenseSelect={handleLicenseSelect}
            />
          </Box>
        )}

      </DialogContent>
      </Dialog>

      <BossBranchDialog
        open={Boolean(selectedLicenseForBranch)}
        license={selectedLicenseForBranch}
        onClose={handleCloseBranchDialog}
      />
    </>
  );
}
