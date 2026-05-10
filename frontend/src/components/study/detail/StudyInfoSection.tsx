import { useNavigate } from "react-router-dom"
import type { StudyMemberResponse, StudyResponse } from "../../../api/study/study"
import type { ReservationResponse } from "../../../api/reservation/reservations"
import { actionButtonClass } from "../../../utils/button"
import { KakaoMapPreview } from "../../common/map/KakaoMapPreview"

function studyStatusLabel(status: string) {
  switch (status) {
    case "RECRUITING":
      return "모집중"
    case "CLOSED_BY_CAPACITY":
      return "정원 마감"
    case "CLOSED_BY_LEADER":
      return "모집 마감"
    default:
      return status
  }
}

function StudyStatusBadge({ status }: { status: string }) {
  const label = studyStatusLabel(status)

  const className =
    status === "RECRUITING"
      ? "bg-emerald-50 text-emerald-700"
      : status === "CLOSED_BY_CAPACITY"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "success"
}) {
  const className =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "success"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

type StudyInfoSectionProps = {
  study: StudyResponse | null
  studyLoading: boolean
  studyError: string | null
  studyMembers: StudyMemberResponse[]
  studyReservations: ReservationResponse[]
  reservationsLoading: boolean
  loggedIn: boolean
  meId: number | null
  isAuthor: boolean
  onCreateStudy: () => void
  onJoinStudy: () => void
  onLeaveStudy: () => void
  onCloseStudy: () => void
  onUpdateCapacity: () => void
  onUpdateNotice: () => void
  onDelegateLeader: (targetMemberId: number) => void
  onUpdatePlace: () => void
}

export default function StudyInfoSection({
  study,
  studyLoading,
  studyError,
  studyMembers,
  studyReservations,
  reservationsLoading,
  loggedIn,
  meId,
  isAuthor,
  onCreateStudy,
  onJoinStudy,
  onLeaveStudy,
  onCloseStudy,
  onUpdateCapacity,
  onUpdateNotice,
  onDelegateLeader,
  onUpdatePlace
}: StudyInfoSectionProps) {
  const nav = useNavigate()

  if (studyLoading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-sm text-slate-500">스터디 정보를 불러오는 중...</div>
      </section>
    )
  }

  if (studyError) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {studyError}
        </div>
      </section>
    )
  }

  if (!study) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
          스터디 정보
        </h2>

        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            아직 스터디가 생성되지 않았습니다.
          </div>

          {isAuthor && (
            <ActionButton variant="primary" onClick={onCreateStudy}>
              스터디 생성
            </ActionButton>
          )}
        </div>
      </section>
    )
  }

  const isRecruiting = study.status === "RECRUITING"
  const isClosedByCapacity = study.status === "CLOSED_BY_CAPACITY"
  const isClosedByLeader = study.status === "CLOSED_BY_LEADER"

  const isStudyLeader = studyMembers.some(
    (member) => member.memberId === meId && member.role === "LEADER"
  )
  const isStudyJoined = study.joinedByMe

  const canJoin = loggedIn && !isStudyJoined && isRecruiting
  const canLeave = loggedIn && isStudyJoined && !isStudyLeader
  const canClose = loggedIn && isStudyJoined && isStudyLeader && isRecruiting
  const canUpdateCapacity = loggedIn && isStudyJoined && isStudyLeader
  const canUpdateNotice = loggedIn && isStudyJoined && isStudyLeader
  const canReserve = loggedIn && isStudyJoined
  const canUpdatePlace = loggedIn && isStudyJoined && isStudyLeader

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          스터디 정보
        </h2>
        <StudyStatusBadge status={study.status} />
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-500">상태</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {studyStatusLabel(study.status)}
            </div>

            {isClosedByCapacity && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                현재 정원이 가득 차 있어 참가할 수 없습니다.
              </p>
            )}

            {isClosedByLeader && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                리더가 모집을 마감한 상태입니다.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-500">현재 인원</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {study.currentMembers} / {study.maxMembers}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 text-xl font-bold text-slate-900">
            스터디 공지
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {study.notice?.trim() ? study.notice : '등록된 공지가 없어요.'}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-2xl font-bold text-slate-900">참여 멤버</h3>

          {studyMembers.length === 0 ? (
            <div className="text-sm text-slate-500">
              참여 중인 멤버가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {studyMembers.map((member) => (
                <div
                  key={member.memberId}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {member.nickname}
                    </span>

                    {member.role === 'LEADER' && (
                      <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                        리더
                      </span>
                    )}
                  </div>

                  {isStudyLeader &&
                    member.role !== 'LEADER' &&
                    member.memberId !== meId && (
                      <ActionButton
                        onClick={() => onDelegateLeader(member.memberId)}
                      >
                        리더 위임
                      </ActionButton>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
        {(study.placeName || study.address) && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 text-xl font-bold text-slate-900">
              📍 스터디 장소
            </div>

            <div className="space-y-1">
              {study.placeName && (
                <p className="font-semibold text-slate-900">
                  {study.placeName}
                </p>
              )}

              {study.address && (
                <p className="text-sm leading-6 text-slate-500">
                  {study.address}
                </p>
              )}
            </div>

            {study.latitude != null && study.longitude != null && (
              <KakaoMapPreview
                latitude={study.latitude}
                longitude={study.longitude}
                placeName={study.placeName}
              />
            )}
          </div>
        )}
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-2xl font-bold text-slate-900">
            스터디 예약 현황
          </h3>

          {reservationsLoading ? (
            <div className="text-sm text-slate-500">
              예약 현황을 불러오는 중...
            </div>
          ) : studyReservations.length === 0 ? (
            <div className="text-sm text-slate-500">
              등록된 스터디 예약이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {studyReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="text-base font-semibold text-slate-900">
                    {reservation.date} · {reservation.reservationSpaceName}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {reservation.startTime.slice(0, 5)} ~{' '}
                    {reservation.endTime.slice(0, 5)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    예약자: {reservation.memberNickname}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loggedIn ? (
          <div className="flex flex-wrap gap-3">
            {canReserve && (
              <ActionButton
                variant="primary"
                onClick={() => nav(`/studies/${study.id}/reservation`)}
              >
                스터디 예약
              </ActionButton>
            )}

            {canJoin && (
              <button
                type="button"
                onClick={onJoinStudy}
                className={actionButtonClass('success')}
              >
                참가하기
              </button>
            )}

            {canLeave && (
              <button
                type="button"
                onClick={onLeaveStudy}
                className={actionButtonClass('danger')}
              >
                탈퇴하기
              </button>
            )}

            {canClose && (
              <button
                type="button"
                onClick={onCloseStudy}
                className={actionButtonClass('subtle')}
              >
                모집 마감
              </button>
            )}

            {canUpdateNotice && (
              <button
                type="button"
                onClick={onUpdateNotice}
                className={actionButtonClass('default')}
              >
                공지 수정
              </button>
            )}

            {canUpdateCapacity && (
              <button
                type="button"
                onClick={onUpdateCapacity}
                className={actionButtonClass('default')}
              >
                정원 수정
              </button>
            )}

            {canUpdatePlace && (
              <button
                type="button"
                onClick={onUpdatePlace}
                className={actionButtonClass('default')}
              >
                장소 수정
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            로그인 후 스터디 참가 및 예약이 가능합니다.
          </div>
        )}
      </div>
    </section>
  )
}