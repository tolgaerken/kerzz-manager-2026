import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from "@mui/material";
import { X, Ban, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useBlockUser } from "../hooks/useBossUsers";
import type { BossLicenseUser } from "../types";

interface BossUserBlockDialogProps {
  open: boolean;
  onClose: () => void;
  license: BossLicenseUser | null;
}

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
  },
  "& .MuiFormHelperText-root": {
    color: "var(--color-muted-foreground)"
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

export function BossUserBlockDialog({ open, onClose, license }: BossUserBlockDialogProps) {
  const [blockType, setBlockType] = useState<"block" | "info">("block");
  const [message, setMessage] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  const blockUser = useBlockUser();

  // Engelle
  const handleBlock = useCallback(async () => {
    if (!license) return;
    if (!message.trim()) {
      toast.error("Mesaj alanı zorunludur");
      return;
    }

    try {
      await blockUser.mutateAsync({
        id: license.id,
        dto: {
          type: blockType,
          message: message.trim(),
          paymentLink: paymentLink.trim() || undefined
        }
      });
      toast.success(blockType === "block" ? "Kullanıcı engellendi" : "Bilgi mesajı eklendi");
      handleClose();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  }, [license, blockType, message, paymentLink, blockUser]);

  // Kapat ve temizle
  const handleClose = useCallback(() => {
    setBlockType("block");
    setMessage("");
    setPaymentLink("");
    onClose();
  }, [onClose]);

  const isBlocking = blockUser.isPending;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)"
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {blockType === "block" ? (
              <Ban size={20} color="var(--color-error)" />
            ) : (
              <AlertTriangle size={20} color="var(--color-warning)" />
            )}
            <Typography variant="h6" component="span" sx={{ color: "var(--color-foreground)" }}>
              {blockType === "block" ? "Kullanıcı Engelle" : "Bilgi Mesajı Gönder"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
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
          bgcolor: "var(--color-surface)",
          borderColor: "var(--color-border)"
        }}
      >
        {license && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              bgcolor: "var(--color-surface-elevated)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-info)"
            }}
          >
            <strong>{license.user_name}</strong> - {license.brand}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Engelleme Tipi */}
          <FormControl fullWidth size="small" sx={selectSx}>
            <InputLabel>İşlem Tipi</InputLabel>
            <Select
              value={blockType}
              onChange={(e) => setBlockType(e.target.value as "block" | "info")}
              label="İşlem Tipi"
            >
              <MenuItem value="block">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Ban size={16} color="var(--color-error)" />
                  Engelle (Kullanıcı uygulamaya giremez)
                </Box>
              </MenuItem>
              <MenuItem value="info">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AlertTriangle size={16} color="var(--color-warning)" />
                  Bilgi (Uyarı mesajı gösterilir)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Mesaj */}
          <TextField
            label="Mesaj"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              blockType === "block"
                ? "Örn: Ödeme yapılmadığı için hesabınız askıya alınmıştır."
                : "Örn: Ödeme tarihiniz yaklaşmaktadır."
            }
            multiline
            rows={3}
            fullWidth
            required
            sx={textFieldSx}
          />

          {/* Ödeme Linki (Opsiyonel) */}
          <TextField
            label="Ödeme Linki (Opsiyonel)"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            placeholder="https://..."
            fullWidth
            helperText="Kullanıcıya gösterilecek ödeme sayfası linki"
            sx={textFieldSx}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid var(--color-border)" }}>
        <Button
          onClick={handleClose}
          disabled={isBlocking}
          sx={{ color: "var(--color-muted-foreground)" }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleBlock}
          disabled={isBlocking || !message.trim()}
          startIcon={
            isBlocking ? (
              <CircularProgress size={16} />
            ) : blockType === "block" ? (
              <Ban size={16} />
            ) : (
              <AlertTriangle size={16} />
            )
          }
          sx={{
            bgcolor: blockType === "block" ? "var(--color-error)" : "var(--color-warning)",
            color:
              blockType === "block"
                ? "var(--color-error-foreground)"
                : "var(--color-warning-foreground)",
            "&:hover": {
              bgcolor: blockType === "block" ? "var(--color-error)" : "var(--color-warning)"
            }
          }}
        >
          {blockType === "block" ? "Engelle" : "Bilgi Gönder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
