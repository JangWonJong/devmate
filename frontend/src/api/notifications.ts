import { http } from "./http"
import type { PageResponse } from "./page"
import { type ApiResponse } from "./type"

export type NotificationType = 
    | "COMMENT_CREATED"
    | "COMMENT_ACCEPTED"
    | "STUDY_NOTICE_UPDATED"
    | "STUDY_JOINED"
    | "STUDY_RESERVATION_CREATED"


export const getNotificationLabel = (type: NotificationResponse["type"]) => {
    switch (type) {
      case "COMMENT_CREATED":
        return "댓글"
      case "COMMENT_ACCEPTED":
        return "채택"
      case "STUDY_NOTICE_UPDATED":
        return "공지"
      case "STUDY_JOINED":
        return "참가"
      case "STUDY_RESERVATION_CREATED":
        return "예약"
      default:
        return "알림"
    }
  }

export const getNotificationLabelStyle = (type: NotificationResponse["type"]) => {
    switch (type) {
      case "COMMENT_CREATED":
        return {
          background: "#eff6ff",
          color: "#1d4ed8",
        }
      case "COMMENT_ACCEPTED":
        return {
          background: "#ecfdf5",
          color: "#047857",
        }
      case "STUDY_NOTICE_UPDATED":
        return {
          background: "#fef3c7",
          color: "#b45309",
        }
      case "STUDY_JOINED":
        return {
           background: "#f0fdf4",
           color: "#15803d",
        }
      case "STUDY_RESERVATION_CREATED":
        return {
           background: "#e0f2fe",
           color: "#0284c7",
        }
      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        }
    }
  }


export type NotificationResponse = {
    id: number
    type: NotificationType
    content: string
    targetUrl: string
    isRead: boolean
    actorNickname: string | null
    createdAt: string
}

export type NotificationUnreadCountResponse = {
    unreadCount: number
}

export async function listNotifications(page = 0, size = 10) {
    const {data} = await http.get<ApiResponse<PageResponse<NotificationResponse>>>(
        "/api/notifications",
        {
            params: { page, size}
        }
    )

    if (!data.success || data.data == null) {
        throw new Error(data.error?.message ?? "알림 목록 조회 실패")
    }

    return data. data
    
}


export async function getUnreadNotificationCount() {
    const {data} = await http.get<ApiResponse<NotificationUnreadCountResponse>>(
        "/api/notifications/unread-count",
    )

    if (!data.success || data.data == null) {
        throw new Error(data.error?.message ?? "안읽은 알림 수 조회 실패")
    }

    return data. data
    
}

export async function readNotification(notificationId: number | string) {
    const {data} = await http.patch<ApiResponse<void>>(
        `/api/notifications/${notificationId}/read`,
    )

    if (!data.success) {
        throw new Error(data.error?.message ?? "알림 읽음 처리 실패")
    }

    return data. data
    
}

export async function readAllNotifications() {
    const {data} = await http.patch<ApiResponse<void>>(
        "/api/notifications/read-all",
    )

    if (!data.success) {
        throw new Error(data.error?.message ?? "전체 알림 읽음 처리 실패")
    }

    return data. data
    
}

