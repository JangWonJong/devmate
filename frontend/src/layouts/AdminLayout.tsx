import { Link, NavLink, Outlet } from "react-router-dom"

function navClass(isActive: boolean) {
  return [
    "block rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-100"
  ].join(" ")
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/admin" className="text-lg font-bold text-slate-900">
            DevMine Admin
          </Link>

          <Link
            to="/"
            className="rounded-xl border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            서비스로 돌아가기
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-white p-4">
          <nav className="space-y-2">
            <NavLink to="/admin" end className={({ isActive }) => navClass(isActive)}>
              대시보드
            </NavLink>
            <NavLink to="/admin/inquiries" className={({ isActive }) => navClass(isActive)}>
              문의 관리
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}