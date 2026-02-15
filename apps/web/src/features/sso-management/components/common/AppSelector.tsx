import { useMemo } from "react";
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Paper
} from "@mui/material";
import { Search } from "lucide-react";
import { useApplications } from "../../hooks";
import type { TApplication } from "../../types";

interface AppSelectorProps {
  selectedAppId: string | null;
  onAppChange: (appId: string | null) => void;
  onFetch: () => void;
  loading?: boolean;
  showAllOption?: boolean;
  label?: string;
}

export function AppSelector({
  selectedAppId,
  onAppChange,
  onFetch,
  loading = false,
  showAllOption = false,
  label = "Uygulama Seçin"
}: AppSelectorProps) {
  const { data: applications = [], isLoading: appsLoading } = useApplications(true);

  const options = useMemo(() => {
    const activeApps = applications.filter((app) => app.isActive);
    if (showAllOption) {
      return [{ id: "__all__", name: "Tüm Uygulamalar", isActive: true } as TApplication, ...activeApps];
    }
    return activeApps;
  }, [applications, showAllOption]);

  const selectedApp = useMemo(
    () => options.find((app) => app.id === selectedAppId) || null,
    [options, selectedAppId]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 1
      }}
    >
      <Box display="flex" gap={2} alignItems="center">
        <Autocomplete
          value={selectedApp}
          onChange={(_, newValue) => {
            onAppChange(newValue?.id || null);
          }}
          options={options}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={appsLoading}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "var(--color-surface-elevated)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
                boxShadow: "none"
              }
            },
            popper: {
              sx: {
                "& .MuiAutocomplete-listbox": {
                  backgroundColor: "var(--color-surface-elevated)",
                  color: "var(--color-foreground)"
                },
                "& .MuiAutocomplete-option": {
                  color: "var(--color-foreground)"
                },
                "& .MuiAutocomplete-option:hover": {
                  backgroundColor: "var(--color-surface-hover)"
                },
                "& .MuiAutocomplete-option[aria-selected='true']": {
                  backgroundColor:
                    "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-elevated))"
                },
                "& .MuiAutocomplete-option[aria-selected='true'].Mui-focused": {
                  backgroundColor:
                    "color-mix(in srgb, var(--color-primary) 18%, var(--color-surface-elevated))"
                },
                "& .MuiAutocomplete-noOptions": {
                  color: "var(--color-muted-foreground)"
                }
              }
            }
          }}
          sx={{
            minWidth: 300,
            flex: 1,
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--color-surface-elevated)",
              color: "var(--color-foreground)",
              "& fieldset": {
                borderColor: "var(--color-border)"
              },
              "&:hover fieldset": {
                borderColor: "var(--color-muted-foreground)"
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--color-primary)"
              }
            },
            "& .MuiInputLabel-root": {
              color: "var(--color-muted-foreground)"
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--color-primary)"
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              size="small"
              placeholder="Uygulama ara..."
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Box>
                  <Box fontWeight={option.id === "__all__" ? 600 : 400}>
                    {option.name}
                  </Box>
                  {option.description && (
                    <Box fontSize="0.75rem" color="var(--color-muted-foreground)">
                      {option.description}
                    </Box>
                  )}
                </Box>
              </li>
            );
          }}
        />
        <Button
          variant="contained"
          onClick={onFetch}
          disabled={!selectedAppId || loading}
          startIcon={<Search size={18} />}
          sx={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            "&:hover": {
              backgroundColor: "var(--color-primary)"
            },
            "&.Mui-disabled": {
              backgroundColor: "var(--color-surface-hover)",
              color: "var(--color-muted-foreground)"
            }
          }}
        >
          {loading ? "Yükleniyor..." : "Getir"}
        </Button>
      </Box>
    </Paper>
  );
}

export default AppSelector;
