import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  createStudyReservation,
  listReservations,
  type ReservationResponse,
} from "../api/reservations"
import { listRooms, type RoomResponse } from "../api/rooms"
import { getStudy, type StudyResponse } from "../api/study"

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function makeTimeSlots() {
  const slots: string[] = []
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`)
  }
  return slots
}

function addOneHour(time: string) {
  const [h, m] = time.split(":").map(Number)
  const nextHour = h + 1
  return `${String(nextHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function StudyReservationPage() {
  const nav = useNavigate()
  const { studyId } = useParams()

  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)

  const [date, setDate] = useState(todayString())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [items, setItems] = useState<ReservationResponse[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timeSlots = useMemo(() => makeTimeSlots(), [])

  const loadReservations = useCallback(async () => {
    const page = await listReservations({
      date,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })
    setItems(page.content)
  }, [date])

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        const res = await listRooms()
        setRooms(res)

        if (res.length > 0) {
          setRoomId((prev) => (prev == null ? res[0].id : prev))
        }
      } catch (e: any) {
        setError(e.message ?? "방 목록 조회 실패")
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        await loadReservations()
      } catch (e: any) {
        setError(e.message ?? "예약 목록 조회 실패")
      }
    })()
  }, [loadReservations])

  useEffect(() => {
    setSelectedTime("")
  }, [date, roomId])

  useEffect(() => {
    ;(async () => {
      if (!studyId) return

      try {
        setLoading(true)
        setError(null)

        const res = await getStudy(Number(studyId))
        setStudy(res)
      } catch (e: any) {
        setError(e.message ?? "스터디 정보를 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    })()
  }, [studyId])

  const isReservedTime = useCallback(
    (time: string) => {
      return items.some(
        (r) => r.roomId === roomId && r.startTime.slice(0, 5) === time
      )
    },
    [items, roomId]
  )

  const endTime = useMemo(() => {
    if (!selectedTime) return ""
    return addOneHour(selectedTime)
  }, [selectedTime])

  const onSubmit = async () => {
    if (!studyId) return
    if (!roomId) {
      setError("방을 선택해 주세요.")
      return
    }
    if (!selectedTime) {
      setError("시간을 선택해 주세요.")
      return
    }

    try {
      setSaving(true)
      setError(null)

      await createStudyReservation(Number(studyId), {
        roomId,
        date,
        startTime: selectedTime,
        endTime,
      })

      alert("스터디 예약이 완료되었습니다.")
      nav(`/posts/${study?.postId}`)
    } catch (e: any) {
      setError(e.message ?? "스터디 예약 실패")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ color: "#666" }}>스터디 정보를 불러오는 중...</div>
  }

  if (error && !study) {
    return <div style={{ color: "crimson" }}>{error}</div>
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
        스터디 예약
      </h1>

      {study && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fafafa",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {study.postTitle}
          </div>

          <div style={{ color: "#666", display: "grid", gap: 6 }}>
            <div>
              <strong>작성자:</strong> {study.authorNickname}
            </div>
            <div>
              <strong>리더:</strong> {study.leaderNickname}
            </div>
            <div>
              <strong>현재 인원:</strong> {study.currentMembers} / {study.maxMembers}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>예약 만들기</h3>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>스터디룸</label>
            <select
              value={roomId?.toString() ?? ""}
              onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
            >
              <option value="" disabled>
                방 선택
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ marginBottom: 10 }}>시간 선택 (1시간 단위)</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 10,
              }}
            >
              {timeSlots.map((time) => {
                const reserved = isReservedTime(time)
                const selected = selectedTime === time

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={reserved || saving}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: "16px 12px",
                      borderRadius: 12,
                      border: reserved
                        ? "1px solid #ddd"
                        : selected
                        ? "2px solid #111"
                        : "1px solid #ddd",
                      background: reserved ? "#f1f1f1" : selected ? "#111" : "#fff",
                      color: reserved ? "#999" : selected ? "#fff" : "#111",
                      cursor: reserved ? "not-allowed" : "pointer",
                    }}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ color: "#666" }}>
            {selectedTime
              ? `선택한 시간: ${selectedTime} ~ ${endTime}`
              : "시간을 선택해 주세요."}
          </div>

          {error && <div style={{ color: "crimson" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              style={{ padding: "10px 14px" }}
            >
              {saving ? "예약 중..." : "예약"}
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              disabled={saving}
              style={{ padding: "10px 14px" }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}