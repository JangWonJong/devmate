import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getAdminInquiryDetail,
  replyAdminInquiry,
  updateAdminInquiryStatus,
  getInquiryStatusLabel,
  getInquiryTypeLabel,
  formatInquiryDate,
  type AdminInquiryDetail,
} from "../../api/admin/support"

function getStatusBadgeClass(status: AdminInquiryDetail["status"]) {
  if (status === "RECEIVED") {
    return "bg-slate-100 text-slate-700 border border-slate-200"
  }

  if (status === "IN_PROGRESS") {
    return "bg-amber-50 text-amber-700 border border-amber-200"
  }

  return "bg-emerald-50 text-emerald-700 border border-emerald-200"
}

export default function AdminSupportDetailPage() {
  const { inquiryId } = useParams()
  const navigate = useNavigate()

  const [inquiry, setInquiry] = useState<AdminInquiryDetail | null>(null)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!inquiryId) return

    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const data = await getAdminInquiryDetail(Number(inquiryId))

        if (!mounted) return

        setInquiry(data)
        setReply(data.adminReply ?? "")
      } catch (e) {
        console.error(e)
        if (mounted) {
          setError("문의 상세 정보를 불러오지 못했습니다.")
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
  }, [inquiryId])

  async function handleMarkInProgress() {
    if (!inquiry) return

    try {
      setSaving(true)
      await updateAdminInquiryStatus({
        inquiryId: inquiry.id,
        status: "IN_PROGRESS",
      })
      const refreshed = await getAdminInquiryDetail(inquiry.id)
      setInquiry(refreshed)
    } catch (e) {
      console.error(e)
      alert("상태 변경에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  async function handleReplySubmit() {
    if (!inquiry) return

    if (!reply.trim()) {
      alert("답변 내용을 입력해주세요.")
      return
    }

    try {
      setSaving(true)
      await replyAdminInquiry({
        inquiryId: inquiry.id,
        adminReply: reply.trim(),
      })
      const refreshed = await getAdminInquiryDetail(inquiry.id)
      setInquiry(refreshed)
      setReply(refreshed.adminReply ?? "")
      alert("답변이 등록되었습니다.")
    } catch (e) {
      console.error(e)
      alert("답변 등록에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">
        불러오는 중...
      </section>
    )
  }

  if (error || !inquiry) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-rose-500">
        {error || "문의가 없습니다."}
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/inquiries")}
              className="mb-3 text-sm text-slate-500 transition hover:text-slate-700"
            >
              ← 목록으로
            </button>
            <h1 className="text-2xl font-bold text-slate-900">문의 상세</h1>
            <p className="mt-2 text-sm text-slate-500">
              문의 내용을 확인하고 상태 및 답변을 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {inquiry.status === "RECEIVED" && (
              <button
                type="button"
                onClick={handleMarkInProgress}
                disabled={saving}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                처리중 변경
              </button>
            )}

            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inquiry.adminReply ? "답변 수정" : "답변 등록"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">작성자</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {inquiry.memberNickname}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/admin/members/${inquiry.memberId}`)}
              className="mt-2 text-xs font-medium text-blue-600 hover:underline"
            >
              회원 상세 보기
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">문의 유형</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {getInquiryTypeLabel(inquiry.type)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">상태</p>
            <div className="mt-2">
              <span
                className={[
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                  getStatusBadgeClass(inquiry.status),
                ].join(" ")}
              >
                {getInquiryStatusLabel(inquiry.status)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">처리자</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {inquiry.processedByNickname || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">등록일</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatInquiryDate(inquiry.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">처리일</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatInquiryDate(inquiry.processedAt)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-slate-500">문의 내용</p>
          <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {inquiry.content}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-slate-500">관리자 답변</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="문의 답변을 입력해주세요."
          />
          <div className="mt-2 text-right text-xs text-slate-400">
            {reply.length} / 2000
          </div>
        </div>
      </section>
    </div>
  )
}