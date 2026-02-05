import { LogOut, User } from "lucide-react";
import { useAuth } from "../../../features/auth";
import { useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "../../ui";
import { NotificationBell } from "../../../features/logs";

export function Header() {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div />
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <ThemeToggle />
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm">{userInfo?.name}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-surface-elevated px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </header>
  );
}
