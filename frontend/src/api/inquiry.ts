import { http } from "./http"
import type { ApiResponse } from "./type"

export type Inquiry = {
  id: number
  type: "BUG" | "FEATURE" | "GENERAL"
  content: string
  status: "PENDING" | "COMPLETED"
  createdAt: string
}

export async function createInquiry(req: {
  type: "BUG" | "FEATURE" | "GENERAL"
  content: string
}) {
  const { data } = await http.post<ApiResponse<void>>(
    "/api/inquiries",
    req
  )

  if (!data.success) throw new Error(data.error.message)
}

export async function listMyInquiries(): Promise<Inquiry[]> {
  const { data } = await http.get<ApiResponse<Inquiry[]>>(
    "/api/inquiries/me"
  )

  if (!data.success || !data.data)
    throw new Error("load fail")

  return data.data
}