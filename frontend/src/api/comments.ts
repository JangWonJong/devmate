import { http } from "./http"
import type { ApiResponse } from "./type"


export type CommentResponse = {
    id: number
    memberId: number
    authorNickname: string
    content: string
    createdAt: string
    adopted: boolean
    likeCount: number
}

export type CommentCreateRequest = {
    content: string
}

export type MyCommentResponse = {
    commentId: number
    postId: number
    postTitle: string
    content: string
    createdAt: string
    adopted: boolean
}

export type CommentLikeStatusResponse = {
  likedByMe: boolean
  likeCount: number
}

export async function listComments(postId: string | number) {

    const {data} = await http.get<ApiResponse<CommentResponse[]>>(
        `/api/posts/${postId}/comments`
    )
    
    if (!data.success || data.data == null)
        throw new Error(data.error?.message ?? "댓글 조회 실패")

    return data.data
}


export async function createComment(
    postId: string | number,
    req: CommentCreateRequest
) {
    const {data} = await http.post<ApiResponse<number>>(
        `/api/posts/${postId}/comments`,
        req
    )
    
    if (!data.success || data.data == null)
        throw new Error(data.error?.message ?? "댓글 작성 실패")

    return data.data
}

export async function deleteComment(id: number | string) {

    const {data} = await http.delete<ApiResponse<void>>(
        `/api/comments/${id}`
    )

    if (!data.success)
        throw new Error(data.error?.message ?? "댓글 삭제 실패")
    
}


export async function updateComment(id: number | string, content: string) {

    const {data} = await http.patch<ApiResponse<void>>(`/api/comments/${id}`, {content})

    if (!data.success) throw new Error(data.error?.message ?? "댓글 수정 실패")
     
}

export async function adoptComment(id: number | string) {
    const {data} = await http.patch<ApiResponse<void>>(`/api/comments/${id}/adopt`)
    if (!data.success) throw new Error(data.error?.message ?? "댓글 채택 실패")
    
}

export async function listMyComments() {

    const {data} = await http.get<ApiResponse<MyCommentResponse[]>>("/api/comments/me")
    
    if (!data.success || data.data == null) {
        throw new Error(data.error?.message ?? "내 댓글 조회 실패")
    } 

    return data.data
}

export async function likeComment(commentId: number | string) {
  const { data } = await http.post<ApiResponse<null>>(`/api/comments/${commentId}/likes`)
  if (!data.success) {
    throw new Error(data.error?.message ?? "댓글 좋아요 처리 실패")
  }
}

export async function unlikeComment(commentId: number | string) {
  const { data } = await http.delete<ApiResponse<null>>(`/api/comments/${commentId}/likes`)
  if (!data.success) {
    throw new Error(data.error?.message ?? "댓글 좋아요 취소 실패")
  }
}

export async function getCommentLikeStatus(commentId: number | string) {
  const { data } = await http.get<ApiResponse<CommentLikeStatusResponse>>(
    `/api/comments/${commentId}/likes/me`
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "댓글 좋아요 상태 조회 실패")
  }

  return data.data
}