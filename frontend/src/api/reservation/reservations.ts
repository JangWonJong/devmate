import { http } from '../http'
import type { PageResponse } from '../page'
import type { ApiResponse } from '../type'

export type ReservationResponse = {
  id: number
  reservationSpaceId: number
  reservationSpaceName: string
  reservationSpaceAddress: string | null
  memberId: number
  memberNickname: string
  date: string
  startTime: string
  endTime: string
  title: string
  status: string
  studyId: number | null
  postId: number | null
  latitude: number | null
  longitude: number | null
}

export type ReservationCreateRequest = {
  reservationSpaceId: number
  date: string
  startTime: string
  endTime: string
  title: string
}

export type ReservationCreateResponse = {
  id: number
}

export type StudyReservationCreateRequest = {
  reservationSpaceId: number
  date: string
  startTime: string
  endTime: string
}

export type AvailabilitySlot = {
  startTime: string
  endTime: string
  available: boolean
  reason: string | null
}

export type AvailabilityResponse = {
  reservationSpaceId: number
  date: string
  slots: AvailabilitySlot[]
}

export async function listReservations(params: {
  date: string
  reservationSpaceId?: number | null
  page?: number
  size?: number
  sort?: string
}): Promise<PageResponse<ReservationResponse>> {
  const date = params.date
  const page = params.page ?? 0
  const size = params.size ?? 50
  const sort = params.sort ?? 'startTime,asc'

  const q: Record<string, any> = { date, page, size, sort }
  if (params.reservationSpaceId != null) {
    q.reservationSpaceId = params.reservationSpaceId
  }

  const { data } = await http.get<
    ApiResponse<PageResponse<ReservationResponse>>
  >('/api/reservations', { params: q })

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? 'Reservation list failed')
  }

  return data.data
}

export async function createReservation(req: ReservationCreateRequest) {
  const { data } = await http.post<ApiResponse<ReservationCreateResponse>>(
    '/api/reservations',
    req
  )

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? 'Reservation create failed')
  }

  return data.data
}

export async function cancelReservation(id: number | string) {
  const { data } = await http.delete<ApiResponse<void>>(
    `/api/reservations/${id}`
  )

  if (!data.success) {
    throw new Error(data.error?.message ?? 'Reservation cancel failed')
  }
}

export async function listMyReservations(params?: {
  date?: string
  page?: number
  size?: number
  sort?: string
}) {
  const page = params?.page ?? 0
  const size = params?.size ?? 50
  const sort = params?.sort ?? 'date,desc'

  const query: Record<string, any> = { page, size, sort }
  if (params?.date) query.date = params.date

  const { data } = await http.get<
    ApiResponse<PageResponse<ReservationResponse>>
  >('/api/reservations/mine', { params: query })

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? 'List failed')
  }

  return data.data
}

export async function createStudyReservation(
  studyId: number,
  req: StudyReservationCreateRequest
) {
  const { data } = await http.post<ApiResponse<{ id: number }>>(
    `/api/studies/${studyId}/reservations`,
    req
  )

  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? 'Study reservation failed')
  }

  return data.data
}

export async function listStudyReservations(params: {
  studyId: number
  page?: number
  size?: number
  sort?: string
}) {
  const page = params.page ?? 0
  const size = params.size ?? 20
  const sort = params.sort ?? 'date,asc'

  const { data } = await http.get<
    ApiResponse<PageResponse<ReservationResponse>>
  >(`/api/studies/${params.studyId}/reservations`, {
    params: { page, size, sort },
  })

  if (!data.success || !data.data) {
    throw new Error(data?.error?.message ?? 'Study reservations list failed')
  }

  return data.data
}

export async function getReservationSpaceAvailability(
  reservationSpaceId: number,
  date: string
) {
  const { data } = await http.get<ApiResponse<AvailabilityResponse>>(
    `/api/reservation-spaces/${reservationSpaceId}/availability`,
    { params: { date } }
  )

  if (!data.success || !data.data) {
    throw new Error(data?.error?.message ?? 'Availability list failed')
  }

  return data.data
}
