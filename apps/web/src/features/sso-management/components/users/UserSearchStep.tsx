import { useState, useCallback } from "react";
import {
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Box,
  Button,
  Chip
} from "@mui/material";
import { UserPlus, User, Mail, Phone } from "lucide-react";
import { SsoSearchInput } from "../common";
import { useSearchUsers } from "../../hooks";
import type { TUser } from "../../types";

interface UserSearchStepProps {
  onSelectUser: (user: TUser) => void;
  onCreateNew: (searchQuery: string) => void;
  isPending: boolean;
}

export function UserSearchStep({ onSelectUser, onCreateNew, isPending }: UserSearchStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: searchResults,
    isLoading: isSearching,
    isFetched
  } = useSearchUsers(searchQuery, 10);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const hasSearched = isFetched && searchQuery.length >= 3;
  const hasResults = hasSearched && searchResults && searchResults.length > 0;
  const noResults = hasSearched && (!searchResults || searchResults.length === 0);

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Alert
        severity="info"
        sx={{
          color: "var(--color-info)",
          border: "1px solid color-mix(in srgb, var(--color-info) 30%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-info) 10%, transparent)",
          "& .MuiAlert-icon": {
            color: "var(--color-info)"
          }
        }}
      >
        Eklemek istediğiniz kullanıcının e-posta adresini veya telefon numarasını yazarak arayın.
        Kullanıcı bulunamazsa yeni oluşturabilirsiniz.
      </Alert>

      <SsoSearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="E-posta veya telefon ile arayın..."
        debounceMs={400}
        minLength={3}
      />

      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          En az 3 karakter giriniz
        </Typography>
      )}

      {isSearching && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {hasResults && (
        <List disablePadding>
          {searchResults.map((user) => (
            <ListItemButton
              key={user.id}
              onClick={() => onSelectUser(user)}
              disabled={isPending}
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: 1,
                mb: 1,
                "&:hover": {
                  borderColor: "var(--color-primary)",
                  bgcolor: "var(--color-surface-hover)"
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <User size={20} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight={500}>
                      {user.name}
                    </Typography>
                    {user.isActive ? (
                      <Chip label="Aktif" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="Pasif" size="small" color="default" variant="outlined" />
                    )}
                  </Box>
                }
                secondary={
                  <Box display="flex" gap={2} mt={0.5}>
                    {user.email && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Mail size={14} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    )}
                    {user.phone && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Phone size={14} />
                        <Typography variant="body2" color="text.secondary">
                          {user.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}

      {noResults && (
        <Stack spacing={2} alignItems="center" py={2}>
          <Alert
            severity="warning"
            sx={{
              width: "100%",
              color: "var(--color-warning)",
              border: "1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-warning) 10%, transparent)",
              "& .MuiAlert-icon": {
                color: "var(--color-warning)"
              }
            }}
          >
            &quot;{searchQuery}&quot; ile eşleşen kullanıcı bulunamadı.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<UserPlus size={18} />}
            onClick={() => onCreateNew(searchQuery)}
          >
            Yeni Kullanıcı Oluştur
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

export default UserSearchStep;
