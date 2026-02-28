import { http } from "./http"
import type { ApiResponse } from "./type"


export type PostCreateRequest = { title: string, content: string}

export type PostResponse = {
    id: number,
    title: string,
    content: string,
    solved: boolean,
    authorId: number,
    authorNickname: string,
    createdAt: string,
    updatedAt: string
}

export type PageResponse<T> = {
    content: T[]
    number: number
    size: number
    totalElements: number
    totalPages:number
    first: boolean
    last: boolean
}


export type PostUpdateRequest = {
    title: string
    content: string
    solved: boolean
}

export async function createPost(req: PostCreateRequest) {

    const {data} = await http.post<ApiResponse<number>>("/api/posts", req)
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Create failed")
    return data.data
    
}

export async function listPosts(params?: {
    page?: number
    size?: number
    sort?: string
    mine?: boolean
}) {
    const page = params?.page ?? 0
    const size = params?.size ?? 10
    const sort = params?.sort ?? "id,desc"
    const mine = params?.mine ?? false

    const {data} = await http.get<ApiResponse<PageResponse<PostResponse>>>(
        "/api/posts", 
        {params: {page, size, sort, mine}}
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

export async function updatePost(id:string, req: PostUpdateRequest) {
    const {data} = await http.patch<ApiResponse<void>>(`/api/posts/${id}`, req)
    if (!data.success) throw new Error(data.error?.message ?? "Update failed")
}
