import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Stack } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useCreatePermission, useUpdatePermission, usePermissionGroups, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { PermissionFormData } from "../../types";

const initialFormData: PermissionFormData = {
  app_id: "",
  group: "",
  permission: "",
  description: "",
  isActive: true
};

export function PermissionForm() {
  const [formData, setFormData] = useState<PermissionFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const { data: groups = [] } = usePermissionGroups(true); // all groups
  const { data: applications = [] } = useApplications(true);

  const {
    isPermissionFormOpen,
    closePermissionForm,
    permissionFormData,
    selectedPermission
  } = useSsoManagementStore();

  const isEditing = !!selectedPermission;

  const appOptions = useMemo(
    () => [
      { value: "", label: "Seçiniz..." },
      ...applications
        .filter((app) => app.isActive)
        .map((app) => ({ value: app.id, label: app.name }))
    ],
    [applications]
  );

  const groupOptions = useMemo(
    () => [{ value: "", label: "Seçiniz veya yeni grup yazın..." }, ...groups.map((g) => ({ value: g, label: g }))],
    [groups]
  );

  useEffect(() => {
    if (permissionFormData) {
      setFormData({
        ...initialFormData,
        ...permissionFormData,
        app_id: permissionFormData.app_id || selectedPermission?.app_id || ""
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [permissionFormData, isPermissionFormOpen, selectedPermission]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.app_id) {
      newErrors.app_id = "Uygulama seçimi zorunludur";
    }

    if (!formData.group.trim()) {
      newErrors.group = "Grup adı zorunludur";
    }

    if (!formData.permission.trim()) {
      newErrors.permission = "İzin adı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEditing && selectedPermission) {
        await updatePermission.mutateAsync({
          id: selectedPermission.id,
          data: formData
        });
        toast.success("İzin başarıyla güncellendi");
      } else {
        await createPermission.mutateAsync(formData);
        toast.success("İzin başarıyla oluşturuldu");
      }
      closePermissionForm();
    } catch {
      toast.error(isEditing ? "İzin güncellenirken hata oluştu" : "İzin oluşturulurken hata oluştu");
    }
  }, [
    validate,
    isEditing,
    selectedPermission,
    updatePermission,
    createPermission,
    formData,
    closePermissionForm
  ]);

  const handleFieldChange = useCallback(
    (field: keyof PermissionFormData, value: string | boolean) => {
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

  const isSubmitting = createPermission.isPending || updatePermission.isPending;

  return (
    <SsoModal
      open={isPermissionFormOpen}
      onClose={closePermissionForm}
      title={isEditing ? "İzni Düzenle" : "Yeni İzin"}
      actions={
        <>
          <Button
            onClick={closePermissionForm}
            disabled={isSubmitting}
            sx={{
              color: "var(--color-muted-foreground)",
              "&:hover": {
                backgroundColor: "var(--color-surface-hover)"
              }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              "&:hover": {
                backgroundColor: "var(--color-primary)"
              },
              "&.Mui-disabled": {
                backgroundColor: "var(--color-surface-hover)",
                color: "var(--color-muted-foreground)"
              }
            }}
          >
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

        {groupOptions.length > 1 ? (
          <SsoFormField
            type="select"
            label="Grup"
            name="group"
            value={formData.group}
            onChange={(value) => handleFieldChange("group", value)}
            options={groupOptions}
            error={errors.group}
            required
          />
        ) : (
          <SsoFormField
            type="text"
            label="Grup"
            name="group"
            value={formData.group}
            onChange={(value) => handleFieldChange("group", value)}
            error={errors.group}
            required
            placeholder="Örn: userOperations"
          />
        )}

        <SsoFormField
          type="text"
          label="İzin Adı"
          name="permission"
          value={formData.permission}
          onChange={(value) => handleFieldChange("permission", value)}
          error={errors.permission}
          required
          placeholder="Örn: createUser"
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
          label="Aktif"
          name="isActive"
          value={formData.isActive ?? true}
          onChange={(value) => handleFieldChange("isActive", value)}
        />
      </Stack>
    </SsoModal>
  );
}

export default PermissionForm;
