import { type ExternalReservationTimeSelectorProps } from './slotutils'
import { TIMES } from './slotutils'


export default function ExternalReservationTimeSelector({
  selectedTime,
  onChangeSelectedTime,
}: ExternalReservationTimeSelectorProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm text-indigo-700">
        외부 장소는 실제 공간 예약이 아닌 스터디 장소 공유 용도로 사용돼요.
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-500">
          시작 시간 선택
        </div>

        <select
          value={selectedTime ?? ''}
          onChange={(e) => onChangeSelectedTime(e.target.value || null)}
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="" disabled>
            시간을 선택하세요
          </option>

          {TIMES.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
