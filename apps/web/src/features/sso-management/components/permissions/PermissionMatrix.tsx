import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert
} from "@mui/material";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { SsoModal } from "../common";
import { usePermissions, useRole, useSetRolePermissions, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { TPermission } from "../../types";

interface GroupedPermissions {
  [group: string]: TPermission[];
}

export function PermissionMatrix() {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const { isPermissionMatrixOpen, closePermissionMatrix, selectedRoleForMatrix } =
    useSsoManagementStore();

  // Get all permissions and filter by role's app_id
  const { data: allPermissions = [], isLoading: permissionsLoading } = usePermissions({
    all: true,
    includeInactive: false
  });
  const { data: applications = [] } = useApplications(true);
  const { data: roleWithPermissions, isLoading: roleLoading } = useRole(
    selectedRoleForMatrix?.id || null
  );
  const setRolePermissions = useSetRolePermissions();

  const isLoading = permissionsLoading || roleLoading;

  // Get app name for display
  const getAppName = useCallback(
    (appId: string) => applications.find((a) => a.id === appId)?.name || appId,
    [applications]
  );

  // Filter permissions by role's app_id
  const permissions = useMemo(() => {
    if (!selectedRoleForMatrix?.app_id) return [];
    return allPermissions.filter((p) => p.app_id === selectedRoleForMatrix.app_id);
  }, [allPermissions, selectedRoleForMatrix?.app_id]);

  // Group permissions by group name
  const groupedPermissions = useMemo<GroupedPermissions>(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.group]) {
        acc[perm.group] = [];
      }
      acc[perm.group].push(perm);
      return acc;
    }, {} as GroupedPermissions);
  }, [permissions]);

  const sortedGroups = useMemo(() => Object.keys(groupedPermissions).sort(), [groupedPermissions]);

  // Initialize selected permissions from role data
  useEffect(() => {
    if (roleWithPermissions?.permissionIds) {
      setSelectedPermissions(new Set(roleWithPermissions.permissionIds));
      setHasChanges(false);
    } else {
      setSelectedPermissions(new Set());
      setHasChanges(false);
    }
  }, [roleWithPermissions]);

  const handleTogglePermission = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
    setHasChanges(true);
  }, []);

  const handleToggleGroup = useCallback(
    (group: string) => {
      const groupPerms = groupedPermissions[group] || [];
      const allSelected = groupPerms.every((p) => selectedPermissions.has(p.id));

      setSelectedPermissions((prev) => {
        const newSet = new Set(prev);
        groupPerms.forEach((p) => {
          if (allSelected) {
            newSet.delete(p.id);
          } else {
            newSet.add(p.id);
          }
        });
        return newSet;
      });
      setHasChanges(true);
    },
    [groupedPermissions, selectedPermissions]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedPermissions(new Set(permissions.map((p) => p.id)));
    setHasChanges(true);
  }, [permissions]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPermissions(new Set());
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedRoleForMatrix) return;

    try {
      await setRolePermissions.mutateAsync({
        roleId: selectedRoleForMatrix.id,
        permissions: Array.from(selectedPermissions)
      });
      toast.success("İzinler başarıyla güncellendi");
      setHasChanges(false);
      closePermissionMatrix();
    } catch {
      toast.error("İzinler güncellenirken hata oluştu");
    }
  }, [selectedRoleForMatrix, selectedPermissions, setRolePermissions, closePermissionMatrix]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (!confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?")) {
        return;
      }
    }
    closePermissionMatrix();
  }, [hasChanges, closePermissionMatrix]);

  const selectedCount = selectedPermissions.size;
  const totalCount = permissions.length;

  return (
    <SsoModal
      open={isPermissionMatrixOpen}
      onClose={handleClose}
      title={`İzin Matrisi - ${selectedRoleForMatrix?.name || ""}`}
      maxWidth="md"
      actions={
        <>
          <Button onClick={handleClose} disabled={setRolePermissions.isPending}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasChanges || setRolePermissions.isPending}
          >
            {setRolePermissions.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* App info and stats */}
          <Box mb={2}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Uygulama:</strong> {getAppName(selectedRoleForMatrix?.app_id || "")}
              </Typography>
              <Typography variant="body2">
                <strong>Seçili İzin:</strong> {selectedCount} / {totalCount}
              </Typography>
            </Alert>

            {/* Quick actions */}
            <Box display="flex" gap={1}>
              <Button size="small" variant="outlined" onClick={handleSelectAll}>
                Tümünü Seç
              </Button>
              <Button size="small" variant="outlined" onClick={handleDeselectAll}>
                Tümünü Kaldır
              </Button>
            </Box>
          </Box>

          {permissions.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <Typography color="text.secondary">
                Bu uygulama için henüz izin tanımlanmamış
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 450 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 150 }}>Grup</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>İzin</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">
                      Seçili
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedGroups.map((group) => {
                    const groupPerms = groupedPermissions[group];
                    const allSelected = groupPerms.every((p) => selectedPermissions.has(p.id));
                    const someSelected =
                      !allSelected && groupPerms.some((p) => selectedPermissions.has(p.id));
                    const selectedInGroup = groupPerms.filter((p) =>
                      selectedPermissions.has(p.id)
                    ).length;

                    return (
                      <Fragment key={`group-${group}`}>
                        {/* Group header row */}
                        <TableRow sx={{ backgroundColor: "action.hover" }}>
                          <TableCell colSpan={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip label={group} size="small" color="primary" variant="outlined" />
                              <Typography variant="body2" color="text.secondary">
                                ({selectedInGroup}/{groupPerms.length} izin)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={() => handleToggleGroup(group)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        {/* Permission rows */}
                        {groupPerms.map((perm) => (
                          <TableRow key={perm.id} hover>
                            <TableCell />
                            <TableCell>
                              <Box>
                                <Typography variant="body2">{perm.permission}</Typography>
                                {perm.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {perm.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={selectedPermissions.has(perm.id)}
                                onChange={() => handleTogglePermission(perm.id)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </SsoModal>
  );
}

export default PermissionMatrix;
