// src/components/layout/Sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, Ticket, Brain, PlugZap, MessagesSquare, FileText, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV = [
  { to: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/connectors", label: "Connectors", icon: PlugZap },
  { to: "/exceptions", label: "Exceptions", icon: AlertTriangle },
  { to: "/tickets",    label: "Tickets",    icon: Ticket },
  { to: "/rca",        label: "Root Cause", icon: Brain },
  { to: "/chatbot",    label: "Assistant",  icon: MessagesSquare },
  { to: "/reports",    label: "Reports",    icon: FileText },
  { to: "/settings",   label: "Settings",   icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-56 border-r border-border bg-surface shrink-0">
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/12 text-primary" : "text-subtext hover:bg-muted hover:text-text"
            )}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3 text-xs text-subtext">v2.0.0 · APEA</div>
    </aside>
  );
}
