import { http } from "../http"
import type { PageResponse } from "../page"
import type { ApiResponse } from "../type"

export type AdminMemberStatus = "ACTIVE" | "DELETED" | "SUSPENDED"
export type AdminMemberRole = "USER" | "ADMIN"

export type AdminMember = {
  id: number
  nickname: string
  email: string
  role: AdminMemberRole
  status: AdminMemberStatus
  createdAt: string
}

export type AdminActionLog = {
  id: number
  actionType: string
  description: string
  adminNickname: string
  createdAt: string
}

export type AdminMemberDetail = {
  id: number
  name: string
  nickname: string
  email: string
  phone: string | null
  bio: string | null
  profileImageUrl: string | null
  role: AdminMemberRole
  status: AdminMemberStatus
  createdAt: string
  updatedAt: string
  adminMemo: string | null
  postCount: number
  commentCount: number
  inquiryCount: number
  reservationCount: number
  recentPosts: AdminMemberRecentPost[]
  recentInquiries: AdminMemberRecentInquiry[]
  recentReservations: AdminMemberRecentReservation[]
  actionLogs: AdminActionLog[]
}

export type ListAdminMembersParams = {
  page?: number
  size?: number
  status?: AdminMemberStatus | ""
  keyword?: string
}

export type AdminMemberRecentPost = {
  id: number
  title: string
  createdAt: string
}

export type AdminMemberRecentInquiry = {
  id: number
  content: string
  createdAt: string
}

export type AdminMemberRecentReservation = {
  id: number
  title: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  status: "ACTIVE" | "CANCELED"
}

export async function listAdminMembers(
  params: ListAdminMembersParams
): Promise<PageResponse<AdminMember>> {
  const { data } = await http.get<ApiResponse<PageResponse<AdminMember>>>(
    "/api/admin/members",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        status: params.status || undefined,
        keyword: params.keyword?.trim() || undefined,
      },
    }
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "회원 목록 조회 실패")
  }

  return data.data
}

export async function getAdminMemberDetail(
  memberId: number
): Promise<AdminMemberDetail> {
  const { data } = await http.get<ApiResponse<AdminMemberDetail>>(
    `/api/admin/members/${memberId}`
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "회원 상세 조회 실패")
  }

  return data.data
}

export function getAdminMemberStatusLabel(status: AdminMemberStatus) {
  if (status === "ACTIVE") return "이용중"
  if (status === "SUSPENDED") return "이용정지"
  return "탈퇴"
}

export function getAdminMemberStatusStyle(status: AdminMemberStatus) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200"
  }
  if (status === "SUSPENDED") {
    return "bg-amber-50 text-amber-700 border border-amber-200"
  }
  return "bg-slate-100 text-slate-600 border border-slate-200"
}

export function formatAdminMemberDate(value: string) {
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

export async function updateAdminMemberStatus(
  memberId: number,
  status: AdminMemberStatus
): Promise<void> {
  const { data } = await http.patch<ApiResponse<null>>(
    `/api/admin/members/${memberId}/status`,
    { status }
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "회원 상태 변경 실패")
  }
}

export async function updateAdminMemberRole(
  memberId: number,
  role: AdminMemberRole
): Promise<void> {
  const { data } = await http.patch<ApiResponse<null>>(
    `/api/admin/members/${memberId}/role`,
    { role }
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "회원 권한 변경 실패")
  }
}


export async function updateAdminMemberMemo(
  memberId: number,
  adminMemo: string
) {
  const { data } = await http.patch<ApiResponse<null>>(
    `/api/admin/members/${memberId}/memo`,
    { adminMemo }
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "관리자 메모 저장 실패")
  }
}
