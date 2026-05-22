import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ui/Button.tsx
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
const VARIANT_STYLES = {
    primary: "bg-primary text-primary-fg hover:opacity-90 active:opacity-80",
    secondary: "bg-muted text-text hover:bg-elevated border border-border",
    ghost: "bg-transparent text-text hover:bg-muted",
    danger: "bg-danger text-white hover:opacity-90",
    outline: "bg-transparent text-text border border-border hover:bg-muted",
};
const SIZE_STYLES = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};
export const Button = forwardRef(function Button({ variant = "primary", size = "md", isLoading, leftIcon, rightIcon, fullWidth, disabled, className, children, ...rest }, ref) {
    return (_jsxs("button", { ref: ref, disabled: disabled || isLoading, className: cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors", "disabled:opacity-50 disabled:cursor-not-allowed", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg", VARIANT_STYLES[variant], SIZE_STYLES[size], fullWidth && "w-full", className), ...rest, children: [isLoading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : leftIcon, children, !isLoading && rightIcon] }));
});
