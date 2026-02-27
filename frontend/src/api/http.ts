import axios from "axios";
import { tokenStore } from "../auth/token";


export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
    const token = tokenStore.getAccess()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`}
    return config
})

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status
        const url = err?.config?.url ?? ""

        const isLoginRequest = url.includes("/api/auth/login")

        if (status ===401 && !isLoginRequest) {
            tokenStore.clear()
            window.location.href = "/login"
        }
    return Promise.reject(err)
    }
)