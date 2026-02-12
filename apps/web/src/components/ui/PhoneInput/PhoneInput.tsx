import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { useCountries } from "../../../features/locations";
import type { Country } from "../../../features/locations";

export interface PhoneInputValue {
  countryCode: string; // "90"
  phoneNumber: string; // "5321234567"
}

interface PhoneInputProps {
  value: PhoneInputValue;
  onChange: (value: PhoneInputValue) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Tarayıcı locale'inden ülke kodunu tespit eder
 * Örn: "tr-TR" -> "TR", "en-US" -> "US"
 */
export function getBrowserCountryCode(): string {
  const locale = navigator.language || "tr-TR";
  const parts = locale.split("-");
  if (parts.length >= 2) {
    return parts[parts.length - 1].toUpperCase();
  }
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

/**
 * Telefon numarasından boşluk ve özel karakterleri temizler
 */
function sanitizePhoneNumber(value: string): string {
  // Sadece rakamları al
  return value.replace(/\D/g, "");
}

/**
 * Tam telefon numarasını oluşturur (ülke kodu + numara)
 */
export function formatFullPhoneNumber(value: PhoneInputValue): string {
  const cleanNumber = sanitizePhoneNumber(value.phoneNumber).replace(/^0+/, "");
  return `+${value.countryCode}${cleanNumber}`;
}

/**
 * Tam telefon numarasını parse eder
 */
export function parsePhoneNumber(fullPhone: string): PhoneInputValue {
  // +90 ile başlıyorsa
  if (fullPhone.startsWith("+")) {
    const withoutPlus = fullPhone.slice(1);
    // İlk 1-3 karakter ülke kodu olabilir, varsayılan olarak 2 karakter al
    // Türkiye için 90
    if (withoutPlus.startsWith("90")) {
      return {
        countryCode: "90",
        phoneNumber: withoutPlus.slice(2)
      };
    }
    // Diğer ülkeler için basit bir yaklaşım (ilk 2 karakter)
    return {
      countryCode: withoutPlus.slice(0, 2),
      phoneNumber: withoutPlus.slice(2)
    };
  }
  // + ile başlamıyorsa sadece numara
  return {
    countryCode: "90",
    phoneNumber: sanitizePhoneNumber(fullPhone)
  };
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  error,
  label,
  placeholder = "5XX XXX XX XX",
  required = false,
  className = ""
}: PhoneInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: countries, isLoading } = useCountries();

  // Seçili ülkeyi bul
  const selectedCountry = useMemo(() => {
    if (!countries || !value.countryCode) return null;
    return countries.find((c) => c.callingCodes?.includes(value.countryCode));
  }, [countries, value.countryCode]);

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
      ...filtered.filter((c) => c.alpha2Code !== "TR")
    ];
  }, [countries, searchTerm]);

  // Dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Açıldığında input'a focus
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleCountrySelect = useCallback(
    (country: Country) => {
      const callingCode = country.callingCodes?.[0];
      if (callingCode) {
        onChange({ ...value, countryCode: callingCode });
      }
      setIsDropdownOpen(false);
      setSearchTerm("");
    },
    [onChange, value]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizePhoneNumber(e.target.value);
      onChange({ ...value, phoneNumber: sanitized });
    },
    [onChange, value]
  );

  const inputClasses =
    "w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

  const labelClasses = "block text-sm font-medium text-[var(--color-foreground)] mb-1";

  return (
    <div className={className}>
      {label && (
        <label className={labelClasses}>
          {label} {required && <span className="text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div
        ref={containerRef}
        className={`relative flex rounded-md border ${
          error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
        } bg-[var(--color-surface)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent`}
      >
        {/* Country Code Dropdown Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="flex items-center gap-1 rounded-l-md border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="text-sm text-[var(--color-muted-foreground)]">...</span>
          ) : selectedCountry ? (
            <>
              <span className="text-base">{getFlagEmoji(selectedCountry.alpha2Code)}</span>
              <span className="text-sm font-medium">+{value.countryCode}</span>
            </>
          ) : (
            <span className="text-sm text-[var(--color-muted-foreground)]">
              +{value.countryCode || "90"}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
        </button>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Phone className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </div>
          <input
            type="tel"
            value={value.phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-r-md bg-transparent py-2 pl-10 pr-3 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="tel"
          />
        </div>

        {/* Country Dropdown */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            {/* Search */}
            <div className="border-b border-[var(--color-border)] p-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ülke ara..."
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading && (
                <div className="px-4 py-3 text-center text-sm text-[var(--color-muted-foreground)]">
                  Yükleniyor...
                </div>
              )}

              {!isLoading && filteredCountries.length === 0 && (
                <div className="px-4 py-3 text-center text-sm text-[var(--color-muted-foreground)]">
                  Ülke bulunamadı
                </div>
              )}

              {!isLoading &&
                filteredCountries.map((country) => (
                  <button
                    key={country.alpha2Code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="text-base">{getFlagEmoji(country.alpha2Code)}</span>
                    <span className="flex-1 truncate text-sm text-[var(--color-foreground)]">
                      {country.name}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      +{country.callingCodes?.[0]}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
