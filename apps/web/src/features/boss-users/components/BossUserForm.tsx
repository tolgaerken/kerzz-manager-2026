import { useState, useCallback, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { Search, Send } from "lucide-react";
import toast from "react-hot-toast";
import {
  useFindUserByPhone,
  useFindUserByEmail,
  useUpsertUser,
  useSendNotification
} from "../hooks/useBossUsers";
import type { SsoUser, BossLicenseUser } from "../types";

interface BossUserFormProps {
  license?: BossLicenseUser | null;
  onUserFound: (user: SsoUser) => void;
  onUserCreated: (user: SsoUser) => void;
}

export function BossUserForm({ license, onUserFound, onUserCreated }: BossUserFormProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const findByPhone = useFindUserByPhone();
  const findByEmail = useFindUserByEmail();
  const upsertUser = useUpsertUser();
  const sendNotification = useSendNotification();

  // License değiştiğinde formu doldur
  useEffect(() => {
    if (license) {
      setPhone(license.phone || "");
      setEmail(license.mail || "");
      setName(license.user_name || "");
      setUserId(license.user_id);
      setIsNewUser(false);
    } else {
      setPhone("");
      setEmail("");
      setName("");
      setUserId(null);
      setIsNewUser(true);
    }
  }, [license]);

  // Telefon ile ara
  const handlePhoneSearch = useCallback(async () => {
    if (!phone || phone.length < 10) {
      toast.error("Geçerli bir telefon numarası girin");
      return;
    }

    try {
      const user = await findByPhone.mutateAsync(phone);
      if (user) {
        setEmail(user.email || "");
        setName(user.name || "");
        setUserId(user.id);
        setIsNewUser(false);
        onUserFound(user);
        toast.success("Kullanıcı bulundu");
      } else {
        setIsNewUser(true);
        toast("Kullanıcı bulunamadı, yeni kullanıcı oluşturabilirsiniz", { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error("Arama başarısız");
    }
  }, [phone, findByPhone, onUserFound]);

  // Email ile ara
  const handleEmailSearch = useCallback(async () => {
    if (!email || !email.includes("@")) {
      toast.error("Geçerli bir email adresi girin");
      return;
    }

    try {
      const user = await findByEmail.mutateAsync(email);
      if (user) {
        setPhone(user.phone || "");
        setName(user.name || "");
        setUserId(user.id);
        setIsNewUser(false);
        onUserFound(user);
        toast.success("Kullanıcı bulundu");
      } else {
        setIsNewUser(true);
        toast("Kullanıcı bulunamadı, yeni kullanıcı oluşturabilirsiniz", { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error("Arama başarısız");
    }
  }, [email, findByEmail, onUserFound]);

  // Kullanıcı kaydet
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Ad alanı zorunludur");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Geçerli bir email adresi girin");
      return;
    }

    try {
      const user = await upsertUser.mutateAsync({
        id: userId || undefined,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined
      });
      setUserId(user.id);
      setIsNewUser(false);
      onUserCreated(user);
      toast.success(userId ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu");
    } catch (error) {
      toast.error("Kayıt başarısız");
    }
  }, [name, email, phone, userId, upsertUser, onUserCreated]);

  // Bildirim gönder
  const handleSendNotification = useCallback(async () => {
    if (!userId) {
      toast.error("Önce kullanıcı kaydedin");
      return;
    }

    try {
      const result = await sendNotification.mutateAsync({
        user_id: userId,
        sendSms: !!phone,
        sendEmail: !!email
      });

      if (result.sms?.success || result.email?.success) {
        toast.success("Bildirim gönderildi");
      } else {
        toast.error("Bildirim gönderilemedi");
      }
    } catch (error) {
      toast.error("Bildirim gönderilemedi");
    }
  }, [userId, phone, email, sendNotification]);

  const isSearching = findByPhone.isPending || findByEmail.isPending;
  const isSaving = upsertUser.isPending;
  const isSendingNotification = sendNotification.isPending;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {isNewUser && !license && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Telefon veya email ile mevcut kullanıcı arayabilir veya yeni kullanıcı oluşturabilirsiniz.
        </Alert>
      )}

      {/* Telefon */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5XX XXX XX XX"
          fullWidth
          size="small"
          disabled={isSearching}
        />
        <Button
          variant="outlined"
          onClick={handlePhoneSearch}
          disabled={isSearching || !phone}
          sx={{ minWidth: 100 }}
        >
          {isSearching ? <CircularProgress size={20} /> : <Search size={18} />}
        </Button>
      </Box>

      {/* Email */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="E-posta"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          fullWidth
          size="small"
          disabled={isSearching}
        />
        <Button
          variant="outlined"
          onClick={handleEmailSearch}
          disabled={isSearching || !email}
          sx={{ minWidth: 100 }}
        >
          {isSearching ? <CircularProgress size={20} /> : <Search size={18} />}
        </Button>
      </Box>

      {/* Ad */}
      <TextField
        label="Ad Soyad"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Kullanıcı adı"
        fullWidth
        size="small"
        required
      />

      {/* Butonlar */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
        <Button
          variant="outlined"
          onClick={handleSendNotification}
          disabled={!userId || isSendingNotification}
          startIcon={isSendingNotification ? <CircularProgress size={16} /> : <Send size={16} />}
        >
          Bildirim Gönder
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !name || !email}
        >
          {isSaving ? <CircularProgress size={20} /> : userId ? "Güncelle" : "Kaydet"}
        </Button>
      </Box>
    </Box>
  );
}
