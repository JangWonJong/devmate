import { Link } from "react-router-dom"

type LandingFooterProps = {
  isLoggedIn?: boolean
}

export default function LandingFooter({
  isLoggedIn = false,
}: LandingFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              DevMate
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              개발 고민 해결부터 스터디와 예약까지 이어가는
              <br />
              개발자 커뮤니티 서비스
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
            <Link
              to="/posts"
              className="transition hover:text-slate-900"
            >
              커뮤니티
            </Link>
            <Link
              to="/mystudies"
              className="transition hover:text-slate-900"
            >
              스터디
            </Link>
            <Link
              to="/reservations"
              className="transition hover:text-slate-900"
            >
              예약
            </Link>
            {isLoggedIn ? (
              <Link
                to="/mypage"
                className="transition hover:text-slate-900"
              >
                마이페이지
              </Link>
            ) : (
              <Link
                to="/login"
                className="transition hover:text-slate-900"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>© 2026 DevMate. All rights reserved.</span>
          <span>Built with Spring Boot & React</span>
        </div>
      </div>
    </footer>
  )
}