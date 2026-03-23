import { hhmm } from "../../utils/reservationUtils"
import type { ReservationResponse } from "../../api/reservations"

type Scope = "all" | "mine"

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: "upcoming" | "today" | "past" | "study" | "private"
}) {
  const className =
    tone === "upcoming"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : tone === "today"
      ? "bg-blue-50 text-blue-700 border border-blue-200"
      : tone === "study"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
      : tone === "private"
      ? "bg-slate-100 text-slate-600 border border-slate-200"
      : "bg-slate-100 text-slate-500 border border-slate-200"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}

function getReservationStatusPill(statusLabel: string) {
  if (statusLabel === "예정 예약") return <StatusPill label={statusLabel} tone="upcoming" />
  if (statusLabel === "오늘 예약") return <StatusPill label={statusLabel} tone="today" />
  return <StatusPill label={statusLabel} tone="past" />
}

type ReservationCardProps = {
  reservation: ReservationResponse
  scope: Scope
  meId: number | null
  busy: boolean
  getReservationStatus: (date: string, endTime: string) => string
  isCancelable: (date: string, startTime: string) => boolean
  onCancel: (id: number) => void
  onMoveToStudyPost: (postId: number | null) => void
}

export default function ReservationCard({
  reservation,
  scope,
  meId,
  busy,
  getReservationStatus,
  isCancelable,
  onCancel,
  onMoveToStudyPost,
}: ReservationCardProps) {
  const isMine = meId != null && reservation.memberId === meId
  const statusLabel = getReservationStatus(reservation.date, reservation.endTime)
  const cancelable = isCancelable(reservation.date, reservation.startTime)

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
        statusLabel === "지난 예약" ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-bold text-slate-900">
                {hhmm(reservation.startTime)} ~ {hhmm(reservation.endTime)}
              </div>

              {getReservationStatusPill(statusLabel)}

              {reservation.studyId ? (
                <StatusPill label="스터디 예약" tone="study" />
              ) : (
                <StatusPill label="개인 예약" tone="private" />
              )}
            </div>

            <div className="mt-3 text-base font-semibold text-slate-900">
              {reservation.title}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{reservation.roomName}</span>
              {scope === "all" && <span>· {reservation.memberNickname}</span>}
              <span>· {reservation.date}</span>
            </div>
          </div>

          {isMine && cancelable && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel(reservation.id)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            {cancelable ? (
              <span className="font-semibold text-emerald-700">취소 가능</span>
            ) : (
              <span className="text-slate-400">취소 불가</span>
            )}
          </div>

          {reservation.studyId && reservation.postId && (
            <button
              type="button"
              onClick={() => onMoveToStudyPost(reservation.postId)}
              className="text-sm font-medium text-blue-700 underline underline-offset-4"
            >
              스터디 글 보기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}