import { Sun, Moon, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme, themeModes } from "../../../theme";

/**
 * Tema Değiştirme Bileşeni
 * Dark/Light mod geçişi ve preset seçimi sağlar
 */
export function ThemeToggle() {
  const {
    isDark,
    activePresetId,
    activePreset,
    availablePresets,
    setDark,
    toggleTheme,
    setPreset,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ModeIcon = isDark ? Moon : Sun;

  return (
    <div className="relative" ref={menuRef}>
      {/* Açma/Kapama Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label="Tema ayarları"
      >
        <ModeIcon className="h-5 w-5" />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: activePreset.colors.primary[500] }}
        />
      </button>

      {/* Açılır Menü */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-4 shadow-xl">
          {/* Tema Modu */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Tema Modu
            </h3>
            <div className="flex gap-2">
              {themeModes.map(({ value, label }) => {
                const Icon = value === "dark" ? Moon : Sun;
                const isActive =
                  (value === "dark" && isDark) ||
                  (value === "light" && !isDark);
                return (
                  <button
                    key={value}
                    onClick={() => setDark(value === "dark")}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-elevated text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Renk Preset'i */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Renk Teması
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availablePresets.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setPreset(preset.id)}
                    className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary"
                        : "bg-surface-elevated text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: preset.colors.primary[500] }}
                    />
                    <span className="truncate text-xs">
                      {preset.id
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mevcut Tema Bilgisi */}
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-center text-xs text-subtle">
              Aktif: {isDark ? "Koyu" : "Açık"} tema
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
