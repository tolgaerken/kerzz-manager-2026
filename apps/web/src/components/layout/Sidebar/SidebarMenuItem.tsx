import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";

export interface SubMenuItem {
  label: string;
  path: string;
}

export interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
}

export function SidebarMenuItem({ icon: Icon, label, path, subItems }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const hasSubItems = subItems && subItems.length > 0;
  const isActive = path ? location.pathname === path : false;
  const isSubItemActive = subItems?.some(item => location.pathname === item.path);

  const handleToggle = () => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
    }
  };

  const baseClasses = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
  const activeClasses = "bg-surface-hover text-foreground";
  const inactiveClasses = "text-muted-foreground hover:bg-surface-elevated hover:text-foreground";

  if (hasSubItems) {
    return (
      <div>
        <button
          onClick={handleToggle}
          className={`${baseClasses} ${isSubItemActive ? activeClasses : inactiveClasses}`}
        >
          <Icon className="h-5 w-5" />
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
                className={`${baseClasses} text-sm ${
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

  return (
    <Link
      to={path ?? "/"}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
