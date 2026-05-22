import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/Header/Header.tsx
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => { await logout(); navigate("/login", { replace: true }); };
    return (_jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur", children: [_jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-fg", children: _jsx(ShieldCheck, { className: "h-4 w-4" }) }), _jsxs("div", { className: "leading-tight", children: [_jsx("p", { className: "text-sm font-semibold text-text", children: "APEA" }), _jsx("p", { className: "text-[10px] text-subtext hidden sm:block", children: "Production Exception Agent" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "hidden sm:flex items-center gap-1.5 text-xs text-subtext", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-success animate-pulse" }), " Live sync"] }), _jsx(ThemeToggle, {}), user && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-xs font-medium text-text hidden sm:block", children: user.full_name }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-subtext hover:bg-muted hover:text-text transition-colors", children: [_jsx(LogOut, { className: "h-3.5 w-3.5" }), " Sign out"] })] }))] })] }));
}
