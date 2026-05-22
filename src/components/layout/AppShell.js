import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/AppShell.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";
export function AppShell() {
    return (_jsxs("div", { className: "h-screen w-full flex flex-col bg-bg text-text overflow-hidden", children: [_jsx(Header, {}), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx(Outlet, {}) })] })] }));
}
