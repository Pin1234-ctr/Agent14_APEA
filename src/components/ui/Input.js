import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ui/Input.tsx
import { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";
export const Input = forwardRef(function Input({ label, error, hint, leftIcon, rightIcon, fullWidth = true, className, id, ...rest }, ref) {
    const reactId = useId();
    const inputId = id || reactId;
    return (_jsxs("div", { className: cn("flex flex-col gap-1.5", fullWidth && "w-full"), children: [label && (_jsx("label", { htmlFor: inputId, className: "text-sm font-medium text-text text-left", children: label })), _jsxs("div", { className: "relative", children: [leftIcon && (_jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtext", children: leftIcon })), _jsx("input", { ref: ref, id: inputId, className: cn("h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-subtext", "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", "disabled:opacity-60 disabled:cursor-not-allowed", leftIcon && "pl-9", rightIcon && "pr-9", error && "border-danger focus:ring-danger", className), ...rest }), rightIcon && (_jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-subtext", children: rightIcon }))] }), error ? (_jsx("span", { className: "text-xs text-danger text-left", children: error })) : hint ? (_jsx("span", { className: "text-xs text-subtext text-left", children: hint })) : null] }));
});
