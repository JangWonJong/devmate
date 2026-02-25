import { http } from "./http"
import type { APiResponse } from "./type"


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


export type Page<T> = {
    content: T[]
    number: number
    size: number
    totalElements: number
    totalPages: number
}

export async function createPost(req: PostCreateRequest) {

    const {data} = await http.post<APiResponse<number>>("/api/posts", req)
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Create failed")
    return data.data
    
}

export async function listPosts() {

    const {data} = await http.get<APiResponse<Page<PostResponse>>>
    ("/api/posts?page=0&size=10&sort=id,desc")
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "List failed")
    return data.data
    
}

export async function getPost(id: string) {

    const {data} = await http.post<APiResponse<PostResponse>>(`/api/posts/${id}`)
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Get failed")
    return data.data
    
}
