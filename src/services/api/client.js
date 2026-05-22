// src/services/api/client.ts
import axios from "axios";
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
    // timeout: 30_000,
});
API.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("access_token");
    if (token)
        cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});
API.interceptors.response.use((r) => r, async (err) => {
    if (err.response?.status === 401) {
        const refresh = localStorage.getItem("refresh_token");
        if (refresh) {
            try {
                const { data } = await axios.post(import.meta.env.VITE_API_BASE_URL + "/api/auth/refresh", { refresh_token: refresh });
                localStorage.setItem("access_token", data.data.access_token);
                err.config.headers.Authorization = `Bearer ${data.data.access_token}`;
                return API.request(err.config);
            }
            catch {
                localStorage.clear();
                window.location.href = "/login";
            }
        }
    }
    return Promise.reject(err);
});
export default API;
