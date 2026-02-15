import { useMemo } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useOrgLocationsActive } from "../../../employee-org-lookup/hooks";
import type { OrgLocation } from "../../../employee-org-lookup/types";

interface LocationLookupSelectProps {
  value: string;
  onChange: (name: string) => void;
  error?: string;
  disabled?: boolean;
}

export function LocationLookupSelect({
  value,
  onChange,
  error,
  disabled = false,
}: LocationLookupSelectProps) {
  const { data: locations, isLoading } = useOrgLocationsActive();

  const selectedOption = useMemo(() => {
    if (!value || !locations) return null;
    return locations.find((l) => l.name === value) || null;
  }, [value, locations]);

  const handleChange = (_: unknown, newValue: OrgLocation | null) => {
    if (newValue) {
      onChange(newValue.name);
    } else {
      onChange("");
    }
  };

  return (
    <Autocomplete<OrgLocation>
      value={selectedOption}
      onChange={handleChange}
      options={locations || []}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.name === val.name}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Lokasyon"
          size="small"
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
          key={option._id}
          style={{
            color: "var(--color-foreground)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {option.name}
          {option.address && (
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.85em",
                color: "var(--color-muted-foreground)",
              }}
            >
              ({option.address})
            </span>
          )}
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

export default LocationLookupSelect;
