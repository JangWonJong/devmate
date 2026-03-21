import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { listRooms, type RoomResponse } from "../api/rooms"
import {
  cancelReservation,
  createReservation,
  listMyReservations,
  listReservations,
  type ReservationResponse,
  type AvailabilityResponse,
  type AvailabilitySlot,
  getRoomAvailability
} from "../api/reservations"
import { tokenStore } from "../auth/token"
import { getMeId } from "../api/members"
import { apiErrorMessage } from "../utils/error"
import {
  addHours, today,
} from "../utils/reservationTime"

import { ReservationTimeline } from "./RservationTimeline"
import { pageStyle, cardStyle, inputStyle, primaryButtonStyle, secondaryButtonStyle, 
  mutedBoxStyle, listItemCardStyle, errorBoxStyle, getSlotButtonStyleV2,
   getReservationStatusStyle, slotTimeTextStyle, slotDescriptionStyle } from "../ui/properties"

type Scope = "all" | "mine"

type Query = {
  scope?: Scope
  date?: string
}

function hhmm(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function getReservationStatus(date: string, endTime: string) {
  const now = new Date()
  const end = new Date(`${date}T${endTime}`)

  if (end < now) return "지난 예약"

  const todayStr = new Date().toISOString().slice(0, 10)
  if (date === todayStr) return "오늘 예약"

  return "예정 예약"
}

function getAvailabilityReasonText(reason: string | null) {
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

function getSlotDescription(
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

function canSelectDuration(
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

function toScope(v: string | null): Scope {
  return v === "mine" ? "mine" : "all"
}

function isCancelable(date: string, startTime: string) {
  const now = new Date()
  const start = new Date(`${date}T${startTime}`)
  const diff = (start.getTime() - now.getTime()) / (1000 * 60)
  return diff >= 60
}

export function ReservationsPage() {
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()

  const scope = toScope(sp.get("scope"))
  const date = sp.get("date") ?? today()

  const setQuery = useCallback(
    (next: Query, options?: { replace?: boolean }) => {
      const curScope = toScope(sp.get("scope"))
      const curDate = sp.get("date") ?? today()

      const nextScope = next.scope ?? curScope
      const nextDate = next.date ?? curDate

      const params: Record<string, string> = {}
      
      if (nextScope !== "all") {
        params.scope = nextScope
      }

      if (nextScope === "all" && nextDate !== today()) {
        params.date = nextDate
}
      setSp(params, { replace: options?.replace ?? false })
    },
    [sp, setSp]
  )

  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [durationHours, setDurationHours] = useState<number>(1)
  const [mineDate, setMineDate] = useState<string>("")

  const [title, setTitle] = useState("")
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)

  const [items, setItems] = useState<ReservationResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!loggedIn) {
        setMeId(null)
        return
      }
      try {
        const id = await getMeId()
        setMeId(id)
      } catch {
        setMeId(null)
      }
    })()
  }, [loggedIn])

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
        setErr(apiErrorMessage(e, "방 목록 조회 실패"))
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (scope !== "all" || !roomId || !date) {
        setAvailability(null)
        setSelectedTime(null)
        return
      }

      try {
        setAvailabilityLoading(true)
        const res = await getRoomAvailability(roomId, date)
        setAvailability(res)
        
        if (
          selectedTime &&
          !res.slots.some(
            (slot) => slot.startTime === selectedTime && slot.available
          )
        ) {
          setSelectedTime(null)
          }
      } catch (e: any) {
        setAvailability(null)
        setSelectedTime(null)
        setErr(apiErrorMessage(e, "예약 가능 시간 조회 실패"))
      }finally {
        setAvailabilityLoading(false)
      }
    }) ()
  }, [scope, roomId, date, selectedTime])

  const loadAll = async () => {
    const page = await listReservations({
      date,
      roomId,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })
    setItems(page.content)
  }

  const loadMine = async () => {
    const page = await listMyReservations({
      date: mineDate || undefined,
      page: 0,
      size: 50,
      sort: mineDate ? "startTime,asc" : "date,desc",
    })
    setItems(page.content)
  }

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)

        if (scope === "mine") {
          if (!loggedIn) {
            setQuery({ scope: "all" }, { replace: true })
            return
          }
          await loadMine()
          return
        }

        await loadAll()
      } catch (e: any) {
        setErr(apiErrorMessage(e, "예약 조회 실패"))
      }
    })()
  }, [scope, date, roomId, mineDate, loggedIn, setQuery])

  useEffect(() => {
    setSelectedTime(null)
  }, [date, roomId, scope, durationHours])

  const emptyText = useMemo(() => {
    if (scope === "mine") {
      return loggedIn ? "내 예약이 없어요" : "로그인 후 내 예약을 확인할 수 있어요"
    }
    return "해당 날짜 예약이 없어요"
  }, [scope, loggedIn])
  
  const onCreate = async () => {
    if (!loggedIn) {
      setErr("로그인 후 예약할 수 있어요")
      nav("/login", {
        state: { from: { pathname: "/reservations", search: `?${sp.toString()}` } },
      })
      return
    }

    if (!roomId) return setErr("방을 선택하세요")

    const t = title.trim()
    if (!t) return setErr("예약 제목을 입력하세요")
    if (!selectedTime) return setErr("예약 시간을 선택하세요")

    try {
      setBusy(true)
      setErr(null)

      await createReservation({
        roomId,
        date,
        startTime: selectedTime,
        endTime: addHours(selectedTime, durationHours),
        title: t,
      })

      setTitle("")
      setSelectedTime(null)
      setDurationHours(1)

      if (scope === "mine") await loadMine()
      else await loadAll()
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) setErr("이미 예약된 시간대입니다.")
      //else if (status === 400) setErr(apiErrorMessage(e, "예약 시간을 확인해주세요."))
      else setErr(apiErrorMessage(e, "예약 생성 실패"))
    } finally {
      setBusy(false)
    }
  }

  const onCancel = async (id: number) => {
    const ok = confirm("예약을 취소할까요?")
    if (!ok) return

    try {
      setBusy(true)
      setErr(null)
      await cancelReservation(id)

      if (scope === "mine") await loadMine()
      else await loadAll()
    } catch (e: any) {
      setErr(apiErrorMessage(e, "예약 취소 실패"))
    } finally {
      setBusy(false)
    }
  }

  const groupedItems = useMemo(() => {
  return items.reduce<Record<string, ReservationResponse[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})
  }, [items])

  const reservationSummary = useMemo(() => {
    let upcoming = 0
    let todayCount = 0
    let past = 0

    for (const item of items) {
      const status = getReservationStatus(item.date, item.endTime)

      if (status === "예정 예약") upcoming += 1
      else if (status === "오늘 예약") todayCount += 1
      else past += 1
    }

    return {
      upcoming,
      todayCount,
      past,
    }
  }, [items])

  const onMoveToStudyPost = (postId: number | null) => {
    if (!postId) return
    nav(`/posts/${postId}`)
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
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>예약</h1>
        <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
          스터디룸 예약 현황을 확인하고 원하는 시간대를 선택해보세요.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setQuery({ scope: "all" })}
          style={scope === "all" ? primaryButtonStyle : secondaryButtonStyle}
        >
          전체 예약
        </button>

        <button
          onClick={() => {
            if (!loggedIn) {
              setErr("로그인 후 내 예약을 확인할 수 있어요")
              nav("/login", {
                state: {
                  from: { pathname: "/reservations", search: `?${sp.toString()}` },
                },
              })
              return
            }
            setQuery({ scope: "mine" })
          }}
          style={scope === "mine" ? primaryButtonStyle : secondaryButtonStyle}
        >
          내 예약
        </button>
      </div>
    </div>

    {err && <div style={errorBoxStyle}>{err}</div>}
    {scope === "mine" && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "#666" }}>날짜 필터</span>
            <input
              type="date"
              value={mineDate}
              onChange={(e) => setMineDate(e.target.value)}
              style={{ ...inputStyle, width: 180 }}
            />
            <button
              type="button"
              onClick={() => setMineDate("")}
              style={secondaryButtonStyle}
            >
              전체 보기
            </button>
          </div>
        </div>
      )}
    {scope === "all" && (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#666" }}>날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setQuery({ date: e.target.value })}
              style={{ ...inputStyle, width: 180 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <ReservationTimeline items={items} roomId={roomId}
           previewStartTime={selectedTime}
           previewEndTime={selectedTime ? addHours(selectedTime, durationHours) : null} />
        </div>

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
            예약 만들기
          </div>

          {!loggedIn && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
              로그인 후 예약할 수 있어요
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 140px minmax(220px, 1fr)",
              gap: 12,
              marginBottom: 16,
            }}
          >
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
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
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

            <div>
              <div style={{ marginBottom: 6, fontSize: 13, color: "#666" }}>
                예약 제목
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 알고리즘 공부"
                style={inputStyle}
              />
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
                const description = isServerUnavailable
                  ? getAvailabilityReasonText(slot.reason)
                  : unavailable
                  ? `${durationHours}시간 연속 선택 불가`
                  : ""
                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    disabled={unavailable || isServerUnavailable || busy}
                    onClick={() => {
                      if (unavailable) return
                      setSelectedTime(slot.startTime)
                    }}
                    style={ getSlotButtonStyleV2(unavailable, selected)}
                    onMouseEnter={(e) => {
                        if (!unavailable && !selected) {
                          e.currentTarget.style.border = "1px solid #2563eb"
                          e.currentTarget.style.background = "#eff6ff"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!unavailable && !selected) {
                          e.currentTarget.style.border = "1px solid #d1d5db"
                          e.currentTarget.style.background = "#ffffff"
                        }
                      }}
                    title={description}
                  >
                    <div
                      style={slotTimeTextStyle}
                    >
                      {hhmm(slot.startTime)}
                    </div>

                    <div
                      style={{
                        ...slotDescriptionStyle,
                        color: unavailable ? "#ef4444" : "#f59e0b",
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
              disabled={busy}
              onClick={onCreate}
              style={{
                ...primaryButtonStyle,
                opacity: busy ? 0.6 : 1,
              }}
            >
              예약하기
            </button>
          </div>
        </div>
      </>
    )}

    <div style={{ ...cardStyle, display: "grid", gap: 10 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
  <div style={{ fontSize: 20, fontWeight: 800 }}>
    {scope === "mine" ? "내 예약 목록" : "예약 목록"}
  </div>

  {scope === "mine" && (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          borderRadius: 999,
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 700,
          background: "#f0fdf4",
          color: "#15803d",
          border: "1px solid #bbf7d0",
        }}
      >
        예정 {reservationSummary.upcoming}건
      </span>

      <span
        style={{
          borderRadius: 999,
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 700,
          background: "#eef6ff",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }}
      >
        오늘 {reservationSummary.todayCount}건
      </span>

      <span
        style={{
          borderRadius: 999,
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 700,
          background: "#f5f5f5",
          color: "#777",
          border: "1px solid #e5e5e5",
        }}
      >
        지난 {reservationSummary.past}건
      </span>
    </div>
      )}
    </div>

    {items.length === 0 ? (
      <div style={mutedBoxStyle}>{emptyText}</div>
    ) : (
      Object.entries(groupedItems).map(([groupDate, reservations]) => (
        <div key={groupDate} style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#555",
              marginTop: 4,
              paddingLeft: 2,
            }}
          >
            {groupDate}
          </div>

          {reservations.map((r) => {
            const isMine = meId != null && r.memberId === meId
            const statusLabel = getReservationStatus(r.date, r.endTime)
            const statusStyle = getReservationStatusStyle(statusLabel)
            const cancelable = isCancelable(r.date, r.startTime)

            return (
              <div
                key={r.id}
                style={{
                  ...listItemCardStyle,
                  opacity: statusLabel === "지난 예약" ? 0.72 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 16 }}>
                        {hhmm(r.startTime)} ~ {hhmm(r.endTime)}
                      </div>

                      <span
                        style={{
                          ...statusStyle,
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#777", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span>{r.roomName}</span>
                      {scope === "all" && <span>· {r.memberNickname}</span>}
                      {r.studyId ? (
                        <button type="button" onClick={() => onMoveToStudyPost(r.postId)}
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: "#eef4ff",
                            border: "1px solid #d0dcff",
                            color: "#1d4ed8",
                            fontWeight: 600,
                          }}
                        >
                          스터디
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: "#f5f5f5",
                            border: "1px solid #ddd",
                            color: "#555",
                            fontWeight: 600,
                          }}
                        >
                          개인
                        </span>
                      )}
                    </div>
                  </div>
                  {isMine && cancelable && (
                    <button
                      disabled={busy}
                      onClick={() => onCancel(r.id)}
                      style={secondaryButtonStyle}
                    >
                      취소
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 6, fontSize: 12 }}>
                {cancelable ? (
                  <span style={{ color: "#15803d", fontWeight: 600 }}>
                    취소 가능
                  </span>
                ) : (
                  <span style={{ color: "#999" }}>
                    취소 불가
                  </span>
                )}
                {r.studyId && r.postId && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => onMoveToStudyPost(r.postId)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#1d4ed8",
                      cursor: "pointer",
                      fontSize: 12,
                      textDecoration: "underline",
                    }}
                  >
                    스터디 글 보기
                  </button>
                </div>
              )}
              </div>
              </div>
            )
          })}
        </div>
      ))
    )}
  </div>
  </div>
)
}