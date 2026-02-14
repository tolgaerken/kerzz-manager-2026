import {
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  TextFieldProps
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
            />
          }
          label={label}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (props.type === "select") {
    return (
      <FormControl fullWidth={fullWidth} error={!!error} required={required}>
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <Select
          labelId={`${name}-label`}
          name={name}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          label={label}
          disabled={disabled}
        >
          {props.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
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
    />
  );
}

export default SsoFormField;
