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

export async function signup(req:SignupRequest) {
    const {data} = await http.post<ApiResponse<SignupRequest>>("/api/members/signup", req)
    if (!data.success || !data.data) throw new Error(data.error.message ?? "Signup failed")
    return data.data
    
}