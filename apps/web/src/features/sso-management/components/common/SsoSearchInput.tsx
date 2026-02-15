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
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={18} />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton onClick={handleClear} size="small" edge="end">
              <X size={16} />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  );
}

export default SsoSearchInput;
