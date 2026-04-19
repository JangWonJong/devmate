import { http } from "./http"
import type { ApiResponse } from "./type"


export type InquiryType = "BUG" | "FEATURE" | "GENERAL"

export type InquiryStatus = "RECEIVED" | "IN_PROGRESS" | "RESOLVED"

export type Inquiry = {
  id: number
  type: InquiryType
  content: string
  status: InquiryStatus
  adminReply: string | null
  createdAt: string
  processedAt: string | null
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

export function getInquiryTypeLabel(type: InquiryType) {
    if (type === "BUG") return "버그"
    if (type === "FEATURE") return "기능 요청"
    return "기타"
}

export function getInquiryStatusLabel(status: InquiryStatus) {
    if (status === "IN_PROGRESS") return "처리 중"
    if (status === "RESOLVED") return "처리 완료"
    return "접수됨"
}


export function getInquiryStatusStyle(status: InquiryStatus) {
  if (status === "IN_PROGRESS") {
    return "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
  }

  if (status === "RESOLVED") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200"
  }

  return "bg-slate-100 text-slate-600 border border-slate-200"
}

export function formatInquiryDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}


export async function listMyInquiries(): Promise<Inquiry[]> {
  const { data } = await http.get<ApiResponse<Inquiry[]>>(
    "/api/inquiries/me"
  )

  if (!data.success || !data.data)
    throw new Error("load fail")

  return data.data
}

export async function deleteInquiry(id: number) {
  const { data } = await http.delete<ApiResponse<void>>(
    `/api/inquiries/${id}`
  )

  if (!data.success) {
    throw new Error(data.error.message)
  }
}

