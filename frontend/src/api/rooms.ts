import { http } from "./http"
import type { ApiResponse } from "./type"

export type RoomResponse = {
    id: number
    name: string
}

export async function listRooms(): Promise<RoomResponse[]> {
    const {data} = await http.get<ApiResponse<RoomResponse[]>>("/api/rooms")
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Room list failed")
    return data.data
    
}