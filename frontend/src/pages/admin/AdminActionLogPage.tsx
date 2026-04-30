import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  getAdminActionLogs,
  type AdminActionLog,
  type AdminActionType,
} from "../../api/admin/actionLog"
import type { PageResponse } from "../../api/page"
import { formatAdminMemberDate } from "../../api/admin/memberManagement"

type ActionFilter = "ALL" | AdminActionType

function getActionTypeLabel(type: string) {
  switch (type) {
    case "MEMBER_STATUS_CHANGE":
      return "상태 변경"
    case "MEMBER_ROLE_CHANGE":
      return "권한 변경"
    case "ADMIN_MEMO_UPDATE":
      return "메모 수정"
    default:
      return type
  }
}

function getActionTypeStyle(type: string) {
  if (type === "MEMBER_STATUS_CHANGE") {
    return "border border-amber-200 bg-amber-50 text-amber-700"
  }

  if (type === "MEMBER_ROLE_CHANGE") {
    return "border border-blue-200 bg-blue-50 text-blue-700"
  }

  return "border border-slate-200 bg-slate-100 text-slate-600"
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  )
}

export default function AdminActionLogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageParam = Number(searchParams.get("page") ?? 0)
  const actionTypeParam = searchParams.get("actionType") as ActionFilter | null
  const keywordParam = searchParams.get("keyword") ?? ""

  const initialFilter: ActionFilter =
    actionTypeParam === "MEMBER_STATUS_CHANGE" ||
    actionTypeParam === "MEMBER_ROLE_CHANGE" ||
    actionTypeParam === "ADMIN_MEMO_UPDATE"
      ? actionTypeParam
      : "ALL"

  const [logs, setLogs] = useState<PageResponse<AdminActionLog> | null>(null)
  const [filter, setFilter] = useState<ActionFilter>(initialFilter)
  const [keyword, setKeyword] = useState(keywordParam)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentPage = Number.isNaN(pageParam) ? 0 : pageParam

  const actionType = useMemo(() => {
    return filter === "ALL" ? undefined : filter
  }, [filter])

  async function fetchLogs(nextPage = currentPage) {
    try {
      setLoading(true)
      setError("")

      const data = await getAdminActionLogs({
        actionType,
        keyword: keyword.trim() || undefined,
        page: nextPage,
        size: 10,
      })

      setLogs(data ?? null)
    } catch (e) {
      console.error(e)
      setError("관리 이력을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLogs(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentPage])

  function updateParams(next: {
    filter?: ActionFilter
    keyword?: string
    page?: number
  }) {
    const nextParams = new URLSearchParams(searchParams)

    const nextFilter = next.filter ?? filter
    const nextKeyword = next.keyword ?? keyword
    const nextPage = next.page ?? 0

    if (nextFilter === "ALL") {
      nextParams.delete("actionType")
    } else {
      nextParams.set("actionType", nextFilter)
    }

    if (nextKeyword.trim()) {
      nextParams.set("keyword", nextKeyword.trim())
    } else {
      nextParams.delete("keyword")
    }

    if (nextPage > 0) {
      nextParams.set("page", String(nextPage))
    } else {
      nextParams.delete("page")
    }

    setSearchParams(nextParams)
  }

  function handleFilterChange(nextFilter: ActionFilter) {
    setFilter(nextFilter)
    updateParams({ filter: nextFilter, page: 0 })
  }

  function handleSearch() {
    updateParams({ keyword, page: 0 })
    void fetchLogs(0)
  }

  function handleReset() {
    setKeyword("")
    setFilter("ALL")
    updateParams({ filter: "ALL", keyword: "", page: 0 })
  }

  const content = logs?.content ?? []
  const totalPages = logs?.totalPages ?? 0
  const isFirst = logs?.first ?? true
  const isLast = logs?.last ?? true

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">관리 이력</h1>
        <p className="mt-2 text-sm text-slate-500">
          관리자에 의해 수행된 회원 상태, 권한, 메모 변경 기록을 확인할 수 있습니다.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "ALL"}
                label="전체"
                onClick={() => handleFilterChange("ALL")}
              />
              <FilterButton
                active={filter === "MEMBER_STATUS_CHANGE"}
                label="상태 변경"
                onClick={() => handleFilterChange("MEMBER_STATUS_CHANGE")}
              />
              <FilterButton
                active={filter === "MEMBER_ROLE_CHANGE"}
                label="권한 변경"
                onClick={() => handleFilterChange("MEMBER_ROLE_CHANGE")}
              />
              <FilterButton
                active={filter === "ADMIN_MEMO_UPDATE"}
                label="메모 수정"
                onClick={() => handleFilterChange("ADMIN_MEMO_UPDATE")}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSearch()
                }
                }}
                placeholder="설명, 처리자, 대상 회원 닉네임/이메일 검색"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />

            <button
                type="button"
                onClick={handleSearch}
                className="shrink-0 whitespace-nowrap rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
                검색
            </button>

            {(keyword.trim() || filter !== "ALL") && (
                <button
                type="button"
                onClick={handleReset}
                className="shrink-0 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                초기화
                </button>
            )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="px-6 py-10 text-sm text-rose-500">{error}</div>
        ) : content.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            관리 이력이 없습니다.
          </div>
        ) : (
          <div>
            {content.map((log) => (
              <div
                key={log.id}
                className="border-t border-slate-100 px-6 py-5 first:border-t-0"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          getActionTypeStyle(log.actionType),
                        ].join(" ")}
                      >
                        {getActionTypeLabel(log.actionType)}
                      </span>

                      <span className="text-xs text-slate-400">
                        처리자: {log.adminNickname}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900">
                      {log.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>대상 회원:</span>
                      <Link
                        to={`/admin/members/${log.targetMemberId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {log.targetMemberNickname}
                      </Link>
                      <span>·</span>
                      <span>{log.targetMemberEmail}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs text-slate-400">
                    {formatAdminMemberDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-400">
              {currentPage + 1} / {totalPages} 페이지
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => updateParams({ page: currentPage - 1 })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>

              <button
                type="button"
                disabled={isLast}
                onClick={() => updateParams({ page: currentPage + 1 })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}