import { http } from "../http"
import type { ApiResponse } from "../type"
import type { PageResponse } from "../page"

export type AdminActionType =
  | "MEMBER_STATUS_CHANGE"
  | "MEMBER_ROLE_CHANGE"
  | "ADMIN_MEMO_UPDATE"

export type AdminActionLog = {
  id: number
  targetMemberId: number
  targetMemberNickname: string
  targetMemberEmail: string
  actionType: AdminActionType
  description: string
  adminNickname: string
  createdAt: string
}

export async function getAdminActionLogs(params: {
  actionType?: AdminActionType
  keyword?: string
  page?: number
  size?: number
}) {
  const { data } = await http.get<ApiResponse<PageResponse<AdminActionLog>>>(
    "/api/admin/action-logs",
    { params }
  )

  return data.data
}