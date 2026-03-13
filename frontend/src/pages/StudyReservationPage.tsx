import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  createStudyReservation,
  listReservations,
  type ReservationResponse,
} from "../api/reservations"
import { listRooms, type RoomResponse } from "../api/rooms"
import { getStudy, type StudyResponse } from "../api/study"
import {
  addHours,
  makeTimeSlots,
  canReserveStartTime,
  today,
} from "../utils/reservationTime"
import { ReservationTimeline } from "./RservationTimeline"
import { pageStyle, cardStyle, inputStyle, primaryButtonStyle, secondaryButtonStyle, 
  mutedBoxStyle, errorBoxStyle, getSlotButtonStyle } from "../ui/properties"
import { apiErrorMessage } from "../api/error"

export function StudyReservationPage() {
  const nav = useNavigate()
  const { studyId } = useParams()

  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [durationHours, setDurationHours] = useState<number>(1)

  const [date, setDate] = useState(today())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [items, setItems] = useState<ReservationResponse[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const timeSlots = useMemo(() => makeTimeSlots(), [])

  const loadReservations = useCallback(async () => {
    const page = await listReservations({
      date,
      roomId,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })
    setItems(page.content)
  }, [date, roomId])

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        const res = await listRooms()
        setRooms(res)

        if (res.length > 0) {
          setRoomId((prev) => (prev == null ? res[0].id : prev))
        }
      } catch (e: any) {
        setErr(e.message ?? "방 목록 조회 실패")
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        await loadReservations()
      } catch (e: any) {
        setErr(e.message ?? "예약 목록 조회 실패")
      }
    })()
  }, [loadReservations])

  useEffect(() => {
    setSelectedTime("")
  }, [date, roomId, durationHours])

  useEffect(() => {
    ;(async () => {
      if (!studyId) return

      try {
        setLoading(true)
        setErr(null)
        const res = await getStudy(Number(studyId))
        setStudy(res)
      } catch (e: any) {
        setErr(e.message ?? "스터디 정보를 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    })()
  }, [studyId])

  const canReserveFromTime = useCallback(
    (time: string) => {
      return canReserveStartTime(items, roomId, time, durationHours)
    },
    [items, roomId, durationHours]
  )

  const endTime = useMemo(() => {
    if (!selectedTime) return ""
    return addHours(selectedTime, durationHours)
  }, [selectedTime, durationHours])

  const onSubmit = async () => {
    if (!studyId) return
    if (!roomId) {
      setErr("방을 선택해 주세요.")
      return
    }
    if (!selectedTime) {
      setErr("시간을 선택해 주세요.")
      return
    }

    try {
      setSaving(true)
      setErr(null)

      await createStudyReservation(Number(studyId), {
        roomId,
        date,
        startTime: selectedTime,
        endTime,
      })

      alert("스터디 예약이 완료되었습니다.")
      nav(`/posts/${study?.postId}`)
    } catch (e: any) {
      setErr(apiErrorMessage(e, "스터디 예약 실패"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ color: "#666", padding: 24 }}>스터디 정보를 불러오는 중...</div>
  }

  if (err && !study) {
    return <div style={{ color: "crimson", padding: 24 }}>{err}</div>
  }

  return (
  <div style={pageStyle}>
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>스터디 예약</h1>
      <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
        스터디룸 현황을 확인하고 스터디 시간을 예약해보세요.
      </div>
    </div>

    {study && (
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
          {study.postTitle}
        </div>

        <div
          style={{
            color: "#666",
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
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

    <div style={cardStyle}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
        예약 만들기
      </div>

      <div style={{ marginBottom: 16 }}>
        <ReservationTimeline items={items} roomId={roomId} 
          previewStartTime={selectedTime}
          previewEndTime={selectedTime ? addHours(selectedTime, durationHours) : null} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#666" }}>
            날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#666" }}>
            스터디룸
          </label>
          <select
            value={roomId?.toString() ?? ""}
            onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : null)}
            style={inputStyle}
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
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#666" }}>
            예약 시간
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            style={inputStyle}
          >
            <option value={1}>1시간</option>
            <option value={2}>2시간</option>
            <option value={3}>3시간</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 10, fontSize: 13, color: "#666" }}>
        시간 선택 (1시간 단위)
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {timeSlots.map((time) => {
          const unavailable = !canReserveFromTime(time)
          const selected = selectedTime === time

          return (
            <button
              key={time}
              type="button"
              disabled={unavailable || saving}
              onClick={() => setSelectedTime(time)}
              style={getSlotButtonStyle(unavailable, selected)}
            >
              {time}
            </button>
          )
        })}
      </div>

      <div style={{ ...mutedBoxStyle, marginBottom: 16 }}>
        {selectedTime
          ? `선택한 시간: ${selectedTime} ~ ${endTime} (${durationHours}시간)`
          : "시간을 선택해 주세요."}
      </div>

      {err && <div style={errorBoxStyle}>{err}</div>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => nav(-1)}
          disabled={saving}
          style={secondaryButtonStyle}
        >
          취소
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          style={{
            ...primaryButtonStyle,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "예약 중..." : "예약"}
        </button>
      </div>
    </div>
  </div>
)
}