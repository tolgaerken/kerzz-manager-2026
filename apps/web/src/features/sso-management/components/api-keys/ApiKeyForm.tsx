import { useState, useEffect, useCallback } from "react";
import { Box, Button, Stack, IconButton, Tooltip, Typography, InputAdornment, TextField } from "@mui/material";
import { RefreshCw, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { SsoModal, SsoFormField } from "../common";
import { useCreateApiKey, useUpdateApiKey, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { ApiKeyFormData } from "../../types";
import { v4 as uuidv4 } from "uuid";

const generateApiKey = (): string => {
  const segments = [
    uuidv4().split("-").slice(0, 2).join("-"),
    "kerzz",
    uuidv4().split("-").slice(2, 4).join("-"),
    uuidv4().split("-")[4]
  ];
  return `${segments[0]}-${segments[1]}-${segments[2]}!?@${segments[3].slice(0, 4)}!${segments[3].slice(4, 8)}**${segments[3].slice(8)}`;
};

const initialFormData: ApiKeyFormData = {
  app_id: "",
  name: "",
  description: "",
  api_key: ""
};

export function ApiKeyForm() {
  const [formData, setFormData] = useState<ApiKeyFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createApiKey = useCreateApiKey();
  const updateApiKey = useUpdateApiKey();
  const { data: applications = [] } = useApplications();

  const { isApiKeyFormOpen, closeApiKeyForm, apiKeyFormData, selectedApiKey } =
    useSsoManagementStore();

  const isEditing = !!selectedApiKey;

  useEffect(() => {
    if (apiKeyFormData) {
      setFormData(apiKeyFormData);
    } else {
      setFormData({
        ...initialFormData,
        api_key: generateApiKey()
      });
    }
    setErrors({});
  }, [apiKeyFormData, isApiKeyFormOpen]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.app_id) {
      newErrors.app_id = "Uygulama seçimi zorunludur";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Anahtar adı zorunludur";
    }

    if (!formData.api_key?.trim()) {
      newErrors.api_key = "API anahtarı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEditing && selectedApiKey) {
        await updateApiKey.mutateAsync({
          id: selectedApiKey.id,
          data: {
            name: formData.name,
            description: formData.description
          }
        });
        toast.success("API anahtarı başarıyla güncellendi");
      } else {
        await createApiKey.mutateAsync(formData);
        toast.success("API anahtarı başarıyla oluşturuldu");
      }
      closeApiKeyForm();
    } catch (error) {
      toast.error(
        isEditing ? "API anahtarı güncellenirken hata oluştu" : "API anahtarı oluşturulurken hata oluştu"
      );
    }
  }, [
    validate,
    isEditing,
    selectedApiKey,
    updateApiKey,
    createApiKey,
    formData,
    closeApiKeyForm
  ]);

  const handleFieldChange = useCallback(
    (field: keyof ApiKeyFormData, value: string) => {
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

  const handleGenerateKey = useCallback(() => {
    setFormData((prev) => ({ ...prev, api_key: generateApiKey() }));
  }, []);

  const handleCopyKey = useCallback(async () => {
    if (formData.api_key) {
      try {
        await navigator.clipboard.writeText(formData.api_key);
        toast.success("API anahtarı kopyalandı");
      } catch {
        toast.error("Kopyalama başarısız");
      }
    }
  }, [formData.api_key]);

  const isSubmitting = createApiKey.isPending || updateApiKey.isPending;

  const appOptions = applications.map((app) => ({ value: app.id, label: app.name }));

  return (
    <SsoModal
      open={isApiKeyFormOpen}
      onClose={closeApiKeyForm}
      title={isEditing ? "API Anahtarını Düzenle" : "Yeni API Anahtarı"}
      actions={
        <>
          <Button
            onClick={closeApiKeyForm}
            disabled={isSubmitting}
            sx={{
              color: "var(--color-muted-foreground)",
              "&:hover": { backgroundColor: "var(--color-surface-hover)" }
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
              "&:hover": { backgroundColor: "var(--color-primary)" },
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
          value={formData.app_id}
          onChange={(value) => handleFieldChange("app_id", value)}
          options={[{ value: "", label: "Seçiniz..." }, ...appOptions]}
          error={errors.app_id}
          required
          disabled={isEditing}
        />

        <SsoFormField
          type="text"
          label="Anahtar Adı"
          name="name"
          value={formData.name}
          onChange={(value) => handleFieldChange("name", value)}
          error={errors.name}
          required
          placeholder="Örn: Production API Key"
        />

        <SsoFormField
          type="text"
          label="Açıklama"
          name="description"
          value={formData.description || ""}
          onChange={(value) => handleFieldChange("description", value)}
          multiline
          rows={2}
        />

        <Box>
          <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)", mb: 1 }}>
            API Anahtarı
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.api_key || ""}
            onChange={(e) => handleFieldChange("api_key", e.target.value)}
            error={!!errors.api_key}
            helperText={errors.api_key}
            disabled={isEditing}
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "var(--color-surface-elevated)",
                color: "var(--color-foreground)"
              },
              "& .MuiInputBase-root.Mui-disabled": {
                backgroundColor: "var(--color-surface)",
                color: "var(--color-foreground)",
                opacity: 0.6
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-muted-foreground)" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-primary)" },
              "& .MuiFormHelperText-root": { color: "var(--color-error)" }
            }}
            InputProps={{
              readOnly: isEditing,
              sx: { fontFamily: "monospace", fontSize: "0.85rem" },
              endAdornment: (
                <InputAdornment position="end">
                  {!isEditing && (
                    <Tooltip title="Yeni Anahtar Oluştur">
                      <IconButton
                        size="small"
                        onClick={handleGenerateKey}
                        sx={{
                          color: "var(--color-muted-foreground)",
                          "&:hover": { backgroundColor: "var(--color-surface-hover)" }
                        }}
                      >
                        <RefreshCw size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Kopyala">
                    <IconButton
                      size="small"
                      onClick={handleCopyKey}
                      sx={{
                        color: "var(--color-muted-foreground)",
                        "&:hover": { backgroundColor: "var(--color-surface-hover)" }
                      }}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Stack>
    </SsoModal>
  );
}

export default ApiKeyForm;
