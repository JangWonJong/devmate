import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  listMemberDevLogs,
  type DevLogResponse,
} from "../../api/devlog/devlog"
import { getMemberProfile } from "../../api/member/members"
import { fileUrl } from "../../utils/file"
import { apiErrorMessage } from "../../utils/error"
import { tokenStore } from "../../api/auth/token"
import { getMeId } from "../../api/member/members"

function preview(text: string) {
  return text.length > 120 ? `${text.slice(0, 120)}...` : text
}

function thumbnail(devLog: DevLogResponse) {
  return devLog.attachments && devLog.attachments.length > 0
    ? devLog.attachments[0].fileUrl
    : null
}

export function MemberDevLogPage() {
  const { memberId } = useParams()
  
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page") ?? 0)
  const keyword = searchParams.get("keyword") ?? "" 
  const size = 10
  
  const [meId, setMeId] = useState<number | null>(null)
  const [nickname, setNickname] = useState("")
  const [devLogs, setDevLogs] = useState<DevLogResponse[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(keyword)

  const [error, setError] = useState("")

  const id = memberId ? Number(memberId) : null

  const movePage = (nextPage: number) => {
    const next = new URLSearchParams()

    if (keyword) {
        next.set("keyword", keyword)
    }

    if (nextPage > 0) {
        next.set("page", String(nextPage))
    }

    setSearchParams(next)
    }

  const submitSearch = () => {
    const next = new URLSearchParams()

    if (searchInput.trim()) {
        next.set("keyword", searchInput.trim())
    }

    setSearchParams(next)
    }
  
  useEffect(() => {
    ;(async () => {
        if (!tokenStore.isLoggedIn()) {
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
    }, [])
    
  useEffect(() => {
    if (id == null || meId == null) return

    if (id === meId) {
        nav("/devlogs", { replace: true })
    }
    }, [id, meId, nav])

  useEffect(() => {
    setSearchInput(keyword)
    }, [keyword])  

  useEffect(() => {
    async function fetchMemberDevLogs() {
      if (!id) return

      try {
        setLoading(true)
        setError("")

        const profile = await getMemberProfile(id)
        setNickname(profile.nickname)

        const data = await listMemberDevLogs(Number(id), {
          page,
          size,
          sort: "id,desc",
          keyword: keyword || undefined,
        })

        setDevLogs(data.content)
        setTotalPages(data.totalPages)
      } catch (e) {
        setError(apiErrorMessage(e, "회원 DevLog 목록 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchMemberDevLogs()
  }, [id, page, keyword])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">DevLog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {nickname ? `${nickname}님의 DevLog` : "회원 DevLog"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              이 회원이 공유한 개발 기록을 확인해보세요.
            </p>
          </div>

          <button
            onClick={() => nav(-1)}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            뒤로가기
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
            onSubmit={(e) => {
            e.preventDefault()
            submitSearch()
            }}
            className="flex flex-col gap-3 sm:flex-row"
        >
            <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목, 문제 상황, 해결 과정, 참고 내용 검색"
            className="h-12 flex-1 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-500"
            />

            <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
            🔍 검색
            </button>

            {keyword && (
            <button
                type="button"
                onClick={() => {
                setSearchInput("")
                setSearchParams({})
                }}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                초기화
            </button>
            )}
        </form>
        </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          DevLog를 불러오는 중...
        </div>
      ) : devLogs.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            아직 공개된 DevLog가 없어요.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            이 회원이 작성한 개발 기록이 아직 없습니다.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {devLogs.map((devLog) => {
            const thumb = thumbnail(devLog)

            return (
              <div
                key={devLog.id}
                onClick={() => nav(`/devlogs/${devLog.id}`)}
                className="cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`grid ${
                    thumb ? "sm:grid-cols-[180px_1fr]" : ""
                  }`}
                >
                  {thumb && (
                    <div className="w-full bg-slate-100 sm:w-[180px] sm:self-stretch">
                      <img
                        src={fileUrl(thumb)}
                        alt={devLog.title}
                        className="h-40 w-full object-cover sm:h-full"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        개발 기록
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(devLog.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                      {devLog.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {preview(devLog.problem)}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <span className="text-slate-500">
                        작성자 {devLog.authorNickname}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-sm font-medium text-red-500">
                        ❤️ {devLog.likeCount}
                        </span>
                      <span className="font-semibold text-slate-700">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => movePage(page - 1)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:text-slate-300"
          >
            이전
          </button>

          <span className="px-3 py-2 text-sm text-slate-500">
            {page + 1} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => movePage(page + 1)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:text-slate-300"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}