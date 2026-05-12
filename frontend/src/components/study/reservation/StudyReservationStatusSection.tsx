import type { ReservationResponse } from '../../../api/reservation/reservations'
import { addHours } from '../../../utils/reservationUtils'
import { ReservationTimeline } from '../../reservation/realtime/ReservationTimeline'
import { MapPin } from 'lucide-react'
import { hhmm } from '../../../utils/reservationUtils'

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

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">오늘 예약</h3>
        <span className="text-xs text-slate-400">{items.length}건</span>
      </div>

      <div className="space-y-3">
        {items.map((reservation) => {
          const isExternal = reservation.providerType === 'USER_INPUT'

          return (
            <div
              key={reservation.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-bold text-slate-900">
                  {hhmm(reservation.startTime)} ~ {hhmm(reservation.endTime)}
                </div>

                {reservation.studyId && (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    스터디 예약
                  </span>
                )}

                {isExternal ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    외부 장소
                  </span>
                ) : (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    DevMine 공간
                  </span>
                )}
              </div>

              <div className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
                {reservation.title}
              </div>

              <div className="mt-2 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {reservation.reservationSpaceName}
                  </div>

                  {reservation.reservationSpaceAddress && (
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {reservation.reservationSpaceAddress}
                    </div>
                  )}

                  {reservation.placeDetail && (
                    <div className="mt-1 truncate text-xs text-slate-500">
                      상세 위치 · {reservation.placeDetail}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                예약자 · {reservation.memberNickname}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
