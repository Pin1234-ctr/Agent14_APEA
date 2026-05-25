// src/components/layout/Header/Header.tsx
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/", { replace: true }); };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-fg">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-text">APEA</p>
          <p className="text-[10px] text-subtext hidden sm:block">Production Exception Agent</p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-subtext">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live sync
        </span>
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-text hidden sm:block">{user.full_name}</p>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-subtext hover:bg-muted hover:text-text transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
