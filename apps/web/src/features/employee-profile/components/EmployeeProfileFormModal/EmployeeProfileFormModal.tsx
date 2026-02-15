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
  Stack,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateEmployeeProfile, useUpdateEmployeeProfile } from "../../hooks";
import {
  WORK_TYPE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  muiFieldSx,
  muiSelectMenuProps,
  muiDialogPaperSx,
  muiDialogTitleSx,
  muiDialogContentSx,
  muiTabsSx,
  muiDividerSx,
  muiCloseButtonSx,
  muiPrimaryButtonSx,
  muiOutlinedButtonSx,
  muiInfoAlertSx,
  muiWarningAlertSx,
} from "../../constants";
import type {
  EmployeeProfile,
  CreateEmployeeProfileFormData,
  UpdateEmployeeProfileFormData,
  WorkType,
  ContractType,
  EmploymentStatus,
  Gender,
} from "../../types";

interface EmployeeProfileFormModalProps {
  open: boolean;
  onClose: () => void;
  profile?: EmployeeProfile | null;
  userId?: string; // Yeni profil oluştururken kullanıcı ID'si
}

interface FormErrors {
  userId?: string;
  employeeNumber?: string;
  nationalId?: string;
  iban?: string;
  [key: string]: string | undefined;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function EmployeeProfileFormModal({
  open,
  onClose,
  profile,
  userId,
}: EmployeeProfileFormModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [formData, setFormData] = useState<CreateEmployeeProfileFormData>({
    userId: "",
    employeeNumber: "",
    departmentCode: "",
    departmentName: "",
    titleCode: "",
    titleName: "",
    managerUserId: "",
    location: "",
    workType: undefined,
    nationalId: "",
    birthDate: "",
    gender: undefined,
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
    hireDate: "",
    contractType: undefined,
    probationEndDate: "",
    payrollGroup: "",
    seniorityStartDate: "",
    employmentStatus: undefined,
    iban: "",
    salary: undefined,
    salaryCurrency: "TRY",
    notes: "",
  });

  const createMutation = useCreateEmployeeProfile();
  const updateMutation = useUpdateEmployeeProfile();

  const isEditMode = !!profile;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Form verilerini profile'dan doldur
  useEffect(() => {
    if (profile) {
      setFormData({
        userId: profile.userId,
        employeeNumber: profile.employeeNumber || "",
        departmentCode: profile.departmentCode || "",
        departmentName: profile.departmentName || "",
        titleCode: profile.titleCode || "",
        titleName: profile.titleName || "",
        managerUserId: profile.managerUserId || "",
        location: profile.location || "",
        workType: profile.workType,
        nationalId: profile.nationalId || "",
        birthDate: profile.birthDate ? profile.birthDate.split("T")[0] : "",
        gender: profile.gender,
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
        hireDate: profile.hireDate ? profile.hireDate.split("T")[0] : "",
        contractType: profile.contractType,
        probationEndDate: profile.probationEndDate
          ? profile.probationEndDate.split("T")[0]
          : "",
        payrollGroup: profile.payrollGroup || "",
        seniorityStartDate: profile.seniorityStartDate
          ? profile.seniorityStartDate.split("T")[0]
          : "",
        employmentStatus: profile.employmentStatus,
        iban: profile.iban || "",
        salary: profile.salary,
        salaryCurrency: profile.salaryCurrency || "TRY",
        notes: profile.notes || "",
      });
    } else if (userId) {
      setFormData((prev) => ({ ...prev, userId }));
    }
    setErrors({});
    setActiveTab(0);
  }, [profile, userId, open]);

  const handleFieldChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setFormData((prev) => {
        // Nested field kontrolü (address.city gibi)
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

      // Hata temizle
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!isEditMode && !formData.userId?.trim()) {
      newErrors.userId = "Kullanıcı ID zorunludur";
    }

    // IBAN formatı kontrolü (opsiyonel)
    if (formData.iban && formData.iban.length > 0 && formData.iban.length < 15) {
      newErrors.iban = "Geçerli bir IBAN giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditMode]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && profile) {
        const updateData: UpdateEmployeeProfileFormData = { ...formData };
        delete (updateData as Record<string, unknown>).userId;

        await updateMutation.mutateAsync({
          userId: profile.userId,
          data: updateData,
        });
        toast.success("Profil güncellendi");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Profil oluşturuldu");
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(errorMessage);
    }
  }, [
    validateForm,
    isEditMode,
    profile,
    formData,
    updateMutation,
    createMutation,
    onClose,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: muiDialogPaperSx }}
    >
      <DialogTitle sx={muiDialogTitleSx}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {isEditMode ? "Profil Düzenle" : "Yeni Profil Oluştur"}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            sx={muiCloseButtonSx}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={muiDialogContentSx}>
        {!isEditMode && (
          <Alert severity="info" sx={{ mb: 2, ...muiInfoAlertSx }}>
            Yeni profil oluşturmak için önce SSO'da kayıtlı bir kullanıcı ID'si
            gereklidir.
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={muiTabsSx}
        >
          <Tab label="Organizasyon" />
          <Tab label="Kişisel" />
          <Tab label="İstihdam" />
          <Tab label="Hassas Bilgiler" />
        </Tabs>

        {/* Organizasyon Bilgileri */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={2}>
            {!isEditMode && (
              <TextField
                fullWidth
                size="small"
                label="Kullanıcı ID"
                value={formData.userId}
                onChange={(e) => handleFieldChange("userId", e.target.value)}
                error={!!errors.userId}
                helperText={errors.userId}
                required
                sx={muiFieldSx}
              />
            )}

            <TextField
              fullWidth
              size="small"
              label="Personel No"
              value={formData.employeeNumber}
              onChange={(e) => handleFieldChange("employeeNumber", e.target.value)}
              sx={muiFieldSx}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Departman Kodu"
                value={formData.departmentCode}
                onChange={(e) => handleFieldChange("departmentCode", e.target.value)}
                sx={muiFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Departman Adı"
                value={formData.departmentName}
                onChange={(e) => handleFieldChange("departmentName", e.target.value)}
                sx={muiFieldSx}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Unvan Kodu"
                value={formData.titleCode}
                onChange={(e) => handleFieldChange("titleCode", e.target.value)}
                sx={muiFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Unvan Adı"
                value={formData.titleName}
                onChange={(e) => handleFieldChange("titleName", e.target.value)}
                sx={muiFieldSx}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Yönetici Kullanıcı ID"
              value={formData.managerUserId}
              onChange={(e) => handleFieldChange("managerUserId", e.target.value)}
              sx={muiFieldSx}
            />

            <TextField
              fullWidth
              size="small"
              label="Lokasyon"
              value={formData.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              sx={muiFieldSx}
            />

            <FormControl fullWidth size="small" sx={muiFieldSx}>
              <InputLabel>Çalışma Tipi</InputLabel>
              <Select
                value={formData.workType || ""}
                onChange={(e) =>
                  handleFieldChange("workType", e.target.value as WorkType)
                }
                label="Çalışma Tipi"
                MenuProps={muiSelectMenuProps}
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {WORK_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </TabPanel>

        {/* Kişisel Bilgiler */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="TC Kimlik No"
              value={formData.nationalId}
              onChange={(e) => handleFieldChange("nationalId", e.target.value)}
              sx={muiFieldSx}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Doğum Tarihi"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleFieldChange("birthDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={muiFieldSx}
              />

              <FormControl fullWidth size="small" sx={muiFieldSx}>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.gender || ""}
                  onChange={(e) =>
                    handleFieldChange("gender", e.target.value as Gender)
                  }
                  label="Cinsiyet"
                  MenuProps={muiSelectMenuProps}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {GENDER_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={muiDividerSx}>
              <Typography variant="caption" sx={{ color: "var(--color-muted-foreground)" }}>
                Adres Bilgileri
              </Typography>
            </Divider>

            <TextField
              fullWidth
              size="small"
              label="Sokak/Cadde"
              value={formData.address?.street}
              onChange={(e) => handleFieldChange("address.street", e.target.value)}
              sx={muiFieldSx}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Şehir"
                value={formData.address?.city}
                onChange={(e) => handleFieldChange("address.city", e.target.value)}
                sx={muiFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="İlçe"
                value={formData.address?.district}
                onChange={(e) => handleFieldChange("address.district", e.target.value)}
                sx={muiFieldSx}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Posta Kodu"
                value={formData.address?.postalCode}
                onChange={(e) => handleFieldChange("address.postalCode", e.target.value)}
                sx={muiFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Ülke"
                value={formData.address?.country}
                onChange={(e) => handleFieldChange("address.country", e.target.value)}
                sx={muiFieldSx}
              />
            </Box>

            <Divider sx={muiDividerSx}>
              <Typography variant="caption" sx={{ color: "var(--color-muted-foreground)" }}>
                Acil Durum İletişim
              </Typography>
            </Divider>

            <TextField
              fullWidth
              size="small"
              label="Acil Durum Kişisi"
              value={formData.emergencyContact?.name}
              onChange={(e) =>
                handleFieldChange("emergencyContact.name", e.target.value)
              }
              sx={muiFieldSx}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Telefon"
                value={formData.emergencyContact?.phone}
                onChange={(e) =>
                  handleFieldChange("emergencyContact.phone", e.target.value)
                }
                sx={muiFieldSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Yakınlık"
                value={formData.emergencyContact?.relationship}
                onChange={(e) =>
                  handleFieldChange("emergencyContact.relationship", e.target.value)
                }
                sx={muiFieldSx}
              />
            </Box>
          </Stack>
        </TabPanel>

        {/* İstihdam Bilgileri */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={2}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="İşe Giriş Tarihi"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleFieldChange("hireDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={muiFieldSx}
              />

              <FormControl fullWidth size="small" sx={muiFieldSx}>
                <InputLabel>Sözleşme Tipi</InputLabel>
                <Select
                  value={formData.contractType || ""}
                  onChange={(e) =>
                    handleFieldChange("contractType", e.target.value as ContractType)
                  }
                  label="Sözleşme Tipi"
                  MenuProps={muiSelectMenuProps}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {CONTRACT_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Deneme Süresi Bitiş"
                type="date"
                value={formData.probationEndDate}
                onChange={(e) =>
                  handleFieldChange("probationEndDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                sx={muiFieldSx}
              />

              <TextField
                fullWidth
                size="small"
                label="Kıdem Başlangıç"
                type="date"
                value={formData.seniorityStartDate}
                onChange={(e) =>
                  handleFieldChange("seniorityStartDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                sx={muiFieldSx}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Bordro Grubu"
              value={formData.payrollGroup}
              onChange={(e) => handleFieldChange("payrollGroup", e.target.value)}
              sx={muiFieldSx}
            />

            <FormControl fullWidth size="small" sx={muiFieldSx}>
              <InputLabel>İstihdam Durumu</InputLabel>
              <Select
                value={formData.employmentStatus || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "employmentStatus",
                    e.target.value as EmploymentStatus
                  )
                }
                label="İstihdam Durumu"
                MenuProps={muiSelectMenuProps}
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </TabPanel>

        {/* Hassas Bilgiler */}
        <TabPanel value={activeTab} index={3}>
          <Alert severity="warning" sx={{ mb: 2, ...muiWarningAlertSx }}>
            Bu bölümdeki bilgiler hassas veri içerir ve yetki kontrolüne tabidir.
          </Alert>

          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="IBAN"
              value={formData.iban}
              onChange={(e) => handleFieldChange("iban", e.target.value)}
              error={!!errors.iban}
              helperText={errors.iban}
              placeholder="TR..."
              sx={muiFieldSx}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Maaş"
                type="number"
                value={formData.salary || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "salary",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                sx={muiFieldSx}
              />

              <FormControl fullWidth size="small" sx={muiFieldSx}>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={formData.salaryCurrency || "TRY"}
                  onChange={(e) =>
                    handleFieldChange("salaryCurrency", e.target.value)
                  }
                  label="Para Birimi"
                  MenuProps={muiSelectMenuProps}
                >
                  <MenuItem value="TRY">TRY</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Notlar"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              multiline
              rows={3}
              sx={muiFieldSx}
            />
          </Stack>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid var(--color-border)" }}>
        <Button onClick={onClose} sx={muiOutlinedButtonSx}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isPending}
          sx={muiPrimaryButtonSx}
        >
          {isPending ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeProfileFormModal;
