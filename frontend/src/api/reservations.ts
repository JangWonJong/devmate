import { http } from "./http"
import type { PageResponse } from "./page"
import type { ApiResponse } from "./type"

export type ReservationResponse = {
    id: number
    roomId: number
    roomName: string
    memberId: number
    date: string
    startTime: string
    endTime: string
    title: string
    status: string
}

export type ReservationCreateRequest = {
    roomId: number
    date: string
    startTime: string
    endTime: string
    title: string
}

export type ReservationCreateResponse = {
    id: number
}

export async function listReservations(params: {
    date: string
    roomId?: number | null
    page?: number
    size?: number
    sort?: string
}): Promise<PageResponse<ReservationResponse>> {
    const date = params.date
    const page = params.page ?? 0
    const size = params.size ?? 50
    const sort = params.sort ?? "startTime,asc"

    const q: Record<string, any> = {date, page, size, sort }
    if (params.roomId != null) q.roomId = params.roomId

    const {data} = await http.get<ApiResponse<PageResponse<ReservationResponse>>>("/api/reservations", 
        { params:  q }
    )
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Reservation list failed")
    
    return data.data
    
}


export async function createReservation(req: ReservationCreateRequest) {

    const {data} = await http.post<ApiResponse<ReservationCreateResponse>>("/api/reservations", req)
    
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Reservation create failed")
    
    return data.data
    
}


export async function cancelReservation(id: number | string) {

    const {data} = await http.delete<ApiResponse<void>>(`/api/reservations/${id}`)
    if (!data.success) throw new Error(data.error?.message ?? "Reservation cancel failed")
    
}


export async function listMyReservations(params?:{
    page?: number
    size?: number
    sort?: string
}) {
    const page = params?.page ?? 0
    const size = params?.size ?? 50
    const sort = params?.sort ?? "date,desc"

    const {data} = await http.get<ApiResponse<PageResponse<ReservationResponse>>>(
        "/api/reservations/mine",
        { params: { page, size, sort}}
    )
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "List failed")
    return data.data
    
}