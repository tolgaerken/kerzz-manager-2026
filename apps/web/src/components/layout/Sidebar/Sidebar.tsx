import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { sidebarMenuItems } from "./sidebarConfig";
import { useSidebarStore } from "../../../store/sidebarStore";
import { Tooltip } from "../../ui";

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <aside 
      className={`flex h-full flex-col bg-surface border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`flex h-16 items-center border-b border-border ${isCollapsed ? "justify-center px-2" : "px-6"}`}>
        {isCollapsed ? (
          <span className="text-xl font-bold text-foreground">K</span>
        ) : (
          <h1 className="text-xl font-bold text-foreground">Kerzz Manager</h1>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? "p-2" : "p-4"}`}>
        <ul className="space-y-1">
          {sidebarMenuItems.map((item) => (
            <li key={item.label}>
              <SidebarMenuItem {...item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className={`border-t border-border ${isCollapsed ? "p-2" : "p-4"}`}>
        <Tooltip content={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"} position="right" disabled={!isCollapsed}>
          <button
            onClick={toggleCollapsed}
            className={`flex items-center rounded-lg bg-surface-elevated text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground ${
              isCollapsed ? "w-full justify-center p-2" : "w-full gap-2 px-3 py-2"
            }`}
            aria-label={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {isCollapsed ? (
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
    </aside>
  );
}
