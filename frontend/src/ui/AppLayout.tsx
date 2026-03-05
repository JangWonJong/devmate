import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"
import { logout, reissue } from "../api/auth"


export function AppLayout(){
  const nav = useNavigate()

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [me, setMe] = useState<MeResponse | null>(null)

  const syncRef = useRef(false)

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
  }, [])

  useEffect(() =>{
    (async () => {
      if (!loggedIn){
        setMe(null)
        return
      }
      try {
        const m = await getMe()
        setMe(m)
      } catch {
        setMe(null)
      }
    })()
  }, [loggedIn])

  const onLogout = async () => {
    try {
      await logout()
    } finally {
      tokenStore.clear()
      nav("/login", {replace: true})
    }
  }

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

            {loggedIn && <Link to="/posts/new">글쓰기</Link>}

            {loggedIn ? (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {me ? `${me.nickname} (${me.email})` : "로그인됨"}
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