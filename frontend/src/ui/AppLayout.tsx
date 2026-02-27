import { useEffect, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { tokenStore } from "../auth/token"
import { getMe, type MeResponse } from "../api/members"


export function AppLayout(){
 
  const nav = useNavigate()
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [me, setMe] = useState<MeResponse | null>(null)

  useEffect(() => {
    const id = setInterval(() => setLoggedIn(tokenStore.isLoggedIn()), 300)
    return () => clearInterval(id)
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
            {loggedIn && <Link to="/posts/new">글쓰기</Link>}

            {loggedIn ? (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {me ? `${me.nickname} (${me.email})` : "로그인됨"}
                </span>
                <button
                  style={{ padding: "6px 10px", cursor: "pointer" }}
                  onClick={() => {
                    tokenStore.clear();
                    setLoggedIn(false);
                    nav("/login");
                  }}
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