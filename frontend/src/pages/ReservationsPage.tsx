import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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

type Scope = "all" | "mine"

export function ReservationsPage() {
  const nav = useNavigate()

  const [scope, setScope] = useState<Scope>("all")

  // 예약 조회 조건
  const [date, setDate] = useState(today())

  // 생성 폼(방은 생성할 때만 필요)
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("19:00")
  const [endTime, setEndTime] = useState("20:00")

  // auth / me
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)

  // list state
  const [items, setItems] = useState<ReservationResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 로그인 상태 동기화
  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  // 내 id (취소 버튼 표시)
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

  // 방 목록(생성 폼용)
  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        const res = await listRooms()
        setRooms(res)
        setRoomId((prev) => (prev == null ? res[0]?.id ?? null : prev))
      } catch (e: any) {
        setErr(apiErrorMessage(e, "방 목록 조회 실패"))
      }
    })()
  }, [])

  // scope/date 기준으로 목록 재조회
  const reload = async () => {
    setErr(null)

    if (scope === "mine") {
      if (!loggedIn) {
        // 안전장치: 비로그인인데 mine이면 all로 되돌림
        setScope("all")
        return
      }
      const page = await listMyReservations({ page: 0, size: 50, sort: "date,desc" })
      setItems(page.content)
      return
    }

    // ✅ A안: 전체예약은 "date 기준 전체 룸"
    const page = await listReservations({
      date,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })
    setItems(page.content)
  }

  useEffect(() => {
    ;(async () => {
      try {
        await reload()
      } catch (e: any) {
        setErr(apiErrorMessage(e, "예약 조회 실패"))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, date, loggedIn])

  const emptyText = useMemo(() => {
    if (scope === "mine") return loggedIn ? "내 예약이 없어요" : "로그인 후 내 예약을 확인할 수 있어요"
    return "해당 날짜 예약이 없어요"
  }, [scope, loggedIn])

  const onCreate = async () => {
    if (!loggedIn) {
      setErr("로그인 후 예약할 수 있어요")
      nav("/login", { state: { from: { pathname: "/reservations" } } })
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

      // ✅ 생성 후에도 현재 scope 기준으로 재조회 (A안 유지)
      await reload()
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) {
        setErr("이미 예약된 시간대입니다.")
      } else if (status === 400) {
        setErr("예약 시간을 확인해주세요.")
      } else {
        setErr(apiErrorMessage(e, "예약 생성 실패"))
      }
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

      // mine이면 그냥 재조회(서버 기준 유지), all이면 리스트에서 제거도 ok
      if (scope === "mine") {
        await reload()
      } else {
        setItems((prev) => prev.filter((r) => r.id !== id))
      }
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

      {/* 토글 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setScope("all")}
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
              nav("/login", { state: { from: { pathname: "/reservations" } } })
              return
            }
            setScope("mine")
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

      {/* 날짜(전체예약 기준 필터) */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#666" }}>날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* 예약 생성 */}
      <div style={{ border: "1px solid #eee", padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>예약 만들기</div>

        {!loggedIn && (
          <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>로그인 후 예약할 수 있어요</div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={roomId?.toString() ?? ""}
            onChange={(e) => {
              const v = e.target.value
              setRoomId(v ? Number(v) : null)
            }}
            style={{ padding: "6px 8px" }}
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

      {/* 예약 목록 */}
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