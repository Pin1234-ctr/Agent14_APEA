import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/Auth/LoginPage";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { ConnectorsPage } from "@/pages/Connectors/ConnectorsPage";
import { ExceptionsPage } from "@/pages/Exceptions/ExceptionsPage";
import { TicketsPage } from "@/pages/Tickets/TicketsPage";
import { RCAPage } from "@/pages/RCA/RCAPage";
import { ChatbotPage } from "@/pages/Chatbot/ChatbotPage";
import { ReportsPage } from "@/pages/Reports/ReportsPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";
function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "flex h-screen items-center justify-center text-subtext text-sm", children: "Loading\u2026" });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
export function AppRouter() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { element: _jsx(Protected, { children: _jsx(AppShell, {}) }), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/connectors", element: _jsx(ConnectorsPage, {}) }), _jsx(Route, { path: "/exceptions", element: _jsx(ExceptionsPage, {}) }), _jsx(Route, { path: "/tickets", element: _jsx(TicketsPage, {}) }), _jsx(Route, { path: "/rca", element: _jsx(RCAPage, {}) }), _jsx(Route, { path: "/chatbot", element: _jsx(ChatbotPage, {}) }), _jsx(Route, { path: "/reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
}
