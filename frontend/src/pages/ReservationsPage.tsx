import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { listRooms, type RoomResponse } from "../api/rooms"
import {
  cancelReservation,
  createReservation,
  listMyReservations,
  listReservations,
  type ReservationResponse,
} from "../api/reservations"
import { tokenStore } from "../auth/token"
import { getMeId } from "../api/members"
import { apiErrorMessage } from "../api/error"
import {
  addHours,
  makeTimeSlots,
  canReserveStartTime,
  today,
} from "../utils/reservationTime"

import { ReservationTimeline } from "./RservationTimeline"
import { pageStyle, cardStyle, inputStyle, primaryButtonStyle, secondaryButtonStyle, 
  mutedBoxStyle, listItemCardStyle, errorBoxStyle, getSlotButtonStyle } from "../ui/properties"

type Scope = "all" | "mine"

type Query = {
  scope?: Scope
  date?: string
}

function hhmm(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function toScope(v: string | null): Scope {
  return v === "mine" ? "mine" : "all"
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

  const [title, setTitle] = useState("")
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)

  const [items, setItems] = useState<ReservationResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      page: 0,
      size: 50,
      sort: "date,desc",
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
  }, [scope, date, roomId, loggedIn, setQuery])

  useEffect(() => {
    setSelectedTime(null)
  }, [date, roomId, scope, durationHours])

  const emptyText = useMemo(() => {
    if (scope === "mine") {
      return loggedIn ? "내 예약이 없어요" : "로그인 후 내 예약을 확인할 수 있어요"
    }
    return "해당 날짜 예약이 없어요"
  }, [scope, loggedIn])

  const timeSlots = useMemo(() => makeTimeSlots(), [])

  const canReserveFromTime = useCallback(
    (time: string) => {
      return canReserveStartTime(items, roomId, time, durationHours)
    },
    [items, roomId, durationHours]
  )

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
                  disabled={unavailable || busy}
                  onClick={() => setSelectedTime(time)}
                  style={getSlotButtonStyle(unavailable, selected)}
                >
                  {time}
                </button>
              )
            })}
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
            <div style={mutedBoxStyle}>
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
      <div style={{ fontSize: 20, fontWeight: 800 }}>
        {scope === "mine" ? "내 예약 목록" : "예약 목록"}
      </div>

      {items.length === 0 ? (
        <div style={mutedBoxStyle}>{emptyText}</div>
      ) : (
        items.map((r) => {
          const isMine = meId != null && r.memberId === meId

          return (
            <div key={r.id} style={listItemCardStyle}>
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
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    {hhmm(r.startTime)} ~ {hhmm(r.endTime)}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#777" }}>
                    {r.roomName}
                    {scope === "mine" && ` · ${r.date}`}
                    {scope === "all" && ` · ${r.memberNickname}`}
                  </div>
                </div>

                {isMine && (
                  <button
                    disabled={busy}
                    onClick={() => onCancel(r.id)}
                    style={secondaryButtonStyle}
                  >
                    취소
                  </button>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 15 }}>{r.title}</div>
            </div>
          )
        })
      )}
    </div>
  </div>
)
}