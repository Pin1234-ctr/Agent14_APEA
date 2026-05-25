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

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: "admin@apea.local", password: "Admin@123" },
  });

  if (!loading && user) {
    const dest = (location.state as { from?: string } | null)?.from || "/dashboard";
    return <Navigate to={dest} replace />;
  }

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (values: LoginForm) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      triggerToast("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      setSubmitError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-text text-bg text-xs px-4 py-2.5 rounded-lg shadow-lg font-medium animate-fadeIn">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-text">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-semibold">{APP_CONFIG.name}</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 space-y-6 shadow-sm">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-text">Sign in</h1>
              <p className="mt-1 text-sm text-subtext">{APP_CONFIG.fullName}</p>
            </div>
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger text-left">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email" },
                })}
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex items-center justify-center hover:text-text focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />
              <Button type="submit" isLoading={isSubmitting} fullWidth>
                Sign in
              </Button>
            </form>
            {/* <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-subtext text-left">
              <p className="font-medium text-text">Default credentials (dev)</p>
              <p className="mt-1">
                <span className="font-mono">admin@apea.local</span> /{" "}
                <span className="font-mono">Admin@123</span>
              </p>
              <p className="mt-1 text-[11px]">Change after first login. See README for details.</p>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
