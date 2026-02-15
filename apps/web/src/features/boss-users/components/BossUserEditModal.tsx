import { useState, useCallback, useEffect } from "react";
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
import type { BossLicenseUser, SsoUser } from "../types";

interface BossUserEditModalProps {
  open: boolean;
  onClose: () => void;
  license?: BossLicenseUser | null;
}

export function BossUserEditModal({ open, onClose, license }: BossUserEditModalProps) {
  const [currentUser, setCurrentUser] = useState<SsoUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  return (
    <>
      <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh" }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {license ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
          </Typography>
          <IconButton onClick={onClose} size="small" edge="end">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Kullanıcı Formu */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Kullanıcı Bilgileri
          </Typography>
          <BossUserForm
            license={license}
            onUserFound={handleUserFound}
            onUserCreated={handleUserCreated}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Lisans Yönetimi */}
        {currentUserId && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
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
