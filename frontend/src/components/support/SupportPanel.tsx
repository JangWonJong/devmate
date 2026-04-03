import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import AiAssistantPanel from "./AiAssistantPanel"
import InquiryForm from "./InquiryForm"
import InquiryList from "./InquiryList"

type Props = {
  open: boolean
  onClose: () => void
}

export default function SupportPanel({ open, onClose }: Props) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [tab, setTab] = useState<"ai" | "inquiry">("ai")

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setTab("ai")
  }, [open])

  if (!open) return null

  const handleMoveToWrite = (payload: {
    title: string
    content: string
    type: "QUESTION" | "STUDY"
  }) => {
    navigate("/posts/new", {
      state: {
        prefilledTitle: payload.title,
        prefilledContent: payload.content,
        prefilledType: payload.type,
      },
    })
    onClose()
  }

  return (
    <div
      ref={panelRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed bottom-24 right-6 z-50 w-[380px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            DevMine 지원 센터
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            질문 가이드와 문의 기능을 이용할 수 있어요.
          </p>
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100"
        >
          닫기
        </button>
      </div>

      <div className="border-b border-slate-200 px-4 pt-4">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setTab("ai")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === "ai"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            질문 가이드
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setTab("inquiry")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === "inquiry"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            문의하기
          </button>
        </div>
      </div>

      <div className="h-[560px] p-4">
        {tab === "ai" ? (
          <AiAssistantPanel onMoveToWrite={handleMoveToWrite} />
        ) : (
          <div className="flex h-full flex-col gap-4">
            <InquiryForm />
            <div className="min-h-0 flex-1">
              <InquiryList />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}