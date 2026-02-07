import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { Search, X } from "lucide-react";
import type { CellEditorProps } from "@kerzz/grid";

interface License {
  _id: string;
  id: string;
  brandName: string;
  SearchItem: string;
}

/**
 * Kerzz-grid compatible autocomplete editor for license selection.
 * Expects context.licenses and context.onLicenseSelect to be provided.
 */
export function LicenseAutocompleteEditor<TData>({
  value,
  row,
  onSave,
  onCancel,
  context
}: CellEditorProps<TData>) {
  const licenses = (context?.licenses as License[]) || [];
  const onLicenseSelect = context?.onLicenseSelect as
    | ((rowId: string, license: { id: string; brandName: string } | null) => void)
    | undefined;

  // row'dan id almak için
  const rowId = (row as Record<string, unknown>)?.id as string ?? "";

  const initialValue = value != null ? String(value) : "";
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<string>(initialValue);
  const [isOpen, setIsOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
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

  const handleSelect = useCallback(
    (license: License) => {
      setSelectedId(license.id);
      if (onLicenseSelect) {
        onLicenseSelect(rowId, license);
      }
      setIsOpen(false);
      onSave(license.id);
    },
    [onLicenseSelect, rowId, onSave]
  );

  const handleClear = useCallback(() => {
    setSelectedId("");
    setSearchText("");
    if (onLicenseSelect) {
      onLicenseSelect(rowId, null);
    }
    onSave("");
  }, [onLicenseSelect, rowId, onSave]);

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
          onCancel();
          break;
        case "Tab":
          if (filteredLicenses[highlightedIndex]) {
            handleSelect(filteredLicenses[highlightedIndex]);
          }
          break;
      }
    },
    [filteredLicenses, highlightedIndex, handleSelect, onCancel]
  );

  // Mevcut seçili lisansı bul
  const selectedLicense = useMemo(
    () => licenses.find((l) => String(l.id) === String(selectedId)),
    [licenses, selectedId]
  );

  return (
    <div className="kz-editor kz-editor--autocomplete">
      <div className="kz-editor__autocomplete-input-wrapper">
        <Search className="kz-editor__autocomplete-icon" />
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
          className="kz-editor__autocomplete-input"
        />
        {(selectedId || searchText) && (
          <button
            type="button"
            onClick={handleClear}
            className="kz-editor__autocomplete-clear"
          >
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {isOpen && filteredLicenses.length > 0 && (
        <div ref={listRef} className="kz-editor__dropdown">
          {filteredLicenses.map((license, index) => (
            <div
              key={license.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(license);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`kz-editor__dropdown-item${
                index === highlightedIndex
                  ? " kz-editor__dropdown-item--highlighted"
                  : ""
              }${license.id === selectedId ? " kz-editor__dropdown-item--selected" : ""}`}
            >
              {license.SearchItem || license.brandName}
            </div>
          ))}
        </div>
      )}

      {isOpen && searchText && filteredLicenses.length === 0 && (
        <div className="kz-editor__dropdown kz-editor__dropdown--empty">
          Sonuç bulunamadı
        </div>
      )}
    </div>
  );
}
