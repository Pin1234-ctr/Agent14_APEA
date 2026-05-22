import { jsx as _jsx } from "react/jsx-runtime";
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/services/api/endpoints";
const Ctx = createContext({});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            authApi.me().then(setUser).catch(() => localStorage.clear()).finally(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);
    const login = async (email, password) => {
        const data = await authApi.login(email, password);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setUser(data.user);
    };
    const logout = async () => {
        try {
            await authApi.logout();
        }
        catch { }
        localStorage.clear();
        setUser(null);
    };
    return _jsx(Ctx.Provider, { value: { user, login, logout, loading }, children: children });
}
export const useAuth = () => useContext(Ctx);
