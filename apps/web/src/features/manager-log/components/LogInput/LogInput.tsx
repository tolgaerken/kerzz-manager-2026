import { useState, useRef, useCallback, useMemo, type KeyboardEvent } from "react";
import { Send, Calendar, Loader2, X } from "lucide-react";
import { MentionPopup, type MentionUser } from "./MentionPopup";
import { ReferencePopup, type ReferenceItem } from "./ReferencePopup";
import { ReminderPicker } from "./ReminderPicker";
import type { CreateLogInput, LogMention, LogReference } from "../../types";
import { useAppUsers } from "../../../users/hooks/useUsers";
import { useAuthStore } from "../../../auth/store/authStore";

interface LogInputProps {
  onSend: (
    input: Omit<CreateLogInput, "customerId" | "contextType" | "contextId" | "authorId" | "authorName">
  ) => Promise<void>;
  isLoading: boolean;
}

export function LogInput({ onSend, isLoading }: LogInputProps) {
  const [message, setMessage] = useState("");
  const [mentions, setMentions] = useState<LogMention[]>([]);
  const [references, setReferences] = useState<LogReference[]>([]);
  const [reminder, setReminder] = useState<string | null>(null);

  // Popup states
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [selectedReferenceCommand, setSelectedReferenceCommand] = useState<string | null>(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sadece bu app'e atanmış kullanıcıları getir
  const { data: appUsers = [] } = useAppUsers();
  const currentUser = useAuthStore((state) => state.userInfo);

  // Mention için sadece app kullanıcılarını filtrele
  const filteredUsers = useMemo<MentionUser[]>(() => {
    const normalizedSearch = mentionSearch.toLowerCase();

    const appMentionUsers = appUsers
      .map((user) => {
        const fallbackName =
          "userName" in user && typeof user.userName === "string"
            ? user.userName
            : "";
        const resolvedName =
          typeof user.name === "string" && user.name.trim().length > 0
            ? user.name
            : fallbackName;

        return {
          id: user.id,
          name: resolvedName,
        };
      })
      .filter((user) => user.name.length > 0)
      .filter((user) => user.name.toLowerCase().includes(normalizedSearch));

    if (appMentionUsers.length > 0) {
      return appMentionUsers;
    }

    // API boş dönerse mention tamamen kırılmasın, en azından aktif kullanıcı seçilebilsin
    if (currentUser?.id && currentUser?.name) {
      const matchesSearch = currentUser.name
        .toLowerCase()
        .includes(normalizedSearch);
      if (matchesSearch) {
        return [{ id: currentUser.id, name: currentUser.name }];
      }
    }

    return [];
  }, [appUsers, currentUser?.id, currentUser?.name, mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // @ işareti kontrolü
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      // @ sonrası boşluk yoksa mention popup'ı aç
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionSearch(textAfterAt);
        setShowMentionPopup(true);
        setMentionSelectedIndex(0);
      } else {
        setShowMentionPopup(false);
      }
    } else {
      setShowMentionPopup(false);
    }

    // / işareti kontrolü (satır başında veya boşluktan sonra)
    const lastSlashIndex = value.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const charBefore = value[lastSlashIndex - 1];
      if (lastSlashIndex === 0 || charBefore === " " || charBefore === "\n") {
        const textAfterSlash = value.slice(lastSlashIndex);
        if (!textAfterSlash.includes(" ") || textAfterSlash.length < 10) {
          setShowReferencePopup(true);
          setSelectedReferenceCommand(null);
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Mention popup navigasyonu
    if (showMentionPopup && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleMentionSelect(filteredUsers[mentionSelectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentionPopup(false);
      }
      return;
    }

    // Enter ile gönder (Shift+Enter ile yeni satır)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMentionSelect = useCallback((user: MentionUser) => {
    // @ işaretinden sonraki metni kaldır ve kullanıcı adını ekle
    const lastAtIndex = message.lastIndexOf("@");
    const newMessage = message.slice(0, lastAtIndex) + `@${user.name} `;
    setMessage(newMessage);
    setMentions((prev) => [...prev, { userId: user.id, userName: user.name }]);
    setShowMentionPopup(false);
    textareaRef.current?.focus();
  }, [message]);

  const handleReferenceSelect = useCallback((item: ReferenceItem) => {
    if (!item.id) {
      // Komut seçildi, arama moduna geç
      setSelectedReferenceCommand(item.label);
      return;
    }

    // Referans seçildi
    const lastSlashIndex = message.lastIndexOf("/");
    const newMessage = message.slice(0, lastSlashIndex);
    setMessage(newMessage);
    setReferences((prev) => [...prev, item]);
    setShowReferencePopup(false);
    setSelectedReferenceCommand(null);
    textareaRef.current?.focus();
  }, [message]);

  const handleReminderSelect = useCallback((date: string) => {
    setReminder(date);
    setShowReminderPicker(false);
  }, []);

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const removeReminder = () => {
    setReminder(null);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    await onSend({
      message: message.trim(),
      mentions: mentions.length > 0 ? mentions : undefined,
      references: references.length > 0 ? references : undefined,
      reminder: reminder ? { date: reminder } : undefined,
    });

    // Formu sıfırla
    setMessage("");
    setMentions([]);
    setReferences([]);
    setReminder(null);
  };

  const popupPosition = { top: 60, left: 16 };

  return (
    <div className="border-t border-border bg-surface-elevated">
      {/* Eklenmiş referanslar ve hatırlatma */}
      {(references.length > 0 || reminder) && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {references.map((ref, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
            >
              {ref.type === "contract" ? "📄" : "🔑"} {ref.label}
              <button
                onClick={() => removeReference(index)}
                className="ml-1 hover:text-primary/70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {reminder && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">
              <Calendar className="w-3 h-3" />
              {new Date(reminder).toLocaleDateString("tr-TR")}
              <button
                onClick={removeReminder}
                className="ml-1 hover:text-warning/70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Giriş alanı */}
      <div className="relative p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Mesaj yazın... (@mention, /kontrat, /lisans)"
              rows={1}
              className="w-full px-4 py-3 pr-12 text-sm bg-surface border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
              style={{
                minHeight: "48px",
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            
            {/* Hatırlatma butonu */}
            <button
              onClick={() => setShowReminderPicker(!showReminderPicker)}
              className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors ${
                reminder
                  ? "text-warning bg-warning/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
              title="Hatırlatma ekle"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* Gönder butonu */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Popup'lar */}
        <MentionPopup
          isOpen={showMentionPopup}
          users={filteredUsers}
          selectedIndex={mentionSelectedIndex}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionPopup(false)}
          position={popupPosition}
        />

        <ReferencePopup
          isOpen={showReferencePopup}
          selectedCommand={selectedReferenceCommand}
          onSelect={handleReferenceSelect}
          onClose={() => {
            setShowReferencePopup(false);
            setSelectedReferenceCommand(null);
          }}
          position={popupPosition}
        />

        <ReminderPicker
          isOpen={showReminderPicker}
          onSelect={handleReminderSelect}
          onClose={() => setShowReminderPicker(false)}
          position={popupPosition}
        />
      </div>
    </div>
  );
}
