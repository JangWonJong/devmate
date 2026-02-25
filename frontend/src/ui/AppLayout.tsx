import { Link, Outlet } from "react-router-dom"


export function AppLayout(){
    return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #eee", padding: "12px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}>
            DevMate
          </Link>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link to="/posts/new">글쓰기</Link>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
        <Outlet />
      </main>
    </div>
    )
}