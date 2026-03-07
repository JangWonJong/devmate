import { http } from "./http"
import type { ApiResponse } from "./type"


export type CommentResponse = {
    id: number
    memberId: number
    authorNickname: string
    content: string
    createdAt: string
    adopted: boolean
}

export type CommentCreateRequest = {
    content: string
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