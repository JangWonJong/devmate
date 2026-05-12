import { CalendarDays } from 'lucide-react'
import type { ReservationSpaceResponse } from '../../../api/reservation/reservationSpaces'
import type { AvailabilityResponse } from '../../../api/reservation/reservations'
import type { StudyResponse } from '../../../api/study/study'
import { addHours } from '../../../utils/reservationUtils'
import ReservationTimeSelector from '../../reservation/slot/ReservationTimeSelector'

type StudyReservationCreateSectionProps = {
  study: StudyResponse
  date: string
  reservationSpaceId: number | null
  reservationSpaces: ReservationSpaceResponse[]
  placeDetail: string
  placeMode: 'INTERNAL' | 'EXTERNAL'
  durationHours: number
  selectedTime: string | null
  saving: boolean
  availability: AvailabilityResponse | null
  availabilityLoading: boolean
  onChangeDate: (value: string) => void
  onChangeReservationSpaceId: (reservationSpaceId: number | null) => void
  onChangePlaceDetail: (value: string) => void
  onChangeDurationHours: (hours: number) => void
  onChangeSelectedTime: (time: string | null) => void
  onCreate: () => void
}

export default function StudyReservationCreateSection({
  study,
  date,
  reservationSpaceId,
  reservationSpaces,
  placeDetail,
  placeMode,
  durationHours,
  selectedTime,
  saving,
  availability,
  availabilityLoading,
  onChangeDate,
  onChangeReservationSpaceId,
  onChangePlaceDetail,
  onChangeDurationHours,
  onChangeSelectedTime,
  onCreate,
}: StudyReservationCreateSectionProps) {
  
  const internalSpaces = reservationSpaces.filter(
    (space) => space.providerType === 'INTERNAL'
  )

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-slate-500" />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          스터디 예약 만들기
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">날짜</div>
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {study.placeName?.trim() ? (
          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">
              예약 장소
            </div>

            <div className="flex h-12 w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800">
              {study.placeName}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">
              예약 공간
            </div>

            <select
              value={reservationSpaceId?.toString() ?? ''}
              onChange={(e) =>
                onChangeReservationSpaceId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="" disabled>
                공간 선택
              </option>

              {internalSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">
            상세 위치
          </label>

          <input
            type="text"
            value={placeDetail}
            onChange={(e) => onChangePlaceDetail(e.target.value)}
            placeholder={
              placeMode === 'EXTERNAL'
                ? '예: 지하 1층 / 창가 좌석'
                : '예: 2층 창가 / 예약'
            }
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-slate-500">
            예약 시간
          </div>
          <select
            value={durationHours}
            onChange={(e) => onChangeDurationHours(Number(e.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value={1}>1시간</option>
            <option value={2}>2시간</option>
            <option value={3}>3시간</option>
          </select>
        </div>
      </div>

      <ReservationTimeSelector
        mode={placeMode}
        availability={availability}
        availabilityLoading={availabilityLoading}
        durationHours={durationHours}
        selectedTime={selectedTime}
        busy={saving}
        onChangeSelectedTime={onChangeSelectedTime}
      />

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Selected Time
          </div>
          <div
            className={`mt-1 text-sm font-semibold ${
              selectedTime ? 'text-indigo-600' : 'text-slate-600'
            }`}
          >
            {selectedTime ? (
              <>
                선택한 시간:{' '}
                <span className="font-bold">
                  {selectedTime} ~ {addHours(selectedTime, durationHours)}
                </span>{' '}
                ({durationHours}시간)
              </>
            ) : (
              '시간을 선택하세요'
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={onCreate}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          스터디 예약하기
        </button>
      </div>
    </section>
  )
}
