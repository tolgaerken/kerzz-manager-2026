import { useState, useEffect, useCallback } from "react";
import { Box, Button, Stack } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useCreateApplication, useUpdateApplication } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { ApplicationFormData } from "../../types";

const initialFormData: ApplicationFormData = {
  name: "",
  description: "",
  isActive: true
};

export function ApplicationForm() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();

  const {
    isApplicationFormOpen,
    closeApplicationForm,
    applicationFormData,
    selectedApplication
  } = useSsoManagementStore();

  const isEditing = !!selectedApplication;

  useEffect(() => {
    if (applicationFormData) {
      setFormData(applicationFormData);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [applicationFormData, isApplicationFormOpen]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Uygulama adı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEditing && selectedApplication) {
        await updateApplication.mutateAsync({
          id: selectedApplication.id,
          data: formData
        });
        toast.success("Uygulama başarıyla güncellendi");
      } else {
        await createApplication.mutateAsync(formData);
        toast.success("Uygulama başarıyla oluşturuldu");
      }
      closeApplicationForm();
    } catch (error) {
      toast.error(isEditing ? "Uygulama güncellenirken hata oluştu" : "Uygulama oluşturulurken hata oluştu");
    }
  }, [
    validate,
    isEditing,
    selectedApplication,
    updateApplication,
    createApplication,
    formData,
    closeApplicationForm
  ]);

  const handleFieldChange = useCallback((field: keyof ApplicationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const isSubmitting = createApplication.isPending || updateApplication.isPending;

  return (
    <SsoModal
      open={isApplicationFormOpen}
      onClose={closeApplicationForm}
      title={isEditing ? "Uygulamayı Düzenle" : "Yeni Uygulama"}
      actions={
        <>
          <Button onClick={closeApplicationForm} disabled={isSubmitting}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <SsoFormField
          type="text"
          label="Uygulama Adı"
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
          label="Aktif"
          name="isActive"
          value={formData.isActive ?? true}
          onChange={(value) => handleFieldChange("isActive", value)}
        />
      </Stack>
    </SsoModal>
  );
}

export default ApplicationForm;
