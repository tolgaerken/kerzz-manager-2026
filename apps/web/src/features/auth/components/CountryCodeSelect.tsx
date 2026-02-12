import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useCountries } from "../../locations";
import type { Country } from "../../locations";

interface CountryCodeSelectProps {
  value: string; // calling code like "90"
  onChange: (callingCode: string) => void;
  disabled?: boolean;
}

/**
 * Tarayıcı locale'inden ülke kodunu tespit eder
 * Örn: "tr-TR" -> "TR", "en-US" -> "US"
 */
export function getBrowserCountryCode(): string {
  const locale = navigator.language || "tr-TR";
  const parts = locale.split("-");
  // tr-TR formatında son kısım ülke kodu
  if (parts.length >= 2) {
    return parts[parts.length - 1].toUpperCase();
  }
  // Sadece dil kodu varsa (tr, en) varsayılan TR
  return "TR";
}

/**
 * Ülke kodundan (alpha2Code) bayrak emojisi oluşturur
 * Örn: "TR" -> "🇹🇷", "US" -> "🇺🇸"
 */
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function CountryCodeSelect({
  value,
  onChange,
  disabled = false,
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: countries, isLoading } = useCountries();

  // Seçili ülkeyi bul
  const selectedCountry = useMemo(() => {
    if (!countries || !value) return null;
    return countries.find((c) => c.callingCodes?.includes(value));
  }, [countries, value]);

  // Filtrelenmiş ve sıralanmış ülkeler
  const filteredCountries = useMemo(() => {
    if (!countries) return [];

    const filtered = countries.filter((country) => {
      if (!country.callingCodes?.length) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        country.name?.toLowerCase().includes(searchLower) ||
        country.nativeName?.toLowerCase().includes(searchLower) ||
        country.callingCodes.some((code) => code.includes(searchTerm))
      );
    });

    // Türkiye'yi en üste koy
    return [
      ...filtered.filter((c) => c.alpha2Code === "TR"),
      ...filtered.filter((c) => c.alpha2Code !== "TR"),
    ];
  }, [countries, searchTerm]);

  // Dışarı tıklandığında kapat
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

  // Açıldığında input'a focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    const callingCode = country.callingCodes?.[0];
    if (callingCode) {
      onChange(callingCode);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Seçili değer butonu */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 rounded-l-xl border-r border-foreground/10 bg-foreground/5 px-3 py-4 text-foreground transition-colors hover:bg-foreground/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="text-sm text-muted">...</span>
        ) : selectedCountry ? (
          <>
            <span className="text-lg">{getFlagEmoji(selectedCountry.alpha2Code)}</span>
            <span className="text-sm font-medium">+{value}</span>
          </>
        ) : (
          <span className="text-sm text-muted">+{value || "90"}</span>
        )}
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-foreground/10 bg-surface shadow-xl">
          {/* Arama */}
          <div className="border-b border-foreground/10 p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ülke ara..."
              className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Liste */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-center text-sm text-muted">
                Yükleniyor...
              </div>
            )}

            {!isLoading && filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-muted">
                Ülke bulunamadı
              </div>
            )}

            {!isLoading &&
              filteredCountries.map((country) => (
                <button
                  key={country.alpha2Code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-foreground/5"
                >
                  <span className="text-lg">{getFlagEmoji(country.alpha2Code)}</span>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {country.name}
                  </span>
                  <span className="text-sm text-muted">
                    +{country.callingCodes?.[0]}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
