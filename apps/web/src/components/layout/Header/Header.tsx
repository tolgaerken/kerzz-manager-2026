import { LogOut, Menu, MessageSquare, User } from "lucide-react";
import { useAuth } from "../../../features/auth";
import { useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "../../ui";
import { NotificationBell } from "../../../features/manager-notification";
import { useLogPanelStore } from "../../../features/manager-log";
import { ExchangeRateDisplay } from "../../../features/exchange-rates";
import { useSidebarStore } from "../../../store/sidebarStore";

export function Header() {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();
  const { openPanel } = useLogPanelStore();
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
  }

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-surface px-3 md:px-6">
      {/* Sol: Menu butonu + Kur (kur mobilde gizli) */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleMobile}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground md:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block">
          <ExchangeRateDisplay />
        </div>
      </div>
      
      {/* Sağ: Aksiyonlar */}
      <div className="flex items-center gap-1.5 md:gap-4">
        <button
          onClick={() => openPanel()}
          className="relative rounded-lg p-2 transition-colors hover:bg-surface-elevated"
          aria-label="Loglar"
        >
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </button>
        <NotificationBell />
        <ThemeToggle />
        
        {/* Kullanıcı adı - sadece desktop */}
        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm">{userInfo?.name}</span>
        </div>
        
        {/* Çıkış - mobilde sadece ikon */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-surface-elevated px-2 md:px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          aria-label="Çıkış Yap"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Çıkış Yap</span>
        </button>
      </div>
    </header>
  );
}
