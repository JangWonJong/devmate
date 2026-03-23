import { Bell, CalendarCheck, MessageSquare, Users } from "lucide-react"
import { Link } from "react-router-dom"
import type { ReactNode } from "react"

type HeroSectionProps = {
  isLoggedIn?: boolean
}

type PreviewCardProps = {
  title: string
  badge: string
  lines: string[]
  icon: ReactNode
}

function PreviewCard({ title, badge, lines, icon }: PreviewCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>
          <span className="text-base font-semibold">{title}</span>
        </div>

        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
          {badge}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-base font-medium leading-6 text-slate-900">
          {lines[0]}
        </p>
        <p className="text-sm text-slate-500">{lines[1]}</p>
      </div>
    </div>
  )
}

export default function HeroSection({
  isLoggedIn = false,
}: HeroSectionProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
            Developer Community · Study · Reservation
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-5xl">
            개발 고민을 나누고,
            <br />
            함께 해결하고,
            <br />
            바로 연결되는 공간
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            DevMate는 개발자들이 고민을 공유하고 댓글과 채택으로 해결하며,
            스터디를 모집하고 참여하고, 스터디룸 예약까지 이어갈 수 있는
            서비스입니다.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/posts"
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  커뮤니티로 이동
                </Link>
                <Link
                  to="/mystudies"
                  className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  내 스터디 보기
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  시작하기
                </Link>
                <Link
                  to="/posts"
                  className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  서비스 둘러보기
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewCard
            icon={<MessageSquare className="h-5 w-5 text-slate-700" />}
            title="최근 고민"
            badge="채택 완료"
            lines={[
              "Spring Security JWT 재발급 흐름 질문",
              "댓글 12 · 해결된 고민",
            ]}
          />
          <PreviewCard
            icon={<Users className="h-5 w-5 text-slate-700" />}
            title="모집 중 스터디"
            badge="모집중"
            lines={["CS 면접 대비 스터디", "현재 4/6명 참여"]}
          />
          <PreviewCard
            icon={<CalendarCheck className="h-5 w-5 text-slate-700" />}
            title="오늘 예약"
            badge="예약 가능"
            lines={["B룸 19:00 ~ 21:00", "가용 슬롯 확인 가능"]}
          />
          <PreviewCard
            icon={<Bell className="h-5 w-5 text-slate-700" />}
            title="최근 알림"
            badge="실시간"
            lines={[
              "내 댓글이 채택되었어요",
              "스터디 참가 요청이 승인되었어요",
            ]}
          />
        </div>
      </div>
    </section>
  )
}