import { useEffect, useRef, useState } from "react";
import { FileText, Key, Search, Loader2 } from "lucide-react";
import { MANAGER_LOG_CONSTANTS } from "../../constants/manager-log.constants";

export interface ReferenceItem {
  type: string;
  id: string;
  label: string;
}

interface ReferencePopupProps {
  isOpen: boolean;
  selectedCommand: string | null;
  onSelect: (item: ReferenceItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const { REFERENCE_COMMANDS } = MANAGER_LOG_CONSTANTS;

export function ReferencePopup({
  isOpen,
  selectedCommand,
  onSelect,
  onClose,
  position,
}: ReferencePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ReferenceItem[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Simüle edilmiş arama - gerçek uygulamada API'den gelecek
  useEffect(() => {
    if (!selectedCommand || !searchQuery) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simüle arama gecikmesi
    const timeout = setTimeout(() => {
      // Demo amaçlı örnek sonuçlar
      const demoResults: ReferenceItem[] = [
        {
          type: selectedCommand === "/kontrat" ? "contract" : "license",
          id: "demo-1",
          label: searchQuery.length > 0 ? `${searchQuery} - Örnek 1` : "Örnek 1",
        },
        {
          type: selectedCommand === "/kontrat" ? "contract" : "license",
          id: "demo-2",
          label: searchQuery.length > 0 ? `${searchQuery} - Örnek 2` : "Örnek 2",
        },
      ];
      setSearchResults(demoResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedCommand, searchQuery]);

  if (!isOpen) return null;

  // Komut seçim menüsü
  if (!selectedCommand) {
    return (
      <div
        ref={popupRef}
        className="absolute z-50 bg-surface-elevated border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
        style={{ bottom: position.top, left: position.left }}
      >
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
          Referans Ekle
        </div>
        {REFERENCE_COMMANDS.map((cmd) => (
          <button
            key={cmd.command}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors"
            onClick={() => onSelect({ type: cmd.type, id: "", label: cmd.command })}
          >
            {cmd.type === "contract" ? (
              <FileText className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Key className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-foreground">{cmd.label}</span>
            <span className="text-muted-foreground text-xs ml-auto">
              {cmd.command}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Arama menüsü
  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-surface-elevated border border-border rounded-lg shadow-lg min-w-[280px]"
      style={{ bottom: position.top, left: position.left }}
    >
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedCommand === "/kontrat" ? "Kontrat ara..." : "Lisans ara..."
            }
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>
      </div>
      <div className="py-1 max-h-[200px] overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result) => (
            <button
              key={result.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors"
              onClick={() => onSelect(result)}
            >
              {result.type === "contract" ? (
                <FileText className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Key className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-foreground">{result.label}</span>
            </button>
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-center text-muted-foreground">
            {searchQuery ? "Sonuç bulunamadı" : "Aramak için yazın..."}
          </div>
        )}
      </div>
    </div>
  );
}
