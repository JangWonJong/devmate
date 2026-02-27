import { useEffect, useState } from "react";
import { listPosts, type PostResponse } from "../api/posts";
import { Link } from "react-router-dom";
import { tokenStore } from "../auth/token";
import { getMeId } from "../api/members";


export function PostsPage() {
  const [scope, setScope] = useState<"all" | "mine">("all")
  const [meId, setMeId] = useState<number | null>(null)
  const [items, setItems] = useState<PostResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [onlySolved, setOnlySolved] = useState(false)
  
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  
  useEffect(() => {
    const id = setInterval(() => setLoggedIn(tokenStore.isLoggedIn()), 300)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    (async () => {
      if (!loggedIn) {
        setMeId(null)
        return
      }
      try {
        const id = await getMeId()
        setMeId(id)
      } catch{
        setMeId(null)
      }
    })()
  }, [loggedIn])

  useEffect(() => {
    (async () => {
        try {
            const page = await listPosts()
            setItems(page.content)
        } catch (e: any) {
            setErr(e.message ?? "목록 조회 실패")
        }
    })()
  }, [])

  const loadingMine = scope === "mine" && loggedIn && meId == null
  
  let visibleItems = onlySolved ? items.filter(p => p.solved) : items
  
  if (scope === "mine") {
    visibleItems = meId == null ? [] : visibleItems.filter(p => p.authorId === meId)
  }
  
  return (
    <div>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
            type="checkbox"
            checked={onlySolved}
            onChange={(e) => setOnlySolved(e.target.checked)}
        />
        해결된 구름
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setScope("all")}
          style={{
            padding: "6px 10px",
            border: "1px solid #ddd",
            background: scope === "all" ? "#111" : "#fff",
            color: scope === "all" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          전체 글
        </button>

        {loggedIn ? (
          <button
            onClick={() => setScope("mine")}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              background: scope === "mine" ? "#111" : "#fff",
              color: scope === "mine" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            내 글만
          </button>
        ) : (
          <button
            disabled
            style={{
              padding: "6px 10px",
              border: "1px solid #eee",
              background: "#f6f6f6",
              color: "#999",
            }}
          >
            내 글만
          </button>
        )}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>게시글</h1>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {visibleItems.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #eee", color: "#666" }}>
            {scope === "mine"
            ? (loadingMine ? "내 글 불러오는 중..." : "내 글이 아직 없어요.")
            : "게시글이 아직 없어요."}
          </div>
        ) : (
          visibleItems.map((p) => (
            <Link key={p.id} to={`/posts/${p.id}`} style={{ padding: 12, border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <b>{p.title}</b>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {p.solved ? <span>✅</span> : <span>🕒</span>}
                  {meId != null && p.authorId === meId && (
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 999,
                        background: "#fafafa",
                        color: "#111",
                        whiteSpace: "nowrap",
                      }}
                    >
                      내 글
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>{p.authorNickname}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}