import { http } from '../http'
import type { ApiResponse } from '../type'

export type ReservationSpaceProviderType = 'INTERNAL' | 'USER_INPUT' | 'PARTNER'
export type ReservationSpaceProviderName = 'INTERNAL' | 'KAKAO' | 'NAVER'

export type PlaceSelection = {
  name: string
  address: string
  latitude: number
  longitude: number
  externalPlaceId: string
}

export type ReservationSpaceResponse = {
  id: number
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  providerType: ReservationSpaceProviderType
  providerName: ReservationSpaceProviderName | null
}

export type ReservationSpaceCreateRequest = PlaceSelection

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

export async function createUserInputReservationSpace(
  req: ReservationSpaceCreateRequest
): Promise<ReservationSpaceResponse> {
  const { data } = await http.post<ApiResponse<ReservationSpaceResponse>>(
    '/api/reservation-spaces/user-input',
    req
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? 'Reservation space create failed')
  }

  return data.data
}