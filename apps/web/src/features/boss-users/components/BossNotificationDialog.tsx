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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Send className="text-blue-500" size={20} />
            <Typography variant="h6" component="span">
              Bildirim Gönder
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
            <Typography variant="body2">
              <strong>{license.user_name}</strong>
            </Typography>
            {license.phone && (
              <Typography variant="caption" display="block">
                Telefon: {license.phone}
              </Typography>
            )}
            {license.mail && (
              <Typography variant="caption" display="block">
                Email: {license.mail}
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Bildirim Yöntemleri */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                    <MessageSquare size={16} />
                    SMS
                    {!hasPhone && (
                      <Typography variant="caption" color="error">
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
                    <Mail size={16} />
                    Email
                    {!hasEmail && (
                      <Typography variant="caption" color="error">
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
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSending}>
          İptal
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={isSending || (!sendSms && !sendEmail)}
          startIcon={isSending ? <CircularProgress size={16} /> : <Send size={16} />}
        >
          Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
}
