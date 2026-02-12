import { memo, useState, useCallback } from "react";
import { Loader2, Plus, Search, X, Check } from "lucide-react";
import { LicenseItemCard } from "./LicenseItemCard";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "./ProductAutocompleteEditor";

interface LicenseItemMobileListProps {
  items: LicenseItem[];
  products: ProductOption[];
  loading?: boolean;
  allowDelete?: boolean;
  onItemsChange: (items: LicenseItem[]) => void;
}

export const LicenseItemMobileList = memo(function LicenseItemMobileList({
  items,
  products,
  loading = false,
  allowDelete = false,
  onItemsChange
}: LicenseItemMobileListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LicenseItem | null>(null);

  const handleSelect = useCallback((item: LicenseItem) => {
    setSelectedId((prev) => (prev === item.id ? null : item.id));
  }, []);

  const handleEdit = useCallback((item: LicenseItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: LicenseItem) => {
    onItemsChange(items.filter((i) => i.id !== item.id));
    if (selectedId === item.id) {
      setSelectedId(null);
    }
  }, [items, onItemsChange, selectedId]);

  const handleAddNew = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddItem = useCallback((productId: string, qty: number) => {
    const product = products.find(
      (p) => p.id === productId || p._id === productId || p.pid === productId
    );
    if (!product) return;

    const newItem: LicenseItem = {
      id: crypto.randomUUID(),
      moduleId: String(parseInt(product.pid, 10) || 0),
      name: product.name,
      qty,
      productId: product.id
    };
    onItemsChange([...items, newItem]);
    setIsAddModalOpen(false);
  }, [items, onItemsChange, products]);

  const handleUpdateItem = useCallback((item: LicenseItem, productId: string, qty: number) => {
    const product = products.find(
      (p) => p.id === productId || p._id === productId || p.pid === productId
    );
    if (!product) return;

    const updatedItems = items.map((i) =>
      i.id === item.id
        ? {
            ...i,
            moduleId: String(parseInt(product.pid, 10) || 0),
            name: product.name,
            qty,
            productId: product.id
          }
        : i
    );
    onItemsChange(updatedItems);
    setIsEditModalOpen(false);
    setEditingItem(null);
  }, [items, onItemsChange, products]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header with add button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] shrink-0">
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {items.length} öğe
        </span>
        <button
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          Ekle
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">Henüz öğe eklenmedi</p>
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              İlk öğeyi ekle
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <LicenseItemCard
                key={item.id}
                item={item}
                products={products}
                selected={selectedId === item.id}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                allowDelete={allowDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <ProductSelectModal
          products={products}
          onSelect={handleAddItem}
          onClose={() => setIsAddModalOpen(false)}
          title="Ürün Ekle"
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <ProductSelectModal
          products={products}
          initialProductId={editingItem.moduleId}
          initialQty={editingItem.qty}
          onSelect={(productId, qty) => handleUpdateItem(editingItem, productId, qty)}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          title="Ürün Düzenle"
        />
      )}
    </div>
  );
});

// Product Select Modal
interface ProductSelectModalProps {
  products: ProductOption[];
  initialProductId?: string;
  initialQty?: number;
  onSelect: (productId: string, qty: number) => void;
  onClose: () => void;
  title: string;
}

function ProductSelectModal({
  products,
  initialProductId,
  initialQty = 1,
  onSelect,
  onClose,
  title
}: ProductSelectModalProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    if (!initialProductId) return null;
    const found = products.find(
      (p) =>
        String(parseInt(p.pid, 10)) === initialProductId ||
        p.pid === initialProductId ||
        p.id === initialProductId ||
        p._id === initialProductId
    );
    return found?.id || null;
  });
  const [qty, setQty] = useState(initialQty);

  const filteredProducts = searchText
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.friendlyName?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.nameWithCode?.toLowerCase().includes(searchText.toLowerCase())
      )
    : products;

  const handleSubmit = () => {
    if (selectedProductId) {
      onSelect(selectedProductId, qty);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 -ml-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
        </button>
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h2>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            autoFocus
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="px-4 py-8 text-sm text-center text-[var(--color-muted-foreground)]">
            {searchText ? "Sonuç bulunamadı" : "Ürün bulunamadı"}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className={`w-full px-4 py-3 text-left transition-colors active:bg-[var(--color-surface-elevated)] ${
                  selectedProductId === product.id ? "bg-[var(--color-primary)]/5" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
                    {product.nameWithCode || product.friendlyName || product.name}
                  </span>
                  {selectedProductId === product.id && (
                    <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity & Submit */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[var(--color-foreground)]">Adet:</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedProductId}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {initialProductId ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
