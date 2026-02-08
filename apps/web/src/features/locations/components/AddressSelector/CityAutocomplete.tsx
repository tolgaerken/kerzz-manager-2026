import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown, MapPin } from "lucide-react";
import { useCitiesTr } from "../../hooks/useLocations";
import type { CityTr } from "../../types";

interface CityAutocompleteProps {
  value: { cityId: number; city: string };
  onChange: (cityId: number, city: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  error,
  disabled = false,
}: CityAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: cities, isLoading } = useCitiesTr();

  const filteredCities = cities?.filter((city) =>
    city.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

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
    (city: CityTr) => {
      onChange(city.id, city.name);
      setSearchTerm("");
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(0, "");
    setSearchTerm("");
    setIsOpen(false);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  if (value.cityId && !isOpen) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
          <MapPin className="w-4 h-4 inline-block mr-1" />
          İl
        </label>
        <div className="flex items-center gap-2 w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)]">
          <span className="flex-1 text-[var(--color-foreground)] truncate">
            {value.city}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
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
        <MapPin className="w-4 h-4 inline-block mr-1" />
        İl
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
          placeholder="İl arayın..."
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow disabled:opacity-50"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
      </div>

      {error && <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-[var(--color-foreground-muted)] text-center">
              Yükleniyor...
            </div>
          )}

          {!isLoading && filteredCities.length === 0 && (
            <div className="px-4 py-3 text-sm text-[var(--color-foreground-muted)] text-center">
              {searchTerm ? "İl bulunamadı" : "Aramak için yazmaya başlayın"}
            </div>
          )}

          {!isLoading &&
            filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface-elevated)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
              >
                <div className="text-sm font-medium text-[var(--color-foreground)]">
                  {city.name}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
