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

type Scope = "all" | "mine"

type Query = {
  scope?: Scope
  date?: string
}

function hhmm(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function today() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
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

      if (nextScope !== "all") params.scope = nextScope
      if (nextScope === "all" && nextDate !== today()) params.date = nextDate
      if (nextScope === "all" && nextDate === today()) {
        // today는 기본값처럼 다뤄서 URL 짧게 유지
      } else if (nextScope === "all") {
        params.date = nextDate
      }

      setSp(params, { replace: options?.replace ?? false })
    },
    [sp, setSp]
  )

  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)

  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("19:00")
  const [endTime, setEndTime] = useState("20:00")

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
  }, [scope, date, loggedIn, setQuery])

  const emptyText = useMemo(() => {
    if (scope === "mine") {
      return loggedIn ? "내 예약이 없어요" : "로그인 후 내 예약을 확인할 수 있어요"
    }
    return "해당 날짜 예약이 없어요"
  }, [scope, loggedIn])

  const onCreate = async () => {
    if (!loggedIn) {
      setErr("로그인 후 예약할 수 있어요")
      nav("/login", { state: { from: { pathname: "/reservations", search: `?${sp.toString()}` } } })
      return
    }

    if (!roomId) return setErr("방을 선택하세요")

    const t = title.trim()
    if (!t) return setErr("예약 제목을 입력하세요")
    if (!(startTime < endTime)) return setErr("시간을 확인하세요")

    try {
      setBusy(true)
      setErr(null)

      await createReservation({
        roomId,
        date,
        startTime,
        endTime,
        title: t,
      })

      setTitle("")

      if (scope === "mine") await loadMine()
      else await loadAll()
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) setErr("이미 예약된 시간대입니다.")
      else if (status === 400) setErr("예약 시간을 확인해주세요.")
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
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>예약</h1>

      {err && <div style={{ color: "crimson", marginBottom: 10 }}>{err}</div>}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {scope === "all" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#666" }}>날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setQuery({ date: e.target.value })}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setQuery({ scope: "all" })}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              background: scope === "all" ? "#111" : "#fff",
              color: scope === "all" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            전체 예약
          </button>

          <button
            onClick={() => {
              if (!loggedIn) {
                setErr("로그인 후 내 예약을 확인할 수 있어요")
                nav("/login", {
                  state: { from: { pathname: "/reservations", search: `?${sp.toString()}` } },
                })
                return
              }
              setQuery({ scope: "mine" })
            }}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              background: scope === "mine" ? "#111" : "#fff",
              color: scope === "mine" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            내 예약
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #eee", padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>예약 만들기</div>

        {!loggedIn && (
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
            로그인 후 예약할 수 있어요
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={roomId?.toString() ?? ""}
            onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : null)}
            style={{ padding: "8px 10px", border: "1px solid #ddd" }}
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

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예약 제목"
            style={{ flex: 1, minWidth: 220, padding: "8px 10px", border: "1px solid #ddd" }}
          />

          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <button
            disabled={busy}
            onClick={onCreate}
            style={{ padding: "8px 12px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            예약
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #eee", color: "#666" }}>{emptyText}</div>
        ) : (
          items.map((r) => {
            const isMine = meId != null && r.memberId === meId

            return (
              <div key={r.id} style={{ padding: 12, border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div>
                    <b>
                      {hhmm(r.startTime)} ~ {hhmm(r.endTime)}
                    </b>{" "}
                    <span style={{ color: "#666" }}>· {r.roomName}</span>
                    {scope === "mine" && <span style={{ color: "#999" }}> · {r.date}</span>}
                  </div>

                  {isMine && (
                    <button
                      disabled={busy}
                      onClick={() => onCancel(r.id)}
                      style={{ padding: "6px 10px", border: "1px solid #eee", background: "#f6f6f6", cursor: "pointer" }}
                    >
                      취소
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 6 }}>{r.title}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}