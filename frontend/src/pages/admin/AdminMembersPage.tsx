import { useEffect, useState } from "react"
import {
  formatAdminMemberDate,
  getAdminMemberStatusLabel,
  getAdminMemberStatusStyle,
  listAdminMembers,
  type AdminMember,
  type AdminMemberStatus,
} from "../../api/admin/memberManagement"

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [status, setStatus] = useState<AdminMemberStatus | "">("")
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")

        const data = await listAdminMembers({
          page,
          size,
          status,
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
  }, [page, size, status, keyword])

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(0)
    setKeyword(keywordInput.trim())
    }

  const handleChangeStatus = (nextStatus: AdminMemberStatus | "") => {
    setPage(0)
    setStatus(nextStatus)
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

          <div className="flex min-w-[124px] flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-slate-500">조회 회원 수</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalElements}
            </p>
          </div>
        </div>
      </section>

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

            <select
            value={status}
            onChange={(e) =>
                handleChangeStatus(e.target.value as AdminMemberStatus | "")
            }
            className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 sm:w-[160px]"
            >
            <option value="">전체 상태</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DELETED">DELETED</option>
            </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-500">{error}</div>
        ) : members.length === 0 ? (
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
                  {members.map((member) => (
                    <tr
                        key={member.id}
                        className="border-t border-slate-100 text-slate-700 transition hover:bg-slate-50"
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