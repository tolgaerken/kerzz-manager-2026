import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "@tanstack/react-router";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { sidebarMenuItems } from "./sidebarConfig";
import { useSidebarStore } from "../../../store/sidebarStore";
import { Tooltip } from "../../ui";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useVersion } from "../../../features/version";
import { usePermissions } from "../../../features/auth/hooks/usePermissions";

export function Sidebar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();
  const shouldCollapse = isCollapsed && !isMobile;
  const { data: versionData } = useVersion();
  const { hasPermission, isAdmin } = usePermissions();

  // İzin bazlı menü filtreleme (sub-item düzeyinde izin desteği ile)
  const visibleMenuItems = useMemo(() => {
    return sidebarMenuItems
      .map((item) => {
        // adminOnly menüler sadece admin kullanıcılarına gösterilir
        if (item.adminOnly && !isAdmin) return null;

        // Sub-item'ları varsa, her birinin iznini kontrol et
        if (item.subItems) {
          const visibleSubItems = item.subItems.filter((sub) => {
            // Sub-item'ın kendi izni varsa onu kontrol et
            if (sub.requiredPermission) return hasPermission(sub.requiredPermission);
            // Yoksa parent'ın iznini kullan
            return !item.requiredPermission || hasPermission(item.requiredPermission);
          });

          // Hiç görünür sub-item yoksa grubu gizle
          if (visibleSubItems.length === 0) return null;

          return { ...item, subItems: visibleSubItems };
        }

        // Sub-item'sız normal menü öğesi
        if (item.requiredPermission && !hasPermission(item.requiredPermission)) return null;

        return item;
      })
      .filter(Boolean) as typeof sidebarMenuItems;
  }, [hasPermission, isAdmin]);

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile, location.pathname, setMobileOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-foreground/30 transition-opacity md:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!isMobileOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-surface transition-all duration-300 md:static md:z-auto ${
          shouldCollapse ? "w-16" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-border ${shouldCollapse ? "justify-center px-2" : "px-6"}`}>
          {shouldCollapse ? (
            <span className="text-xl font-bold text-foreground">K</span>
          ) : (
            <h1 className="text-xl font-bold text-foreground">Kerzz Manager</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${shouldCollapse ? "p-2" : "p-4"}`}>
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => (
              <li key={item.label}>
                <SidebarMenuItem {...item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className={`border-t border-border ${shouldCollapse ? "p-2" : "p-4"}`}>
          <Tooltip content={shouldCollapse ? "Menüyü Genişlet" : "Menüyü Daralt"} position="right" disabled={!shouldCollapse}>
            <button
              onClick={toggleCollapsed}
              className={`flex items-center rounded-lg bg-surface-elevated text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground ${
                shouldCollapse ? "w-full justify-center p-2" : "w-full gap-2 px-3 py-2"
              }`}
              aria-label={shouldCollapse ? "Menüyü Genişlet" : "Menüyü Daralt"}
            >
              {shouldCollapse ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Daralt</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Version Info */}
        {versionData && (
          <div className={`border-t border-border ${shouldCollapse ? "p-2" : "p-4"}`}>
            <div className={`text-xs text-muted-foreground ${shouldCollapse ? "text-center" : ""}`}>
              {shouldCollapse ? (
                <Tooltip content={`v${versionData.version}`} position="right">
                  <span>v{versionData.version}</span>
                </Tooltip>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{versionData.name}</span>
                  <span>Versiyon: {versionData.version}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
