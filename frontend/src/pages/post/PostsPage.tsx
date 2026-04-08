import { useCallback, useEffect, useState } from "react"
import { listPosts, listPopularQuestionPosts, type PostResponse } from "../../api/posts"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { tokenStore } from "../../auth/token"
import {
  getMeId,
  getPopularMembers,
  type PopularMemberResponse,
} from "../../api/members"
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Search,
} from "lucide-react"
import { imageUrl } from "../../utils/image"
import { apiErrorMessage } from "../../utils/error"
import { listPopularStudies, joinStudy, type StudyResponse } from "../../api/study"

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
  sort?: "id,desc" | "id,asc" | "likes,desc"
  type?: "QUESTION" | "STUDY" | null
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

function toSort(v: string | null): "id,desc" | "id,asc" | "likes,desc" {
  if (v === "id,asc") return "id,asc"
  if (v === "likes,desc") return "likes,desc"
  return "id,desc"
}

function toType(v: string | null): "QUESTION" | "STUDY" | undefined {
  if (v === "QUESTION") return "QUESTION"
  if (v === "STUDY") return "STUDY"
  return undefined
}

function normalizeSize(v: string | null, def = 10) {
  const s = toInt(v, def)
  return s === 5 || s === 10 || s === 20 ? s : def
}

function StatusBadge({ solved }: { solved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        solved
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {solved ? "고민 해결됨" : "고민 해결 전"}
    </span>
  )
}

function ScopeButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  )
}

export function PostsPage() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()

  const scope = toScope(sp.get("scope"))
  const onlySolved = toBool(sp.get("solved"), false)
  const page = toInt(sp.get("page"), 0)
  const sort = toSort(sp.get("sort"))
  const size = normalizeSize(sp.get("size"), 10)
  const q = sp.get("q") ?? ""
  const hasQuery = q.trim().length > 0
  const type = toType(sp.get("type"))

  const setQuery = useCallback(
    (next: Query, options?: { replace?: boolean }) => {
      const curQ = sp.get("q") ?? ""
      const curScope = toScope(sp.get("scope"))
      const curSolved = toBool(sp.get("solved"), false)
      const curPage = toInt(sp.get("page"), 0)
      const curSort = toSort(sp.get("sort"))
      const curSize = normalizeSize(sp.get("size"), 10)
      const curType = toType(sp.get("type"))

      const nextQ = (next.q ?? curQ)?.trim()
      const nextScope = next.scope ?? curScope
      const nextSolved = next.solved ?? curSolved
      const nextPage = next.page ?? curPage
      const nextSize = next.size ?? curSize
      const nextSort = next.sort ?? curSort
      const nextType = next.type === undefined ? curType : next.type


      const params: Record<string, string> = {}
      if (nextQ) params.q = nextQ
      if (nextScope !== "all") params.scope = nextScope
      if (nextSolved) params.solved = "true"
      if (nextPage !== 0) params.page = String(nextPage)
      if (nextSort !== "id,desc") params.sort = nextSort
      if (nextSize !== 10) params.size = String(nextSize)
      if (nextType != null) params.type = nextType 

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
  
  const [popularMembers, setPopularMembers] = useState<PopularMemberResponse[]>([])
  const [popularQuestions, setPopularQuestions] = useState<PostResponse[]>([])
  const [popularStudies, setPopularStudies] = useState<StudyResponse[]>([])
  const [popularLoading, setPopularLoading] = useState(false)

  const [joiningStudyId, setJoiningStudyId] = useState<number | null>(null)
  const [joinErr, setJoinErr] = useState<string | null>(null)

  useEffect(() => {
    setQInput(q)
  }, [q])

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  useEffect(() => {
    ;(async () => {
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
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)

        if (!loggedIn && scope === "mine") {
          setQuery({ scope: "all", page: 0 }, { replace: true })
          return
        }

        const res = await listPosts({
          page,
          size,
          sort,
          mine: scope === "mine",
          keyword: q || undefined,
          solved: onlySolved ? true : undefined,
          type,
        })

        setItems(res.content)
        setPageInfo({
          totalPages: res.totalPages,
          totalElements: res.totalElements,
        })

        if (res.totalPages > 0 && page > res.totalPages - 1) {
          setQuery({ page: res.totalPages - 1 }, { replace: true })
        }
      } catch (e: any) {
        setErr(apiErrorMessage(e, "목록 조회 실패"))
      } finally {
        setLoading(false)
      }
    })()
  }, [page, size, scope, sort, q, onlySolved, loggedIn, type, setQuery])

  useEffect(() => {
    ;(async () => {
      try {
        const members = await getPopularMembers(5)
        setPopularMembers(members.filter((m) => m.popularityScore > 0))
      } catch {
        setPopularMembers([])
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setPopularLoading(true)
        const q = await listPopularQuestionPosts(5)
        const s = await listPopularStudies(3)

        setPopularQuestions(q)
        setPopularStudies(s)
      } catch {
        setPopularQuestions([])
        setPopularStudies([])
      } finally {
        setPopularLoading(false)
      }
    })()
  }, [])

  const handleJoinPopularStudy = async (studyId: number) => {
    if (!loggedIn) {
      nav("/login")
      return
    }

    try {
      setJoiningStudyId(studyId)
      setJoinErr(null)

      await joinStudy(studyId)

      setPopularStudies((prev) =>
        prev.map((study) =>
          study.id === studyId
            ? {
                ...study,
                joinedByMe: true,
                currentMembers: study.currentMembers + 1,
                status:
                  study.currentMembers + 1 >= study.maxMembers
                    ? "CLOSED"
                    : study.status,
              }
            : study
        )
      )
    } catch (e: any) {
      setJoinErr(apiErrorMessage(e, "스터디 참여 실패"))
    } finally {
      setJoiningStudyId(null)
    }
  }

  const emptyText = (() => {
    if (hasQuery) return "검색 결과가 없어요"
    if (scope === "mine") {
      return loggedIn ? "내 글이 아직 없어요" : "로그인 후 내 글을 확인할 수 있어요"
    }
    return "게시글이 아직 없어요"
  })()

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          커뮤니티
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          개발 고민을 공유하고, 해결 과정을 기록해보세요.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setQuery({ q: qInput, page: 0 })
                }}
                placeholder="검색어를 입력하세요 (제목/내용)"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuery({ q: qInput, page: 0 })}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                검색
              </button>

              {q && (
                <button
                  type="button"
                  onClick={() => setQuery({ q: "", page: 0 })}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlySolved}
                  onChange={(e) =>
                    setQuery({ solved: e.target.checked, page: 0 })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                해결된 글만
              </label>

              <ScopeButton
                active={scope === "all" && !type}
                onClick={() => setQuery({ scope: "all", type: null, page: 0 })}
              >
                전체 글
              </ScopeButton>

              <ScopeButton
                active={scope === "all" && type === "QUESTION"}
                onClick={() => setQuery({ type: "QUESTION", scope: "all", page: 0 })}
              >
                질문 글
              </ScopeButton>

              <ScopeButton
                active={scope === "all" && type === "STUDY"}
                onClick={() => setQuery({ type: "STUDY", scope: "all", page: 0 })}
              >
                스터디 글
              </ScopeButton>

              <ScopeButton
                active={scope === "mine" && !type}
                disabled={!loggedIn}
                onClick={() => setQuery({ scope: "mine", type: null, page: 0 })}
              >
                내 글만
              </ScopeButton>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">정렬</span>
              <select
                value={sort}
                onChange={(e) =>
                  setQuery({
                    sort: e.target.value as "id,desc" | "id,asc" | "likes,desc",
                    page: 0,
                  })
                }
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="id,desc">최신순</option>
                <option value="id,asc">오래된순</option>
                <option value="likes,desc">인기순</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {joinErr && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {joinErr}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          게시글 불러오는 중...
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-5">
          {popularLoading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              인기글 불러오는 중...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 items-start">

              {/* 🔥 인기 질문 */}
              {popularQuestions.length > 0 && (
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                      🔥 인기 질문
                    </h2>
                    <span className="text-xs text-slate-400">
                      좋아요 + 댓글 기준
                    </span>
                  </div>

                  <div className="space-y-3">
                    {popularQuestions.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => nav(`/posts/${p.id}`)}
                        className="cursor-pointer rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">{idx + 1}</span>
                            <span className="truncate">{p.title}</span>
                          </div>

                          <div className="flex gap-2 text-xs text-slate-500">
                            <span>❤️ {p.likeCount ?? 0}</span>
                            <span>💬 {p.commentCount ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 📚 인기 스터디 */}
              {popularStudies.length > 0 && (
                <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                      📚 인기 스터디
                    </h2>
                    <span className="text-xs text-slate-400">
                      참여 인원 + 모집 상태
                    </span>
                  </div>

                  <div className="space-y-3">
                    {popularStudies.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => nav(`/posts/${s.postId}`)}
                      className="cursor-pointer rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex flex-col text-sm">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 font-semibold">{idx + 1}</span>
                            <span className="truncate">{s.postTitle}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            리더: {s.leaderNickname}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            👥 {s.currentMembers}/{s.maxMembers}
                          </span>

                          <span
                            className={`font-medium ${
                              s.status === "RECRUITING"
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {s.status === "RECRUITING" ? "모집중" : "마감"}
                          </span>

                          {s.joinedByMe ? (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600"
                            >
                              참여중
                            </button>
                          ) : s.status === "RECRUITING" ? (
                            <button
                              type="button"
                              disabled={joiningStudyId === s.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleJoinPopularStudy(s.id)
                              }}
                              className="ml-1 rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            >
                              {joiningStudyId === s.id ? "참여중..." : "참여"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] text-slate-400"
                            >
                              마감
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  <div className="mt-4">
                  <button
                    onClick={() => setQuery({ type: "STUDY", scope: "all", page: 0 })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                  >
                    스터디 모집글 더 보기 →
                  </button>
                </div>
                </section>
              )}

            </div>
          )}

          <section className="space-y-5">
            {!loading && items.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
                {emptyText}
              </div>
            ) : (
              items.map((p) => {
                const imageCount = p.attachments?.length ?? 0
                const hasImage = imageCount > 0

                return (
                  <article
                    key={p.id}
                    onClick={() => nav(`/posts/${p.id}`)}
                    className="cursor-pointer rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="px-5 py-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge solved={p.solved} />

                            {p.type === "STUDY" && (
                              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                스터디 글
                              </span>
                            )}

                            {meId != null && p.authorId === meId && (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                내 글
                              </span>
                            )}

                            {hasImage && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                <ImageIcon className="h-3.5 w-3.5" />
                                이미지 {imageCount}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-red-500">
                          ❤️ {p.likeCount ?? 0}
                        </span>

                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                          💬 {p.commentCount ?? 0}
                        </span>
                        </div>
                        </div>

                        <div className="space-y-2">
                          <h2 className="break-words text-xl font-bold leading-8 tracking-tight text-slate-900">
                            {p.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <Link
                              to={`/members/${p.authorId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-slate-700 hover:underline"
                            >
                              {p.authorNickname}
                            </Link>
                            {p.createdAt && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>
                                  {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </section>

          {pageInfo && pageInfo.totalPages > 1 && (
            <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setQuery({ page: Math.max(0, page - 1) })}
                  className="inline-flex items-center gap-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </button>

                {Array.from({ length: pageInfo.totalPages })
                  .slice(
                    Math.max(0, page - 3),
                    Math.min(pageInfo.totalPages, page + 4)
                  )
                  .map((_, idx) => {
                    const start = Math.max(0, page - 3)
                    const pno = start + idx
                    return (
                      <button
                        key={pno}
                        type="button"
                        onClick={() => setQuery({ page: pno }, { replace: true })}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          pno === page
                            ? "bg-slate-900 text-white"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pno + 1}
                      </button>
                    )
                  })}

                <button
                  type="button"
                  disabled={
                    pageInfo.totalPages === 0 || page >= pageInfo.totalPages - 1
                  }
                  onClick={() => setQuery({ page: page + 1 })}
                  className="inline-flex items-center gap-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  {page + 1} / {pageInfo.totalPages} 페이지 · 총{" "}
                  {pageInfo.totalElements}개
                </span>

                <select
                  value={size}
                  onChange={(e) =>
                    setQuery({ size: Number(e.target.value), page: 0 })
                  }
                  className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                >
                  <option value={5}>5개</option>
                  <option value={10}>10개</option>
                  <option value={20}>20개</option>
                </select>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {popularMembers.length > 0 && (
            <section className="rounded-[24px] border border-slate-300 bg-white p-4 shadow-md ring-1 ring-slate-100">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  인기 멤버
                </h2>
                <span className="text-[11px] text-slate-400">좋아요 기준</span>
              </div>

              <div className="space-y-2">
                {popularMembers.map((member, idx) => (
                  <Link
                    key={member.id}
                    to={`/members/${member.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <div className="relative shrink-0">
                      {member.profileImageUrl ? (
                        <img
                          src={imageUrl(member.profileImageUrl)}
                          alt={member.nickname}
                          className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                          {member.nickname.slice(0, 1)}
                        </div>
                      )}

                      <div
                        className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
                          idx === 0
                            ? "bg-amber-500"
                            : idx === 1
                            ? "bg-slate-500"
                            : idx === 2
                            ? "bg-orange-500"
                            : "bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {member.nickname}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {member.bio || "소개 없음"}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        {member.popularityScore}
                      </div>
                      <div className="text-[10px] text-slate-400">좋아요</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}