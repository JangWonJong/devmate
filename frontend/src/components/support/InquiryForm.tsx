import { useState } from "react"
import { createInquiry } from "../../api/inquiry"

export default function InquiryForm() {
  const [type, setType] = useState<"BUG" | "FEATURE" | "GENERAL">("BUG")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    try {
      setLoading(true)
      setMsg(null)

      await createInquiry({ type, content: trimmed })

      setContent("")
      setType("BUG")
      setMsg("문의가 접수되었습니다.")

      window.dispatchEvent(new Event("inquiry-updated"))
    } catch (e: any) {
      setMsg("문의 등록 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        문의하기
      </h3>

      <div className="mb-3 flex gap-2">
        {["BUG", "FEATURE", "GENERAL"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t as "BUG" | "FEATURE" | "GENERAL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium ${
              type === t
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {t === "BUG" ? "버그" : t === "FEATURE" ? "기능 요청" : "기타"}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="문의 내용을 입력해 주세요."
        className="min-h-[100px] w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:bg-slate-300"
        >
          {loading ? "등록 중..." : "문의 등록"}
        </button>
      </div>

      {msg && <div className="mt-2 text-xs text-slate-500">{msg}</div>}
    </div>
  )
}