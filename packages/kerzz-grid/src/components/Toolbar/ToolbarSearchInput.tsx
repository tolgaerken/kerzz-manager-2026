import React, { useCallback, useRef, useEffect } from 'react';
import { useLocale } from '../../i18n/useLocale';

interface ToolbarSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ToolbarSearchInput = React.memo(function ToolbarSearchInput({ value, onChange }: ToolbarSearchInputProps) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onChange('');
      }
    },
    [onChange]
  );

  return (
    <div className="kz-toolbar-search">
      <span className="kz-toolbar-search__icon">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="text"
        className="kz-toolbar-search__input"
        placeholder={locale.toolbarSearchPlaceholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button
          type="button"
          className="kz-toolbar-search__clear"
          onClick={handleClear}
          title={locale.filterClear}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
});

const SearchIcon = React.memo(function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM14 14l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const ClearIcon = React.memo(function ClearIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
