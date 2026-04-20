import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getAdminDashboardSummary, type AdminDashboardSummary } from "../../api/admin/dashboard"

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
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {helper && <div className="mt-1 text-xs text-slate-400">{helper}</div>}
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
        if (mounted) setSummary(data)
      } catch (e) {
        console.error(e)
        if (mounted) setError("대시보드 정보를 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          DevMine 운영 지표를 한눈에 확인할 수 있습니다.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
          불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-red-500">
          {error}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/admin/inquiries"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="text-sm text-slate-500">문의 관리</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            사용자 문의 확인 및 답변
          </div>
        </Link>
      </div>
    </div>
  )
}