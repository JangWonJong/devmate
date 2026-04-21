import { http } from "../http"
import type { PageResponse } from "../page"
import type { ApiResponse } from "../type"

export type AdminMemberStatus = "ACTIVE" | "DELETED"
export type AdminMemberRole = "USER" | "ADMIN"

export type AdminMember = {
  id: number
  nickname: string
  email: string
  role: AdminMemberRole
  status: AdminMemberStatus
  createdAt: string
}

export type ListAdminMembersParams = {
  page?: number
  size?: number
  status?: AdminMemberStatus | ""
  keyword?: string
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

export function getAdminMemberStatusLabel(status: AdminMemberStatus) {
  if (status === "ACTIVE") return "활성"
  return "탈퇴"
}

export function getAdminMemberStatusStyle(status: AdminMemberStatus) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200"
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