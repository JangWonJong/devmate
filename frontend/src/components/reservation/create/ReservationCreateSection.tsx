import { CalendarDays } from 'lucide-react'
import type { PlaceSelection, ReservationSpaceResponse } from '../../../api/reservation/reservationSpaces'
import type {
  AvailabilityResponse,
  ReservationResponse,
} from '../../../api/reservation/reservations'
import {
  addHours,
} from '../../../utils/reservationUtils'
import { ReservationTimeline } from '../realtime/ReservationTimeline'
import ReservationPlaceSelector from '../place/ReservationPlaceSelector'
import ReservationTimeSelector from '../slot/ReservationTimeSelector'


type ReservationCreateSectionProps = {
  date: string
  reservationSpaceId: number | null
  reservationSpaces: ReservationSpaceResponse[]
  durationHours: number
  title: string
  selectedTime: string | null
  loggedIn: boolean
  busy: boolean
  items: ReservationResponse[]
  availability: AvailabilityResponse | null
  availabilityLoading: boolean
  selectedPlace: PlaceSelection | null
  placeDetail: string
  placeModalOpen: boolean
  placeMode: 'EXTERNAL' | 'INTERNAL'

  onChangeDate: (date: string) => void
  onChangeReservationSpaceId: (reservationSpaceId: number | null) => void
  onChangeDurationHours: (hours: number) => void
  onChangeTitle: (value: string) => void
  onChangeSelectedTime: (time: string | null) => void
  onCreate: () => void
  onChangeSelectedPlace: (place: PlaceSelection | null) => void
  onChangePlaceDetail: (value: string) => void
  onOpenPlaceModal: () => void
  onClosePlaceModal: () => void
  onChangePlaceMode: (mode: 'EXTERNAL' | 'INTERNAL') => void
}

export default function ReservationCreateSection({
  date,
  reservationSpaceId,
  reservationSpaces,
  durationHours,
  title,
  selectedTime,
  loggedIn,
  busy,
  items,
  availability,
  availabilityLoading,
  selectedPlace,
  placeDetail,
  placeModalOpen,
  placeMode,

  onChangeDate,
  onChangeReservationSpaceId,
  onChangeDurationHours,
  onChangeTitle,
  onChangeSelectedTime,
  onCreate,
  onChangeSelectedPlace,
  onChangePlaceDetail,
  onOpenPlaceModal,
  onClosePlaceModal,
  onChangePlaceMode,
}: ReservationCreateSectionProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            예약 현황
          </h2>
          <p className="text-sm text-slate-500">
            현재 예약 현황을 확인할 수 있어요.
          </p>
        </div>

        <div className="mt-4">
          <ReservationTimeline
            items={items}
            reservationSpaceId={reservationSpaceId}
            previewStartTime={selectedTime}
            previewEndTime={
              selectedTime ? addHours(selectedTime, durationHours) : null
            }
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-500" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            예약 만들기
          </h2>
        </div>

        {!loggedIn && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            로그인 후 예약할 수 있어요.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">날짜</div>

            <input
              type="date"
              value={date}
              onChange={(e) => onChangeDate(e.target.value)}
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

        <div className="mt-4">
          <ReservationPlaceSelector
            reservationSpaceId={reservationSpaceId}
            reservationSpaces={reservationSpaces}
            selectedPlace={selectedPlace}
            placeDetail={placeDetail}
            placeModalOpen={placeModalOpen}
            placeMode={placeMode}
            onChangeReservationSpaceId={onChangeReservationSpaceId}
            onChangeSelectedPlace={onChangeSelectedPlace}
            onChangePlaceDetail={onChangePlaceDetail}
            onOpenPlaceModal={onOpenPlaceModal}
            onClosePlaceModal={onClosePlaceModal}
            onChangePlaceMode={onChangePlaceMode}
          />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-slate-500">
            예약 제목
          </div>
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="예: 알고리즘 공부"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <ReservationTimeSelector
          mode={placeMode}
          availability={availability}
          availabilityLoading={availabilityLoading}
          durationHours={durationHours}
          selectedTime={selectedTime}
          busy={busy}
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
            disabled={busy}
            onClick={onCreate}
            className="
                  rounded-2xl px-4 py-2.5 text-sm font-semibold transition
                  bg-indigo-50 text-indigo-600
                  hover:bg-indigo-100
                  disabled:opacity-50
                "
          >
            예약하기
          </button>
        </div>
      </section>
    </div>
  )
}
