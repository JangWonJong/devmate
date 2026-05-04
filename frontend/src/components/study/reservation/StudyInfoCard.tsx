import { Users } from "lucide-react"
import type { StudyResponse } from "../../../api/study/study"
import { getStudyStatusText } from "../../../utils/reservationUtils"

function StudyStatusBadge({ status }: { status: string }) {
  const text = getStudyStatusText(status)
  const className =
    status === "RECRUITING"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-slate-100 text-slate-600 border border-slate-200"

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {text}
    </span>
  )
}

type StudyInfoCardProps = {
  study: StudyResponse
}

export default function StudyInfoCard({ study }: StudyInfoCardProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          스터디 정보
        </h2>
        <StudyStatusBadge status={study.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">제목</div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            {study.postTitle}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">리더</div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            {study.leaderNickname}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">현재 인원</div>
          <div className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <Users className="h-4 w-4 text-slate-500" />
            {study.currentMembers} / {study.maxMembers}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs font-medium text-slate-500">상태</div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            {getStudyStatusText(study.status)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-2">
          <div className="text-xs font-medium text-slate-500">공지</div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {study.notice?.trim() ? study.notice : "등록된 공지가 없어요."}
          </div>
        </div>
      </div>
    </section>
  )
}