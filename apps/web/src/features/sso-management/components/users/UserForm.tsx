import { useState, useEffect, useCallback } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { SsoModal, SsoFormField } from "../common";
import { useSsoManagementStore } from "../../store";
import type { UserFormData } from "../../types";

const initialFormData: UserFormData = {
  name: "",
  email: "",
  phone: "",
  isActive: true
};

export function UserForm() {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  const { isUserFormOpen, closeUserForm, userFormData, selectedUser } = useSsoManagementStore();

  const isEditing = !!selectedUser;

  useEffect(() => {
    if (userFormData) {
      setFormData(userFormData);
    } else {
      setFormData(initialFormData);
    }
  }, [userFormData, isUserFormOpen]);

  const handleFieldChange = useCallback(
    (field: keyof UserFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Note: User editing is read-only in this context
  // Users are managed through SSO system, not directly here

  return (
    <SsoModal
      open={isUserFormOpen}
      onClose={closeUserForm}
      title={isEditing ? "Kullanıcı Detayları" : "Kullanıcı Bilgileri"}
      actions={
        <Button onClick={closeUserForm}>Kapat</Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Kullanıcı bilgileri SSO sistemi üzerinden yönetilmektedir. Bu ekran sadece görüntüleme amaçlıdır.
        </Typography>

        <SsoFormField
          type="text"
          label="Ad Soyad"
          name="name"
          value={formData.name}
          onChange={(value) => handleFieldChange("name", value)}
          disabled
        />

        <SsoFormField
          type="email"
          label="E-posta"
          name="email"
          value={formData.email}
          onChange={(value) => handleFieldChange("email", value)}
          disabled
        />

        <SsoFormField
          type="text"
          label="Telefon"
          name="phone"
          value={formData.phone || ""}
          onChange={(value) => handleFieldChange("phone", value)}
          disabled
        />

        <SsoFormField
          type="checkbox"
          label="Aktif"
          name="isActive"
          value={formData.isActive ?? true}
          onChange={(value) => handleFieldChange("isActive", value)}
          disabled
        />
      </Stack>
    </SsoModal>
  );
}

export default UserForm;
