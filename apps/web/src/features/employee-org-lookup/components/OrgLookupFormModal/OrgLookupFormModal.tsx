import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { X } from "lucide-react";
import type { OrgLookupType } from "../../types";

interface OrgLookupFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  type: OrgLookupType;
  initialData?: Record<string, unknown> | null;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<OrgLookupType, string> = {
  department: "Departman",
  title: "Ünvan",
  location: "Lokasyon",
};

export function OrgLookupFormModal({
  open,
  onClose,
  onSubmit,
  type,
  initialData,
  isLoading = false,
}: OrgLookupFormModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!initialData?._id;
  const typeLabel = TYPE_LABELS[type];

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Default values
        setFormData({
          code: "",
          name: "",
          isActive: true,
          description: "",
          address: "",
          sortOrder: 0,
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = useCallback(
    (field: string, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (type !== "location" && !formData.code) {
      newErrors.code = "Kod zorunludur";
    }

    if (!formData.name) {
      newErrors.name = type === "location" ? "Ad zorunludur" : "Ad zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, type]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    await onSubmit(formData);
  }, [validate, formData, onSubmit]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {isEditMode ? `${typeLabel} Düzenle` : `Yeni ${typeLabel}`}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            sx={{ color: "var(--color-muted-foreground)" }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "var(--color-border)" }}>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {/* Code field - only for department and title */}
          {type !== "location" && (
            <TextField
              fullWidth
              size="small"
              label="Kod"
              value={formData.code || ""}
              onChange={(e) => handleChange("code", e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "var(--color-border)" },
                  "&:hover fieldset": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-primary)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--color-muted-foreground)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--color-foreground)",
                },
              }}
            />
          )}

          {/* Name field */}
          <TextField
            fullWidth
            size="small"
            label={type === "location" ? "Lokasyon Adı" : "Ad"}
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-muted-foreground)",
              },
              "& .MuiInputBase-input": {
                color: "var(--color-foreground)",
              },
            }}
          />

          {/* Address field - only for location */}
          {type === "location" && (
            <TextField
              fullWidth
              size="small"
              label="Adres"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              multiline
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "var(--color-border)" },
                  "&:hover fieldset": {
                    borderColor: "var(--color-primary)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-primary)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--color-muted-foreground)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--color-foreground)",
                },
              }}
            />
          )}

          {/* Description field */}
          <TextField
            fullWidth
            size="small"
            label="Açıklama"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            multiline
            rows={2}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-muted-foreground)",
              },
              "& .MuiInputBase-input": {
                color: "var(--color-foreground)",
              },
            }}
          />

          {/* Sort order field */}
          <TextField
            fullWidth
            size="small"
            label="Sıralama"
            type="number"
            value={formData.sortOrder ?? 0}
            onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
            inputProps={{ min: 0 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-muted-foreground)",
              },
              "& .MuiInputBase-input": {
                color: "var(--color-foreground)",
              },
            }}
          />

          {/* Active switch */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive !== false}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "var(--color-primary)",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "var(--color-primary)",
                  },
                }}
              />
            }
            label="Aktif"
            sx={{ color: "var(--color-foreground)" }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "var(--color-foreground)",
            borderColor: "var(--color-border)",
            "&:hover": {
              backgroundColor: "var(--color-surface-hover)",
            },
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            "&:hover": {
              backgroundColor:
                "color-mix(in oklab, var(--color-primary) 85%, var(--color-foreground) 15%)",
            },
            "&.Mui-disabled": {
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-muted-foreground)",
            },
          }}
        >
          {isLoading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrgLookupFormModal;
