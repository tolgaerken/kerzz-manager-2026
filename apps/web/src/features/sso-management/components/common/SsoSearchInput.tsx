import { useState, useEffect, useCallback, useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, X } from "lucide-react";

interface SsoSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  minLength?: number;
  fullWidth?: boolean;
  size?: "small" | "medium";
}

export function SsoSearchInput({
  value,
  onChange,
  placeholder = "Ara...",
  debounceMs = 300,
  minLength = 0,
  fullWidth = true,
  size = "small"
}: SsoSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (localValue === value) {
      return;
    }

    const timer = setTimeout(() => {
      if (localValue.length >= minLength || localValue.length === 0) {
        onChangeRef.current(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, debounceMs, minLength]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      sx={{
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
        "& .MuiSvgIcon-root, & svg": {
          color: "var(--color-muted-foreground)"
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={18} />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              size="small"
              edge="end"
              sx={{
                color: "var(--color-muted-foreground)",
                "&:hover": { backgroundColor: "var(--color-surface-hover)" }
              }}
            >
              <X size={16} />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  );
}

export default SsoSearchInput;
