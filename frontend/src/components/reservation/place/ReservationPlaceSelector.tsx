import type {
  PlaceSelection,
  ReservationSpaceResponse,
} from '../../../api/reservation/reservationSpaces'

type ReservationPlaceSelectorProps = {
  reservationSpaceId: number | null
  reservationSpaces: ReservationSpaceResponse[]
  selectedPlace: PlaceSelection | null
  placeDetail: string
  placeModalOpen: boolean
  placeMode: 'EXTERNAL' | 'INTERNAL'

  onChangeReservationSpaceId: (reservationSpaceId: number | null) => void
  onChangeSelectedPlace: (place: PlaceSelection | null) => void
  onChangePlaceDetail: (value: string) => void
  onOpenPlaceModal: () => void
  onClosePlaceModal: () => void
  onChangePlaceMode: (mode: 'EXTERNAL' | 'INTERNAL') => void
}

export default function ReservationPlaceSelector({
  reservationSpaceId,
  reservationSpaces,
  selectedPlace,
  placeDetail,
  placeMode,
  onChangeReservationSpaceId,
  onChangeSelectedPlace,
  onChangePlaceDetail,
  onOpenPlaceModal,
  onChangePlaceMode,
}: ReservationPlaceSelectorProps) {
  const internalSpaces = reservationSpaces.filter(
    (space) => space.providerType === 'INTERNAL'
  )

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 text-sm font-medium text-slate-500">예약 장소</div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onChangePlaceMode('INTERNAL')
                onChangeSelectedPlace(null)
              }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                placeMode === 'INTERNAL'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              DevMine 공간
            </button>

            <button
              type="button"
              onClick={() => {
                onChangePlaceMode('EXTERNAL')
                onChangeSelectedPlace(null)
              }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                placeMode === 'EXTERNAL'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              지도 장소
            </button>
          </div>

          {placeMode === 'INTERNAL' ? (
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
                DevMine 공간 선택
              </option>

              {internalSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenPlaceModal}
                className="h-12 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-4 text-left text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                지도에서 장소 선택
              </button>

              {selectedPlace && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-4">
                  <div className="text-sm font-bold text-slate-900">
                    {selectedPlace.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {selectedPlace.address}
                  </div>

                  <button
                    type="button"
                    onClick={() => onChangeSelectedPlace(null)}
                    className="mt-3 text-xs font-semibold text-rose-500"
                  >
                    선택 해제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-500">상세 위치</div>
        <input
          value={placeDetail}
          onChange={(e) => onChangePlaceDetail(e.target.value)}
          placeholder={
            selectedPlace ? '예: 지하 1층 / 창가 좌석' : '예: A룸 / 2층 회의실'
          }
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
    </div>
  )
}
