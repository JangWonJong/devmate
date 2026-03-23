import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPost } from "../../api/posts"

export function NewPostPage() {
  const nav = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"QUESTION" | "STUDY">("QUESTION")

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr("제목을 입력해 주세요.")
    if (!c) return setErr("내용을 입력해 주세요.")

    try {
      setLoading(true)
      const id = await createPost({ title: t, content: c, type })
      nav(`/posts/${id}`)
    } catch (e: any) {
      setErr(e.message ?? "등록 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          게시글 작성
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          개발 고민이나 스터디 모집 글을 작성해보세요.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-700">
                글 종류
              </label>
              <span className="text-xs text-slate-400">
                게시글 성격에 맞게 선택해 주세요
              </span>
            </div>

            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setType("QUESTION")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  type === "QUESTION"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                질문
              </button>
              <button
                type="button"
                onClick={() => setType("STUDY")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  type === "STUDY"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                스터디
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              {type === "QUESTION"
                ? "해결하고 싶은 개발 고민이나 질문을 자유롭게 작성해보세요."
                : "함께할 사람을 모집하는 스터디 글로 작성할 수 있어요."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">제목</label>
            <input
              placeholder="제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-13 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">내용</label>
            <textarea
              placeholder={
                type === "QUESTION"
                  ? "어떤 문제가 있었는지, 시도한 방법은 무엇인지 적어보세요."
                  : "스터디 주제, 목표, 모집 인원, 진행 방식을 적어보세요."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              게시글 등록 중...
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <button
              disabled={loading}
              onClick={onSubmit}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              등록
            </button>

            <button
              disabled={loading}
              onClick={() => nav(-1)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}