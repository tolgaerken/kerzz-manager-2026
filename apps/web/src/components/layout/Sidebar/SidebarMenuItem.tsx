import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Tooltip } from "../../ui";
import { useSidebarStore } from "../../../store/sidebarStore";
import { SidebarPopover } from "./SidebarPopover";
import { useIsMobile } from "../../../hooks/useIsMobile";

export interface SubMenuItem {
  label: string;
  path: string;
  /** Alt menü öğesine özel izin — tanımlanırsa kendi izin kontrolünü kullanır */
  requiredPermission?: string;
}

export interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
  /** İzin bazlı görünürlük kontrolü için gerekli izin */
  requiredPermission?: string;
  /** Sadece admin kullanıcılarına göster (izin kontrolü yerine) */
  adminOnly?: boolean;
}

export function SidebarMenuItem({ icon: Icon, label, path, subItems }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const shouldCollapse = isCollapsed && !isMobile;
  
  const hasSubItems = subItems && subItems.length > 0;
  const isActive = path ? location.pathname === path : false;
  const isSubItemActive = subItems?.some(item => location.pathname === item.path);

  const handleToggle = () => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
    }
  };

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  const baseClasses = "flex w-full items-center rounded-lg text-sm font-medium transition-colors";
  const paddingClasses = shouldCollapse ? "justify-center p-2.5" : "gap-3 px-3 py-2.5";
  const activeClasses = "bg-surface-hover text-foreground";
  const inactiveClasses = "text-muted-foreground hover:bg-surface-elevated hover:text-foreground";

  // Collapsed state with sub-items - show flyout popover
  if (shouldCollapse && hasSubItems) {
    return (
      <SidebarPopover label={label} subItems={subItems}>
        <button
          className={`${baseClasses} ${paddingClasses} ${isSubItemActive ? activeClasses : inactiveClasses}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </button>
      </SidebarPopover>
    );
  }

  // Collapsed state without sub-items
  if (shouldCollapse) {
    return (
      <Tooltip content={label} position="right">
        <Link
          to={path ?? "/"}
          onClick={handleNavigation}
          className={`${baseClasses} ${paddingClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </Link>
      </Tooltip>
    );
  }

  // Expanded state with sub-items
  if (hasSubItems) {
    return (
      <div>
        <button
          onClick={handleToggle}
          className={`${baseClasses} ${paddingClasses} ${isSubItemActive ? activeClasses : inactiveClasses}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border-subtle pl-4">
            {subItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={`${baseClasses} gap-3 px-3 py-2.5 text-sm ${
                  location.pathname === item.path ? activeClasses : inactiveClasses
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Expanded state without sub-items
  return (
    <Link
      to={path ?? "/"}
      onClick={handleNavigation}
      className={`${baseClasses} ${paddingClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
