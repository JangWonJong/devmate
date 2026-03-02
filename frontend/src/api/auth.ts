import { http } from "./http"
import type { ApiResponse } from "./type"


export type LoginRequest = { email: string, password: string}
export type LoginResponse = { accessToken: string, refreshToken: string}
export type SignupRequest = { email: string, password: string, nickname: string}
export type SignupResponse = { id: number, email: string, password: string, nickname: string}


export async function login(req: LoginRequest) {
    const {data} = await http.post<ApiResponse<LoginResponse>>("/api/auth/login", req)
    if (!data.success || !data.data) throw new Error(data.error.message ?? "Login failed")
    return data.data
    
}

export async function logout() {
    const {data} = await http.post("/api/auth/logout")
    if (!data.success) {
        throw new Error(data?.error?.message ?? "Logout failed")
    }
}

export async function signup(req:SignupRequest) {
    const {data} = await http.post<ApiResponse<SignupRequest>>("/api/members/signup", req)
    if (!data.success || !data.data) throw new Error(data.error.message ?? "Signup failed")
    return data.data
    
}


export async function reissue(refreshToken: string) {
    const {data} = await http.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reissue`,
        {refreshToken},
        {headers: { "Content-Type": "application/json" }}
        )
    if (!data.success || !data?.data?.accessToken) {
        throw new Error(data?.error?.message ?? "Reissue failed")
    }
    return data.data.accessToken as string
    
}