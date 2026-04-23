import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { LogOut, UserCircle2 } from "lucide-react"
import AppLogo from "../components/common/AppLogo"
import { logout } from "../api/auth/auth"
import { tokenStore } from "../api/auth/token"
import { getAdminDashboardSummary } from "../api/admin/dashboard"

function navClass(isActive: boolean) {
  return [
    "block rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-100",
  ].join(" ")
}

function getAdminPageLabel(pathname: string) {
  if (pathname === "/admin") return "대시보드"
  if (pathname.startsWith("/admin/inquiries")) return "문의 관리"
  if (pathname.startsWith("/admin/members")) return "회원 관리"
  return "관리자"
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [pendingInquiryCount, setPendingInquiryCount] = useState(0)

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 무시
    } finally {
      tokenStore.clear()
      navigate("/", { replace: true })
    }
  }

  const currentLabel = getAdminPageLabel(location.pathname)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const data = await getAdminDashboardSummary()
        if (mounted) {
          setPendingInquiryCount(data.pendingInquiries ?? 0)
        }
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <AppLogo showAdminText />
            <span className="text-sm text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-500">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 md:flex">
              <UserCircle2 className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">관리자</span>
            </div>

            <Link
              to="/posts"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              서비스로 돌아가기
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border bg-white p-4">
          <nav className="space-y-2">
            <NavLink to="/admin" end className={({ isActive }) => navClass(isActive)}>
              대시보드
            </NavLink>
            
            <NavLink to="/admin/inquiries"
                  className={({ isActive }) =>
                    [ "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }>
              {({ isActive }) => (
                <>
                  <span>문의 관리</span>

                  {pendingInquiryCount > 0 && (
                  <span
                    className={[
                      "ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-white/20 text-white border border-white/10"
                        : "bg-blue-100 text-blue-700 border border-blue-200",
                    ].join(" ")}
                  >
                    {pendingInquiryCount}
                  </span>
                )}
                </>
              )}
            </NavLink>
            <NavLink to="/admin/members" className={({ isActive }) => navClass(isActive)}>
              회원 관리
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