import { useMemo, useCallback, useState } from "react";
import { Box, Typography, Chip, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { RefreshCw, UserPlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { useEmployeeProfiles, useSoftDeleteEmployeeProfile } from "../../hooks";
import { EmployeeProfileFormModal } from "../EmployeeProfileFormModal";
import {
  EMPLOYMENT_STATUS_OPTIONS,
  WORK_TYPE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  muiFieldSx,
  muiSelectMenuProps,
} from "../../constants";
import {
  EMPLOYMENT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  type EmployeeProfile,
  type EmployeeProfileQueryParams,
  EmploymentStatus,
  WorkType,
} from "../../types";

const chipBaseSx = {
  borderColor: "var(--color-border)",
  color: "var(--color-foreground)",
  backgroundColor: "var(--color-surface)",
};

const statusChipSxMap: Record<EmploymentStatus, Record<string, string>> = {
  [EmploymentStatus.ACTIVE]: {
    color: "var(--color-success-foreground)",
    backgroundColor: "color-mix(in oklab, var(--color-success) 18%, transparent)",
    borderColor: "color-mix(in oklab, var(--color-success) 45%, transparent)",
  },
  [EmploymentStatus.INACTIVE]: {
    color: "var(--color-muted-foreground)",
    backgroundColor: "var(--color-surface-hover)",
    borderColor: "var(--color-border)",
  },
  [EmploymentStatus.ON_LEAVE]: {
    color: "var(--color-warning-foreground)",
    backgroundColor: "color-mix(in oklab, var(--color-warning) 18%, transparent)",
    borderColor: "color-mix(in oklab, var(--color-warning) 45%, transparent)",
  },
  [EmploymentStatus.TERMINATED]: {
    color: "var(--color-error-foreground)",
    backgroundColor: "color-mix(in oklab, var(--color-error) 18%, transparent)",
    borderColor: "color-mix(in oklab, var(--color-error) 45%, transparent)",
  },
};

export function EmployeeProfileGrid() {
  const [queryParams, setQueryParams] = useState<EmployeeProfileQueryParams>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);

  const { data, isLoading, refetch } = useEmployeeProfiles(queryParams);
  const softDeleteMutation = useSoftDeleteEmployeeProfile();

  const profiles = data?.data || [];

  const handleEdit = useCallback((profile: EmployeeProfile) => {
    setSelectedProfile(profile);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedProfile(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedProfile(null);
  }, []);

  const handleDelete = useCallback(
    async (profile: EmployeeProfile) => {
      const reason = prompt(
        `"${profile.employeeNumber || profile.userId}" profilini silmek istediğinize emin misiniz?\nAyrılış nedeni:`
      );

      if (reason === null) return;

      try {
        await softDeleteMutation.mutateAsync({
          userId: profile.userId,
          terminationReason: reason,
        });
        toast.success("Profil başarıyla silindi");
      } catch {
        toast.error("Profil silinirken bir hata oluştu");
      }
    },
    [softDeleteMutation]
  );

  const handleFilterChange = useCallback(
    (field: keyof EmployeeProfileQueryParams, value: string | undefined) => {
      setQueryParams((prev) => ({
        ...prev,
        [field]: value || undefined,
        page: 1, // Filtre değiştiğinde ilk sayfaya dön
      }));
    },
    []
  );

  const columns: GridColumnDef<EmployeeProfile>[] = useMemo(
    () => [
      {
        id: "userName",
        header: "Ad Soyad",
        accessorKey: "userName",
        width: 180,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (value, row) => (
          <div className="flex flex-col">
            <span className="font-medium">{value || "-"}</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {row.userEmail || ""}
            </span>
          </div>
        ),
      },
      {
        id: "employeeNumber",
        header: "Personel No",
        accessorKey: "employeeNumber",
        width: 110,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "equals"] },
        cell: (value) => value || "-",
      },
      {
        id: "departmentName",
        header: "Departman",
        accessorKey: "departmentName",
        width: 150,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (value) => value || "-",
      },
      {
        id: "titleName",
        header: "Unvan",
        accessorKey: "titleName",
        width: 150,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (value) => value || "-",
      },
      {
        id: "location",
        header: "Lokasyon",
        accessorKey: "location",
        width: 120,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains"] },
        cell: (value) => value || "-",
      },
      {
        id: "workType",
        header: "Çalışma Tipi",
        accessorKey: "workType",
        width: 130,
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value: unknown) =>
          WORK_TYPE_LABELS[value as WorkType] || String(value),
        cell: (value) =>
          value ? (
            <Chip
              label={WORK_TYPE_LABELS[value as WorkType] || value}
              size="small"
              variant="outlined"
              sx={chipBaseSx}
            />
          ) : (
            "-"
          ),
      },
      {
        id: "employmentStatus",
        header: "Durum",
        accessorKey: "employmentStatus",
        width: 100,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value: unknown) =>
          EMPLOYMENT_STATUS_LABELS[value as EmploymentStatus] || String(value),
        cell: (value) => {
          const status = value as EmploymentStatus;
          return (
            <Chip
              label={EMPLOYMENT_STATUS_LABELS[status] || status}
              size="small"
              variant="outlined"
              sx={statusChipSxMap[status] ?? statusChipSxMap[EmploymentStatus.INACTIVE]}
            />
          );
        },
      },
      {
        id: "hasProfile",
        header: "Profil",
        accessorKey: "hasProfile",
        width: 80,
        align: "center",
        sortable: true,
        cell: (value) => (
          <Chip
            label={value ? "Var" : "Yok"}
            size="small"
            variant="outlined"
            sx={
              value
                ? {
                    color: "var(--color-success-foreground)",
                    backgroundColor:
                      "color-mix(in oklab, var(--color-success) 18%, transparent)",
                    borderColor:
                      "color-mix(in oklab, var(--color-success) 45%, transparent)",
                  }
                : {
                    color: "var(--color-warning-foreground)",
                    backgroundColor:
                      "color-mix(in oklab, var(--color-warning) 18%, transparent)",
                    borderColor:
                      "color-mix(in oklab, var(--color-warning) 45%, transparent)",
                  }
            }
          />
        ),
      },
      {
        id: "_actions",
        header: "İşlemler",
        accessorKey: "_id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              title="Düzenle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-error)]"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              title="Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add-profile",
        label: "Yeni Profil",
        icon: <UserPlus size={18} />,
        onClick: handleCreate,
        variant: "primary",
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "default",
      },
    ],
    [handleCreate, refetch]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: "var(--color-foreground)" }}>
          Çalışan Profilleri
        </Typography>
      </Box>

      {/* Filtreler */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 150, ...muiFieldSx }}>
          <InputLabel>İstihdam Durumu</InputLabel>
          <Select
            value={queryParams.employmentStatus || ""}
            onChange={(e) =>
              handleFilterChange(
                "employmentStatus",
                e.target.value as EmploymentStatus | undefined
              )
            }
            label="İstihdam Durumu"
            MenuProps={muiSelectMenuProps}
          >
            <MenuItem value="">
              <em>Tümü</em>
            </MenuItem>
            {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150, ...muiFieldSx }}>
          <InputLabel>Çalışma Tipi</InputLabel>
          <Select
            value={queryParams.workType || ""}
            onChange={(e) =>
              handleFilterChange("workType", e.target.value as WorkType | undefined)
            }
            label="Çalışma Tipi"
            MenuProps={muiSelectMenuProps}
          >
            <MenuItem value="">
              <em>Tümü</em>
            </MenuItem>
            {WORK_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <div style={{ height: 550 }}>
        <Grid<EmployeeProfile>
          data={profiles}
          columns={columns}
          loading={isLoading}
          height="100%"
          locale="tr"
          stateKey="employee-profiles-grid"
          getRowId={(row) => row._id || row.userId}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "calisan-profilleri",
          }}
        />
      </div>

      {/* Pagination bilgisi */}
      {data?.meta && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
            Toplam {data.meta.total} kayıt
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--color-muted-foreground)" }}>
            Sayfa {data.meta.page} / {data.meta.totalPages}
          </Typography>
        </Box>
      )}

      {/* Form Modal */}
      <EmployeeProfileFormModal
        open={isFormOpen}
        onClose={handleCloseForm}
        profile={selectedProfile}
      />
    </Box>
  );
}

export default EmployeeProfileGrid;
