import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
export function Pagination({ currentPage, totalPages, onPageChange, className }) {
    if (totalPages <= 1)
        return null;
    const getPages = () => {
        const delta = 1;
        const left = currentPage - delta;
        const right = currentPage + delta + 1;
        const pages = [];
        const points = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                points.push(i);
            }
        }
        let l;
        for (const i of points) {
            if (l !== undefined) {
                if (i - l === 2) {
                    pages.push(l + 1);
                }
                else if (i - l !== 1) {
                    pages.push("...");
                }
            }
            pages.push(i);
            l = i;
        }
        return pages;
    };
    return (_jsxs("div", { className: cn("flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-border bg-surface/50", className), children: [_jsxs("div", { className: "flex flex-1 items-center justify-between gap-4 sm:hidden", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: currentPage === 1, onClick: () => onPageChange(currentPage - 1), leftIcon: _jsx(ChevronLeft, { className: "h-4 w-4" }), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: currentPage === totalPages, onClick: () => onPageChange(currentPage + 1), rightIcon: _jsx(ChevronRight, { className: "h-4 w-4" }), children: "Next" })] }), _jsxs("div", { className: "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between", children: [_jsxs("p", { className: "text-sm text-subtext", children: ["Showing page ", _jsx("span", { className: "font-semibold text-text", children: currentPage }), " of", " ", _jsx("span", { className: "font-semibold text-text", children: totalPages })] }), _jsxs("nav", { className: "flex items-center gap-1", "aria-label": "Pagination", children: [_jsx(Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0 flex items-center justify-center", disabled: currentPage === 1, onClick: () => onPageChange(currentPage - 1), children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), getPages().map((p, i) => (p === "..." ? (_jsx("span", { className: "px-2 text-subtext text-xs", children: "..." }, `dots-${i}`)) : (_jsx(Button, { variant: currentPage === p ? "primary" : "ghost", size: "sm", className: "h-8 w-8 p-0 text-sm flex items-center justify-center", onClick: () => onPageChange(p), children: p }, p)))), _jsx(Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0 flex items-center justify-center", disabled: currentPage === totalPages, onClick: () => onPageChange(currentPage + 1), children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] })] }));
}
