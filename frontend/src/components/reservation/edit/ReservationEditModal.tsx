import { useEffect, useState } from 'react'
import type { ReservationResponse } from '../../../api/reservation/reservations'
import { addHours, hhmm } from '../../../utils/reservationUtils'
import { TIMES } from '../slot/slotutils' 

type Props = {
  open: boolean
  reservation: ReservationResponse | null
  busy: boolean
  onClose: () => void
  onSubmit: (payload: {
    date: string
    startTime: string
    endTime: string
    title: string
    placeDetail?: string
  }) => void
}

export default function ReservationEditModal({
  open,
  reservation,
  busy,
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationHours, setDurationHours] = useState(1)
  const [placeDetail, setPlaceDetail] = useState('')

  useEffect(() => {
    if (!reservation) return

    setDate(reservation.date)
    setTitle(reservation.title)
    setStartTime(hhmm(reservation.startTime))

    const start = Number(reservation.startTime.split(':')[0])
    const end = Number(reservation.endTime.split(':')[0])

    setDurationHours(end - start)

    setPlaceDetail(reservation.placeDetail ?? '')
  }, [reservation])

  if (!open || !reservation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">예약 수정</h2>

          <p className="mt-2 text-sm text-slate-500">
            예약 정보를 수정할 수 있어요.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              제목
            </label>

            <input
              value={title}
              disabled={reservation.studyId != null}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-400 disabled:bg-slate-100 disabled:text-slate-500"
            />
            {reservation.studyId != null && (
              <p className="mt-2 text-xs text-slate-400">
                스터디 예약 제목은 스터디 글 제목을 기준으로 자동 관리돼요.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              날짜
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                시작 시간
              </label>

              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-400"
              >
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                이용 시간
              </label>

              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-400"
              >
                <option value={1}>1시간</option>
                <option value={2}>2시간</option>
                <option value={3}>3시간</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              상세 위치
            </label>

            <input
              value={placeDetail}
              onChange={(e) => setPlaceDetail(e.target.value)}
              placeholder="예: 창가 좌석 / 스터디룸 2번"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            예약 장소는 현재 수정할 수 없어요. 장소 변경이 필요하면 예약을
            취소한 뒤 다시 예약해주세요.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
          >
            취소
          </button>

          <button
            type="button"
            disabled={busy || !title.trim() || !date || !startTime}
            onClick={() =>
              onSubmit({
                date,
                startTime,
                endTime: addHours(startTime, durationHours),
                title: title.trim(),
                placeDetail: placeDetail.trim() || undefined,
              })
            }
            className="rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  )
}
