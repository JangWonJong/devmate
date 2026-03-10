import { useCallback, useEffect, useState } from "react";
import { listPosts, type PostResponse } from "../api/posts";
import { Link, useSearchParams } from "react-router-dom";
import { tokenStore } from "../auth/token";
import { getMeId } from "../api/members";

type PageInfo = {
  totalPages: number
  totalElements: number
}

type Query = {
  q?: string
  scope?: "all" | "mine"
  solved?: boolean
  page?: number
  size?: number
  sort?: "id,desc" | "id,asc"
}

function toInt(v: string | null, def: number) {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : def
}

function toBool(v: string | null, def: boolean) {
  if (v == null) return def
  return v === "true" || v === "1"
}

function toScope(v: string | null): "all" | "mine" {
  return v === "mine" ? "mine" : "all"
}

function toSort(v: string | null) {
  if (v === "id,asc") return "id,asc"
  return "id,desc"
}

function normalizeSize(v: string | null, def = 10) {
  const s = toInt(v, def)
  return s === 5 || s === 10 || s === 20 ? s : def
}

function StatusBadge({ solved }: { solved: boolean }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "2px 8px",
        border: "1px solid #ddd",
        borderRadius: 999,
        background: solved ? "#f3fff6" : "#fafafa",
        color: "#111",
        whiteSpace: "nowrap",
      }}
    >
      {solved ? "고민 해결됨" : "고민 해결 전"}
    </span>
  )
}

export function PostsPage() {
  const [sp, setSp] = useSearchParams()

  const scope = toScope(sp.get("scope"))
  const onlySolved = toBool(sp.get("solved"), false)
  const page = toInt(sp.get("page"), 0)
  const sort = toSort(sp.get("sort"))
  const size = normalizeSize(sp.get("size"), 10)
  const q = sp.get("q") ?? ""
  const hasQuery = q.trim().length > 0

  const setQuery = useCallback(
    (next: Query, options?: { replace?: boolean }) => {
      const curQ = sp.get("q") ?? ""
      const curScope = toScope(sp.get("scope"))
      const curSolved = toBool(sp.get("solved"), false)
      const curPage = toInt(sp.get("page"), 0)
      const curSort = toSort(sp.get("sort"))
      const curSize = normalizeSize(sp.get("size"), 10)

      const nextQ = (next.q ?? curQ)?.trim()
      const nextScope = next.scope ?? curScope
      const nextSolved = next.solved ?? curSolved
      const nextPage = next.page ?? curPage
      const nextSize = next.size ?? curSize
      const nextSort = next.sort ?? curSort

      const params: Record<string, string> = {}
      if (nextQ) params.q = nextQ
      if (nextScope !== "all") params.scope = nextScope
      if (nextSolved) params.solved = "true"
      if (nextPage !== 0) params.page = String(nextPage)
      if (nextSort !== "id,desc") params.sort = nextSort
      if (nextSize !== 10) params.size = String(nextSize)

      setSp(params, { replace: options?.replace ?? false })
    },
    [sp, setSp]
  )

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)
  const [items, setItems] = useState<PostResponse[]>([])
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [qInput, setQInput] = useState(q)

  useEffect(() => {
    setQInput(q)
  }, [q])

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
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
      } catch {
        setMeId(null)
      }
    })()
  }, [loggedIn])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setErr(null)

        if (!loggedIn && scope === "mine") {
          setQuery({ scope: "all", page: 0 })
          return
        }

        const res = await listPosts({
          page,
          size,
          sort,
          mine: scope === "mine",
          keyword: q || undefined,
          solved: onlySolved ? true : undefined,
        })

        setItems(res.content)
        setPageInfo({
          totalPages: res.totalPages,
          totalElements: res.totalElements,
        })

        if (res.totalPages > 0 && page > res.totalPages - 1) {
          setQuery({ page: res.totalPages - 1 })
        }
      } catch (e: any) {
        setErr(e.message ?? "목록 조회 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [page, size, scope, sort, q, onlySolved, loggedIn, setQuery])

  const emptyText = (() => {
    if (hasQuery) return "검색 결과가 없어요"
    if (scope === "mine") return loggedIn ? "내 글이 아직 없어요" : "로그인 후 내 글을 확인 할 수 있어요"
    return "게시글이 아직 없어요"
  })()

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>게시글</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setQuery({ q: qInput, page: 0 })
          }}
          placeholder="검색어 (제목/내용)"
          style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd" }}
        />
        <button
          onClick={() => setQuery({ q: qInput, page: 0 })}
          style={{ padding: "8px 12px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
        >
          검색
        </button>
        {q && (
          <button
            onClick={() => setQuery({ q: "", page: 0 })}
            style={{ padding: "8px 12px", border: "1px solid #eee", background: "#f6f6f6", cursor: "pointer" }}
          >
            지우기
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlySolved}
            onChange={(e) => setQuery({ solved: e.target.checked, page: 0 })}
          />
          해결된 글만
        </label>

        <button
          onClick={() => setQuery({ scope: "all", page: 0 })}
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
            onClick={() => setQuery({ scope: "mine", page: 0 })}
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

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#666" }}>정렬:</span>
          <select
            value={sort}
            onChange={(e) => setQuery({ sort: e.target.value as any, page: 0 })}
            style={{ padding: "6px 8px" }}
          >
            <option value="id,desc">최신순</option>
            <option value="id,asc">오래된순</option>
          </select>
        </div>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      {loading && <div style={{ color: "#666", marginBottom: 8 }}>게시글 불러오는 중...</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {!loading && items.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", color: "#666", borderRadius: 10 }}>
            {emptyText}
          </div>
        ) : (
          items.map((p) => (
            <Link
              key={p.id}
              to={`/posts/${p.id}`}
              style={{
                padding: 14,
                border: "1px solid #eee",
                borderRadius: 10,
                textDecoration: "none",
                color: "#111",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 6,
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}
                  >
                    {p.title}
                  </div>

                  <div style={{ fontSize: 13, color: "#666" }}>
                    {p.authorNickname}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <StatusBadge solved={p.solved} />

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
            </Link>
          ))
        )}
      </div>

      {pageInfo && pageInfo.totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button
            disabled={page === 0}
            onClick={() => setQuery({ page: Math.max(0, page - 1) })}
            style={{ padding: "6px 10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            이전
          </button>

          {Array.from({ length: pageInfo.totalPages })
            .slice(Math.max(0, page - 3), Math.min(pageInfo.totalPages, page + 4))
            .map((_, idx) => {
              const start = Math.max(0, page - 3)
              const pno = start + idx
              return (
                <button
                  key={pno}
                  onClick={() => setQuery({ page: pno }, { replace: true })}
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
            onClick={() => setQuery({ page: page + 1 })}
            style={{ padding: "6px 10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            다음
          </button>

          <span style={{ marginLeft: 8, color: "#666", fontSize: 13 }}>
            {page + 1} / {pageInfo.totalPages} (총 {pageInfo.totalElements}개)
          </span>

          <select
            value={size}
            onChange={(e) => setQuery({ size: Number(e.target.value), page: 0 })}
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