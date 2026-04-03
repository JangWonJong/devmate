import { http } from "./http"
import { type ApiResponse } from "./type"

export type AiGuideRequest = {
    message: string
}

export type AiGuideResponse = {
    question: string
    details: string
    hints: string
}

export async function guideQuestion(request: AiGuideRequest) {
    const {data} = await http.post<ApiResponse<AiGuideResponse>>(
        "/api/ai/guide", request
    )

    if (!data.success || !data.data) throw new Error(data.error?.message ?? "Ai GUide Load failed")
    return data.data
    
}