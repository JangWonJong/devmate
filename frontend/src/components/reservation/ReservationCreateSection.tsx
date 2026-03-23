import { CalendarDays, Clock3, DoorOpen } from "lucide-react"
import type { RoomResponse } from "../../api/rooms"
import type { AvailabilityResponse, ReservationResponse } from "../../api/reservations"
import { addHours, canSelectDuration, getAvailabilityReasonText, hhmm } from "../../utils/reservationUtils"
import { ReservationTimeline } from "../../pages/reservation/ReservationTimeline"

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
      className={`rounded-2xl border px-3 py-4 text-left transition ${
        selected
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
      }`}
      title={description}
    >
      <div className={`text-lg font-bold ${selected ? "text-white" : "text-slate-700"}`}>
        {hhmm(time)}
      </div>
      <div
        className={`mt-2 min-h-[20px] text-xs leading-5 ${
          selected
            ? "text-blue-100"
            : disabled
            ? description.includes("이미") || description.includes("예약")
              ? "text-red-500"
              : "text-amber-500"
            : "text-transparent"
        }`}
      >
        {description || " "}
      </div>
    </button>
  )
}

type ReservationCreateSectionProps = {
  date: string
  roomId: number | null
  rooms: RoomResponse[]
  durationHours: number
  title: string
  selectedTime: string | null
  loggedIn: boolean
  busy: boolean
  items: ReservationResponse[]
  availability: AvailabilityResponse | null
  availabilityLoading: boolean
  onChangeDate: (date: string) => void
  onChangeRoomId: (roomId: number | null) => void
  onChangeDurationHours: (hours: number) => void
  onChangeTitle: (value: string) => void
  onChangeSelectedTime: (time: string | null) => void
  onCreate: () => void
}

export default function ReservationCreateSection({
  date,
  roomId,
  rooms,
  durationHours,
  title,
  selectedTime,
  loggedIn,
  busy,
  items,
  availability,
  availabilityLoading,
  onChangeDate,
  onChangeRoomId,
  onChangeDurationHours,
  onChangeTitle,
  onChangeSelectedTime,
  onCreate,
}: ReservationCreateSectionProps) {
  const selectedRoomName =
    rooms.find((r) => r.id === roomId)?.name ?? "스터디룸"

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => onChangeDate(e.target.value)}
              className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <DoorOpen className="h-4 w-4" />
            <span>{selectedRoomName}</span>
          </div>
        </div>

        <div className="mt-6">
          <ReservationTimeline
            items={items}
            roomId={roomId}
            previewStartTime={selectedTime}
            previewEndTime={selectedTime ? addHours(selectedTime, durationHours) : null}
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

        <div className="grid gap-4 md:grid-cols-[180px_140px_minmax(220px,1fr)]">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">스터디룸</div>
            <select
              value={roomId?.toString() ?? ""}
              onChange={(e) => onChangeRoomId(e.target.value ? Number(e.target.value) : null)}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="" disabled>
                방 선택
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">예약 시간</div>
            <select
              value={durationHours}
              onChange={(e) => onChangeDurationHours(Number(e.target.value))}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value={1}>1시간</option>
              <option value={2}>2시간</option>
              <option value={3}>3시간</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">예약 제목</div>
            <input
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="예: 알고리즘 공부"
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>
        </div>

        <div className="mt-6 mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
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
              방과 날짜를 선택하면 예약 가능 시간을 확인할 수 있어요.
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
              const description = isServerUnavailable
                ? getAvailabilityReasonText(slot.reason)
                : unavailable
                ? `${durationHours}시간 연속 선택 불가`
                : ""

              return (
                <SlotButton
                  key={`${slot.startTime}-${slot.endTime}`}
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

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            {selectedTime
              ? `선택한 시간: ${selectedTime} ~ ${addHours(selectedTime, durationHours)} (${durationHours}시간)`
              : "시간을 선택하세요"}
          </div>

          <button
            disabled={busy}
            onClick={onCreate}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            예약하기
          </button>
        </div>
      </section>
    </div>
  )
}