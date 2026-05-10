import { http } from '../http'
import type { ApiResponse } from '../type'

export type ReservationSpaceResponse = {
  id: number
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  providerType: string
}

export async function listReservationSpaces(): Promise<
  ReservationSpaceResponse[]
> {
  const { data } = await http.get<ApiResponse<ReservationSpaceResponse[]>>(
    '/api/reservation-spaces'
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? 'Reservation space list failed')
  }

  return data.data
}
