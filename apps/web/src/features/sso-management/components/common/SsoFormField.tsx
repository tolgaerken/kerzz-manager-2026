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
  helperText?: string;
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
      <FormControl
        fullWidth={fullWidth}
        error={!!error}
        required={required}
        sx={{
          "& .MuiInputLabel-root": { color: "var(--color-muted-foreground)" },
          "& .MuiInputLabel-root.Mui-focused": { color: "var(--color-primary)" },
          "& .MuiInputLabel-root.Mui-disabled": { color: "var(--color-muted-foreground)" }
        }}
      >
        <InputLabel id={`${name}-label`}>
          {label}
        </InputLabel>
        <Select
          labelId={`${name}-label`}
          name={name}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          label={label}
          disabled={disabled}
          size="small"
          sx={{
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-foreground)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--color-border)"
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--color-muted-foreground)"
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--color-primary)"
            },
            "&.Mui-disabled": {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-foreground)",
              opacity: 0.6,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-border)"
              }
            },
            "& .MuiSvgIcon-root": {
              color: "var(--color-muted-foreground)"
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "var(--color-surface-elevated)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                "& .MuiMenuItem-root": {
                  color: "var(--color-foreground)",
                  "&:hover": {
                    backgroundColor: "var(--color-surface-hover)"
                  },
                  "&.Mui-selected": {
                    backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-elevated))"
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "color-mix(in srgb, var(--color-primary) 18%, var(--color-surface-elevated))"
                  }
                }
              }
            }
          }}
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
      helperText={error || props.helperText}
      required={required}
      disabled={disabled}
      multiline={props.multiline}
      rows={props.rows}
      placeholder={props.placeholder}
      size="small"
      sx={{
        ...fieldSx,
        "& .MuiInputBase-root.Mui-disabled": {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-foreground)",
          opacity: 0.6,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-border)"
          }
        },
        "& .MuiInputLabel-root.Mui-disabled": {
          color: "var(--color-muted-foreground)"
        },
        "& .MuiFormHelperText-root": {
          color: error ? "var(--color-error)" : "var(--color-muted-foreground)"
        }
      }}
    />
  );
}

export default SsoFormField;
