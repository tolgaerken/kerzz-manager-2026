import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Stack } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useCreateRole, useUpdateRole, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { RoleFormData } from "../../types";

const initialFormData: RoleFormData = {
  name: "",
  app_id: "",
  description: "",
  developer: false,
  isActive: true
};

export function RoleForm() {
  const [formData, setFormData] = useState<RoleFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: applications = [] } = useApplications(true);

  const { isRoleFormOpen, closeRoleForm, roleFormData, selectedRole } = useSsoManagementStore();

  const isEditing = !!selectedRole;

  const appOptions = useMemo(
    () => [
      { value: "", label: "Seçiniz..." },
      ...applications
        .filter((app) => app.isActive)
        .map((app) => ({ value: app.id, label: app.name }))
    ],
    [applications]
  );

  useEffect(() => {
    if (roleFormData) {
      setFormData({
        ...initialFormData,
        ...roleFormData,
        app_id: roleFormData.app_id || selectedRole?.app_id || ""
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [roleFormData, isRoleFormOpen, selectedRole]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.app_id) {
      newErrors.app_id = "Uygulama seçimi zorunludur";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Rol adı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEditing && selectedRole) {
        await updateRole.mutateAsync({
          id: selectedRole.id,
          data: formData
        });
        toast.success("Rol başarıyla güncellendi");
      } else {
        await createRole.mutateAsync(formData);
        toast.success("Rol başarıyla oluşturuldu");
      }
      closeRoleForm();
    } catch {
      toast.error(isEditing ? "Rol güncellenirken hata oluştu" : "Rol oluşturulurken hata oluştu");
    }
  }, [validate, isEditing, selectedRole, updateRole, createRole, formData, closeRoleForm]);

  const handleFieldChange = useCallback(
    (field: keyof RoleFormData, value: string | boolean | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const isSubmitting = createRole.isPending || updateRole.isPending;

  return (
    <SsoModal
      open={isRoleFormOpen}
      onClose={closeRoleForm}
      title={isEditing ? "Rolü Düzenle" : "Yeni Rol"}
      actions={
        <>
          <Button onClick={closeRoleForm} disabled={isSubmitting}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <SsoFormField
          type="select"
          label="Uygulama"
          name="app_id"
          value={formData.app_id || ""}
          onChange={(value) => handleFieldChange("app_id", value)}
          options={appOptions}
          error={errors.app_id}
          required
          disabled={isEditing}
        />

        <SsoFormField
          type="text"
          label="Rol Adı"
          name="name"
          value={formData.name}
          onChange={(value) => handleFieldChange("name", value)}
          error={errors.name}
          required
        />

        <SsoFormField
          type="text"
          label="Açıklama"
          name="description"
          value={formData.description || ""}
          onChange={(value) => handleFieldChange("description", value)}
          multiline
          rows={3}
        />

        <SsoFormField
          type="checkbox"
          label="Geliştirici Rolü"
          name="developer"
          value={formData.developer ?? false}
          onChange={(value) => handleFieldChange("developer", value)}
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

export default RoleForm;
