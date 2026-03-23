import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPost, updatePost } from "../../api/posts"

export function EditPostPage() {
  const nav = useNavigate()
  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [solved, setSolved] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        setLoading(true)

        if (!id) return
        const post = await getPost(id)
        setTitle(post.title)
        setContent(post.content)
        setSolved(post.solved)
      } catch (e: any) {
        setErr(e.message ?? "게시글 불러오기 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr("제목을 입력해 주세요.")
    if (!c) return setErr("내용을 입력해 주세요.")
    if (!id) return setErr("잘못된 접근입니다.")

    try {
      setSaving(true)
      await updatePost(id, {
        title: t,
        content: c,
        solved,
      })
      nav(`/posts/${id}`)
    } catch (e: any) {
      setErr(e.message ?? "수정 실패")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        게시글 불러오는 중...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          게시글 수정
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          기존 내용을 수정하고, 해결 상태를 함께 관리할 수 있어요.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-8">
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
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={solved}
                onChange={(e) => setSolved(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              해결됨으로 표시
            </label>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              체크하면 이 게시글은 해결된 고민으로 표시됩니다.
            </p>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {saving && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              게시글 수정 중...
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <button
              disabled={saving}
              onClick={onSubmit}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              수정 완료
            </button>

            <button
              disabled={saving}
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