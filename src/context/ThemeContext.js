import { jsx as _jsx } from "react/jsx-runtime";
// src/context/ThemeContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
export const THEME_CONFIG = {
    storageKey: "apea-theme",
    modes: ["light", "dark", "system"],
};
const ThemeContext = createContext(null);
function getInitialMode() {
    try {
        const v = localStorage.getItem(THEME_CONFIG.storageKey);
        if (v === "light" || v === "dark" || v === "system")
            return v;
    }
    catch {
        /* ignore */
    }
    return "system";
}
function resolveEffective(mode) {
    if (mode === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
}
export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(getInitialMode);
    const [effective, setEffective] = useState(() => resolveEffective(getInitialMode()));
    useEffect(() => {
        const root = document.documentElement;
        if (effective === "dark")
            root.classList.add("dark");
        else
            root.classList.remove("dark");
    }, [effective]);
    useEffect(() => {
        if (mode !== "system")
            return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => setEffective(mq.matches ? "dark" : "light");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [mode]);
    const setMode = useCallback((m) => {
        setModeState(m);
        setEffective(resolveEffective(m));
        try {
            localStorage.setItem(THEME_CONFIG.storageKey, m);
        }
        catch {
            /* ignore */
        }
    }, []);
    const toggle = useCallback(() => {
        setMode(effective === "dark" ? "light" : "dark");
    }, [effective, setMode]);
    const value = useMemo(() => ({ mode, effective, setMode, toggle }), [mode, effective, setMode, toggle]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
}
export function useThemeContext() {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error("useThemeContext must be used within ThemeProvider");
    return ctx;
}
