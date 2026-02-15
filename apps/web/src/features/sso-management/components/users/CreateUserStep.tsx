import { useState, useCallback } from "react";
import { Button, Stack, Alert } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { SsoFormField } from "../common";

interface CreateUserFormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  general?: string;
}

interface CreateUserStepProps {
  initialSearchQuery: string;
  onSubmit: (data: CreateUserFormData) => void;
  onBack: () => void;
  isPending: boolean;
}

function getInitialFormData(searchQuery: string): CreateUserFormData {
  const isEmail = /^[^\s@]+@[^\s@]+/.test(searchQuery);
  const isPhone = /^[0-9+\s()-]{3,}$/.test(searchQuery.trim());

  return {
    name: "",
    email: isEmail ? searchQuery : "",
    phone: isPhone ? searchQuery : ""
  };
}

export function CreateUserStep({
  initialSearchQuery,
  onSubmit,
  onBack,
  isPending
}: CreateUserStepProps) {
  const [formData, setFormData] = useState<CreateUserFormData>(
    () => getInitialFormData(initialSearchQuery)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const handleFieldChange = useCallback(
    (field: keyof CreateUserFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      if (errors.general) {
        setErrors((prev) => ({ ...prev, general: undefined }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ad Soyad zorunludur";
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.general = "E-posta veya telefon numarasından en az biri gereklidir";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    onSubmit(formData);
  }, [validateForm, onSubmit, formData]);

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={onBack}
        sx={{
          alignSelf: "flex-start",
          color: "var(--color-muted-foreground)",
          "&:hover": { backgroundColor: "var(--color-surface-hover)" }
        }}
        size="small"
      >
        Aramaya Dön
      </Button>

      <Alert
        severity="info"
        sx={{
          color: "var(--color-info)",
          border: "1px solid color-mix(in srgb, var(--color-info) 30%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-info) 10%, transparent)",
          "& .MuiAlert-icon": { color: "var(--color-info)" }
        }}
      >
        Yeni bir SSO kullanıcısı oluşturulacak ve uygulamaya eklenecektir.
      </Alert>

      {errors.general && (
        <Alert
          severity="warning"
          sx={{
            color: "var(--color-warning)",
            border: "1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--color-warning) 10%, transparent)",
            "& .MuiAlert-icon": { color: "var(--color-warning)" }
          }}
        >
          {errors.general}
        </Alert>
      )}

      <SsoFormField
        type="text"
        label="Ad Soyad"
        name="name"
        value={formData.name}
        onChange={(value) => handleFieldChange("name", value)}
        required
        error={errors.name}
      />

      <SsoFormField
        type="email"
        label="E-posta"
        name="email"
        value={formData.email}
        onChange={(value) => handleFieldChange("email", value)}
        error={errors.email}
        placeholder="ornek@email.com"
      />

      <SsoFormField
        type="text"
        label="Telefon"
        name="phone"
        value={formData.phone}
        onChange={(value) => handleFieldChange("phone", value)}
        error={errors.phone}
        placeholder="05XX XXX XX XX"
      />

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isPending}
        fullWidth
        sx={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
          "&:hover": { backgroundColor: "var(--color-primary)" },
          "&.Mui-disabled": {
            backgroundColor: "var(--color-surface-hover)",
            color: "var(--color-muted-foreground)"
          }
        }}
      >
        {isPending ? "Oluşturuluyor..." : "Oluştur ve Ekle"}
      </Button>
    </Stack>
  );
}

export default CreateUserStep;
