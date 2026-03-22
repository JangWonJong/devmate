import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { listRooms, type RoomResponse } from "../api/rooms"
import {
  createStudyReservation,
  getRoomAvailability,
  listReservations,
  type AvailabilityResponse,
  type ReservationResponse,
} from "../api/reservations"
import { getStudy, type StudyResponse } from "../api/study"
import { apiErrorMessage } from "../utils/error"
import {
  addHours,
  canSelectDuration,
  getSlotDescription,
  hhmm,
  today,
  getStudyStatusText
} from "../utils/reservationUtils"
import { ReservationTimeline } from "./RservationTimeline"
import {
  cardStyle,
  errorBoxStyle,
  getSlotButtonStyleV2,
  inputStyle,
  pageStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  slotDescriptionStyle,
  slotTimeTextStyle,
} from "../ui/properties"

export function StudyReservationPage() {
  const nav = useNavigate()
  const { studyId } = useParams()

  const parsedStudyId = Number(studyId)

  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [date, setDate] = useState(today())
  const [durationHours, setDurationHours] = useState(1)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [items, setItems] = useState<ReservationResponse[]>([])
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)

  const [loading, setLoading] = useState(true)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadReservations = useCallback(async () => {
    if (!date) return

    const page = await listReservations({
      date,
      roomId,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })

    setItems(page.content)
  }, [date, roomId])

  const refreshAvailability = useCallback(async () => {
    if (!roomId || !date) {
      setAvailability(null)
      return
    }

    try {
      setAvailabilityLoading(true)
      const res = await getRoomAvailability(roomId, date)
      setAvailability(res)
    } catch (e: any) {
      setAvailability(null)
      setErr(apiErrorMessage(e, "예약 가능 시간 조회 실패"))
    } finally {
      setAvailabilityLoading(false)
    }
  }, [roomId, date])

  useEffect(() => {
    if (!successMessage) return

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    ;(async () => {
      if (!parsedStudyId || Number.isNaN(parsedStudyId)) {
        setErr("잘못된 스터디 정보예요.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setErr(null)

        const [studyRes, roomRes] = await Promise.all([
          getStudy(parsedStudyId),
          listRooms(),
        ])

        setStudy(studyRes)
        setRooms(roomRes)

        if (roomRes.length > 0) {
          setRoomId((prev) => (prev == null ? roomRes[0].id : prev))
        }
      } catch (e: any) {
        setErr(apiErrorMessage(e, "스터디 예약 페이지 조회 실패"))
      } finally {
        setLoading(false)
      }
    })()
  }, [parsedStudyId])

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        await loadReservations()
      } catch (e: any) {
        setErr(apiErrorMessage(e, "예약 목록 조회 실패"))
      }
    })()
  }, [loadReservations])

  useEffect(() => {
    void refreshAvailability()
  }, [refreshAvailability])

  useEffect(() => {
    setSelectedTime(null)
  }, [date, roomId, durationHours])

  const onCreate = async () => {
    if (!parsedStudyId || Number.isNaN(parsedStudyId)) {
      setErr("잘못된 스터디 정보예요.")
      return
    }

    if (!roomId) {
      setErr("방을 선택하세요.")
      return
    }

    if (!selectedTime) {
      setErr("예약 시간을 선택하세요.")
      return
    }

    setSuccessMessage(null)

    try {
      setSaving(true)
      setErr(null)

      await createStudyReservation(parsedStudyId, {
        roomId,
        date,
        startTime: selectedTime,
        endTime: addHours(selectedTime, durationHours),
      })

      setSuccessMessage("스터디 예약이 완료되었어요.")
      setSelectedTime(null)
      setDurationHours(1)

      await loadReservations()
      await refreshAvailability()
    } catch (e: any) {
      setErr(apiErrorMessage(e, "스터디 예약 생성 실패"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>불러오는 중...</div>
      </div>
    )
  }

  if (!study) {
    return (
      <div style={pageStyle}>
        <div style={errorBoxStyle}>스터디 정보를 찾을 수 없어요.</div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
            스터디 예약
          </h1>
          <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
            가능한 시간대를 확인하고 스터디 예약을 진행해보세요.
          </div>
        </div>

        <button type="button" onClick={() => nav(-1)} style={secondaryButtonStyle}>
          뒤로가기
        </button>
      </div>

      {err && <div style={errorBoxStyle}>{err}</div>}

      {successMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
          스터디 정보
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <strong>제목</strong> · {study.postTitle}
          </div>
          <div>
            <strong>리더</strong> · {study.leaderNickname}
          </div>
          <div>
            <strong>상태</strong> · {getStudyStatusText(study.status)}
          </div>
          <div>
            <strong>인원</strong> · {study.currentMembers} / {study.maxMembers}
          </div>
          <div
            style={{
              color: study.notice?.trim() ? "#111827" : "#9ca3af",
              lineHeight: 1.5,
            }}>
            <strong>공지</strong> ·{" "}
            {study.notice?.trim() ? study.notice : "등록된 공지가 없어요."}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ReservationTimeline
          items={items}
          roomId={roomId}
          previewStartTime={selectedTime}
          previewEndTime={selectedTime ? addHours(selectedTime, durationHours) : null}
        />
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
          스터디 예약 만들기
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 180px 140px",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ marginBottom: 6, fontSize: 13, color: "#666" }}>
              날짜
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 13, color: "#666" }}>
              스터디룸
            </div>
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
            <div style={{ marginBottom: 6, fontSize: 13, color: "#666" }}>
              예약 시간
            </div>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {availabilityLoading ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "16px 14px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              예약 가능 시간을 불러오는 중이에요.
            </div>
          ) : !availability ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "16px 14px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              방과 날짜를 선택하면 예약 가능 시간을 확인할 수 있어요.
            </div>
          ) : (
            availability.slots.map((slot) => {
              const unavailable = !canSelectDuration(
                availability.slots,
                slot.startTime,
                durationHours
              )
              const isServerUnavailable = !slot.available
              const selected = selectedTime === slot.startTime
              const description = getSlotDescription(
                slot,
                availability.slots,
                durationHours
              )

              return (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  disabled={unavailable || isServerUnavailable || saving}
                  onClick={() => {
                    if (unavailable || isServerUnavailable || saving) return
                    setSelectedTime(slot.startTime)
                  }}
                  style={getSlotButtonStyleV2(
                    unavailable || isServerUnavailable,
                    selected
                  )}
                  onMouseEnter={(e) => {
                    if (!(unavailable || isServerUnavailable) && !selected) {
                      e.currentTarget.style.border = "1px solid #2563eb"
                      e.currentTarget.style.background = "#eff6ff"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(unavailable || isServerUnavailable) && !selected) {
                      e.currentTarget.style.border = "1px solid #d1d5db"
                      e.currentTarget.style.background = "#ffffff"
                    }
                  }}
                  title={description}
                >
                  <div style={slotTimeTextStyle}>{hhmm(slot.startTime)}</div>

                  <div
                    style={{
                      ...slotDescriptionStyle,
                      color: isServerUnavailable
                        ? "#ef4444"
                        : unavailable
                        ? "#f59e0b"
                        : "transparent",
                    }}
                  >
                    {description || " "}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              marginTop: 8,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#475569",
              fontSize: 14,
            }}
          >
            {selectedTime
              ? `선택한 시간: ${selectedTime} ~ ${addHours(selectedTime, durationHours)} (${durationHours}시간)`
              : "시간을 선택하세요"}
          </div>

          <button
            disabled={saving}
            onClick={onCreate}
            style={{
              ...primaryButtonStyle,
              opacity: saving ? 0.6 : 1,
            }}
          >
            스터디 예약하기
          </button>
        </div>
      </div>
    </div>
  )
}