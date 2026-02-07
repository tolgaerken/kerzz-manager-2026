import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, X } from "lucide-react";

interface ReminderPickerProps {
  isOpen: boolean;
  onSelect: (date: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function ReminderPicker({
  isOpen,
  onSelect,
  onClose,
  position,
}: ReminderPickerProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Varsayılan olarak yarını seç
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (selectedDate) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      onSelect(dateTime.toISOString());
    }
  };

  // Hızlı seçenekler
  const quickOptions = [
    { label: "Yarın", days: 1 },
    { label: "3 Gün", days: 3 },
    { label: "1 Hafta", days: 7 },
    { label: "1 Ay", days: 30 },
  ];

  const selectQuickOption = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-surface-elevated border border-border rounded-lg shadow-lg min-w-[280px]"
      style={{ bottom: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          Hatırlatma Ekle
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Hızlı seçenekler */}
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((opt) => (
            <button
              key={opt.days}
              className="px-3 py-1 text-xs bg-surface border border-border rounded-full hover:bg-primary/10 hover:border-primary/30 transition-colors"
              onClick={() => selectQuickOption(opt.days)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tarih seçici */}
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Tarih</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Saat seçici */}
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Saat
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Onay butonu */}
        <button
          onClick={handleConfirm}
          disabled={!selectedDate}
          className="w-full py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hatırlatma Ekle
        </button>
      </div>
    </div>
  );
}
