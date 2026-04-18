import { Link } from "react-router-dom"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          DevMine 운영 기능을 관리하는 관리자 전용 공간입니다.
        </p>
      </div>

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