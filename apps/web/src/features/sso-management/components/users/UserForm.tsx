import { useState, useEffect, useCallback } from "react";
import { Button, Stack, Alert } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useSsoManagementStore } from "../../store";
import { useUpdateUser } from "../../hooks";
import type { UserFormData } from "../../types";

interface FormErrors {
  name?: string;
  email?: string;
}

const initialFormData: UserFormData = {
  name: "",
  email: "",
  phone: "",
  isActive: true
};

export function UserForm() {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const { isUserFormOpen, closeUserForm, userFormData, selectedUser } = useSsoManagementStore();
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (userFormData) {
      setFormData(userFormData);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [userFormData, isUserFormOpen]);

  const handleFieldChange = useCallback(
    (field: keyof UserFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field in errors) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ad Soyad zorunludur";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !selectedUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || "",
          isActive: formData.isActive
        }
      });
      toast.success("Kullanıcı bilgileri güncellendi");
      closeUserForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Kullanıcı güncellenirken bir hata oluştu";
      toast.error(errorMessage);
    }
  }, [validateForm, selectedUser, updateUserMutation, formData, closeUserForm]);

  return (
    <SsoModal
      open={isUserFormOpen}
      onClose={closeUserForm}
      title="Kullanıcı Düzenle"
      actions={
        <>
          <Button onClick={closeUserForm} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {selectedUser && (
          <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
            Kullanıcı ID: {selectedUser.id}
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
          value={formData.phone || ""}
          onChange={(value) => handleFieldChange("phone", value)}
          placeholder="05XX XXX XX XX"
        />

        <SsoFormField
          type="checkbox"
          label="Aktif"
          name="isActive"
          value={formData.isActive ?? true}
          onChange={(value) => handleFieldChange("isActive", value)}
        />
      </Stack>
    </SsoModal>
  );
}

export default UserForm;
