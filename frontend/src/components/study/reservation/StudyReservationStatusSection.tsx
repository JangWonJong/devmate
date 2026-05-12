import type { ReservationResponse } from '../../../api/reservation/reservations'
import { addHours } from '../../../utils/reservationUtils'
import { ReservationTimeline } from '../../reservation/realtime/ReservationTimeline'

type StudyReservationStatusSectionProps = {
  reservationSpaceId: number | null
  items: ReservationResponse[]
  selectedTime: string | null
  durationHours: number
}

export default function StudyReservationStatusSection({
  reservationSpaceId,
  items,
  selectedTime,
  durationHours,
}: StudyReservationStatusSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          예약 현황
        </h2>
        <p className="text-sm text-slate-500">실시간 예약 상태</p>
      </div>

      <ReservationTimeline
        items={items}
        reservationSpaceId={reservationSpaceId}
        previewStartTime={selectedTime}
        previewEndTime={
          selectedTime ? addHours(selectedTime, durationHours) : null
        }
      />
    </section>
  )
}
