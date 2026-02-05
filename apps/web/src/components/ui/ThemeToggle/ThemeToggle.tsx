import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme, themeModes } from "../../../theme";
import type { ColorPalette, ThemeMode } from "../../../theme";

const modeIcons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const paletteColors: Record<ColorPalette, string> = {
  purple: "bg-[oklch(0.65_0.25_290)]",
  blue: "bg-[oklch(0.60_0.20_250)]",
  teal: "bg-[oklch(0.70_0.15_180)]",
  rose: "bg-[oklch(0.65_0.22_10)]",
};

export function ThemeToggle() {
  const { mode, palette, availablePalettes, setMode, setPalette, resolvedMode } = useTheme();
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

  const CurrentModeIcon = modeIcons[mode];

  return (
    <div className="relative" ref={menuRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label="Tema ayarları"
      >
        <CurrentModeIcon className="h-5 w-5" />
        <div className={`h-3 w-3 rounded-full ${paletteColors[palette]}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-4 shadow-xl">
          {/* Tema Modu */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Tema Modu
            </h3>
            <div className="flex gap-2">
              {themeModes.map(({ value, label }) => {
                const Icon = modeIcons[value];
                const isActive = mode === value;
                return (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
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

          {/* Renk Paleti */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Renk Paleti
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availablePalettes.map((p) => {
                const isActive = palette === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => setPalette(p.name as ColorPalette)}
                    className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary"
                        : "bg-surface-elevated text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full ${paletteColors[p.name as ColorPalette]}`} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mevcut Tema Bilgisi */}
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-center text-xs text-subtle">
              Aktif: {resolvedMode === "dark" ? "Koyu" : "Açık"} tema
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
