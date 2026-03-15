import type { ReservationResponse } from "../api/reservations"
import { getRoomReservations, hhmmToMinutes } from "../utils/reservationTime"

type Props = {
  items: ReservationResponse[]
  roomId: number | null
  previewStartTime?: string | null
  previewEndTime?: string | null
}

const TIMELINE_START_HOUR = 9
const TIMELINE_END_HOUR = 22

const timelineLabels = [9, 12, 15, 18, 21].map(
  (hour) => `${String(hour).padStart(2, "0")}:00`
)

function timeToMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number)
  return h * 60 + m
}

function timeToPercent(time:string) {
  const start = TIMELINE_START_HOUR * 60
  const end = TIMELINE_END_HOUR * 60
  const total = end - start
  const current = timeToMinutes(time)

  return ((current - start) / total) * 100
}

export function ReservationTimeline({
  items,
  roomId,
  previewStartTime,
  previewEndTime,
}: Props) {
  const roomReservations = getRoomReservations(items, roomId)

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
        height: 48,
        borderRadius: 12,
        background: "#f5f5f5",
        overflow: "hidden",
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
          예약 없음
        </div>
      ) : null}

      {roomReservations.map((r) => {
        const left = timeToPercent(r.startTime)
        const right = timeToPercent(r.endTime)
        const width = right - left

        return (
          <div
            key={r.id}
            title={`${r.startTime.slice(0, 5)} ~ ${r.endTime.slice(0, 5)} · ${r.title}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: `${width}%`,
              top: 8,
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
            {r.startTime.slice(0, 5)} ~ {r.endTime.slice(0, 5)}
          </div>
        )
      })}

      {hasPreview && (
        <div
          title={`선택 예정: ${previewStartTime} ~ ${previewEndTime}`}
          style={{
            position: "absolute",
            left: `${timeToPercent(previewStartTime!)}%`,
            width: `${timeToPercent(previewEndTime!) - timeToPercent(previewStartTime!)}%`,
            top: 8,
            height: 32,
            borderRadius: 999,
            background: "rgba(17, 17, 17, 0.2)",
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
          미리 보기
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
              <strong>
                {r.startTime.slice(0, 5)} ~ {r.endTime.slice(0, 5)}
              </strong>
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