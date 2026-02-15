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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {blockType === "block" ? (
              <Ban className="text-red-500" size={20} />
            ) : (
              <AlertTriangle className="text-yellow-500" size={20} />
            )}
            <Typography variant="h6" component="span">
              {blockType === "block" ? "Kullanıcı Engelle" : "Bilgi Mesajı Gönder"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" edge="end">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {license && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{license.user_name}</strong> - {license.brand}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Engelleme Tipi */}
          <FormControl fullWidth size="small">
            <InputLabel>İşlem Tipi</InputLabel>
            <Select
              value={blockType}
              onChange={(e) => setBlockType(e.target.value as "block" | "info")}
              label="İşlem Tipi"
            >
              <MenuItem value="block">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Ban size={16} className="text-red-500" />
                  Engelle (Kullanıcı uygulamaya giremez)
                </Box>
              </MenuItem>
              <MenuItem value="info">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AlertTriangle size={16} className="text-yellow-500" />
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
          />

          {/* Ödeme Linki (Opsiyonel) */}
          <TextField
            label="Ödeme Linki (Opsiyonel)"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            placeholder="https://..."
            fullWidth
            helperText="Kullanıcıya gösterilecek ödeme sayfası linki"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isBlocking}>
          İptal
        </Button>
        <Button
          variant="contained"
          color={blockType === "block" ? "error" : "warning"}
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
        >
          {blockType === "block" ? "Engelle" : "Bilgi Gönder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
