import { useMemo } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useOrgDepartmentsActive } from "../../../employee-org-lookup/hooks";
import type { OrgDepartment } from "../../../employee-org-lookup/types";

interface DepartmentLookupSelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
  error?: string;
  disabled?: boolean;
}

export function DepartmentLookupSelect({
  value,
  onChange,
  error,
  disabled = false,
}: DepartmentLookupSelectProps) {
  const { data: departments, isLoading } = useOrgDepartmentsActive();

  const selectedOption = useMemo(() => {
    if (!value || !departments) return null;
    return departments.find((d) => d.code === value) || null;
  }, [value, departments]);

  const handleChange = (_: unknown, newValue: OrgDepartment | null) => {
    if (newValue) {
      onChange(newValue.code, newValue.name);
    } else {
      onChange("", "");
    }
  };

  return (
    <Autocomplete<OrgDepartment>
      value={selectedOption}
      onChange={handleChange}
      options={departments || []}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Departman"
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

export default DepartmentLookupSelect;
