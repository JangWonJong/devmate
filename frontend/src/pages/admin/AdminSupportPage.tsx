import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  listAdminInquiries,
  getInquiryStatusLabel,
  getInquiryTypeLabel,
  formatInquiryDate,
  type AdminInquiryListItem,
  type InquiryStatus,
} from "../../api/admin/support"

function statusClass(status: InquiryStatus) {
  if (status === "RECEIVED") {
    return "bg-slate-100 text-slate-700 border border-slate-200"
  }

  if (status === "IN_PROGRESS") {
    return "bg-amber-50 text-amber-700 border border-amber-200"
  }

  return "bg-emerald-50 text-emerald-700 border border-emerald-200"
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
    </section>
  )
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

        if (mounted) {
          setInquiries(data)
        }
      } catch (e) {
        console.error(e)
        if (mounted) {
          setError("문의 목록을 불러오지 못했습니다.")
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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">문의 관리</h1>
        <p className="mt-2 text-sm text-slate-500">
          사용자 문의를 확인하고 상태를 관리할 수 있습니다.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="접수됨" value={summary.received} />
        <SummaryCard label="처리중" value={summary.inProgress} />
        <SummaryCard label="완료됨" value={summary.resolved} />
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">전체 문의</h2>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="px-6 py-10 text-sm text-rose-500">{error}</div>
        ) : inquiries.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">문의가 없습니다.</div>
        ) : (
          <div>
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                to={`/admin/inquiries/${inquiry.id}`}
                className="block border-t border-slate-100 px-6 py-5 transition hover:bg-slate-50 first:border-t-0"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusClass(inquiry.status),
                        ].join(" ")}
                      >
                        {getInquiryStatusLabel(inquiry.status)}
                      </span>

                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getInquiryTypeLabel(inquiry.type)}
                      </span>

                      <span className="text-xs text-slate-400">
                        {inquiry.memberNickname}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm text-slate-700">
                      {inquiry.content}
                    </p>
                  </div>

                  <div className="shrink-0 text-xs text-slate-400">
                    <div>등록: {formatInquiryDate(inquiry.createdAt)}</div>
                    <div className="mt-1">
                      처리: {formatInquiryDate(inquiry.processedAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}