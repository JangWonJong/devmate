import { useCallback, useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"
import { logout, reissue } from "../api/auth"


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
          moveToLogin()
          return
        }
        setMe(null)
      } finally {
        setMeLoading(false)
       }
    })()
  }, [loggedIn, moveToLogin])
  
  useEffect(() => {
      if (!isAuthenticated) return

      if (loc.pathname === "/login" || loc.pathname === "/signup") {
        nav("/", { replace: true })
      }
    }, [isAuthenticated, loc.pathname, nav])

    return (
     <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #eee", padding: "12px 16px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}>
            DevMate
          </Link>
          
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/reservations">예약</Link>
            {isAuthenticated && <Link to="/posts/new">글쓰기</Link>}
            {isAuthenticated && <Link to="/mystudies">내 스터디</Link>}
            {meLoading ? (
              <span style={{ fontSize: 13, color: "#666" }}>사용자 확인 중</span>
            ) : isAuthenticated ? (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {me.nickname} ({me.email})
                </span>
                <button
                  style={{ padding: "6px 10px", cursor: "pointer" }}
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login">로그인</Link>
                <Link to="/signup">회원가입</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
        <Outlet />
      </main>
    </div>
    )
}