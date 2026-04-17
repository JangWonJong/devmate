import { http } from "./http"
import type { ApiResponse } from "./type"

export type AnalyticsSummaryResponse = {
  dailyVisitors: number
  totalVisitors: number
}

export async function countVisit() {
  const { data } = await http.post<ApiResponse<void>>("/api/analytics/visit")
  if (!data.success) {
    throw new Error(data.error?.message ?? "Visit count failed")
  }
}

export async function getAnalyticsSummary() {
  const { data } = await http.get<ApiResponse<AnalyticsSummaryResponse>>("/api/analytics/summary")
  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "Summary fetch failed")
  }
  return data.data
}