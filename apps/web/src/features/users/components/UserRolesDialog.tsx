import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton
} from "@mui/material";
import { X } from "lucide-react";
import { useUserRoles, useUpdateUserRoles } from "../hooks/useUsers";
import type { AppUser, Role } from "../types/user.types";

interface UserRolesDialogProps {
  open: boolean;
  onClose: () => void;
  user: AppUser;
  roles: Role[];
}

export function UserRolesDialog({ open, onClose, user, roles }: UserRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: userRoles = [], isLoading, error } = useUserRoles(user.id);
  const updateUserRoles = useUpdateUserRoles();

  // Initialize selected roles when data loads
  useEffect(() => {
    if (userRoles.length > 0) {
      setSelectedRoles(userRoles);
    }
  }, [userRoles]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    try {
      await updateUserRoles.mutateAsync({
        userId: user.id,
        roles: selectedRoles
      });
      onClose();
    } catch (err) {
      console.error("Update roles error:", err);
    }
  };

  const hasChanges =
    JSON.stringify([...selectedRoles].sort()) !== JSON.stringify([...userRoles].sort());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Kullanıcı Rolleri: {user.name}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Roller yüklenirken hata oluştu</Alert>
        ) : roles.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Henüz tanımlanmış rol bulunmuyor
          </Typography>
        ) : (
          <FormGroup>
            {roles.map((role) => (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{role.name}</Typography>
                    {role.description && (
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        )}

        {updateUserRoles.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Roller güncellenirken hata oluştu
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges || updateUserRoles.isPending}
        >
          {updateUserRoles.isPending ? <CircularProgress size={20} /> : "Kaydet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserRolesDialog;
