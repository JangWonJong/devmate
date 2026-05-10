import type { AvailabilitySlot, ReservationResponse } from "../api/reservation/reservations"

const TIMELINE_START_HOUR = 9
const TIMELINE_END_HOUR = 22

export function hhmmToMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number)
  return h * 60 + m
}

export function hhmm(time: string) {
  return time?.length >= 5 ? time.slice(0, 5) : time
}

export function today() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function addHours(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number)
  const nextHour = h + hours
  return `${String(nextHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function makeTimeSlots() {
  const slots: string[] = []
  for (let hour = TIMELINE_START_HOUR; hour <= TIMELINE_END_HOUR - 1; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`)
  }
  return slots
}

export function isOverlapping(
  startTime: string,
  endTime: string,
  reservedStart: string,
  reservedEnd: string
) {
  const start = hhmmToMinutes(startTime)
  const end = hhmmToMinutes(endTime)
  const rStart = hhmmToMinutes(reservedStart)
  const rEnd = hhmmToMinutes(reservedEnd)

  return start < rEnd && end > rStart
}

export function canReserveStartTime(
  items: ReservationResponse[],
  reservationSpaceId: number | null,
  startTime: string,
  durationHours: number
) {
  if (!reservationSpaceId) return false

  const endTime = addHours(startTime, durationHours)

  if (hhmmToMinutes(endTime) > hhmmToMinutes('22:00')) {
    return false
  }

  return !items.some(
    (space) =>
      space.reservationSpaceId === reservationSpaceId &&
      isOverlapping(startTime, endTime, space.startTime, space.endTime)
  )
}

export function getReservationSpaceReservations(
  items: ReservationResponse[],
  reservationSpaceId: number | null
) {
  if (!reservationSpaceId) return []

  return items
    .filter((space) => space.reservationSpaceId === reservationSpaceId)
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime))
}

export function getAvailabilityReasonText(reason: string | null) {
  switch (reason) {
    case "PAST_TIME":
      return "지난 시간"
    case "ALREADY_RESERVED":
      return "이미 예약됨"
    case "MY_CONFLICT":
      return "내 예약과 겹침"
    case "DAILY_COUNT_LIMIT":
      return "하루 예약 횟수 초과"
    default:
      return ""
  }
}

export function getStudyStatusText(status: string) {
  switch (status) {
    case "RECRUITING":
      return "모집중"
    case "CLOSED_BY_CAPACITY":
      return "정원 마감"
    case "CLOSED":
      return "모집 종료"
    default:
      return status
  }
}

export function canSelectDuration(
  slots: AvailabilitySlot[],
  startTime: string,
  durationHours: number
) {
  const startIndex = slots.findIndex((slot) => slot.startTime === startTime)
  if (startIndex === -1) return false

  for (let i = 0; i < durationHours; i += 1) {
    const slot = slots[startIndex + i]
    if (!slot || !slot.available) return false
  }

  return true
}

export function getSlotDescription(
  slot: AvailabilitySlot,
  slots: AvailabilitySlot[],
  durationHours: number
) {
  if (slot.reason) {
    return getAvailabilityReasonText(slot.reason)
  }

  if (!canSelectDuration(slots, slot.startTime, durationHours)) {
    return `${durationHours}시간 연속 선택 불가`
  }

  return ""
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${hhmm(startTime)} ~ ${hhmm(endTime)}`
}

export function timeToPercent(time: string) {
  const start = TIMELINE_START_HOUR * 60
  const end = TIMELINE_END_HOUR * 60
  const total = end - start
  const current = hhmmToMinutes(time)

  return ((current - start) / total) * 100
}

export function getTimelineLabels() {
  return [9, 12, 15, 18, 21].map(
    (hour) => `${String(hour).padStart(2, "0")}:00`
  )
}