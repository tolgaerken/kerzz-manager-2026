import { useState, useCallback, useEffect, useMemo } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Typography
} from "@mui/material";
import { Search, Send, Check } from "lucide-react";
import toast from "react-hot-toast";
import {
  useFindUserByPhone,
  useFindUserByEmail,
  useUpsertUser,
  useSendNotification
} from "../hooks/useBossUsers";
import { useCustomerLookup } from "../../lookup";
import type { CustomerLookupItem } from "../../lookup";
import type { SsoUser, BossLicenseUser } from "../types";

interface BossUserFormProps {
  license?: BossLicenseUser | null;
  defaultCustomerId?: string;
  onUserFound: (user: SsoUser) => void;
  onUserCreated: (user: SsoUser) => void;
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
  }
} as const;

const autocompleteSx = {
  "& .MuiAutocomplete-popupIndicator": {
    color: "var(--color-muted-foreground)"
  },
  "& .MuiAutocomplete-clearIndicator": {
    color: "var(--color-muted-foreground)"
  }
} as const;

const autocompletePaperSx = {
  bgcolor: "var(--color-surface)",
  color: "var(--color-foreground)",
  border: "1px solid var(--color-border)"
} as const;

const autocompleteListboxSx = {
  bgcolor: "var(--color-surface)",
  "& .MuiAutocomplete-option": {
    color: "var(--color-foreground)",
    "&.Mui-focused": {
      bgcolor: "var(--color-surface-hover)"
    },
    "&.Mui-focusVisible": {
      bgcolor: "var(--color-surface-hover)"
    },
    '&[aria-selected="true"]': {
      bgcolor: "var(--color-surface-elevated)"
    },
    '&[aria-selected="true"].Mui-focused': {
      bgcolor: "var(--color-surface-hover)"
    }
  }
} as const;

const getCustomerLabel = (customer: CustomerLookupItem): string =>
  customer.name || customer.companyName || customer.erpId || customer.id || customer._id;

const normalizeCustomerOptionId = (customer: CustomerLookupItem): string => {
  const byId = customer.id?.toString().trim();
  if (byId) return byId;
  return customer._id;
};

export function BossUserForm({
  license,
  defaultCustomerId,
  onUserFound,
  onUserCreated
}: BossUserFormProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const findByPhone = useFindUserByPhone();
  const findByEmail = useFindUserByEmail();
  const upsertUser = useUpsertUser();
  const sendNotification = useSendNotification();
  const { customers, isLoading: customersLoading } = useCustomerLookup();

  // License değiştiğinde formu doldur
  useEffect(() => {
    if (license) {
      setPhone(license.phone || "");
      setEmail(license.mail || "");
      setName(license.user_name || "");
      setUserId(license.user_id);
      setCustomerId(license.customerId || defaultCustomerId || "");
      setIsNewUser(false);
    } else {
      setPhone("");
      setEmail("");
      setName("");
      setUserId(null);
      setCustomerId(defaultCustomerId || "");
      setIsNewUser(true);
    }
  }, [license, defaultCustomerId]);

  const selectedCustomer = useMemo(() => {
    const normalized = customerId.trim();
    if (!normalized) return null;
    return (
      customers.find((customer) => {
        const candidate = normalizeCustomerOptionId(customer);
        return candidate === normalized || customer._id === normalized;
      }) || null
    );
  }, [customerId, customers]);

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
        if (user.customerId) {
          setCustomerId(user.customerId);
        }
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
        if (user.customerId) {
          setCustomerId(user.customerId);
        }
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
    if (!customerId.trim()) {
      toast.error("Lutfen kullanicinin bagli oldugu sirketi secin");
      return;
    }

    try {
      const user = await upsertUser.mutateAsync({
        id: userId || undefined,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        customerId: customerId.trim()
      });
      setUserId(user.id);
      if (user.customerId) {
        setCustomerId(user.customerId);
      }
      setIsNewUser(false);
      onUserCreated(user);
      toast.success(userId ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu");
    } catch (error) {
      toast.error("Kayıt başarısız");
    }
  }, [name, email, phone, customerId, userId, upsertUser, onUserCreated]);

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
  const isUpdateMode = Boolean(userId);
  const hasName = name.trim().length > 0;
  const hasCustomer = customerId.trim().length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {isNewUser && !license && (
        <Alert
          severity="info"
          sx={{
            mb: 1,
            bgcolor: "var(--color-surface-elevated)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-info)"
          }}
        >
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
          sx={textFieldSx}
        />
        <Button
          variant="outlined"
          onClick={handlePhoneSearch}
          disabled={isSearching || !phone}
          sx={{
            minWidth: 100,
            color: "var(--color-foreground)",
            borderColor: "var(--color-border)",
            "&:hover": {
              borderColor: "var(--color-primary)",
              bgcolor: "var(--color-surface-hover)"
            }
          }}
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
          sx={textFieldSx}
        />
        <Button
          variant="outlined"
          onClick={handleEmailSearch}
          disabled={isSearching || email.trim().length === 0}
          sx={{
            minWidth: 100,
            color: "var(--color-foreground)",
            borderColor: "var(--color-border)",
            "&:hover": {
              borderColor: "var(--color-primary)",
              bgcolor: "var(--color-surface-hover)"
            }
          }}
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
        sx={textFieldSx}
      />

      <Box>
        <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "var(--color-warning)" }}>
          Kullanicinin bagli oldugu sirketi secin. Kullanici franchise olabilir; bu durumda ana sirket degil, kullanicinin kendi sirketi secilmelidir.
        </Typography>
        <Autocomplete
          options={customers}
          loading={customersLoading}
          value={selectedCustomer}
          onChange={(_, value) => setCustomerId(value ? normalizeCustomerOptionId(value) : "")}
          getOptionLabel={getCustomerLabel}
          isOptionEqualToValue={(option, value) => {
            const optionId = normalizeCustomerOptionId(option);
            const valueId = normalizeCustomerOptionId(value);
            return optionId === valueId || option._id === value._id;
          }}
          noOptionsText="Musteri bulunamadi"
          loadingText="Yukleniyor..."
          sx={autocompleteSx}
          slotProps={{
            paper: {
              sx: autocompletePaperSx
            },
            listbox: {
              sx: autocompleteListboxSx
            }
          }}
          renderOption={(props, option) => (
            <li {...props} key={`${option._id}-${option.id}`}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" sx={{ color: "var(--color-foreground)" }}>
                  {getCustomerLabel(option)}
                </Typography>
                <Typography variant="caption" sx={{ color: "var(--color-muted-foreground)" }}>
                  ERP: {option.erpId || "-"} - VKN: {option.taxNo || "-"}
                </Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Musteri (Sirket)"
              placeholder="Musteri adi, ERP veya VKN ile arayin"
              size="small"
              required
              sx={textFieldSx}
            />
          )}
        />
      </Box>

      {/* Butonlar */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
        <Button
          variant="outlined"
          onClick={handleSendNotification}
          disabled={!userId || isSendingNotification}
          startIcon={isSendingNotification ? <CircularProgress size={16} /> : <Send size={16} />}
          sx={{
            color: "var(--color-foreground)",
            borderColor: "var(--color-border)",
            "&:hover": {
              borderColor: "var(--color-primary)",
              bgcolor: "var(--color-surface-hover)"
            }
          }}
        >
          Bildirim Gönder
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !hasName || !hasCustomer}
          startIcon={
            isSaving ? <CircularProgress size={16} /> : isUpdateMode ? <Check size={16} /> : undefined
          }
          sx={{
            minWidth: 120,
            bgcolor: isUpdateMode ? "var(--color-success)" : "var(--color-primary)",
            color: isUpdateMode
              ? "var(--color-success-foreground)"
              : "var(--color-primary-foreground)",
            border: "1px solid",
            borderColor: isUpdateMode ? "var(--color-success)" : "var(--color-primary)",
            "&:hover": {
              bgcolor: isUpdateMode ? "var(--color-success)" : "var(--color-primary)"
            },
            "&.Mui-disabled": {
              bgcolor: "var(--color-surface-elevated)",
              color: "var(--color-muted-foreground)",
              borderColor: "var(--color-border)"
            }
          }}
        >
          {isUpdateMode ? "Güncelle" : "Kaydet"}
        </Button>
      </Box>
    </Box>
  );
}
