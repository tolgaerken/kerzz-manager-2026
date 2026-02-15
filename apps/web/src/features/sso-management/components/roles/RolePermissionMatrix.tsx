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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from "@mui/material";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { SsoModal } from "../common";
import {
  usePermissions,
  useRoles,
  useApplications,
  useSetRolePermissions
} from "../../hooks";
import { rolesApi } from "../../api/ssoApi";
import type { TPermission } from "../../types";

interface GroupedPermissions {
  [group: string]: TPermission[];
}

interface RolePermissionMap {
  [roleId: string]: Set<string>;
}

interface RolePermissionMatrixProps {
  open: boolean;
  onClose: () => void;
  initialAppId?: string;
}

export function RolePermissionMatrix({ open, onClose, initialAppId }: RolePermissionMatrixProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId || "");
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMap>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Fetch data
  const { data: applications = [], isLoading: appsLoading } = useApplications(true);
  const { data: allPermissions = [], isLoading: permissionsLoading } = usePermissions({
    all: true,
    includeInactive: false
  });
  const { data: allRoles = [], isLoading: rolesLoading } = useRoles({
    all: true,
    includeInactive: false
  });
  const setRolePermissionsMutation = useSetRolePermissions();

  const isLoading = appsLoading || permissionsLoading || rolesLoading;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAppId(initialAppId || "");
      setRolePermissions({});
      setHasChanges(false);
    }
  }, [open, initialAppId]);

  // Get app name for display
  const getAppName = useCallback(
    (appId: string) => applications.find((a) => a.id === appId)?.name || appId,
    [applications]
  );

  // Filter permissions and roles by selected app
  const permissions = useMemo(() => {
    if (!selectedAppId) return [];
    return allPermissions.filter((p) => p.app_id === selectedAppId);
  }, [allPermissions, selectedAppId]);

  const roles = useMemo(() => {
    if (!selectedAppId) return [];
    return allRoles.filter((r) => r.app_id === selectedAppId);
  }, [allRoles, selectedAppId]);

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

  // Fetch role permissions when app changes
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedAppId || roles.length === 0) {
        setRolePermissions({});
        return;
      }

      setLoadingPermissions(true);
      const newRolePermissions: RolePermissionMap = {};

      // Initialize with empty sets
      for (const role of roles) {
        newRolePermissions[role.id] = new Set();
      }

      // Fetch permissions for each role using the API client
      try {
        const rolePromises = roles.map(async (role) => {
          try {
            const roleData = await rolesApi.getById(role.id);
            if (roleData.permissionIds) {
              newRolePermissions[role.id] = new Set(roleData.permissionIds);
            }
          } catch {
            // Ignore individual role fetch errors
          }
        });

        await Promise.all(rolePromises);
      } catch {
        // Ignore errors
      }

      setRolePermissions(newRolePermissions);
      setLoadingPermissions(false);
      setHasChanges(false);
    };

    fetchRolePermissions();
  }, [selectedAppId, roles]);

  const handleTogglePermission = useCallback((roleId: string, permissionId: string) => {
    setRolePermissions((prev) => {
      const newMap = { ...prev };
      const rolePerms = new Set(prev[roleId] || []);
      if (rolePerms.has(permissionId)) {
        rolePerms.delete(permissionId);
      } else {
        rolePerms.add(permissionId);
      }
      newMap[roleId] = rolePerms;
      return newMap;
    });
    setHasChanges(true);
  }, []);

  const handleToggleGroupForRole = useCallback(
    (roleId: string, group: string) => {
      const groupPerms = groupedPermissions[group] || [];
      const rolePerms = rolePermissions[roleId] || new Set();
      const allSelected = groupPerms.every((p) => rolePerms.has(p.id));

      setRolePermissions((prev) => {
        const newMap = { ...prev };
        const newRolePerms = new Set(prev[roleId] || []);
        groupPerms.forEach((p) => {
          if (allSelected) {
            newRolePerms.delete(p.id);
          } else {
            newRolePerms.add(p.id);
          }
        });
        newMap[roleId] = newRolePerms;
        return newMap;
      });
      setHasChanges(true);
    },
    [groupedPermissions, rolePermissions]
  );

  const handleSelectAllForRole = useCallback(
    (roleId: string) => {
      setRolePermissions((prev) => {
        const newMap = { ...prev };
        newMap[roleId] = new Set(permissions.map((p) => p.id));
        return newMap;
      });
      setHasChanges(true);
    },
    [permissions]
  );

  const handleDeselectAllForRole = useCallback((roleId: string) => {
    setRolePermissions((prev) => {
      const newMap = { ...prev };
      newMap[roleId] = new Set();
      return newMap;
    });
    setHasChanges(true);
  }, []);

  const handleSaveRole = useCallback(
    async (roleId: string) => {
      setSavingRoleId(roleId);
      try {
        await setRolePermissionsMutation.mutateAsync({
          roleId,
          permissions: Array.from(rolePermissions[roleId] || [])
        });
        toast.success("Rol izinleri kaydedildi");
      } catch {
        toast.error("İzinler kaydedilirken hata oluştu");
      } finally {
        setSavingRoleId(null);
      }
    },
    [rolePermissions, setRolePermissionsMutation]
  );

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (!confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?")) {
        return;
      }
    }
    setSelectedAppId("");
    onClose();
  }, [hasChanges, onClose]);

  const activeApps = useMemo(
    () => applications.filter((app) => app.isActive),
    [applications]
  );

  return (
    <SsoModal
      open={open}
      onClose={handleClose}
      title="Rol İzin Matrisi"
      maxWidth="lg"
      actions={
        <Button
          onClick={handleClose}
          sx={{
            color: "var(--color-muted-foreground)",
            "&:hover": { backgroundColor: "var(--color-surface-hover)" }
          }}
        >
          Kapat
        </Button>
      }
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* App selector */}
          <Box mb={3}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": { color: "var(--color-muted-foreground)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-primary)" }
              }}
            >
              <InputLabel>Uygulama Seçin</InputLabel>
              <Select
                value={selectedAppId}
                onChange={(e) => {
                  setSelectedAppId(e.target.value);
                  setHasChanges(false);
                }}
                label="Uygulama Seçin"
                sx={{
                  backgroundColor: "var(--color-surface-elevated)",
                  color: "var(--color-foreground)",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-muted-foreground)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-primary)" },
                  "& .MuiSvgIcon-root": { color: "var(--color-muted-foreground)" }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "var(--color-surface-elevated)",
                      color: "var(--color-foreground)",
                      border: "1px solid var(--color-border)"
                    }
                  }
                }}
              >
                <MenuItem value="" sx={{ color: "var(--color-muted-foreground)" }}>
                  <em>Seçiniz...</em>
                </MenuItem>
                {activeApps.map((app) => (
                  <MenuItem
                    key={app.id}
                    value={app.id}
                    sx={{
                      color: "var(--color-foreground)",
                      "&:hover": { backgroundColor: "var(--color-surface-hover)" },
                      "&.Mui-selected": {
                        backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-elevated))"
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "color-mix(in srgb, var(--color-primary) 18%, var(--color-surface-elevated))"
                      }
                    }}
                  >
                    {app.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {selectedAppId && (
            <>
              {/* Stats */}
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  color: "var(--color-info)",
                  border: "1px solid color-mix(in srgb, var(--color-info) 30%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--color-info) 10%, transparent)",
                  "& .MuiAlert-icon": {
                    color: "var(--color-info)"
                  }
                }}
              >
                <Typography variant="body2">
                  <strong>Uygulama:</strong> {getAppName(selectedAppId)} |{" "}
                  <strong>Roller:</strong> {roles.length} |{" "}
                  <strong>İzinler:</strong> {permissions.length}
                </Typography>
              </Alert>

              {loadingPermissions ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Rol izinleri yükleniyor...</Typography>
                </Box>
              ) : roles.length === 0 ? (
                <Typography sx={{ color: "var(--color-muted-foreground)" }} textAlign="center" py={4}>
                  Bu uygulama için henüz rol tanımlanmamış
                </Typography>
              ) : permissions.length === 0 ? (
                <Typography sx={{ color: "var(--color-muted-foreground)" }} textAlign="center" py={4}>
                  Bu uygulama için henüz izin tanımlanmamış
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 500,
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)"
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            minWidth: 200,
                            position: "sticky",
                            left: 0,
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-foreground)",
                            borderBottomColor: "var(--color-border)",
                            zIndex: 3
                          }}
                        >
                          İzin
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell
                            key={role.id}
                            align="center"
                            sx={{
                              fontWeight: 600,
                              minWidth: 140,
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-foreground)",
                              borderBottomColor: "var(--color-border)"
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: "var(--color-foreground)" }}>
                                {role.name}
                              </Typography>
                              {role.developer && (
                                <Chip
                                  label="Dev"
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    bgcolor: "var(--color-warning)",
                                    color: "var(--color-warning-foreground)"
                                  }}
                                />
                              )}
                              <Box mt={0.5}>
                                <Typography variant="caption" sx={{ color: "var(--color-muted-foreground)" }}>
                                  {(rolePermissions[role.id]?.size || 0)}/{permissions.length}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Quick actions row */}
                      <TableRow
                        sx={{
                          backgroundColor:
                            "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))"
                        }}
                      >
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            backgroundColor:
                              "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))",
                            zIndex: 1,
                            fontWeight: 600
                          }}
                        >
                          Hızlı İşlemler
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} align="center">
                            <Box display="flex" flexDirection="column" gap={0.5}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleSelectAllForRole(role.id)}
                                sx={{
                                  fontSize: "0.7rem",
                                  py: 0,
                                  color: "var(--color-primary)",
                                  "&:hover": { backgroundColor: "var(--color-surface-hover)" }
                                }}
                              >
                                Tümü
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleDeselectAllForRole(role.id)}
                                sx={{
                                  fontSize: "0.7rem",
                                  py: 0,
                                  color: "var(--color-muted-foreground)",
                                  "&:hover": { backgroundColor: "var(--color-surface-hover)" }
                                }}
                              >
                                Hiçbiri
                              </Button>
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>

                      {sortedGroups.map((group) => {
                        const groupPerms = groupedPermissions[group];

                        return (
                          <Fragment key={`group-${group}`}>
                            {/* Group header row */}
                            <TableRow sx={{ backgroundColor: "var(--color-surface-hover)" }}>
                              <TableCell
                                sx={{
                                  position: "sticky",
                                  left: 0,
                                  backgroundColor: "var(--color-surface-hover)",
                                  zIndex: 1
                                }}
                              >
                                <Chip
                                  label={`${group} (${groupPerms.length})`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                                />
                              </TableCell>
                              {roles.map((role) => {
                                const rolePerms = rolePermissions[role.id] || new Set();
                                const allSelected = groupPerms.every((p) => rolePerms.has(p.id));
                                const someSelected =
                                  !allSelected && groupPerms.some((p) => rolePerms.has(p.id));

                                return (
                                  <TableCell key={role.id} align="center" sx={{ borderBottomColor: "var(--color-border)" }}>
                                    <Checkbox
                                      checked={allSelected}
                                      indeterminate={someSelected}
                                      onChange={() => handleToggleGroupForRole(role.id, group)}
                                      size="small"
                                      sx={{
                                        color: "var(--color-muted-foreground)",
                                        "&.Mui-checked": { color: "var(--color-primary)" },
                                        "&.MuiCheckbox-indeterminate": { color: "var(--color-primary)" }
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                            {/* Permission rows */}
                            {groupPerms.map((perm) => (
                              <TableRow
                                key={perm.id}
                                hover
                                sx={{
                                  "&:hover": { backgroundColor: "var(--color-surface-hover)" },
                                  "& td": { borderBottomColor: "var(--color-border)" }
                                }}
                              >
                                <TableCell
                                  sx={{
                                    position: "sticky",
                                    left: 0,
                                    backgroundColor: "var(--color-surface)",
                                    color: "var(--color-foreground)",
                                    zIndex: 1
                                  }}
                                >
                                  <Tooltip title={perm.description || ""} placement="right">
                                    <Typography variant="body2" sx={{ pl: 2, color: "var(--color-foreground)" }}>
                                      {perm.permission}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                {roles.map((role) => {
                                  const rolePerms = rolePermissions[role.id] || new Set();
                                  return (
                                    <TableCell key={role.id} align="center">
                                      <Checkbox
                                        checked={rolePerms.has(perm.id)}
                                        onChange={() => handleTogglePermission(role.id, perm.id)}
                                        size="small"
                                        sx={{
                                          color: "var(--color-muted-foreground)",
                                          "&.Mui-checked": { color: "var(--color-primary)" }
                                        }}
                                      />
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </Fragment>
                        );
                      })}
                      {/* Save buttons row */}
                      <TableRow
                        sx={{
                          backgroundColor:
                            "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))"
                        }}
                      >
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            backgroundColor:
                              "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))",
                            zIndex: 1,
                            fontWeight: 600
                          }}
                        >
                          Kaydet
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} align="center" sx={{ borderBottomColor: "var(--color-border)" }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSaveRole(role.id)}
                              disabled={savingRoleId === role.id}
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
                              {savingRoleId === role.id ? "..." : "Kaydet"}
                            </Button>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      )}
    </SsoModal>
  );
}

export default RolePermissionMatrix;
