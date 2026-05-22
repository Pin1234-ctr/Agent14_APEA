// src/components/shared/ThemeToggle.tsx
import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeContext, type ThemeMode } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const { mode, setMode } = useThemeContext();
  const modes = [
    { value: "light" as ThemeMode, icon: Sun, label: "Light" },
    { value: "dark" as ThemeMode, icon: Moon, label: "Dark" },
    { value: "system" as ThemeMode, icon: Monitor, label: "System" },
  ];
  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5" role="radiogroup" aria-label="Theme">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          aria-pressed={mode === value}
          title={label}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            mode === value ? "bg-muted text-text" : "text-subtext hover:text-text",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
