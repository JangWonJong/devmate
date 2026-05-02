import { http } from "../http"
import type { ApiResponse } from "../type"
import type { PageResponse } from "../page"

export type DevLogCreateRequest = {
  title: string
  problem: string
  solution: string
  reference?: string
  retrospective?: string
}

export type DevLogUpdateRequest = {
  title: string
  problem: string
  solution: string
  reference?: string
  retrospective?: string
  removedFileIds: number[]
}

export type DevLogAttachmentResponse = {
  id: number
  originalFileName: string
  fileUrl: string
  contentType: string
  fileSize: number
  displayOrder: number
}

export type DevLogResponse = {
  id: number
  title: string
  problem: string
  solution: string
  reference?: string
  retrospective?: string
  authorId: number
  authorNickname: string
  likeCount: number
  attachments: DevLogAttachmentResponse[]
  createdAt: string
  updatedAt: string
}

export type DevLogLikeStatusResponse = {
  likedByMe: boolean
  likeCount: number
}

export type DevLogSort = "id,desc" | "id,asc"

export async function createDevLog(
  req: DevLogCreateRequest,
  files: File[] = []
) {
  const formData = new FormData()

  formData.append(
    "request",
    new Blob([JSON.stringify(req)], { type: "application/json" })
  )

  files.forEach((file) => {
    formData.append("files", file)
  })

  const { data } = await http.post<ApiResponse<number>>(
    "/api/devlogs",
    formData
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "DevLog 생성 실패")
  }

  return data.data
}

export async function listMyDevLogs(params?: {
  page?: number
  size?: number
  sort?: DevLogSort
  keyword?: string
}) {
  const page = params?.page ?? 0
  const size = params?.size ?? 10
  const sort = params?.sort ?? "id,desc"
  const keyword = params?.keyword

  const { data } = await http.get<ApiResponse<PageResponse<DevLogResponse>>>(
    "/api/devlogs/mine",
    { params: { page, size, sort, keyword } }
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "내 DevLog 목록 조회 실패")
  }

  return data.data
}

export async function listMemberDevLogs(
  memberId: number,
  params?: {
    page?: number
    size?: number
    sort?: DevLogSort
    keyword?: string
  }
) {
  const page = params?.page ?? 0
  const size = params?.size ?? 10
  const sort = params?.sort ?? "id,desc"
  const keyword = params?.keyword

  const { data } = await http.get<ApiResponse<PageResponse<DevLogResponse>>>(
    `/api/members/${memberId}/devlogs`,
    { params: { page, size, sort, keyword } }
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "회원 DevLog 목록 조회 실패")
  }

  return data.data
}

export async function getDevLog(id: number | string) {
  const { data } = await http.get<ApiResponse<DevLogResponse>>(
    `/api/devlogs/${id}`
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "DevLog 조회 실패")
  }

  return data.data
}

export async function updateDevLog(
  id: number | string,
  req: DevLogUpdateRequest,
  files: File[] = []
) {
  const formData = new FormData()

  formData.append(
    "request",
    new Blob([JSON.stringify(req)], { type: "application/json" })
  )

  files.forEach((file) => {
    formData.append("files", file)
  })

  const { data } = await http.patch<ApiResponse<void>>(
    `/api/devlogs/${id}`,
    formData
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "DevLog 수정 실패")
  }
}

export async function deleteDevLog(id: number | string) {
  const { data } = await http.delete<ApiResponse<void>>(`/api/devlogs/${id}`)

  if (!data.success) {
    throw new Error(data.error?.message ?? "DevLog 삭제 실패")
  }
}

export async function getDevLogLikeStatus(devLogId: number) {
  const { data } = await http.get<ApiResponse<DevLogLikeStatusResponse>>(
    `/api/devlogs/${devLogId}/likes/status`
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "좋아요 상태 조회 실패")
  }

  return data.data
}

export async function likeDevLog(devLogId: number) {
  await http.post(`/api/devlogs/${devLogId}/likes`)
}

export async function unlikeDevLog(devLogId: number) {
  await http.delete(`/api/devlogs/${devLogId}/likes`)
}