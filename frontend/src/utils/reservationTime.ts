import type { ReservationResponse } from "../api/reservations"

export function hhmmToMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number)
  return h * 60 + m
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
  for (let hour = 9; hour <= 21; hour++) {
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
  roomId: number | null,
  startTime: string,
  durationHours: number
) {
  if (!roomId) return false

  const endTime = addHours(startTime, durationHours)

  // 운영시간 22:00까지
  if (hhmmToMinutes(endTime) > hhmmToMinutes("22:00")) {
    return false
  }

  return !items.some(
    (r) =>
      r.roomId === roomId &&
      isOverlapping(startTime, endTime, r.startTime, r.endTime)
  )
}

export function getRoomReservations(
  items: ReservationResponse[],
  roomId: number | null
) {
  if (!roomId) return []
  return items
    .filter((r) => r.roomId === roomId)
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime))
}