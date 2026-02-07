import { useEffect, useRef } from "react";
import { User } from "lucide-react";

export interface MentionUser {
  id: string;
  name: string;
}

interface MentionPopupProps {
  isOpen: boolean;
  users: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function MentionPopup({
  isOpen,
  users,
  selectedIndex,
  onSelect,
  onClose,
  position,
}: MentionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || users.length === 0) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-surface-elevated border border-border rounded-lg shadow-lg py-1 min-w-[200px] max-h-[200px] overflow-y-auto"
      style={{ bottom: position.top, left: position.left }}
    >
      {users.map((user, index) => (
        <button
          key={user.id}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors ${
            index === selectedIndex ? "bg-primary/10" : ""
          }`}
          onClick={() => onSelect(user)}
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{user.name}</span>
        </button>
      ))}
    </div>
  );
}
