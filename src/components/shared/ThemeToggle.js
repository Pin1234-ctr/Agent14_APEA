import { jsx as _jsx } from "react/jsx-runtime";
// src/components/shared/ThemeToggle.tsx
import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";
export function ThemeToggle() {
    const { mode, setMode } = useThemeContext();
    const modes = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "System" },
    ];
    return (_jsx("div", { className: "flex items-center rounded-lg border border-border bg-surface p-0.5", role: "radiogroup", "aria-label": "Theme", children: modes.map(({ value, icon: Icon, label }) => (_jsx("button", { onClick: () => setMode(value), "aria-pressed": mode === value, title: label, className: cn("rounded-md p-1.5 transition-colors", mode === value ? "bg-muted text-text" : "text-subtext hover:text-text"), children: _jsx(Icon, { className: "h-3.5 w-3.5" }) }, value))) }));
}
