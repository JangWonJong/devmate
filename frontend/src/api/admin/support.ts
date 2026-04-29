import { http } from "../http"
import type { ApiResponse } from "../type"

export type InquiryType = "BUG" | "FEATURE" | "GENERAL"
export type InquiryStatus = "RECEIVED" | "IN_PROGRESS" | "RESOLVED"

export type AdminInquiryListItem = {
  id: number
  memberNickname: string | null
  guestName: string | null
  guestEmail: string | null
  member: boolean
  type: InquiryType
  status: InquiryStatus
  content: string
  createdAt: string
  processedAt: string | null
}

export type AdminInquiryDetail = {
  id: number
  memberId: number | null
  memberNickname: string | null
  guestName: string | null
  guestEmail: string | null
  member: boolean
  type: InquiryType
  status: InquiryStatus
  content: string
  adminReply: string | null
  processedByNickname: string | null
  createdAt: string
  processedAt: string | null
  updatedAt: string
}

export async function listAdminInquiries(): Promise<AdminInquiryListItem[]> {
  const { data } = await http.get<ApiResponse<AdminInquiryListItem[]>>(
    "/api/admin/inquiries"
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "문의 목록 조회 실패")
  }

  return data.data
}

export async function getAdminInquiryDetail(
  inquiryId: number
): Promise<AdminInquiryDetail> {
  const { data } = await http.get<ApiResponse<AdminInquiryDetail>>(
    `/api/admin/inquiries/${inquiryId}`
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "문의 상세 조회 실패")
  }

  return data.data
}

export async function updateAdminInquiryStatus(req: {
  inquiryId: number
  status: InquiryStatus
}): Promise<void> {
  const { data } = await http.patch<ApiResponse<null>>(
    `/api/admin/inquiries/${req.inquiryId}/status`,
    { status: req.status }
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "문의 상태 변경 실패")
  }
}

export async function replyAdminInquiry(req: {
  inquiryId: number
  adminReply: string
}): Promise<void> {
  const { data } = await http.patch<ApiResponse<null>>(
    `/api/admin/inquiries/${req.inquiryId}/reply`,
    { adminReply: req.adminReply }
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "문의 답변 등록 실패")
  }
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
    return "bg-amber-50 text-amber-700 border border-amber-200"
  }

  if (status === "RESOLVED") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200"
  }

  return "bg-slate-100 text-slate-600 border border-slate-200"
}

export function formatInquiryDate(value: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}