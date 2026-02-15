import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Chip,
} from "@mui/material";
import { User, MapPin, Building2, Briefcase, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useMyProfile, useUpdateMyProfile } from "../../hooks";
import {
  EMPLOYMENT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  type UpdateSelfProfileFormData,
} from "../../types";
import {
  muiFieldSx,
  muiCardSx,
  muiSkeletonSx,
  muiDividerSx,
  muiOutlinedButtonSx,
  muiPrimaryButtonSx,
  muiInfoAlertSx,
  muiErrorAlertSx,
} from "../../constants";

export function MyProfileCard() {
  const { data: profile, isLoading, error } = useMyProfile();
  const updateMutation = useUpdateMyProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateSelfProfileFormData>({
    address: {
      street: "",
      city: "",
      district: "",
      postalCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    iban: "",
  });

  // Profil yüklendiğinde form verilerini doldur
  useEffect(() => {
    if (profile) {
      setFormData({
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          district: profile.address?.district || "",
          postalCode: profile.address?.postalCode || "",
          country: profile.address?.country || "",
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          phone: profile.emergencyContact?.phone || "",
          relationship: profile.emergencyContact?.relationship || "",
        },
        iban: profile.iban || "",
      });
    }
  }, [profile]);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
              [child]: value,
            },
          };
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Profiliniz güncellendi");
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(errorMessage);
    }
  }, [formData, updateMutation]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setFormData({
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          district: profile.address?.district || "",
          postalCode: profile.address?.postalCode || "",
          country: profile.address?.country || "",
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || "",
          phone: profile.emergencyContact?.phone || "",
          relationship: profile.emergencyContact?.relationship || "",
        },
        iban: profile.iban || "",
      });
    }
    setIsEditing(false);
  }, [profile]);

  if (isLoading) {
    return (
      <Card sx={muiCardSx}>
        <CardHeader title={<Skeleton width={200} sx={muiSkeletonSx} />} />
        <CardContent>
          <Stack spacing={2}>
            <Skeleton height={40} sx={muiSkeletonSx} />
            <Skeleton height={40} sx={muiSkeletonSx} />
            <Skeleton height={40} sx={muiSkeletonSx} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={muiErrorAlertSx}>
        Profil yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert severity="info" sx={muiInfoAlertSx}>
        Henüz bir profiliniz bulunmuyor. Lütfen İK departmanı ile iletişime geçin.
      </Alert>
    );
  }

  return (
    <Card sx={muiCardSx}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <User size={24} className="text-[var(--color-primary)]" />
            <Typography variant="h6" sx={{ color: "var(--color-foreground)" }}>
              Profilim
            </Typography>
          </Box>
        }
        action={
          !isEditing ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(true)}
              sx={muiOutlinedButtonSx}
            >
              Düzenle
            </Button>
          ) : null
        }
      />
      <CardContent>
        {/* Salt okunur bilgiler */}
        <Box mb={3}>
          <Typography variant="subtitle2" sx={{ color: "var(--color-muted-foreground)" }} gutterBottom>
            Organizasyon Bilgileri
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Building2 size={16} className="text-[var(--color-muted-foreground)]" />
              <Typography variant="body2">
                {profile.departmentName || "-"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Briefcase size={16} className="text-[var(--color-muted-foreground)]" />
              <Typography variant="body2">{profile.titleName || "-"}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <MapPin size={16} className="text-[var(--color-muted-foreground)]" />
              <Typography variant="body2">{profile.location || "-"}</Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} mt={1}>
            <Chip
              label={profile.workType ? (WORK_TYPE_LABELS[profile.workType] || profile.workType) : "-"}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
                backgroundColor: "var(--color-surface)",
              }}
            />
            <Chip
              label={
                EMPLOYMENT_STATUS_LABELS[profile.employmentStatus] ||
                profile.employmentStatus
              }
              size="small"
              variant="outlined"
              sx={
                profile.employmentStatus === "active"
                  ? {
                      color: "var(--color-success-foreground)",
                      backgroundColor:
                        "color-mix(in oklab, var(--color-success) 18%, transparent)",
                      borderColor:
                        "color-mix(in oklab, var(--color-success) 45%, transparent)",
                    }
                  : {
                      color: "var(--color-muted-foreground)",
                      backgroundColor: "var(--color-surface-hover)",
                      borderColor: "var(--color-border)",
                    }
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, ...muiDividerSx }} />

        {/* Düzenlenebilir alanlar */}
        <Typography variant="subtitle2" sx={{ color: "var(--color-muted-foreground)" }} gutterBottom>
          Adres Bilgileri
        </Typography>
        <Stack spacing={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            label="Sokak/Cadde"
            value={formData.address?.street || ""}
            onChange={(e) => handleFieldChange("address.street", e.target.value)}
            disabled={!isEditing}
            sx={muiFieldSx}
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              label="Şehir"
              value={formData.address?.city || ""}
              onChange={(e) => handleFieldChange("address.city", e.target.value)}
              disabled={!isEditing}
              sx={muiFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="İlçe"
              value={formData.address?.district || ""}
              onChange={(e) => handleFieldChange("address.district", e.target.value)}
              disabled={!isEditing}
              sx={muiFieldSx}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              label="Posta Kodu"
              value={formData.address?.postalCode || ""}
              onChange={(e) => handleFieldChange("address.postalCode", e.target.value)}
              disabled={!isEditing}
              sx={muiFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Ülke"
              value={formData.address?.country || ""}
              onChange={(e) => handleFieldChange("address.country", e.target.value)}
              disabled={!isEditing}
              sx={muiFieldSx}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 2, ...muiDividerSx }} />

        <Typography variant="subtitle2" sx={{ color: "var(--color-muted-foreground)" }} gutterBottom>
          Acil Durum İletişim
        </Typography>
        <Stack spacing={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            label="Acil Durum Kişisi"
            value={formData.emergencyContact?.name || ""}
            onChange={(e) =>
              handleFieldChange("emergencyContact.name", e.target.value)
            }
            disabled={!isEditing}
            sx={muiFieldSx}
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              label="Telefon"
              value={formData.emergencyContact?.phone || ""}
              onChange={(e) =>
                handleFieldChange("emergencyContact.phone", e.target.value)
              }
              disabled={!isEditing}
              sx={muiFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              label="Yakınlık"
              value={formData.emergencyContact?.relationship || ""}
              onChange={(e) =>
                handleFieldChange("emergencyContact.relationship", e.target.value)
              }
              disabled={!isEditing}
              sx={muiFieldSx}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 2, ...muiDividerSx }} />

        <Typography variant="subtitle2" sx={{ color: "var(--color-muted-foreground)" }} gutterBottom>
          Banka Bilgileri
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="IBAN"
          value={formData.iban || ""}
          onChange={(e) => handleFieldChange("iban", e.target.value)}
          disabled={!isEditing}
          placeholder="TR..."
          sx={muiFieldSx}
        />

        {/* Kaydet/İptal butonları */}
        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={muiOutlinedButtonSx}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
              sx={muiPrimaryButtonSx}
            >
              {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default MyProfileCard;
