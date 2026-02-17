import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Box, Avatar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../../lib/apiClient";

// Simple debounce hook
function useDebounce(callback: (term: string) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (term: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(term);
      }, delay);
    },
    [callback, delay]
  );
}

interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

interface AppUserListResponse {
  data: AppUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ManagerLookupSelectProps {
  value: string;
  onChange: (userId: string, userName: string) => void;
  error?: string;
  disabled?: boolean;
  excludeUserId?: string; // Kendini seçememesi için
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export function ManagerLookupSelect({
  value,
  onChange,
  error,
  disabled = false,
  excludeUserId,
}: ManagerLookupSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Uygulamaya atanmış kullanıcı listesini ara
  const { data, isLoading } = useQuery({
    queryKey: ["app-users-lookup", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
      });
      if (searchTerm) {
        params.set("search", searchTerm);
      }
      const response = await apiGet<AppUserListResponse>(
        `${API_BASE_URL}/sso/users?${params.toString()}`
      );
      return response;
    },
    staleTime: 1000 * 60 * 2,
    enabled: true,
  });

  // Seçili kullanıcıyı getir (value değiştiğinde)
  const { data: selectedUser } = useQuery({
    queryKey: ["app-user-detail", value],
    queryFn: async () => {
      if (!value) return null;
      const response = await apiGet<AppUser>(
        `${API_BASE_URL}/sso/users/${encodeURIComponent(value)}`
      );
      return response;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!value,
  });

  const users = useMemo(() => {
    const list = data?.data || [];
    // Kendini hariç tut
    if (excludeUserId) {
      return list.filter((u) => u.id !== excludeUserId);
    }
    return list;
  }, [data, excludeUserId]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    // Önce listede ara
    const fromList = users.find((u) => u.id === value);
    if (fromList) return fromList;
    // Yoksa detay sorgudan al
    if (selectedUser) return selectedUser;
    return null;
  }, [value, users, selectedUser]);

  const debouncedSearch = useDebounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleInputChange = useCallback(
    (_: unknown, newInputValue: string) => {
      setInputValue(newInputValue);
      debouncedSearch(newInputValue);
    },
    [debouncedSearch]
  );

  const handleChange = (_: unknown, newValue: AppUser | null) => {
    if (newValue) {
      onChange(newValue.id, newValue.name);
    } else {
      onChange("", "");
    }
  };

  return (
    <Autocomplete<AppUser>
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={users}
      getOptionLabel={(option) => option.name || option.email || option.id}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      loading={isLoading}
      disabled={disabled}
      filterOptions={(x) => x} // Server-side filtering
      renderInput={(params) => (
        <TextField
          {...params}
          label="Yönetici"
          size="small"
          placeholder="Kullanıcı ara..."
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "var(--color-border)" },
              "&:hover fieldset": { borderColor: "var(--color-primary)" },
              "&.Mui-focused fieldset": { borderColor: "var(--color-primary)" },
            },
            "& .MuiInputLabel-root": { color: "var(--color-muted-foreground)" },
            "& .MuiInputBase-input": { color: "var(--color-foreground)" },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          style={{
            color: "var(--color-foreground)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.75rem",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {option.name?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <Box>
              <div style={{ fontWeight: 500 }}>{option.name}</div>
              {(option.email || option.phone) && (
                <div
                  style={{
                    fontSize: "0.8em",
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {option.email || option.phone}
                </div>
              )}
            </Box>
          </Box>
        </li>
      )}
      componentsProps={{
        paper: {
          sx: {
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          },
        },
      }}
    />
  );
}

export default ManagerLookupSelect;
