import { http } from "../http"
import type { ApiResponse } from "../type"

export type AdminRecentMember = {
  id: number
  nickname: string
  email: string
  createdAt: string
}

export type AdminRecentInquiry = {
  id: number
  memberNickname: string
  type: "BUG" | "FEATURE" | "GENERAL"
  status: "RECEIVED" | "IN_PROGRESS" | "RESOLVED"
  content: string
  createdAt: string
}

export type AdminDashboardSummary = {
  dailyVisitors: number
  totalVisitors: number
  totalMembers: number
  activeMembers: number
  deletedMembers: number
  pendingInquiries: number
  todaySignups: number
  recentMembers: AdminRecentMember[]
  recentInquiries: AdminRecentInquiry[]
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const { data } = await http.get<ApiResponse<AdminDashboardSummary>>(
    "/api/admin/dashboard/summary"
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "대시보드 요약 조회 실패")
  }

  return data.data
}