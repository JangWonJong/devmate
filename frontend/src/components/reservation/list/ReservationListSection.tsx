import type { ReservationResponse } from '../../../api/reservation/reservations'
import ReservationCard from '../create/ReservationCard'

type Scope = 'all' | 'mine'

type ReservationListSectionProps = {
  title: string
  items: ReservationResponse[]
  groupedItems: Record<string, ReservationResponse[]>
  emptyText: string
  scope: Scope
  meId: number | null
  busy: boolean
  getReservationStatus: (date: string, endTime: string) => string
  isCancelable: (date: string, startTime: string) => boolean
  onCancel: (id: number) => void
  onMoveToStudyPost: (postId: number | null) => void
}

export default function ReservationListSection({
  title,
  items,
  groupedItems,
  emptyText,
  scope,
  meId,
  busy,
  getReservationStatus,
  isCancelable,
  onCancel,
  onMoveToStudyPost,
}: ReservationListSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedItems).map(([groupDate, reservations]) => (
            <div key={groupDate} className="space-y-3">
              <div className="text-sm font-semibold text-slate-500">
                {groupDate}
              </div>

              <div className="space-y-3">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    scope={scope}
                    meId={meId}
                    busy={busy}
                    getReservationStatus={getReservationStatus}
                    isCancelable={isCancelable}
                    onCancel={onCancel}
                    onMoveToStudyPost={onMoveToStudyPost}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
