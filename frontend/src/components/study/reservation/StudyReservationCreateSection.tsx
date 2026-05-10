import { CalendarDays, Clock3 } from 'lucide-react'
import type { ReservationSpaceResponse } from '../../../api/reservation/reservationSpaces'
import type { AvailabilityResponse } from '../../../api/reservation/reservations'
import type { StudyResponse } from '../../../api/study/study'
import {
  addHours,
  canSelectDuration,
  getSlotDescription,
  hhmm,
} from '../../../utils/reservationUtils'

function SlotButton({
  disabled,
  selected,
  time,
  description,
  onClick,
}: {
  disabled: boolean
  selected: boolean
  time: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={description}
      className={`rounded-2xl border px-3 py-4 text-left transition ${
        selected
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm'
      }`}
    >
      <div
        className={`text-lg font-bold ${selected ? 'text-white' : 'text-slate-800'}`}
      >
        {hhmm(time)}
      </div>

      <div
        className={`mt-2 min-h-[20px] text-xs leading-5 ${
          selected
            ? 'text-indigo-100'
            : disabled
              ? description.includes('이미')
                ? 'text-rose-500'
                : 'text-amber-500'
              : 'text-transparent'
        }`}
      >
        {description || ' '}
      </div>
    </button>
  )
}

type StudyReservationCreateSectionProps = {
  study: StudyResponse
  date: string
  reservationSpaceId: number | null
  reservationSpaces: ReservationSpaceResponse[]
  placeDetail: string
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

              {reservationSpaces.map((space) => (
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
            placeholder="예: 2층 창가 / 예약자명 WJ"
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

      <div className="mb-3 mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Clock3 className="h-4 w-4" />
        <span>시간 선택 (1시간 단위)</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {availabilityLoading ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            예약 가능 시간을 불러오는 중이에요.
          </div>
        ) : !availability ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            예약 장소와 날짜를 선택하면 예약 가능 시간을 확인할 수 있어요.
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
              <SlotButton
                key={`${slot.startTime}-${slot.endTime}`}
                disabled={unavailable || isServerUnavailable || saving}
                selected={selected}
                time={slot.startTime}
                description={description}
                onClick={() => {
                  if (unavailable || isServerUnavailable || saving) return
                  onChangeSelectedTime(slot.startTime)
                }}
              />
            )
          })
        )}
      </div>

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
