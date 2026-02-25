import { http } from "./http"
import type { APiResponse } from "./type"


export type LoginRequest = { email: string, password: string}
export type LoginResponse = { accessToken: string, refreshToken: string}

export async function login(req: LoginRequest) {
    const {data} = await http.post<APiResponse<LoginResponse>>("/api/auth/login", req)
    if (!data.success || !data.data) throw new Error(data.error.message ?? "Login failed")
    return data.data
    
}