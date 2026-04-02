import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../api/auth"
import { tokenStore } from "../../auth/token"

type LandingHeaderProps = {
  isLoggedIn?: boolean
}

export default function LandingHeader({
  isLoggedIn = false,
}: LandingHeaderProps) {
  const nav = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 무시
    } finally {
      tokenStore.clear()
      nav("/", { replace: true })
      window.location.reload()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/devmine2.png"
            alt="DevMine"
            className="h-15 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/posts"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            커뮤니티
          </Link>
          <Link
            to="/mystudies"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            내스터디
          </Link>
          <Link
            to="/reservations"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            예약
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                마이페이지
              </Link>
              <Link
                to="/posts"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                서비스로 이동
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}