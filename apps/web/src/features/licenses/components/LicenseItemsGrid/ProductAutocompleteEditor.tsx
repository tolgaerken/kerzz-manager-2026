import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { Search, X } from "lucide-react";
import type { CellEditorProps } from "@kerzz/grid";

export interface ProductOption {
  _id: string;
  id: string;
  pid: string;
  name: string;
  friendlyName: string;
  nameWithCode: string;
}

/**
 * Lisans modül/SaaS ürün seçimi için autocomplete editör.
 * Grid context'inde `products: ProductOption[]` bekler.
 */
export function ProductAutocompleteEditor<TData>({
  value,
  onSave,
  onCancel,
  context
}: CellEditorProps<TData>) {
  const products = (context?.products as ProductOption[]) || [];

  const initialValue = value != null ? String(value) : "";

  /** Find a product by moduleId (checks pid as number, then id, then _id) */
  const findProduct = useCallback(
    (moduleId: string): ProductOption | undefined => {
      if (!moduleId) return undefined;
      return products.find(
        (p) =>
          String(parseInt(p.pid, 10)) === moduleId ||
          p.pid === moduleId ||
          p.id === moduleId ||
          p._id === moduleId
      );
    },
    [products]
  );

  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<string>(initialValue);
  const [isOpen, setIsOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    if (initialValue) {
      const found = findProduct(initialValue);
      const idx = found ? products.indexOf(found) : -1;
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtrelenmiş ürünler
  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    const lowerSearch = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(lowerSearch) ||
        p.friendlyName?.toLowerCase().includes(lowerSearch) ||
        p.nameWithCode?.toLowerCase().includes(lowerSearch) ||
        p.id?.toLowerCase().includes(lowerSearch)
    );
  }, [products, searchText]);

  // Input'a focus
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Scroll to highlighted item
  useEffect(() => {
    if (listRef.current && filteredProducts.length > 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, filteredProducts.length]);

  /** moduleId olarak pid'nin integer halini kaydet (io-cloud-2025 uyumluluğu) */
  const getModuleIdFromProduct = useCallback(
    (product: ProductOption): string => String(parseInt(product.pid, 10) || 0),
    []
  );

  const handleSelect = useCallback(
    (product: ProductOption) => {
      const moduleId = getModuleIdFromProduct(product);
      setSelectedId(moduleId);
      setIsOpen(false);
      onSave(moduleId);
    },
    [onSave, getModuleIdFromProduct]
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
            Math.min(prev + 1, filteredProducts.length - 1)
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
    [filteredProducts, highlightedIndex, handleSelect, onCancel]
  );

  // Mevcut seçili ürünü bul (pid, id, _id hepsiyle eşleştir)
  const selectedProduct = useMemo(
    () => findProduct(String(selectedId)),
    [findProduct, selectedId]
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
          placeholder={selectedProduct?.nameWithCode || selectedProduct?.friendlyName || selectedProduct?.name || "Ürün ara..."}
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
              }${getModuleIdFromProduct(product) === selectedId ? " kz-editor__dropdown-item--selected" : ""}`}
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
