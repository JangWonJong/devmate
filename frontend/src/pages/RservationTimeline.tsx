import type { ReservationResponse } from "../api/reservations"
import {
  formatTimeRange,
  getRoomReservations,
  getTimelineLabels,
  hhmmToMinutes,
  timeToPercent,
} from "../utils/reservationUtils"

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

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 16,
        padding: 16,
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 12 }}>예약 현황</div>

      <div
        style={{
          position: "relative",
          height: 20,
          marginBottom: 8,
          fontSize: 12,
          color: "#666",
        }}
      >
        {timelineLabels.map((label) => (
          <span
            key={label}
            style={{
              position: "absolute",
              left: `${timeToPercent(label)}%`,
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          height: 56,
          borderRadius: 12,
          background: "#f5f5f5",
          overflow: "hidden",
          padding: "0 4px",
        }}
      >
        {timelineLabels.map((label) => (
          <div
            key={`line-${label}`}
            style={{
              position: "absolute",
              left: `${timeToPercent(label)}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: "#e6e6e6",
            }}
          />
        ))}

        {roomReservations.length === 0 && !hasPreview ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#888",
            }}
          >
            예약된 일정이 없습니다
          </div>
        ) : null}

        {roomReservations.map((r) => {
          const left = timeToPercent(r.startTime)
          const right = timeToPercent(r.endTime)
          const width = right - left

          return (
            <div
              key={r.id}
              title={`${formatTimeRange(r.startTime, r.endTime)} · ${r.title}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                top: 12,
                height: 32,
                borderRadius: 999,
                background: "#111",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {formatTimeRange(r.startTime, r.endTime)}
            </div>
          )
        })}

        {hasPreview && (
          <div
            title={`선택 예정: ${formatTimeRange(
              previewStartTime!,
              previewEndTime!
            )}`}
            style={{
              position: "absolute",
              left: `${timeToPercent(previewStartTime!)}%`,
              width: `${
                timeToPercent(previewEndTime!) - timeToPercent(previewStartTime!)
              }%`,
              top: 12,
              height: 32,
              borderRadius: 999,
              background: "rgba(17, 17, 17, 0.12)",
              border: "1px dashed #111",
              color: "#111",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            선택 예정
          </div>
        )}
      </div>

      {roomReservations.length > 0 && (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {roomReservations.map((r) => (
            <div
              key={`list-${r.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 14,
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                padding: "8px 10px",
              }}
            >
              <div>
                <strong>{formatTimeRange(r.startTime, r.endTime)}</strong>
                <span style={{ color: "#666" }}> · {r.title}</span>
              </div>
              <div style={{ color: "#888" }}>{r.memberNickname}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}