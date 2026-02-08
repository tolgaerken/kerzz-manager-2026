import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown, Globe } from "lucide-react";
import { useCountries } from "../../hooks/useLocations";
import type { Country } from "../../types";

interface CountryAutocompleteProps {
  value: { countryId: string; country: string };
  onChange: (countryId: string, country: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CountryAutocomplete({
  value,
  onChange,
  error,
  disabled = false,
}: CountryAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: countries, isLoading } = useCountries();

  const filteredCountries = countries?.filter((country) =>
    country.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  // Türkiye'yi en üste koy
  const sortedCountries = [
    ...filteredCountries.filter((c) => c.alpha2Code === "TR"),
    ...filteredCountries.filter((c) => c.alpha2Code !== "TR"),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (country: Country) => {
      onChange(country.alpha2Code, country.name);
      setSearchTerm("");
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("", "");
    setSearchTerm("");
    setIsOpen(false);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  if (value.countryId && !isOpen) {
    return (
      <div ref={containerRef} className="relative">
        <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
          <Globe className="w-4 h-4 inline-block mr-1" />
          Ülke
        </label>
        <div
          onClick={() => !disabled && setIsOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] cursor-pointer"
        >
          <span className="flex-1 text-[var(--color-foreground)] truncate">
            {value.country}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex-shrink-0 p-1 rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
              title="Temizle"
            >
              <X className="w-4 h-4 text-[var(--color-foreground-muted)]" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
        <Globe className="w-4 h-4 inline-block mr-1" />
        Ülke
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          placeholder="Ülke arayın..."
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow disabled:opacity-50"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
      </div>

      {error && <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 max-h-60 overflow-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-[var(--color-foreground-muted)] text-center">
              Yükleniyor...
            </div>
          )}

          {!isLoading && sortedCountries.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-foreground-muted)] text-center">
              {searchTerm ? "Ülke bulunamadı" : "Aramak için yazmaya başlayın"}
            </div>
          )}

          {!isLoading &&
            sortedCountries.map((country) => (
              <button
                key={country.alpha2Code}
                type="button"
                onClick={() => handleSelect(country)}
                className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface-elevated)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
              >
                <span className="text-sm font-medium text-[var(--color-foreground)]">
                  {country.name}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
