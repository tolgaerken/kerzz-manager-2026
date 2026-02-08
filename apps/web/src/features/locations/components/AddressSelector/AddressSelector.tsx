import { useCallback } from "react";
import { MapPin } from "lucide-react";
import type { AddressData } from "../../types";
import { EMPTY_ADDRESS } from "../../types";
import { CountryAutocomplete } from "./CountryAutocomplete";
import { CityAutocomplete } from "./CityAutocomplete";
import { TownAutocomplete } from "./TownAutocomplete";

interface AddressSelectorProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  errors?: Record<string, string>;
}

const inputClasses =
  "w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm";

const labelClasses = "block text-sm font-medium text-[var(--color-foreground)] mb-1";

export function AddressSelector({ value, onChange, errors = {} }: AddressSelectorProps) {
  const isTurkey = value.countryId === "TR" || value.country === "Türkiye" || value.country === "Turkey";

  const handleCountryChange = useCallback(
    (countryId: string, country: string) => {
      onChange({
        ...EMPTY_ADDRESS,
        countryId,
        country,
      });
    },
    [onChange]
  );

  const handleCityChange = useCallback(
    (cityId: number, city: string) => {
      onChange({
        ...value,
        cityId,
        city,
        townId: 0,
        town: "",
      });
    },
    [value, onChange]
  );

  const handleTownChange = useCallback(
    (townId: number, town: string) => {
      onChange({
        ...value,
        townId,
        town,
      });
    },
    [value, onChange]
  );

  const handleManualChange = useCallback(
    (field: keyof AddressData, fieldValue: string) => {
      onChange({ ...value, [field]: fieldValue });
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-[var(--color-muted-foreground)]" />
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Adres Bilgileri
        </span>
      </div>

      {/* Ülke Autocomplete */}
      <CountryAutocomplete
        value={{ countryId: value.countryId, country: value.country }}
        onChange={handleCountryChange}
        error={errors.country}
      />

      {isTurkey ? (
        /* Türkiye: Cascade Autocomplete */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* İl Autocomplete */}
          <CityAutocomplete
            value={{ cityId: value.cityId, city: value.city }}
            onChange={handleCityChange}
            error={errors.city}
          />

          {/* İlçe Autocomplete */}
          <TownAutocomplete
            cityId={value.cityId}
            value={{ townId: value.townId, town: value.town }}
            onChange={handleTownChange}
            error={errors.town}
          />
        </div>
      ) : (
        /* Yurt Dışı: Manuel Giriş */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Şehir</label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => handleManualChange("city", e.target.value)}
              placeholder="Şehir giriniz..."
              className={inputClasses}
            />
            {errors.city && <p className="text-xs text-[var(--color-error)] mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className={labelClasses}>
              İlçe <span className="text-[var(--color-muted-foreground)]">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={value.town}
              onChange={(e) => handleManualChange("town", e.target.value)}
              placeholder="İlçe giriniz..."
              className={inputClasses}
            />
          </div>
        </div>
      )}

      {/* Açık Adres */}
      <div>
        <label className={labelClasses}>Açık Adres</label>
        <textarea
          value={value.address}
          onChange={(e) => handleManualChange("address", e.target.value)}
          placeholder="Sokak, cadde, bina no, kat, daire..."
          rows={2}
          className={inputClasses + " resize-none"}
        />
        {errors.address && <p className="text-xs text-[var(--color-error)] mt-1">{errors.address}</p>}
      </div>
    </div>
  );
}
