import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  formatInquiryDate,
  getInquiryStatusLabel,
  getInquiryStatusStyle,
  getInquiryTypeLabel,
  listMyInquiries,
  deleteInquiry,
  type Inquiry,
} from "../../api/support/inquiry"
import { tokenStore } from "../../api/auth/token"
import { appToast } from "../../lib/toast"
import { ConfirmModal } from "../common/ConfirmModal"
import { useConfirm } from "../common/useConfirm"


type InquiryListProps = {
  variant?: "compact" | "full"
}

export default function InquiryList({
  variant = "compact",
}: InquiryListProps) {
  const nav = useNavigate()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())

  const {
    open,
    title,
    message,
    danger,
    action,
    setOpen,
    confirm: openConfirm,
  } = useConfirm()

  const isCompact = variant === "compact"

  const fetchData = async () => {
    if (!tokenStore.isLoggedIn()) {
      setInquiries([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await listMyInquiries()
      setInquiries(data)
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const sync = () => {
      setLoggedIn(tokenStore.isLoggedIn())
      void fetchData()
    }

    sync()

    const unsubscribe = tokenStore.subscribe(sync)

    const handleUpdated = () => {
      void fetchData()
    }

    window.addEventListener("inquiry-updated", handleUpdated)

    return () => {
      unsubscribe()
      window.removeEventListener("inquiry-updated", handleUpdated)
    }
  }, [])

  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
        비회원 문의는 접수 후 이메일로 확인해주세요.
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-slate-400">불러오는 중...</div>
  }

  if (inquiries.length === 0) {
    return <div className="text-sm text-slate-400">등록된 문의가 없습니다.</div>
  }

  return (
    <div className={`pr-1 ${isCompact ? "space-y-2 overflow-y-auto" : "space-y-3"}`}>
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className={`border border-slate-200 bg-white ${
            isCompact ? "rounded-xl p-3" : "rounded-2xl p-4"
          }`}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-700">
                {getInquiryTypeLabel(inquiry.type)}
                <span className="ml-1 font-normal text-slate-400">
                  · {formatInquiryDate(inquiry.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${getInquiryStatusStyle(inquiry.status)}`}
              >
                {getInquiryStatusLabel(inquiry.status)}
              </span>

              {inquiry.status === "RECEIVED" && (
                <button
                  type="button"
                  onClick={async () => {
                    openConfirm({
                    title: "문의 취소",
                    message: "문의 내용을 취소할까요?",
                    danger: true,
                    onConfirm: async () => {
                      try {
                        await deleteInquiry(inquiry.id)
                        window.dispatchEvent(new Event("inquiry-updated"))
                        appToast.success("문의가 취소되었습니다.")
                      } catch {
                        appToast.error("문의 취소에 실패했습니다.")
                      } finally {
                        setOpen(false)
                      }
                    },
                  })
                  }}
                  className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  문의 취소
                </button>
              )}
            </div>
          </div>

          <div
            className={`break-words text-sm text-slate-700 ${
              isCompact ? "line-clamp-2" : "whitespace-pre-line"
            }`}
          >
            {inquiry.content}
          </div>

          {inquiry.status === "RESOLVED" && inquiry.adminReply && (
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3">
              <div className="text-xs font-medium text-slate-500">
                관리자 답변
              </div>

              {!isCompact && (
                <div className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {inquiry.adminReply}
                </div>
              )}

              {inquiry.processedAt && (
                <div className="mt-2 text-xs text-slate-400">
                  답변일 · {formatInquiryDate(inquiry.processedAt)}
                </div>
              )}

              {isCompact && (
                <button
                  type="button"
                  onClick={() => nav("/mypage/inquiries")}
                  className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
                >
                  자세한 내용은 내 문의에서 확인하기
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      <ConfirmModal
        open={open}
        title={title}
        message={message}
        confirmText="확인"
        cancelText="취소"
        danger={danger}
        onConfirm={() => action?.()}
        onCancel={() => setOpen(false)}
      />
    </div>
    
  )
}