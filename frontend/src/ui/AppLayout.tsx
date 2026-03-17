import { useCallback, useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"
import { logout, reissue } from "../api/auth"
import { headerStyle, headerInnerStyle, logoStyle, navStyle, navItemStyle, mainLayoutStyle, secondaryButtonStyle } from "./properties"

export function AppLayout(){
  const nav = useNavigate()
  const loc = useLocation()

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoading, setMeLoading] = useState(false)
  
  const syncRef = useRef(false)
  const isAuthenticated = me != null

  const moveToLogin = useCallback(() => {
    if (loc.pathname === "/login" || loc.pathname === "/signup") return
    nav("/login", {
      replace: true,
      state: {
        from: {
          pathname: loc.pathname,
          search: loc.search,
          hash: loc.hash
        }
      }
    })
  }, [loc.pathname, loc.search, loc.hash, nav])

  const onLogout = async () => {
    try {
      await logout()
    } finally {
      tokenStore.clear()
      nav("/login", {replace: true})
    }
  }
  
  useEffect(() => {
    let alive = true
    const onChange = async () => {
      if (!alive) return
      // 1) UI 로그인 상태 반영
      setLoggedIn(tokenStore.isLoggedIn())

      // 2) access 없고 refresh 있으면 access 복구 시도
      if (syncRef.current) return

      const access = tokenStore.getAccess()
      const refresh = tokenStore.getRefresh()
      if (access || !refresh) return

      syncRef.current = true
      try {
        const newAccess = await reissue(refresh)
        if (!alive) return
        tokenStore.setAccess(newAccess) // auth-change 발생 -> 다른 구독자도 반영
      } catch {
        tokenStore.clear()
        if (alive) moveToLogin()
      } finally {
        syncRef.current = false
      }
    }

    // 앱 시작 시 1회
    void onChange()
    const unsub = tokenStore.subscribe(() => void onChange())
    // auth-change + storage 변화 구독
    return () => {
      alive = false
      unsub()
    }
  }, [moveToLogin])

  useEffect(() =>{
    (async () => {
      if (!loggedIn){
        setMe(null)
        setMeLoading(false)
        return
      }
      try {
        setMeLoading(true)
        const m = await getMe()
        setMe(m)
      } catch (e: any) {
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          tokenStore.clear()
          setMe(null)
          return
        }
        setMe(null)
      } finally {
        setMeLoading(false)
       }
    })()
  }, [loggedIn])
  
  useEffect(() => {
      if (!isAuthenticated) return

      if (loc.pathname === "/login" || loc.pathname === "/signup") {
        nav("/", { replace: true })
      }
    }, [isAuthenticated, loc.pathname, nav])

    return (
     <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <Link to="/" style={logoStyle}>
            DevMate
          </Link>

          <nav style={navStyle}>
            {isAuthenticated ? (
              <Link to="/posts/new" style={navItemStyle}>
                글쓰기
              </Link>
            ) : (
              <button
                type="button"
                style={navItemStyle}
                onClick={() => {
                  alert("로그인 후 게시글 작성이 가능합니다.")
                  nav("/login", {
                    state: {
                      from: {
                        pathname: loc.pathname,
                        search: loc.search,
                        hash: loc.hash,
                      },
                    },
                  })
                }}
              >
                글쓰기
              </button>
            )}

            {isAuthenticated && (
              <Link to="/mystudies" style={navItemStyle}>
                내 스터디
              </Link>
            )}

            <Link to="/reservations" style={navItemStyle}>
              예약
            </Link>

            {isAuthenticated && (
              <Link to="/mypage" style={navItemStyle}>
                마이페이지
              </Link>
            )}

            {meLoading ? (
              <span style={{ fontSize: 13, color: "#666" }}>사용자 확인 중</span>
            ) : isAuthenticated ? (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {me.nickname}님 ({me.email})
                </span>
                <button
                  style={{ ...secondaryButtonStyle, padding: "6px 10px" }}
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={navItemStyle}>
                  로그인
                </Link>
                <Link to="/signup" style={navItemStyle}>
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={mainLayoutStyle}>
        <Outlet />
      </main>
    </div>
  )
}