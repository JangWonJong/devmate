import { useEffect, useState } from "react";
import { listPosts, type PostResponse } from "../api/posts";
import { Link } from "react-router-dom";


export function PostsPage() {
  const [items, setItems] = useState<PostResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  
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

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>게시글</h1>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((p) => (
          <Link key={p.id} to={`/posts/${p.id}`} style={{ padding: 12, border: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{p.title}</b>
              {p.solved && <span>✅</span>}
              {!p.solved && <span>🕒</span>}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>{p.authorNickname}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}