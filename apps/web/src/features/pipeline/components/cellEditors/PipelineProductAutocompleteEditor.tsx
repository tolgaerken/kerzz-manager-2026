import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import type { CellEditorProps } from "@kerzz/grid";

export interface PipelineProductOption {
  _id: string;
  id: string;
  name: string;
  friendlyName?: string;
  nameWithCode?: string;
}

interface PipelineProductAutocompleteContext<TData> {
  products?: PipelineProductOption[];
  onProductSelect?: (row: TData, product: PipelineProductOption) => void;
}

export function PipelineProductAutocompleteEditor<TData>({
  value,
  row,
  onSave,
  onCancel,
  context,
}: CellEditorProps<TData>) {
  const { products = [], onProductSelect } =
    (context as PipelineProductAutocompleteContext<TData>) || {};

  const initialValue = value != null ? String(value) : "";
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<string>(initialValue);
  const [isOpen, setIsOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    if (initialValue) {
      const idx = products.findIndex((p) => p.id === initialValue);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lowerSearch = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(lowerSearch) ||
        p.friendlyName?.toLowerCase().includes(lowerSearch) ||
        p.nameWithCode?.toLowerCase().includes(lowerSearch) ||
        p.id?.toLowerCase().includes(lowerSearch),
    );
  }, [products, searchText]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (listRef.current && filteredProducts.length > 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, filteredProducts.length]);

  const handleSelect = useCallback(
    (product: PipelineProductOption) => {
      setSelectedId(product.id);
      setIsOpen(false);
      onSave(product.id);
      onProductSelect?.(row, product);
    },
    [onSave, onProductSelect, row],
  );

  const handleClear = useCallback(() => {
    setSelectedId("");
    setSearchText("");
    onSave("");
  }, [onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredProducts.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredProducts[highlightedIndex]) {
            handleSelect(filteredProducts[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onCancel();
          break;
        case "Tab":
          if (filteredProducts[highlightedIndex]) {
            handleSelect(filteredProducts[highlightedIndex]);
          }
          break;
      }
    },
    [filteredProducts, highlightedIndex, handleSelect, onCancel],
  );

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(selectedId)),
    [products, selectedId],
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
          placeholder={
            selectedProduct?.nameWithCode ||
            selectedProduct?.friendlyName ||
            selectedProduct?.name ||
            "Ürün ara..."
          }
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

      {isOpen && filteredProducts.length > 0 && (
        <div ref={listRef} className="kz-editor__dropdown">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(product);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`kz-editor__dropdown-item${
                index === highlightedIndex
                  ? " kz-editor__dropdown-item--highlighted"
                  : ""
              }${product.id === selectedId ? " kz-editor__dropdown-item--selected" : ""}`}
            >
              {product.nameWithCode || product.friendlyName || product.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && searchText && filteredProducts.length === 0 && (
        <div className="kz-editor__dropdown kz-editor__dropdown--empty">
          Sonuç bulunamadı
        </div>
      )}
    </div>
  );
}
