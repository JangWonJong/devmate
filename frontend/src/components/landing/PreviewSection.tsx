import { Bell, Clock3, MessageSquare, Users } from "lucide-react"
import type { ReactNode } from "react"

type PreviewItemCardProps = {
  title: string
  icon: ReactNode
  content: string
  meta: string
  badge: string
  badgeClassName: string
}

function PreviewItemCard({
  title,
  icon,
  content,
  meta,
  badge,
  badgeClassName,
}: PreviewItemCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>
          <span className="text-base font-semibold">{title}</span>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassName}`}
        >
          {badge}
        </span>
      </div>

      <div className="space-y-2">
        <p className="min-h-[48px] text-base font-medium leading-6 text-slate-900">
          {content}
        </p>
        <p className="text-sm text-slate-500">{meta}</p>
      </div>
    </div>
  )
}

export default function PreviewSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
            이런 기능을 한 화면에서 경험할 수 있어요
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            실제 서비스 화면처럼 보이도록 게시글, 스터디, 예약, 알림 요소를 함께 배치하여
            <br /> DevMine의 흐름을 한눈에 보여줍니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <PreviewItemCard
            title="인기 게시글"
            icon={<MessageSquare className="h-5 w-5 text-slate-700" />}
            content="JPA N+1 문제 해결 방식 질문"
            meta="댓글 8 · 채택 완료"
            badge="채택 완료"
            badgeClassName="bg-amber-50 text-amber-700"
          />

          <PreviewItemCard
            title="모집 중 스터디"
            icon={<Users className="h-5 w-5 text-slate-700" />}
            content="알고리즘 주 3회 스터디"
            meta="현재 5/6명 · 모집 진행 중"
            badge="모집중"
            badgeClassName="bg-emerald-50 text-emerald-700"
          />

          <PreviewItemCard
            title="오늘 예약 슬롯"
            icon={<Clock3 className="h-5 w-5 text-slate-700" />}
            content="A룸 18:00 ~ 20:00"
            meta="다음 가능 시간 20:00"
            badge="예약 가능"
            badgeClassName="bg-blue-50 text-blue-700"
          />

          <PreviewItemCard
            title="최근 알림"
            icon={<Bell className="h-5 w-5 text-slate-700" />}
            content="스터디 참가 요청이 승인되었어요"
            meta="방금 전"
            badge="실시간"
            badgeClassName="bg-violet-50 text-violet-700"
          />
        </div>
      </div>
    </section>
  )
}