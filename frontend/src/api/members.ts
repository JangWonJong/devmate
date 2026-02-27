import { http } from "./http";


type ApiError = { code: string; message: string}
type ApiResponse<T> = { success: boolean; data?: T; error?: ApiError}

export type MeResponse = {
    id: number
    email: string
    nickname: string
}

export async function getMe() {
    const { data } = await http.get<ApiResponse<MeResponse>>("/api/members/me")
    if (!data.success || !data.data) throw new Error(data.error?.message ?? "me failed")
    return data.data
    
}

export async function getMeId() {
    const me = await getMe()
    return me.id
}