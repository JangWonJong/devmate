import { useState } from "react"
import { guideQuestion, type AiGuideResponse } from "../../api/ai/ai"

type Props = {
  variant?: "modal" | "inline"
  onMoveToWrite?: (payload: {
    title: string
    content: string
    type: "QUESTION" | "STUDY"
  }) => void
}

export default function AiAssistantPanel({
  variant = "modal",
  onMoveToWrite,
}: Props) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<AiGuideResponse | null>(null)

  const isInline = variant === "inline"

  const handleSubmit = async () => {
    const trimmed = message.trim()

    if (!trimmed) return

    if (trimmed.length < 5) {
      setError("문제 상황을 조금 더 구체적으로 입력해 주세요.")
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError("")
      const response = await guideQuestion({ message: trimmed })
      setResult(response)
    } catch {
      setError("질문 가이드를 불러오지 못했습니다.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToWrite = () => {
    if (!result || !onMoveToWrite) return

    const sections: string[] = [result.question]

    sections.push(`현재 상황:\n${message.trim()}`)

    if (result.details.trim()) {
      sections.push(`확인해보면 좋은 내용:\n${result.details}`)
    }

    if (result.hints.trim()) {
      sections.push(`점검 포인트:\n${result.hints}`)
    }

    onMoveToWrite({
      title: result.question,
      type: "QUESTION",
      content: sections.join("\n\n"),
    })
  }

  return (
    <div className="flex h-full flex-col">
      {!isInline && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">질문 가이드</h3>
          <p className="mt-1 text-sm text-slate-500">
            더 좋은 질문과 점검 방향을 안내합니다.
          </p>
        </div>
      )}

      <div
        className={
          isInline
            ? "rounded-2xl border border-slate-100 bg-white p-4"
            : "rounded-2xl border border-slate-200 bg-slate-50 p-4"
        }
      >
        <label className="mb-2 block text-sm font-medium text-slate-700">
          어떤 문제가 있으신가요?
        </label>

        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            if (error) setError("")
          }}
          placeholder="예: Spring Security JWT 재발급이 잘 안 되고 있습니다. access token 만료 후 refresh 요청이 실패합니다."
          className="min-h-[120px] w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-2 text-xs text-blue-600">
          💡 AI가 질문을 더 명확하게 정리해드립니다.
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            문제 상황을 구체적으로 적을수록 더 도움이 됩니다.
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "정리 중..." : isInline ? "초안 만들기" : "질문 정리"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="space-y-4">
            <section>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                추천 제목
              </h4>
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
                {result.question}
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                추가하면 좋은 정보
              </h4>
              <div className="whitespace-pre-line rounded-xl bg-slate-100 px-4 py-4 text-sm leading-7 text-slate-700">
                {result.details}
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                점검 포인트
              </h4>
              <div className="whitespace-pre-line rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {result.hints}
              </div>
            </section>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleMoveToWrite}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {isInline ? "작성폼에 적용하기" : "이 내용으로 커뮤니티에 질문하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}