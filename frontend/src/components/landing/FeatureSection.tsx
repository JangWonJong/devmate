import { CheckCircle2 } from "lucide-react"

const features = [
  {
    number: "01",
    title: "개발 고민을 기록하고 해결하세요",
    description:
      "질문과 댓글, 채택 기능을 통해 해결 과정을 남기고 지식을 쌓을 수 있습니다.",
    points: ["고민 게시글 작성", "댓글 기반 소통", "채택 기능으로 핵심 답변 정리"],
    preview: "community",
  },
  {
    number: "02",
    title: "스터디를 만들고, 참여하고, 운영하세요",
    description:
      "모집 상태 관리, 참가와 탈퇴, 리더 위임까지 스터디 운영 흐름을 지원합니다.",
    points: ["스터디 생성", "참가 / 탈퇴", "리더 위임 및 모집 상태 관리"],
    preview: "study",
  },
  {
    number: "03",
    title: "필요한 시간에 바로 예약하세요",
    description:
      "예약 가능 시간 확인, 충돌 방지, 정책 기반 제한으로 안정적인 예약 경험을 제공합니다.",
    points: ["availability API", "충돌 방지", "예약 정책 적용"],
    preview: "reservation",
  },
] as const

function CommunityPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-sm font-semibold text-slate-500">커뮤니티 미리보기</div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">
              Spring Security JWT 재발급 질문
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              채택 완료
            </span>
          </div>
          <p className="text-xs text-slate-500">댓글 12 · 해결된 고민</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">
              JPA N+1 문제 해결 방식 질문
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              답변 대기
            </span>
          </div>
          <p className="text-xs text-slate-500">댓글 8 · 진행 중</p>
        </div>
      </div>
    </div>
  )
}

function StudyPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-sm font-semibold text-slate-500">스터디 미리보기</div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">
              CS 면접 대비 스터디
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              모집중
            </span>
          </div>
          <p className="text-xs text-slate-500">현재 4/6명 · 리더 운영 중</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">
              알고리즘 주 3회 스터디
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              모집 완료
            </span>
          </div>
          <p className="text-xs text-slate-500">현재 6/6명 · 진행 예정</p>
        </div>
      </div>
    </div>
  )
}

function ReservationPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-sm font-semibold text-slate-500">예약 미리보기</div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">A룸</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              예약 가능
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">18:00</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">19:00</span>
            <span className="rounded-lg bg-slate-900 px-2 py-1 text-white">20:00</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">B룸</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              일부 예약됨
            </span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-lg bg-slate-900 px-2 py-1 text-white">19:00</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">20:00</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">21:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturePreview({ type }: { type: "community" | "study" | "reservation" }) {
  if (type === "community") return <CommunityPreview />
  if (type === "study") return <StudyPreview />
  return <ReservationPreview />
}

export default function FeatureSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
            DevMate의 핵심 기능
          </h2>
          <p className="text-slate-600">
            커뮤니티, 스터디, 예약 기능이 분리되지 않고 하나의 흐름으로 연결됩니다.
          </p>
        </div>

        <div className="grid gap-6">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-8 lg:grid-cols-[1.05fr_0.95fr]"
            >
              <div>
                <div className="mb-4 text-sm font-semibold text-slate-500">
                  {feature.number}
                </div>

                <h3 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-slate-900">
                  {feature.title}
                </h3>

                <p className="mb-6 max-w-xl text-lg leading-8 text-slate-600">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-3 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 text-slate-700" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <FeaturePreview type={feature.preview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}