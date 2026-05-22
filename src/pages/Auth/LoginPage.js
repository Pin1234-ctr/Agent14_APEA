import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShieldCheck, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
const APP_CONFIG = {
    name: "APEA",
    fullName: "Autonomous Production Exception Agent"
};
export function LoginPage() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitError, setSubmitError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        defaultValues: { email: "admin@apea.local", password: "Admin@123" },
    });
    if (!loading && user) {
        const dest = location.state?.from || "/dashboard";
        return _jsx(Navigate, { to: dest, replace: true });
    }
    const triggerToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };
    const onSubmit = async (values) => {
        setSubmitError(null);
        try {
            await login(values.email, values.password);
            triggerToast("Welcome back!");
            navigate("/dashboard", { replace: true });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Invalid email or password";
            setSubmitError(msg);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-bg", children: [toast && (_jsx("div", { className: "fixed bottom-5 right-5 z-[100] bg-text text-bg text-xs px-4 py-2.5 rounded-lg shadow-lg font-medium animate-fadeIn", children: toast })), _jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-text", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg", children: _jsx(ShieldCheck, { className: "h-5 w-5" }) }), _jsx("span", { className: "font-semibold", children: APP_CONFIG.name })] }), _jsx(ThemeToggle, {})] }), _jsx("div", { className: "flex-1 flex items-center justify-center px-4 py-8", children: _jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 }, className: "w-full max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-border bg-surface p-6 md:p-8 space-y-6 shadow-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-semibold text-text", children: "Sign in" }), _jsx("p", { className: "mt-1 text-sm text-subtext", children: APP_CONFIG.fullName })] }), submitError && (_jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger text-left", children: [_jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0" }), _jsx("span", { children: submitError })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Email", type: "email", autoComplete: "email", leftIcon: _jsx(Mail, { className: "h-4 w-4" }), error: errors.email?.message, ...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email" },
                                        }) }), _jsx(Input, { label: "Password", type: showPassword ? "text" : "password", autoComplete: "current-password", leftIcon: _jsx(Lock, { className: "h-4 w-4" }), rightIcon: _jsx("button", { type: "button", onClick: () => setShowPassword((prev) => !prev), className: "flex items-center justify-center hover:text-text focus:outline-none transition-colors", "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) }), error: errors.password?.message, ...register("password", { required: "Password is required" }) }), _jsx(Button, { type: "submit", isLoading: isSubmitting, fullWidth: true, children: "Sign in" })] }), _jsxs("div", { className: "rounded-lg border border-border bg-muted/30 p-3 text-xs text-subtext text-left", children: [_jsx("p", { className: "font-medium text-text", children: "Default credentials (dev)" }), _jsxs("p", { className: "mt-1", children: [_jsx("span", { className: "font-mono", children: "admin@apea.local" }), " /", " ", _jsx("span", { className: "font-mono", children: "Admin@123" })] }), _jsx("p", { className: "mt-1 text-[11px]", children: "Change after first login. See README for details." })] })] }) }) })] }));
}
