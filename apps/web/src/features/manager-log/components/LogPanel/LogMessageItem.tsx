import { useMemo, useRef, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import type { Log } from "../../types";

interface LogMessageItemProps {
  log: Log;
  isOwn: boolean;
  highlighted?: boolean;
  onHighlightSeen?: () => void;
}

export function LogMessageItem({ log, isOwn, highlighted, onHighlightSeen }: LogMessageItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  // Highlight edilmiş log'a scroll yap
  useEffect(() => {
    if (highlighted && itemRef.current) {
      // Kısa bir gecikme ile scroll yap (panel açılma animasyonu için)
      const timer = setTimeout(() => {
        itemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);

      // 3 saniye sonra highlight'ı temizle
      const clearTimer = setTimeout(() => {
        onHighlightSeen?.();
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlighted, onHighlightSeen]);
  const formattedDate = useMemo(() => {
    const date = new Date(log.createdAt);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [log.createdAt]);

  const hasReminder = log.reminder && !log.reminder.completed;
  const reminderDate = hasReminder
    ? new Date(log.reminder!.date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  // Mesaj içindeki mention'ları işaretle
  const renderMessage = () => {
    let message = log.message;
    
    // Mention'ları vurgula
    log.mentions.forEach((mention) => {
      const regex = new RegExp(`@${mention.userName}`, "g");
      message = message.replace(
        regex,
        `<span class="text-primary font-medium">@${mention.userName}</span>`
      );
    });

    return (
      <p
        className="text-sm text-foreground whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    );
  };

  return (
    <div
      ref={itemRef}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 transition-all duration-500 ${
        highlighted ? "scale-[1.02]" : ""
      }`}
    >
      <div
        className={`max-w-[80%] ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-tl-xl rounded-tr-xl rounded-bl-xl"
            : "bg-surface-elevated text-foreground rounded-tl-xl rounded-tr-xl rounded-br-xl"
        } px-4 py-2.5 shadow-sm transition-all duration-500 ${
          highlighted
            ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]"
            : ""
        }`}
      >
        {/* Yazar bilgisi (sadece başkalarının mesajlarında) */}
        {!isOwn && (
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {log.authorName}
          </p>
        )}

        {/* Mesaj */}
        {renderMessage()}

        {/* Referanslar */}
        {log.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {log.references.map((ref, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                  isOwn
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {ref.type === "contract" ? "📄" : "🔑"} {ref.label}
              </span>
            ))}
          </div>
        )}

        {/* Hatırlatma */}
        {hasReminder && (
          <div
            className={`flex items-center gap-1.5 mt-2 text-xs ${
              isOwn ? "text-primary-foreground/80" : "text-warning"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hatırlatma: {reminderDate}</span>
          </div>
        )}

        {/* Tarih/Saat */}
        <div
          className={`flex items-center gap-1 mt-1.5 ${
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span className="text-xs">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
