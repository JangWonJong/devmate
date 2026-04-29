import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  getAdminDashboardSummary,
  type AdminDashboardSummary,
} from "../../api/admin/dashboard"
import { formatInquiryDate } from "../../api/admin/support"

function SummaryCard({
  label,
  value,
  helper,
  to,
}: {
  label: string
  value: string | number
  helper?: string
  to?: string
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      >
        {content}
      </Link>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      {content}
    </section>
  )
}

function QuickLinkCard({
  to,
  label,
  title,
  badge = 0,
}: {
  to: string
  label: string
  title: string
  badge?: number
}) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-500">
              {label}
            </p>

            {badge > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-blue-200 bg-blue-100 px-1.5 text-[11px] font-semibold text-blue-700">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-3 text-xl font-bold text-slate-900">
            {title}
          </p>
        </div>

        <span className="shrink-0 text-base text-slate-300 transition group-hover:text-blue-500">
          →
        </span>
      </div>
    </Link>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const data = await getAdminDashboardSummary()

        if (mounted) {
          setSummary(data)
        }
      } catch (e) {
        console.error(e)
        if (mounted) {
          setError("대시보드 정보를 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
        <p className="mt-2 text-sm text-slate-500">
          DevMine 운영 지표를 한눈에 확인할 수 있습니다.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickLinkCard
          to="/admin/inquiries"
          label="문의 관리"
          title="문의 확인 및 답변"
          badge={summary?.pendingInquiries ?? 0}
        />
        <QuickLinkCard
          to="/admin/members"
          label="회원 관리"
          title="회원 조회"
        />
      </div>

      {loading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">
          불러오는 중...
        </section>
      ) : error ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-rose-500">
          {error}
        </section>
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="오늘 방문자 수" value={summary.dailyVisitors} />
            <SummaryCard label="누적 방문자 수" value={summary.totalVisitors} />

            <SummaryCard
              label="전체 회원 수"
              value={summary.totalMembers}
              to="/admin/members?status=ALL"
            />

            <SummaryCard
              label="ACTIVE 회원 수"
              value={summary.activeMembers}
              to="/admin/members?status=ACTIVE"
            />

            <SummaryCard
              label="탈퇴 회원 수"
              value={summary.deletedMembers}
              to="/admin/members?status=DELETED"
            />

            <SummaryCard
              label="미처리 문의 수"
              value={summary.pendingInquiries}
              helper="접수됨 + 처리중"
              to="/admin/inquiries?status=UNRESOLVED"
            />

            <SummaryCard
              label="오늘 가입자 수"
              value={summary.todaySignups}
              to="/admin/members"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">최근 가입 회원</h2>

              <div className="mt-4">
                {(summary.recentMembers ?? []).length === 0 ? (
                  <EmptyState
                    title="최근 가입 회원이 없습니다."
                    description="새로운 가입이 발생하면 이곳에 최근 회원이 표시됩니다."
                  />
                ) : (
                  <div className="space-y-4">
                  {(summary.recentMembers ?? []).map((member) => (
                    <Link
                      to={`/admin/members/${member.id}`}
                      key={member.id}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {member.nickname}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {member.email}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        가입일 : {formatInquiryDate(member.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">최근 문의</h2>

              <div className="mt-4">
                {(summary.recentInquiries ?? []).length === 0 ? (
                  <EmptyState
                    title="최근 문의가 없습니다."
                    description="새로운 문의가 등록되면 이곳에 최근 문의가 표시됩니다."
                  />
                ) : (
                  <div className="space-y-4">
                    {[...(summary.recentInquiries ?? [])]
                      .sort((a, b) => {
                        const order = {
                          RECEIVED: 0,
                          IN_PROGRESS: 1,
                          RESOLVED: 2,
                        }

                        const statusDiff = order[a.status] - order[b.status]
                        if (statusDiff !== 0) return statusDiff

                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      })
                      .map((inquiry) => (
                        <Link
                          to={`/admin/inquiries/${inquiry.id}`}
                          key={inquiry.id}
                          className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                              {inquiry.content}
                            </p>

                            <span
                              className={[
                                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                inquiry.status === "RECEIVED"
                                  ? "border border-slate-200 bg-slate-100 text-slate-700"
                                  : inquiry.status === "IN_PROGRESS"
                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700",
                              ].join(" ")}
                            >
                              {inquiry.status === "RECEIVED"
                                ? "접수됨"
                                : inquiry.status === "IN_PROGRESS"
                                  ? "처리중"
                                  : "완료됨"}
                            </span>
                          </div>
                          
                          <p className="mt-2 text-xs text-slate-500">
                            닉네임 : {inquiry.memberNickname ?? "비회원"}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            등록일 : {formatInquiryDate(inquiry.createdAt)}
                          </p>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  )
}