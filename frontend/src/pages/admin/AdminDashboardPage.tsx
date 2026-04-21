import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  getAdminDashboardSummary,
  type AdminDashboardSummary,
} from "../../api/admin/dashboard"

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper?: string
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </section>
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


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/admin/inquiries"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-500">문의 관리</p>
          <p className="mt-3 text-lg font-bold text-slate-900">
            문의 확인 및 답변
          </p>
        </Link>

        <Link
          to="/admin/members"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-500">회원 관리</p>
          <p className="mt-3 text-lg font-bold text-slate-900">
            회원 조회
          </p>
        </Link>
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="오늘 방문자 수" value={summary.dailyVisitors} />
          <SummaryCard label="누적 방문자 수" value={summary.totalVisitors} />
          <SummaryCard label="전체 회원 수" value={summary.totalMembers} />
          <SummaryCard label="ACTIVE 회원 수" value={summary.activeMembers} />
          <SummaryCard label="탈퇴 회원 수" value={summary.deletedMembers} />
          <SummaryCard
            label="미처리 문의 수"
            value={summary.pendingInquiries}
            helper="접수됨 + 처리중"
          />
        </div>
      ) : null}
    </div>
  )
}