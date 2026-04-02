import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

type CtaSectionProps = {
  isLoggedIn?: boolean
}

export default function CtaSection({
  isLoggedIn = false,
}: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-[32px] border border-slate-200 bg-slate-50 px-8 py-16 text-center shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {isLoggedIn
            ? "DevMine에서 지금 바로 시작해보세요"
            : "DevMine에서 함께 해결해보세요"}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {isLoggedIn
            ? "질문에서 스터디, 그리고 실제 모임까지 이어지는 흐름을 바로 이용할 수 있습니다."
            : "질문에서 스터디, 그리고 실제 모임까지 한 번에 이어지는 개발자 서비스입니다."}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/posts"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                커뮤니티 보기
              </Link>

              <Link
                to="/reservations"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                예약하기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                지금 시작하기
              </Link>

              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                커뮤니티 둘러보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}