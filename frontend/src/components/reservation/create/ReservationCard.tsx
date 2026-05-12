import { MapPin, Navigation, Users } from 'lucide-react'
import { hhmm } from '../../../utils/reservationUtils'
import type { ReservationResponse } from '../../../api/reservation/reservations'

type Scope = 'all' | 'mine'

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone:
    | 'upcoming'
    | 'today'
    | 'past'
    | 'study'
    | 'private'
    | 'internal'
    | 'external'
}) {
  const className =
    tone === 'upcoming'
      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'today'
        ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
        : tone === 'study'
          ? 'border border-violet-200 bg-violet-50 text-violet-700'
          : tone === 'private'
            ? 'border border-slate-200 bg-slate-100 text-slate-600'
            : tone === 'internal'
              ? 'border border-blue-200 bg-blue-50 text-blue-700'
              : tone === 'external'
                ? 'border border-amber-200 bg-amber-50 text-amber-700'
                : 'border border-slate-200 bg-slate-100 text-slate-500'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}

function getReservationStatusPill(statusLabel: string) {
  if (statusLabel === '예정 예약') {
    return <StatusPill label={statusLabel} tone="upcoming" />
  }

  if (statusLabel === '오늘 예약') {
    return <StatusPill label={statusLabel} tone="today" />
  }

  return <StatusPill label={statusLabel} tone="past" />
}

function getPlaceTypePill(providerType: ReservationResponse['providerType']) {
  if (providerType === 'INTERNAL') {
    return <StatusPill label="DevMine 공간" tone="internal" />
  }

  if (providerType === 'USER_INPUT') {
    return <StatusPill label="외부 장소" tone="external" />
  }

  return <StatusPill label="제휴 장소" tone="external" />
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
  const statusLabel = getReservationStatus(
    reservation.date,
    reservation.endTime
  )
  const cancelable = isCancelable(reservation.date, reservation.startTime)

  const hasAddress = Boolean(reservation.reservationSpaceAddress)
  const hasPlaceDetail = Boolean(reservation.placeDetail)
  const hasMapPoint =
    reservation.latitude != null && reservation.longitude != null

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
        statusLabel === '지난 예약' ? 'opacity-75' : ''
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-bold text-slate-900">
                {hhmm(reservation.startTime)} ~ {hhmm(reservation.endTime)}
              </div>

              {getReservationStatusPill(statusLabel)}
              {getPlaceTypePill(reservation.providerType)}

              {reservation.studyId ? (
                <StatusPill label="스터디 예약" tone="study" />
              ) : (
                <StatusPill label="개인 예약" tone="private" />
              )}
            </div>

            <div className="mt-3 text-base font-semibold text-slate-900">
              {reservation.title}
            </div>

            <div className="mt-3 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">
                    {reservation.reservationSpaceName}
                  </div>

                  {hasAddress && (
                    <div className="mt-1 text-sm text-slate-500">
                      {reservation.reservationSpaceAddress}
                    </div>
                  )}

                  {hasPlaceDetail && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="text-slate-400">상세 위치</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-700">
                        {reservation.placeDetail}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {scope === 'all' && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {reservation.memberNickname}
                </span>
              )}
              <span>{reservation.date}</span>
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {cancelable ? (
              <span className="font-semibold text-emerald-700">취소 가능</span>
            ) : (
              <span className="text-slate-400">취소 불가</span>
            )}

            {hasMapPoint && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Navigation className="h-3.5 w-3.5" />
                지도 위치 저장됨
              </span>
            )}
          </div>

          {reservation.studyId && reservation.postId && (
            <button
              type="button"
              onClick={() => onMoveToStudyPost(reservation.postId)}
              className="text-sm font-medium text-indigo-700 underline underline-offset-4"
            >
              스터디 글 보기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
