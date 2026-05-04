import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { listMyDevLogs, type DevLogResponse } from "../../api/devlog/devlog"
import { fileUrl } from "../../utils/file"
import { apiErrorMessage } from "../../utils/error"
import { DevLoggerCard } from "../../components/devlog/DevLoggerCard"
import { PageContainer } from "../../layouts/PageContainer"

function preview(text: string) {
  return text.length > 120 ? `${text.slice(0, 120)}...` : text
}

function thumbnail(devLog: DevLogResponse) {
  return devLog.attachments && devLog.attachments.length > 0
    ? devLog.attachments[0].fileUrl
    : null
}

export function DevLogListPage() {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page") ?? 0)
  const keyword = searchParams.get("keyword") ?? "" 
  const size = 10

  const [devLogs, setDevLogs] = useState<DevLogResponse[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(keyword)

  const [error, setError] = useState("")

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
    setSearchInput(keyword)
    }, [keyword])  
    
  useEffect(() => {
    async function fetchDevLogs() {
      try {
        setLoading(true)
        setError("")

        const data = await listMyDevLogs({
          page,
          size,
          sort: "id,desc",
          keyword: keyword || undefined,
        })

        setDevLogs(data.content)
        setTotalPages(data.totalPages)
      } catch (e) {
        setError(apiErrorMessage(e, "DevLog 목록 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchDevLogs()
  }, [page, keyword])

  return (
    <PageContainer>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
      
      <div className="min-w-0 space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">DevLog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              📘 개발 기록함
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              문제 해결 과정, 삽질 기록, 참고 코드, 회고를 기록하고 공유해보세요.
            </p>
          </div>

          <button
            onClick={() => nav("/devlogs/new")}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            ✍️ DevLog 작성
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
            📭 아직 작성한 DevLog가 없어요.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            오늘 해결한 문제부터 기록해보세요.
          </p>
          <button
            onClick={() => nav("/devlogs/new")}
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            ✍️ 첫 DevLog 작성하기
          </button>
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
                      📝 {devLog.title}
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
                        🔍 자세히 보기 →
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

    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <DevLoggerCard />
    </aside>
    </div>
    </PageContainer>

  )
}