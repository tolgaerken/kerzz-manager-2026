import { useMemo } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useOrgTitlesActive } from "../../../employee-org-lookup/hooks";
import type { OrgTitle } from "../../../employee-org-lookup/types";

interface TitleLookupSelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TitleLookupSelect({
  value,
  onChange,
  error,
  disabled = false,
}: TitleLookupSelectProps) {
  const { data: titles, isLoading } = useOrgTitlesActive();

  const selectedOption = useMemo(() => {
    if (!value || !titles) return null;
    return titles.find((t) => t.code === value) || null;
  }, [value, titles]);

  const handleChange = (_: unknown, newValue: OrgTitle | null) => {
    if (newValue) {
      onChange(newValue.code, newValue.name);
    } else {
      onChange("", "");
    }
  };

  return (
    <Autocomplete<OrgTitle>
      value={selectedOption}
      onChange={handleChange}
      options={titles || []}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Ünvan"
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
          <span style={{ fontWeight: 500 }}>{option.code}</span>
          <span style={{ marginLeft: 8, color: "var(--color-muted-foreground)" }}>
            {option.name}
          </span>
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

export default TitleLookupSelect;
