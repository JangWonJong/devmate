import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  listAdminInquiries,
  statusLabel,
  typeLabel,
  formatDateTime,
  type AdminInquiryListItem,
  type InquiryStatus,
} from "../../api/admin/support"

function statusClass(status: InquiryStatus) {
  if (status === "RECEIVED") {
    return "bg-slate-100 text-slate-700"
  }
  if (status === "IN_PROGRESS") {
    return "bg-amber-100 text-amber-700"
  }
  return "bg-emerald-100 text-emerald-700"
}

export default function AdminSupportPage() {
  const [inquiries, setInquiries] = useState<AdminInquiryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const data = await listAdminInquiries()
        if (mounted) setInquiries(data)
      } catch (e) {
        console.error(e)
        if (mounted) setError("문의 목록을 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    return {
      received: inquiries.filter((inquiry) => inquiry.status === "RECEIVED").length,
      inProgress: inquiries.filter((inquiry) => inquiry.status === "IN_PROGRESS").length,
      resolved: inquiries.filter((inquiry) => inquiry.status === "RESOLVED").length,
    }
  }, [inquiries])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">문의 관리</h1>
        <p className="mt-1 text-sm text-slate-500">
          사용자 문의를 확인하고 상태를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">접수됨</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.received}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">처리중</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.inProgress}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">완료됨</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.resolved}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-900">전체 문의</h2>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="px-5 py-10 text-sm text-red-500">{error}</div>
        ) : inquiries.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-500">문의가 없습니다.</div>
        ) : (
          <div className="divide-y">
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                to={`/admin/inquiries/${inquiry.id}`}
                className="block px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(inquiry.status)}`}
                      >
                        {statusLabel(inquiry.status)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {typeLabel(inquiry.type)}
                      </span>
                      <span className="text-xs text-slate-400">{inquiry.memberNickname}</span>
                    </div>

                    <p className="line-clamp-2 text-sm text-slate-700">{inquiry.content}</p>
                  </div>

                  <div className="shrink-0 text-xs text-slate-400">
                    <div>등록: {formatDateTime(inquiry.createdAt)}</div>
                    <div className="mt-1">처리: {formatDateTime(inquiry.processedAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}