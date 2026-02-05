import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { Search, X } from "lucide-react";

interface License {
  _id: string;
  id: string;
  brandName: string;
  SearchItem: string;
}

interface LicenseAutocompleteEditorProps extends ICellEditorParams {
  licenses: License[];
  onLicenseSelect?: (license: License | null) => void;
}

export const LicenseAutocompleteEditor = forwardRef(
  (props: LicenseAutocompleteEditorProps, ref) => {
    const { value, licenses = [], stopEditing, onLicenseSelect } = props;
    // value sayısal olabilir, string'e çevir
    const initialValue = value != null ? String(value) : "";
    const [searchText, setSearchText] = useState("");
    const [selectedId, setSelectedId] = useState<string>(initialValue);
    const [isOpen, setIsOpen] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState(() => {
      // Mevcut değer varsa, o indeksi bul
      if (initialValue) {
        const idx = licenses.findIndex((l) => l.id === initialValue);
        return idx >= 0 ? idx : 0;
      }
      return 0;
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Filtrelenmiş lisanslar
    const filteredLicenses = useMemo(() => {
      if (!searchText) return licenses;
      const lowerSearch = searchText.toLowerCase();
      return licenses.filter(
        (lic) =>
          lic.brandName?.toLowerCase().includes(lowerSearch) ||
          lic.SearchItem?.toLowerCase().includes(lowerSearch) ||
          lic.id?.toLowerCase().includes(lowerSearch)
      );
    }, [licenses, searchText]);

    // Input'a focus
    useEffect(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, []);

    // Scroll to highlighted item
    useEffect(() => {
      if (listRef.current && filteredLicenses.length > 0) {
        const item = listRef.current.children[highlightedIndex] as HTMLElement;
        item?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, filteredLicenses.length]);

    // AG Grid için getValue
    useImperativeHandle(ref, () => ({
      getValue: () => selectedId,
      isCancelAfterEnd: () => false,
      isCancelBeforeStart: () => false
    }));

    const handleSelect = useCallback(
      (license: License) => {
        setSelectedId(license.id);
        if (onLicenseSelect) {
          onLicenseSelect(license);
        }
        setIsOpen(false);
        setTimeout(() => stopEditing(), 0);
      },
      [onLicenseSelect, stopEditing]
    );

    const handleClear = useCallback(() => {
      setSelectedId("");
      setSearchText("");
      if (onLicenseSelect) {
        onLicenseSelect(null);
      }
    }, [onLicenseSelect]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex((prev) =>
              Math.min(prev + 1, filteredLicenses.length - 1)
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            break;
          case "Enter":
            e.preventDefault();
            if (filteredLicenses[highlightedIndex]) {
              handleSelect(filteredLicenses[highlightedIndex]);
            }
            break;
          case "Escape":
            e.preventDefault();
            stopEditing();
            break;
          case "Tab":
            if (filteredLicenses[highlightedIndex]) {
              handleSelect(filteredLicenses[highlightedIndex]);
            }
            break;
        }
      },
      [filteredLicenses, highlightedIndex, handleSelect, stopEditing]
    );

    // Mevcut seçili lisansı bul
    const selectedLicense = useMemo(
      () => licenses.find((l) => String(l.id) === String(selectedId)),
      [licenses, selectedId]
    );

    return (
      <div className="relative w-full h-full">
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-primary rounded shadow-lg">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setHighlightedIndex(0);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedLicense?.SearchItem || "Lisans ara..."}
            className="flex-1 min-w-0 outline-none bg-transparent text-sm"
          />
          {(selectedId || searchText) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-muted rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {isOpen && filteredLicenses.length > 0 && (
          <div
            ref={listRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-border rounded shadow-lg"
          >
            {filteredLicenses.map((license, index) => (
              <div
                key={license.id}
                onClick={() => handleSelect(license)}
                className={`px-3 py-2 cursor-pointer text-sm truncate ${
                  index === highlightedIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                } ${license.id === selectedId ? "font-medium" : ""}`}
              >
                {license.SearchItem || license.brandName}
              </div>
            ))}
          </div>
        )}

        {isOpen && searchText && filteredLicenses.length === 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 px-3 py-2 bg-white border border-border rounded shadow-lg text-sm text-muted-foreground">
            Sonuç bulunamadı
          </div>
        )}
      </div>
    );
  }
);

LicenseAutocompleteEditor.displayName = "LicenseAutocompleteEditor";
