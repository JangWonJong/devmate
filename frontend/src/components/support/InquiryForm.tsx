import { useEffect, useState } from "react"
import { createInquiry, type InquiryType } from "../../api/support/inquiry"
import { tokenStore } from "../../api/auth/token"

export default function InquiryForm() {
  const [type, setType] = useState<InquiryType>("BUG")
  const [content, setContent] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  const handleSubmit = async () => {
    const trimmed = content.trim()
    const name = guestName.trim()
    const email = guestEmail.trim()

    if (!trimmed) {
      setMsg("문의 내용을 입력해주세요.")
      return
    }

    if (!loggedIn && !name) {
      setMsg("이름을 입력해주세요.")
      return
    }

    if (!loggedIn && !email) {
      setMsg("이메일을 입력해주세요.")
      return
    }

    try {
      setLoading(true)
      setMsg(null)

      await createInquiry({
        type,
        content: trimmed,
        guestName: loggedIn ? undefined : name,
        guestEmail: loggedIn ? undefined : email,
      })

      setContent("")
      setGuestName("")
      setGuestEmail("")
      setType("BUG")
      setMsg("문의가 접수되었습니다.")

      window.dispatchEvent(new Event("inquiry-updated"))
    } catch (e: any) {
      setMsg(e?.response?.data?.error?.message ?? e?.message ?? "문의 등록 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">문의하기</h3>

      {!loggedIn && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="이름"
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />

          <input
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="이메일"
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
      )}

      <div className="mb-3 flex gap-2">
        {["BUG", "FEATURE", "GENERAL"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t as InquiryType)}
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