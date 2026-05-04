import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { listRooms, type RoomResponse } from "../../api/reservation/rooms"
import {
  createStudyReservation,
  getRoomAvailability,
  listReservations,
  type AvailabilityResponse,
  type ReservationResponse,
} from "../../api/reservation/reservations"
import { getStudy, type StudyResponse } from "../../api/study/study"
import { apiErrorMessage } from "../../utils/error"
import {
  addHours,
  today,
} from "../../utils/reservationUtils"
import StudyInfoCard from "../../components/study/reservation/StudyInfoCard"
import StudyReservationCreateSection from "../../components/study/reservation/StudyReservationCreateSection"
import StudyReservationStatusSection from "../../components/study/reservation/StudyReservationStatusSection"
import { tokenStore } from "../../api/auth/token"
import { PageContainer } from "../../layouts/PageContainer"

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

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
      if (!roomId || !date) return
  
      const token = tokenStore.getAccess()
      if (!token) return
  
      const es = new EventSource(
        `${import.meta.env.VITE_API_BASE_URL}/api/reservations/subscribe?roomId=${roomId}&date=${date}&token=${encodeURIComponent(token)}`
      )
  
      es.onmessage = () => {
        refreshAvailability()
        loadAll()
      }
  
      return () => {
        es.close()
      }
    }, [roomId, date, refreshAvailability, loadAll])

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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        불러오는 중...
      </div>
    )
  }

  if (!study) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        스터디 정보를 찾을 수 없어요.
      </div>
    )
  }

  return (
  <PageContainer>
  <div className="mx-auto w-full max-w-6xl space-y-6">
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Study Reservation
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          스터디 예약
        </h1>
        <p className="mt-2 text-lg leading-8 text-slate-600">
          가능한 시간대를 확인하고 스터디 예약을 진행해보세요.
        </p>
      </div>

      <button
        type="button"
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로가기
      </button>
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div className="space-y-6">
        <StudyInfoCard study={study} />

        <StudyReservationCreateSection
          date={date}
          roomId={roomId}
          rooms={rooms}
          durationHours={durationHours}
          selectedTime={selectedTime}
          saving={saving}
          availability={availability}
          availabilityLoading={availabilityLoading}
          onChangeDate={setDate}
          onChangeRoomId={setRoomId}
          onChangeDurationHours={setDurationHours}
          onChangeSelectedTime={setSelectedTime}
          onCreate={onCreate}
        />
      </div>

      <StudyReservationStatusSection
        roomId={roomId}
        items={items}
        selectedTime={selectedTime}
        durationHours={durationHours}
      />
    </div>
    </div>
  </PageContainer>
)
}