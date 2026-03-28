import { http } from "./http"
import type { ApiResponse } from "./type"
import type { PageResponse } from "./page"

export type PostCreateRequest = { title: string, content: string, type: "QUESTION" | "STUDY"}

export type PostResponse = {
    id: number
    title: string
    content: string
    solved: boolean
    authorId: number
    authorNickname: string
    type: "QUESTION" | "STUDY"
    attachments: PostAttachmentResponse[]
    likeCount: number
    createdAt: string
    updatedAt: string
}

export type PostUpdateRequest = {
    title: string
    content: string
    solved: boolean
    removedFileIds: number[]
}

export type PostAttachmentResponse = {
  id: number
  originalFileName: string
  fileUrl: string
  contentType: string
  fileSize: number
  displayOrder: number
}

export type PostLikeStatusResponse = {
  likedByMe: boolean
  likeCount: number
}

export async function createPost(
  req: PostCreateRequest,
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

  const { data } = await http.post<ApiResponse<number>>("/api/posts", formData)

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "Create failed")
  }

  return data.data
}

export async function listPosts(params?: {
    page?: number
    size?: number
    sort?: string
    mine?: boolean
    keyword?: string
    solved?: boolean

}) {
    const page = params?.page ?? 0
    const size = params?.size ?? 10
    const sort = params?.sort ?? "id,desc"
    const mine = params?.mine ?? false
    const keyword = params?.keyword
    const solved = params?.solved

    const {data} = await http.get<ApiResponse<PageResponse<PostResponse>>>(
        "/api/posts", 
        {params: {page, size, sort, mine, keyword, solved}}
    )
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "List failed")
    return data.data
    
}

export async function getPost(id: string) {

    const {data} = await http.get<ApiResponse<PostResponse>>(`/api/posts/${id}`)
    if (!data.success || !data.data) throw new Error(data.error?.message ?? "Get failed")
    return data.data
    
}

export async function deletePost(id:string) {
    const {data} = await http.delete<ApiResponse<void>>(`/api/posts/${id}`)
    if (!data.success) throw new Error(data.error?.message ?? "Delete Failed")
    
}


export async function updatePost(
  id: string,
  req: PostUpdateRequest,
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
    `/api/posts/${id}`,
    formData
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? "Update failed")
  }
}

export async function solvePost(id: string) {
    const {data} = await http.patch<ApiResponse<void>>(`/api/posts/${id}/solve`)
    if (!data.success) throw new Error(data.error?.message ?? "Solved failed")
    
}

export async function likePost(postId: number | string) {
    const {data} = await http.post<ApiResponse<null>>(`/api/posts/${postId}/likes`)
    if (!data.success) {
    throw new Error(data.error?.message ?? "좋아요 처리에 실패했습니다.")
    }
}

export async function unlikePost(postId: number | string) {
    const {data} = await http.delete<ApiResponse<null>>(`/api/posts/${postId}/likes`)
    if (!data.success) {
      throw new Error(data.error?.message ?? "좋아요 취소에 실패했습니다.")
    }
}

export async function getPostLikeStatus(postId: number | string) {
  const {data} = await http.get<ApiResponse<PostLikeStatusResponse>>(
    `/api/posts/${postId}/likes/me`
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "좋아요 상태 조회에 실패했습니다.")
  }

  return data.data
}