import { useEffect, useMemo, useState } from "react";
import { listPosts, type PostResponse } from "../api/posts";
import { Link } from "react-router-dom";
import { tokenStore } from "../auth/token";
import { getMeId } from "../api/members";


export function PostsPage() {
  type PageInfo = {
    totalPages: number
    totalElements: number
  }

  const [scope, setScope] = useState<"all" | "mine">("all")
  const [meId, setMeId] = useState<number | null>(null)
  
  const [items, setItems] = useState<PostResponse[]>([])
  const [err, setErr] = useState<string | null>(null)
  
  const [onlySolved, setOnlySolved] = useState(false)
  
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  
  //로그인 상태 폴링
  useEffect(() => {
    const id = setInterval(() => setLoggedIn(tokenStore.isLoggedIn()), 300)
    return () => clearInterval(id)
  }, [])

  // 내글 배지용 meId
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

  // 목록 로드(서버 페이징 + mine 옵션)
  useEffect(() => {
    (async () => {
        try {
            setErr(null)
            const res = await listPosts({ 
            page, size, sort: "id,desc", mine: scope ==="mine"})
            setItems(res.content)
            setPageInfo({ totalPages: res.totalPages, totalElements: res.totalElements})
        } catch (e: any) {
            setErr(e.message ?? "목록 조회 실패")
        }
    })()
  }, [page, size, scope])

  const loadingMine = scope === "mine" && loggedIn && meId == null
  
  const visibleItems = useMemo(()=> {
    return onlySolved ? items.filter(p => p.solved) : items}, [items, onlySolved]) 
  
  const emptyText = 
  scope === "mine"
  ? loggedIn ? "내 글이 아직 없어요" : "로그인 후 내 글을 확인 할 수 있어요" : "게시글이 아직 없어요"
    
  return (
    <div>
      {/* solved 필터 */} 
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
            type="checkbox"
            checked={onlySolved}
              onChange={(e) => {setOnlySolved(e.target.checked); setPage(0)}}
        />
        해결된 구름
      </label>

      {/* scope 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => {setScope("all"); setPage(0)}}
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
            onClick={() => {setScope("mine"); setPage(0)}}
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

      {/* 목록 */}
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
  {/* 페이지네이션 */}
  {pageInfo && pageInfo.totalPages > 1 && (
  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
    <button
      disabled={page === 0}
      onClick={() => setPage((p) => Math.max(0, p - 1))}
      style={{ padding: "6px 10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
    >
      이전
    </button>

    {/* 페이지 번호(최대 7개만 보여주기) */}
    {Array.from({ length: pageInfo.totalPages })
      .slice(Math.max(0, page - 3), Math.min(pageInfo.totalPages, page + 4))
      .map((_, idx, arr) => {
        const start = Math.max(0, page - 3)
        const pno = start + idx
        return (
          <button
            key={pno}
            onClick={() => setPage(pno)}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              background: pno === page ? "#111" : "#fff",
              color: pno === page ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {pno + 1}
          </button>
        )
      })}

    <button
      disabled={pageInfo.totalPages === 0 || page >= pageInfo.totalPages - 1}
      onClick={() => setPage((p) => p + 1)}
      style={{ padding: "6px 10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
    >
      다음
    </button>

    <span style={{ marginLeft: 8, color: "#666", fontSize: 13 }}>
      {page + 1} / {pageInfo.totalPages} (총 {pageInfo.totalElements}개)
    </span>

    {/* size 선택(선택) */}
    <select
      value={size}
      onChange={(e) => {
        setPage(0)
        setSize(Number(e.target.value))
      }}
      style={{ marginLeft: 8, padding: "6px 8px" }}
    >
      <option value={5}>5개</option>
      <option value={10}>10개</option>
      <option value={20}>20개</option>
    </select>
  </div>
)}
    </div>
  )
}