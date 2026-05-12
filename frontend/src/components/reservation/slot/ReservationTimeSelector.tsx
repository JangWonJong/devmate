import { Clock3 } from 'lucide-react'
import type { AvailabilityResponse } from '../../../api/reservation/reservations'
import {
  canSelectDuration,
  getAvailabilityReasonText,
  hhmm,
} from '../../../utils/reservationUtils'
import { TIMES } from './slotutils'

type ReservationTimeSelectorProps = {
  mode: 'INTERNAL' | 'EXTERNAL'
  availability: AvailabilityResponse | null
  availabilityLoading: boolean
  durationHours: number
  selectedTime: string | null
  busy: boolean
  onChangeSelectedTime: (time: string | null) => void
}

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
              ? description.includes('이미') || description.includes('예약')
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

export default function ReservationTimeSelector({
  mode,
  availability,
  availabilityLoading,
  durationHours,
  selectedTime,
  busy,
  onChangeSelectedTime,
}: ReservationTimeSelectorProps) {
  const isInternal = mode === 'INTERNAL'

  const externalSlots = TIMES.map((time) => ({
    startTime: time,
    endTime: time,
    available: true,
    reason: null,
  }))

  const slots = isInternal ? availability?.slots : externalSlots

  return (
    <div className="mt-6">
      {mode === 'EXTERNAL' && (
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm text-indigo-700">
          외부 장소는 실제 공간 예약이 아닌 스터디 장소 공유 용도로 사용돼요.
        </div>
      )}

      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Clock3 className="h-4 w-4" />
        <span>시간 선택 (1시간 단위)</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isInternal && availabilityLoading ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            예약 가능 시간을 불러오는 중이에요.
          </div>
        ) : isInternal && !availability ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            예약 장소와 날짜를 선택하면 예약 가능 시간을 확인할 수 있어요.
          </div>
        ) : (
          slots?.map((slot) => {
            const unavailable = isInternal
              ? !canSelectDuration(
                  availability?.slots ?? [],
                  slot.startTime,
                  durationHours
                )
              : false

            const isServerUnavailable = isInternal ? !slot.available : false
            const selected = selectedTime === slot.startTime

            const description = isInternal
              ? isServerUnavailable
                ? getAvailabilityReasonText(slot.reason)
                : unavailable
                  ? `${durationHours}시간 연속 선택 불가`
                  : ''
              : ''

            return (
              <SlotButton
                key={slot.startTime}
                disabled={unavailable || isServerUnavailable || busy}
                selected={selected}
                time={slot.startTime}
                description={description}
                onClick={() => {
                  if (unavailable || isServerUnavailable || busy) return
                  onChangeSelectedTime(slot.startTime)
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
