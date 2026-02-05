import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  id: string;
  name: string;
}

interface SelectCellEditorProps extends ICellEditorParams {
  options: SelectOption[];
}

export const SelectCellEditor = forwardRef(
  (props: SelectCellEditorProps, ref) => {
    const { value, options = [], stopEditing } = props;
    const [selectedValue, setSelectedValue] = useState<string>(value || "");
    const [isOpen, setIsOpen] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState(() =>
      Math.max(
        options.findIndex((o) => o.id === value),
        0
      )
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Focus on mount
    useEffect(() => {
      containerRef.current?.focus();
    }, []);

    // Scroll to highlighted item
    useEffect(() => {
      if (listRef.current && options.length > 0) {
        const item = listRef.current.children[highlightedIndex] as HTMLElement;
        item?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, options.length]);

    // AG Grid için getValue
    useImperativeHandle(ref, () => ({
      getValue: () => selectedValue,
      isCancelAfterEnd: () => false,
      isCancelBeforeStart: () => false
    }));

    const handleSelect = useCallback(
      (option: SelectOption) => {
        setSelectedValue(option.id);
        setIsOpen(false);
        setTimeout(() => stopEditing(), 0);
      },
      [stopEditing]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex((prev) =>
              Math.min(prev + 1, options.length - 1)
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            break;
          case "Enter":
            e.preventDefault();
            if (options[highlightedIndex]) {
              handleSelect(options[highlightedIndex]);
            }
            break;
          case "Escape":
            e.preventDefault();
            stopEditing();
            break;
          case "Tab":
            if (options[highlightedIndex]) {
              handleSelect(options[highlightedIndex]);
            }
            break;
        }
      },
      [options, highlightedIndex, handleSelect, stopEditing]
    );

    // Mevcut seçili option
    const selectedOption = options.find((o) => o.id === selectedValue);

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative w-full h-full outline-none"
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-1 px-2 py-1 bg-white border border-primary rounded shadow-lg cursor-pointer"
        >
          <span className="text-sm truncate">
            {selectedOption?.name || "Seçiniz..."}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>

        {isOpen && options.length > 0 && (
          <div
            ref={listRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-border rounded shadow-lg"
          >
            {options.map((option, index) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  index === highlightedIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                } ${option.id === selectedValue ? "font-medium" : ""}`}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SelectCellEditor.displayName = "SelectCellEditor";
