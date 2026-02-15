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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert
} from "@mui/material";
import { X, Send, Mail, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useSendNotification } from "../hooks/useBossUsers";
import type { BossLicenseUser } from "../types";

interface BossNotificationDialogProps {
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

export function BossNotificationDialog({
  open,
  onClose,
  license
}: BossNotificationDialogProps) {
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  const sendNotification = useSendNotification();

  // Bildirim gönder
  const handleSend = useCallback(async () => {
    if (!license) return;
    if (!sendSms && !sendEmail) {
      toast.error("En az bir bildirim yöntemi seçin");
      return;
    }

    try {
      const result = await sendNotification.mutateAsync({
        user_id: license.user_id,
        sendSms: sendSms && !!license.phone,
        sendEmail: sendEmail && !!license.mail,
        customMessage: customMessage.trim() || undefined
      });

      const successMessages: string[] = [];
      const errorMessages: string[] = [];

      if (result.sms?.success) {
        successMessages.push("SMS");
      } else if (sendSms && license.phone && result.sms?.error) {
        errorMessages.push(`SMS: ${result.sms.error}`);
      }

      if (result.email?.success) {
        successMessages.push("Email");
      } else if (sendEmail && license.mail && result.email?.error) {
        errorMessages.push(`Email: ${result.email.error}`);
      }

      if (successMessages.length > 0) {
        toast.success(`${successMessages.join(" ve ")} gönderildi`);
      }
      if (errorMessages.length > 0) {
        toast.error(errorMessages.join(", "));
      }

      if (successMessages.length > 0) {
        handleClose();
      }
    } catch (error) {
      toast.error("Bildirim gönderilemedi");
    }
  }, [license, sendSms, sendEmail, customMessage, sendNotification]);

  // Kapat ve temizle
  const handleClose = useCallback(() => {
    setSendSms(true);
    setSendEmail(true);
    setCustomMessage("");
    onClose();
  }, [onClose]);

  const isSending = sendNotification.isPending;
  const hasPhone = !!license?.phone;
  const hasEmail = !!license?.mail;

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
            <Send size={20} color="var(--color-info)" />
            <Typography variant="h6" component="span" sx={{ color: "var(--color-foreground)" }}>
              Bildirim Gönder
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
            <Typography variant="body2" sx={{ color: "var(--color-foreground)" }}>
              <strong>{license.user_name}</strong>
            </Typography>
            {license.phone && (
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "var(--color-muted-foreground)" }}
              >
                Telefon: {license.phone}
              </Typography>
            )}
            {license.mail && (
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "var(--color-muted-foreground)" }}
              >
                Email: {license.mail}
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Bildirim Yöntemleri */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: "var(--color-muted-foreground)" }}>
              Bildirim Yöntemi
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    disabled={!hasPhone}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MessageSquare size={16} color="var(--color-foreground)" />
                    SMS
                    {!hasPhone && (
                      <Typography variant="caption" sx={{ color: "var(--color-error)" }}>
                        (Telefon yok)
                      </Typography>
                    )}
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    disabled={!hasEmail}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Mail size={16} color="var(--color-foreground)" />
                    Email
                    {!hasEmail && (
                      <Typography variant="caption" sx={{ color: "var(--color-error)" }}>
                        (Email yok)
                      </Typography>
                    )}
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* Özel Mesaj */}
          <TextField
            label="Özel Mesaj (Opsiyonel)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Boş bırakılırsa varsayılan mesaj gönderilir"
            multiline
            rows={3}
            fullWidth
            helperText="Varsayılan: Kerzz Boss uygulamasına erişiminiz tanımlandı..."
            sx={textFieldSx}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid var(--color-border)" }}>
        <Button
          onClick={handleClose}
          disabled={isSending}
          sx={{ color: "var(--color-muted-foreground)" }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isSending || (!sendSms && !sendEmail)}
          startIcon={isSending ? <CircularProgress size={16} /> : <Send size={16} />}
          sx={{
            bgcolor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            "&:hover": { bgcolor: "var(--color-primary)" }
          }}
        >
          Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
}
