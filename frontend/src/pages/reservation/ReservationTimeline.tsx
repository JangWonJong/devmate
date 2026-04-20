import type { ReservationResponse } from "../../api/reservation/reservations"
import {
  formatTimeRange,
  getRoomReservations,
  getTimelineLabels,
  hhmmToMinutes,
  timeToPercent,
} from "../../utils/reservationUtils"

type Props = {
  items: ReservationResponse[]
  roomId: number | null
  previewStartTime?: string | null
  previewEndTime?: string | null
}

export function ReservationTimeline({
  items,
  roomId,
  previewStartTime,
  previewEndTime,
}: Props) {
  const roomReservations = getRoomReservations(items, roomId)
  const timelineLabels = getTimelineLabels()

  const hasPreview =
    !!previewStartTime &&
    !!previewEndTime &&
    hhmmToMinutes(previewEndTime) > hhmmToMinutes(previewStartTime)

  const getBarStyle = (startTime: string, endTime: string) => {
  const left = timeToPercent(startTime)
  const right = timeToPercent(endTime)
  const width = right - left

  return {
    left: `calc(${left}% + 2px)`,
    width: `calc(${width}% - 4px)`,
  }
}

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">예약 현황</div>

      <div className="relative mb-3 h-5 text-xs text-slate-500">
        {timelineLabels.map((label) => (
          <span
            key={label}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${timeToPercent(label)}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="relative h-16 overflow-hidden rounded-2xl bg-white">
        {timelineLabels.map((label) => (
          <div
            key={`line-${label}`}
            className="absolute bottom-0 top-0 w-px bg-slate-200"
            style={{ left: `${timeToPercent(label)}%` }}
          />
        ))}

        {roomReservations.length === 0 && !hasPreview ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            예약된 일정이 없습니다
          </div>
        ) : null}

        {roomReservations.map((reservation) => (
          <div
            key={reservation.id}
            title={`${formatTimeRange(reservation.startTime, reservation.endTime)} · ${reservation.title}`}
            className="absolute top-3.5 h-9 rounded-xl border border-indigo-600 bg-indigo-500 shadow-sm hover:bg-indigo-500 transition"
            style={{
              ...getBarStyle(reservation.startTime, reservation.endTime),
              minWidth: "52px",
            }}
          />
        ))}

        {hasPreview && (
        <div
          title={`선택 예정: ${formatTimeRange(previewStartTime!, previewEndTime!)}`}
          className="absolute top-3.5 h-9 rounded-xl border border-dashed border-indigo-500 bg-indigo-100 shadow-sm"
          style={{
            ...getBarStyle(previewStartTime!, previewEndTime!),
            minWidth: "52px",
          }}
        />
      )}
      </div>

      {roomReservations.length > 0 && (
        <div className="mt-4 grid gap-2">
          {roomReservations.map((reservation) => (
            <div
              key={`list-${reservation.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-semibold text-slate-900">
                  {formatTimeRange(reservation.startTime, reservation.endTime)}
                </span>
                <span className="text-slate-500"> · {reservation.title}</span>
              </div>
              <div className="shrink-0 text-slate-500">{reservation.memberNickname}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}