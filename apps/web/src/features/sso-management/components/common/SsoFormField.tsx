import {
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText
} from "@mui/material";

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

interface TextFieldComponentProps extends BaseFieldProps {
  type: "text" | "email" | "password" | "number";
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox";
  value: boolean;
  onChange: (value: boolean) => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

type SsoFormFieldProps = TextFieldComponentProps | CheckboxFieldProps | SelectFieldProps;

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: "var(--color-muted-foreground)"
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-primary)"
  },
  "& .MuiInputBase-root": {
    backgroundColor: "var(--color-surface-elevated)",
    color: "var(--color-foreground)"
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-border)"
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-muted-foreground)"
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-primary)"
  },
  "& .MuiFormHelperText-root": {
    color: "var(--color-error)"
  }
} as const;

export function SsoFormField(props: SsoFormFieldProps) {
  const { label, name, error, required, disabled, fullWidth = true } = props;

  if (props.type === "checkbox") {
    return (
      <FormControl fullWidth={fullWidth} error={!!error}>
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={props.value}
              onChange={(e) => props.onChange(e.target.checked)}
              disabled={disabled}
              sx={{
                color: "var(--color-muted-foreground)",
                "&.Mui-checked": {
                  color: "var(--color-primary)"
                }
              }}
            />
          }
          label={label}
          sx={{
            color: "var(--color-foreground)"
          }}
        />
        {error && <FormHelperText sx={{ color: "var(--color-error)" }}>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (props.type === "select") {
    return (
      <FormControl fullWidth={fullWidth} error={!!error} required={required}>
        <InputLabel id={`${name}-label`} sx={{ color: "var(--color-muted-foreground)" }}>
          {label}
        </InputLabel>
        <Select
          labelId={`${name}-label`}
          name={name}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          label={label}
          disabled={disabled}
          sx={fieldSx}
        >
          {props.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText sx={{ color: "var(--color-error)" }}>{error}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      name={name}
      type={props.type}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      error={!!error}
      helperText={error}
      required={required}
      disabled={disabled}
      multiline={props.multiline}
      rows={props.rows}
      placeholder={props.placeholder}
      size="small"
      sx={fieldSx}
    />
  );
}

export default SsoFormField;
