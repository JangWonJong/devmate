import { http } from "./http"
import type { PageResponse } from "./page"
import { type ApiResponse } from "./type"

export type NotificationType = 
    | "COMMENT_CREATED"
    | "COMMENT_ACCEPTED"
    | "STUDY_NOTICE_UPDATED"



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

