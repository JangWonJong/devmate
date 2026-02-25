import axios from "axios";
import { tokenStore } from "../auth/token";


export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
    const token = tokenStore.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})