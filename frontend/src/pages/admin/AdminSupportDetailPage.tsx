import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getAdminInquiryDetail,
  replyAdminInquiry,
  updateAdminInquiryStatus,
  statusLabel,
  typeLabel,
  formatDateTime,
  type AdminInquiryDetail,
} from "../../api/admin/support"

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
        if (mounted) setError("문의 상세 정보를 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
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
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
        불러오는 중...
      </div>
    )
  }

  if (error || !inquiry) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-red-500">
        {error || "문의가 없습니다."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/inquiries")}
            className="mb-3 text-sm text-slate-500 hover:text-slate-700"
          >
            ← 목록으로
          </button>
          <h1 className="text-2xl font-bold text-slate-900">문의 상세</h1>
        </div>

        <div className="flex gap-2">
          {inquiry.status === "RECEIVED" && (
            <button
              type="button"
              onClick={handleMarkInProgress}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              처리중 변경
            </button>
          )}

          <button
            type="button"
            onClick={handleReplySubmit}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {inquiry.adminReply ? "답변 수정" : "답변 등록"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs text-slate-400">작성자</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {inquiry.memberNickname}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">문의 유형</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {typeLabel(inquiry.type)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">상태</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {statusLabel(inquiry.status)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">처리자</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {inquiry.processedByNickname || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">등록일</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatDateTime(inquiry.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">처리일</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatDateTime(inquiry.processedAt)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs text-slate-400">문의 내용</div>
          <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {inquiry.content}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs text-slate-400">관리자 답변</div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            placeholder="문의 답변을 입력해주세요."
          />
        </div>
      </div>
    </div>
  )
}