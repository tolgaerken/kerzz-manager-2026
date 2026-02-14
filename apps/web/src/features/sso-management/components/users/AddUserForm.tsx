import { useState, useCallback } from "react";
import { Button, Stack, Alert } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useSsoManagementStore } from "../../store";
import { useAddUser } from "../../hooks";

interface FormData {
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

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: ""
};

export function AddUserForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const { isAddUserFormOpen, addUserFormAppId, closeAddUserForm } = useSsoManagementStore();
  const addUserMutation = useAddUser();

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

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

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!addUserFormAppId) {
      toast.error("Uygulama seçilmedi");
      return;
    }

    try {
      const result = await addUserMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        appId: addUserFormAppId
      });

      if (result.isNewUser) {
        toast.success("Yeni kullanıcı oluşturuldu ve uygulamaya eklendi");
      } else {
        toast.success("Mevcut kullanıcı uygulamaya eklendi");
      }

      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Kullanıcı eklenirken bir hata oluştu";
      toast.error(errorMessage);
    }
  }, [validateForm, addUserFormAppId, addUserMutation, formData]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    closeAddUserForm();
  }, [closeAddUserForm]);

  return (
    <SsoModal
      open={isAddUserFormOpen}
      onClose={handleClose}
      title="Kullanıcı Ekle"
      actions={
        <>
          <Button onClick={handleClose} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={addUserMutation.isPending}
          >
            {addUserMutation.isPending ? "Ekleniyor..." : "Ekle"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {errors.general && (
          <Alert severity="warning">{errors.general}</Alert>
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

        <Alert severity="info" sx={{ mt: 1 }}>
          E-posta veya telefon numarası ile eşleşen bir kullanıcı varsa, mevcut kullanıcı uygulamaya eklenecektir.
          Yoksa yeni bir kullanıcı oluşturulacaktır.
        </Alert>
      </Stack>
    </SsoModal>
  );
}

export default AddUserForm;
