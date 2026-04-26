import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  formatAdminMemberDate,
  getAdminMemberStatusLabel,
  getAdminMemberStatusStyle,
  listAdminMembers,
  type AdminMember,
  type AdminMemberStatus,
} from "../../api/admin/memberManagement"

type MemberFilter = "ALL" | AdminMemberStatus | "ADMIN"

function MemberSummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 leading-none">
        {value}
      </p>
    </section>
  )
}

function MemberFilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <span>{label}</span>
      <span
        className={[
          "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  )
}

export default function AdminMembersPage() {
  const navigate = useNavigate()

  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [filter, setFilter] = useState<MemberFilter>("ALL")
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")

  const requestStatus: AdminMemberStatus | "" =
     filter === "ACTIVE" || filter === "DELETED" ? filter : ""

  const visibleMembers =
    filter === "ADMIN"
      ? members.filter((member) => member.role === "ADMIN")
      : members


  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")

        const data = await listAdminMembers({
          page,
          size,
          status: requestStatus,
          keyword,
        })

        if (!mounted) return

        setMembers(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (e) {
        console.error(e)
        if (mounted) {
          setError("회원 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [page, size, requestStatus, keyword])

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(0)
    setKeyword(keywordInput.trim())
    }

  const summary = {
    total: totalElements,
    active: members.filter((member) => member.status === "ACTIVE").length,
    deleted: members.filter((member) => member.status === "DELETED").length,
    admin: members.filter((member) => member.role === "ADMIN").length,
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">회원 관리</h1>
            <p className="mt-2 text-sm text-slate-500">
              회원 상태와 계정 정보를 조회할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <MemberSummaryCard label="조회 회원 수" value={totalElements} />
        <MemberSummaryCard label="이용중 회원" value={summary.active} />
        <MemberSummaryCard label="탈퇴 회원" value={summary.deleted} />
        <MemberSummaryCard label="관리자 계정" value={summary.admin} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <form
            onSubmit={handleSearchSubmit}
            className="flex w-full flex-1 flex-col gap-3 sm:flex-row"
            >
            <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="닉네임 또는 이메일 검색"
                className="h-11 w-full flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
            />
            <button
                type="submit"
                className="h-11 min-w-[84px] whitespace-nowrap rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
                검색
            </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
            <MemberFilterButton
              active={filter === "ALL"}
              label="전체"
              count={totalElements}
              onClick={() => {
                setPage(0)
                setFilter("ALL")
              }}
            />
            <MemberFilterButton
              active={filter === "ACTIVE"}
              label="이용중"
              count={summary.active}
              onClick={() => {
                setPage(0)
                setFilter("ACTIVE")
              }}
            />
            <MemberFilterButton
              active={filter === "DELETED"}
              label="탈퇴"
              count={summary.deleted}
              onClick={() => {
                setPage(0)
                setFilter("DELETED")
              }}
            />
            <MemberFilterButton
              active={filter === "ADMIN"}
              label="관리자"
              count={summary.admin}
              onClick={() => {
                setPage(0)
                setFilter("ADMIN")
              }}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-500">{error}</div>
        ) : visibleMembers.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            조회된 회원이 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">ID</th>
                    <th className="px-5 py-4 text-left font-semibold">닉네임</th>
                    <th className="px-5 py-4 text-left font-semibold">이메일</th>
                    <th className="px-5 py-4 text-left font-semibold">권한</th>
                    <th className="px-5 py-4 text-left font-semibold">상태</th>
                    <th className="px-5 py-4 text-left font-semibold">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((member) => (
                    <tr
                        key={member.id}
                        onClick={() => navigate(`/admin/members/${member.id}`)}
                        className="cursor-pointer border-t border-slate-100 text-slate-700 transition hover:bg-slate-50"
                        >
                      <td className="px-5 py-4">{member.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {member.nickname}
                      </td>
                      <td className="px-5 py-4">{member.email}</td>
                      <td className="px-5 py-4">{member.role}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            getAdminMemberStatusStyle(member.status),
                          ].join(" ")}
                        >
                          {getAdminMemberStatusLabel(member.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {formatAdminMemberDate(member.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-500">
                페이지 {page + 1} / {Math.max(totalPages, 1)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}