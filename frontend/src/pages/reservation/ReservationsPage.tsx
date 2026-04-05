import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { listRooms, type RoomResponse } from "../../api/rooms"
import {
  cancelReservation,
  createReservation,
  listMyReservations,
  listReservations,
  type ReservationResponse,
  type AvailabilityResponse,
  getRoomAvailability,
} from "../../api/reservations"
import { tokenStore } from "../../auth/token"
import { getMeId } from "../../api/members"
import { apiErrorMessage } from "../../utils/error"
import { addHours, today } from "../../utils/reservationUtils"
import ReservationCreateSection from "../../components/reservation/ReservationCreateSection"
import ReservationListSection from "../../components/reservation/ReservationListSection"

type Scope = "all" | "mine"

type Query = {
  scope?: Scope
  date?: string
}

function getReservationStatus(date: string, endTime: string) {
  const now = new Date()
  const end = new Date(`${date}T${endTime}`)

  if (end < now) return "지난 예약"

  const todayStr = new Date().toISOString().slice(0, 10)
  if (date === todayStr) return "오늘 예약"

  return "예정 예약"
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

function ScopeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: "upcoming" | "today" | "past"
}) {
  const className =
    tone === "upcoming"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "today"
      ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border border-slate-200 bg-slate-100 text-slate-500"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const refreshAvailability = useCallback(async () => {
    if (scope !== "all" || !roomId || !date) {
      setAvailability(null)
      return
    }

    try {
      setAvailabilityLoading(true)
      const res = await getRoomAvailability(roomId, date)
      setAvailability(res)
    } catch (e: any) {
      const status = e?.response?.status

      if (status === 401 || status === 403) {
        setAvailability(null)
        return
      }

      setAvailability(null)
      setErr(apiErrorMessage(e, "예약 가능 시간 조회 실패"))
    } finally {
      setAvailabilityLoading(false)
    }
  }, [scope, roomId, date])

  const loadAll = useCallback(async () => {
    const page = await listReservations({
      date,
      roomId,
      page: 0,
      size: 50,
      sort: "startTime,asc",
    })
    setItems(page.content)
  }, [date, roomId])

  const loadMine = useCallback(async () => {
    const page = await listMyReservations({
      date: mineDate || undefined,
      page: 0,
      size: 50,
      sort: mineDate ? "startTime,asc" : "date,desc",
    })
    setItems(page.content)
  }, [mineDate])

  const onCreate = async () => {
    if (!loggedIn) {
      setErr("로그인 후 예약할 수 있어요")
      nav("/login", {
        state: { from: { pathname: "/reservations", search: `?${sp.toString()}` } },
      })
      return
    }

    if (!roomId) {
      setErr("방을 선택하세요")
      return
    }

    const t = title.trim()
    if (!t) {
      setErr("예약 제목을 입력하세요")
      return
    }

    if (!selectedTime) {
      setErr("예약 시간을 선택하세요")
      return
    }

    setSuccessMessage(null)

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

      setSuccessMessage("예약이 완료되었어요")
      setTitle("")
      setSelectedTime(null)
      setDurationHours(1)

      if (scope === "mine") {
        await loadMine()
      } else {
        await loadAll()
        await refreshAvailability()
      }
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) setErr("이미 예약된 시간대입니다.")
      else setErr(apiErrorMessage(e, "예약 생성 실패"))
    } finally {
      setBusy(false)
    }
  }

  const onCancel = async (id: number) => {
    const ok = confirm("예약을 취소할까요?")
    if (!ok) return

    setSuccessMessage(null)

    try {
      setBusy(true)
      setErr(null)
      await cancelReservation(id)
      setSuccessMessage("예약이 취소되었어요")

      if (scope === "mine") {
        await loadMine()
      } else {
        await loadAll()
        await refreshAvailability()
      }
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

    return { upcoming, todayCount, past }
  }, [items])

  const onMoveToStudyPost = (postId: number | null) => {
    if (!postId) return
    nav(`/posts/${postId}`)
  }

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
    if (scope !== "all" || !roomId || !date) return

    const token = tokenStore.getAccess()
    if (!token) return

    const es = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/api/reservations/subscribe?roomId=${roomId}&date=${date}&token=${encodeURIComponent(token)}`
    )

    es.onmessage = (e) => {
      if (e.data === "connected") return
      void refreshAvailability()
      void loadAll()
    }

    return () => {
      es.close()
    }
  }, [scope, roomId, date, refreshAvailability, loadAll])

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
        const status = e?.response?.status

        if (status === 401 || status === 403) {
          setRooms([])
          setRoomId(null)
          return
        }

        setErr(apiErrorMessage(e, "방 목록 조회 실패"))
      }
    })()
  }, [])

  useEffect(() => {
    void refreshAvailability()
  }, [refreshAvailability])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [successMessage])

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
        const status = e?.response?.status

        if (scope === "all" && (status === 401 || status === 403)) {
          setItems([])
          return
        }

        setErr(apiErrorMessage(e, "예약 조회 실패"))
      }
    })()
  }, [scope, loggedIn, setQuery, loadMine, loadAll])

  useEffect(() => {
    setSelectedTime(null)
  }, [date, roomId, scope, durationHours])

  const emptyText = useMemo(() => {
    if (scope === "mine") {
      return loggedIn ? "내 예약이 없어요" : "로그인 후 내 예약을 확인할 수 있어요"
    }
    return "해당 날짜 예약이 없어요"
  }, [scope, loggedIn])

  
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">personal Reservation</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">예약</h1>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            스터디룸 예약 현황을 확인하고 원하는 시간대를 선택해보세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ScopeTab active={scope === "all"} onClick={() => setQuery({ scope: "all" })}>
            전체 예약
          </ScopeTab>

          <ScopeTab
            active={scope === "mine"}
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
          >
            내 예약
          </ScopeTab>
        </div>
      </section>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {scope === "mine" ? (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-500">날짜 필터</span>
                <input
                  type="date"
                  value={mineDate}
                  onChange={(e) => setMineDate(e.target.value)}
                  className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setMineDate("")}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  전체 보기
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill label={`예정 ${reservationSummary.upcoming}건`} tone="upcoming" />
                <StatusPill label={`오늘 ${reservationSummary.todayCount}건`} tone="today" />
                <StatusPill label={`지난 ${reservationSummary.past}건`} tone="past" />
              </div>
            </div>
          </section>

          <ReservationListSection
            title="내 예약 목록"
            items={items}
            groupedItems={groupedItems}
            emptyText={emptyText}
            scope={scope}
            meId={meId}
            busy={busy}
            getReservationStatus={getReservationStatus}
            isCancelable={isCancelable}
            onCancel={onCancel}
            onMoveToStudyPost={onMoveToStudyPost}
          />
        </>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <ReservationCreateSection
            date={date}
            roomId={roomId}
            rooms={rooms}
            durationHours={durationHours}
            title={title}
            selectedTime={selectedTime}
            loggedIn={loggedIn}
            busy={busy}
            items={items}
            availability={availability}
            availabilityLoading={availabilityLoading}
            onChangeDate={(value) => setQuery({ date: value })}
            onChangeRoomId={setRoomId}
            onChangeDurationHours={setDurationHours}
            onChangeTitle={setTitle}
            onChangeSelectedTime={setSelectedTime}
            onCreate={onCreate}
          />

          <ReservationListSection
            title="예약 목록"
            items={items}
            groupedItems={groupedItems}
            emptyText={emptyText}
            scope={scope}
            meId={meId}
            busy={busy}
            getReservationStatus={getReservationStatus}
            isCancelable={isCancelable}
            onCancel={onCancel}
            onMoveToStudyPost={onMoveToStudyPost}
          />
        </div>
      )}
    </div>
  )
}