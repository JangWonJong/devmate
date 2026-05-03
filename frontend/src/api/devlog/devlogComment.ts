import { http } from "../http"
import type { ApiResponse } from "../type"

export type DevLogCommentResponse = {
  id: number
  memberId: number
  authorNickname: string
  content: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
}

export async function listDevLogComments(devLogId: number) {
  const { data } = await http.get<ApiResponse<DevLogCommentResponse[]>>(
    `/api/devlogs/${devLogId}/comments`
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "DevLog 댓글 조회 실패")
  }

  return data.data
}

export async function createDevLogComment(devLogId: number, content: string) {
  const { data } = await http.post<ApiResponse<number>>(
    `/api/devlogs/${devLogId}/comments`,
    { content }
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "DevLog 댓글 작성 실패")
  }

  return data.data
}

export async function updateDevLogComment(
  devLogId: number,
  commentId: number,
  content: string
) {
  await http.patch<ApiResponse<void>>(
    `/api/devlogs/${devLogId}/comments/${commentId}`,
    { content }
  )
}

export async function deleteDevLogComment(devLogId: number, commentId: number) {
  await http.delete<ApiResponse<void>>(
    `/api/devlogs/${devLogId}/comments/${commentId}`
  )
}

export async function likeDevLogComment(commentId: number) {
  await http.post<ApiResponse<void>>(`/api/devlog-comments/${commentId}/likes`)
}

export async function unlikeDevLogComment(commentId: number) {
  await http.delete<ApiResponse<void>>(`/api/devlog-comments/${commentId}/likes`)
}