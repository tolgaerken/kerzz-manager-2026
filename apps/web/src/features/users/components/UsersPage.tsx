import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert
} from "@mui/material";
import { Search, UserPlus, Trash2, Edit, X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useAppUsers, useSearchUsers, useAssignUser, useRemoveUser, useRoles } from "../hooks/useUsers";
import type { AppUser, SsoUser, Role } from "../types/user.types";
import { UserRolesDialog } from "./UserRolesDialog";

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [ssoSearchQuery, setSsoSearchQuery] = useState("");

  const { data: appUsers = [], isLoading, error, refetch } = useAppUsers();
  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(ssoSearchQuery, ssoSearchQuery.length >= 2);
  const { data: roles = [] } = useRoles();
  const assignUser = useAssignUser();
  const removeUser = useRemoveUser();

  // Filter app users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return appUsers;
    const query = searchQuery.toLowerCase();
    return appUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
    );
  }, [appUsers, searchQuery]);

  // Column definitions for AG Grid
  const columnDefs: ColDef<AppUser>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Ad Soyad",
        flex: 1,
        minWidth: 150
      },
      {
        field: "email",
        headerName: "E-posta",
        flex: 1,
        minWidth: 200
      },
      {
        field: "phone",
        headerName: "Telefon",
        width: 140
      },
      {
        field: "isActive",
        headerName: "Durum",
        width: 100,
        cellRenderer: (params: ICellRendererParams<AppUser>) => (
          <Chip
            label={params.value ? "Aktif" : "Pasif"}
            color={params.value ? "success" : "default"}
            size="small"
          />
        )
      },
      {
        headerName: "İşlemler",
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<AppUser>) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleEditRoles(params.data!)}
              title="Rolleri Düzenle"
            >
              <Edit size={16} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveUser(params.data!.id)}
              title="Kullanıcıyı Kaldır"
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        )
      }
    ],
    []
  );

  const handleEditRoles = useCallback((user: AppUser) => {
    setSelectedUser(user);
    setRolesDialogOpen(true);
  }, []);

  const handleRemoveUser = useCallback(
    async (userId: string) => {
      if (!confirm("Bu kullanıcıyı uygulamadan kaldırmak istediğinize emin misiniz?")) {
        return;
      }
      try {
        await removeUser.mutateAsync(userId);
      } catch (err) {
        console.error("Remove user error:", err);
      }
    },
    [removeUser]
  );

  const handleAssignUser = useCallback(
    async (user: SsoUser) => {
      try {
        await assignUser.mutateAsync({
          userId: user.id,
          userName: user.name
        });
        setAssignDialogOpen(false);
        setSsoSearchQuery("");
      } catch (err) {
        console.error("Assign user error:", err);
      }
    },
    [assignUser]
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Kullanıcılar yüklenirken hata oluştu: {(error as Error).message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={() => setAssignDialogOpen(true)}
        >
          Kullanıcı Ekle
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Grid */}
      <Box sx={{ flex: 1, minHeight: 400 }} className="ag-theme-material">
        <AgGridReact<AppUser>
          rowData={filteredUsers}
          columnDefs={columnDefs}
          loading={isLoading}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
          animateRows
          rowSelection="single"
          suppressCellFocus
        />
      </Box>

      {/* Assign User Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Kullanıcı Ekle
          <IconButton
            onClick={() => setAssignDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="SSO'da kullanıcı ara (isim, e-posta veya telefon)..."
            value={ssoSearchQuery}
            onChange={(e) => setSsoSearchQuery(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
              endAdornment: isSearching && <CircularProgress size={20} />
            }}
          />

          {searchResults.length > 0 && (
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {searchResults.map((user) => {
                const isAlreadyAssigned = appUsers.some((au) => au.id === user.id);
                return (
                  <ListItem
                    key={user.id}
                    sx={{
                      bgcolor: isAlreadyAssigned ? "action.disabledBackground" : "transparent",
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemText
                      primary={user.name}
                      secondary={`${user.email || ""} ${user.phone ? `• ${user.phone}` : ""}`}
                    />
                    <ListItemSecondaryAction>
                      {isAlreadyAssigned ? (
                        <Chip label="Zaten Ekli" size="small" />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAssignUser(user)}
                          disabled={assignUser.isPending}
                        >
                          Ekle
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}

          {ssoSearchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              Kullanıcı bulunamadı
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>

      {/* User Roles Dialog */}
      {selectedUser && (
        <UserRolesDialog
          open={rolesDialogOpen}
          onClose={() => {
            setRolesDialogOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          roles={roles}
        />
      )}
    </Box>
  );
}

export default UsersPage;
