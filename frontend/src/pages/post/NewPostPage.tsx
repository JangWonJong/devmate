import { useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createPost } from "../../api/post/posts"
import AiAssistantPanel from "../../components/support/AiAssistantPanel"
import { validateFiles } from "../../utils/file"

export function NewPostPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const state = loc.state as
   | {
      prefilledTitle?: string
      prefilledContent?: string
      prefilledType?: "QUESTION" | "STUDY"
    }
  | undefined

  const fileInputRef = useRef<HTMLInputElement | null>(null)


  const [title, setTitle] = useState(state?.prefilledTitle ?? "")
  const [content, setContent] = useState(state?.prefilledContent ?? "")
  const [type, setType] = useState<"QUESTION" | "STUDY">(state?.prefilledType ?? "QUESTION")

  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const [showAiGuide, setShowAiGuide] = useState(false)

  const isFromDevLog = Boolean(state?.prefilledTitle) || Boolean(state?.prefilledContent)


  const addFiles = (selected: File[]) => {
    setFiles((prev) => {
      const merged = [...prev, ...selected]

      const unique = merged.filter(
        (file, index, self) =>
          index ===
          self.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          )
      )

      return unique.slice(0, 5)
    })
  }

  const handleApplyAiGuide = (payload: {
    title: string
    content: string
    type: "QUESTION" | "STUDY"
  }) => {
    setTitle(payload.title)
    setContent(payload.content)
    setType(payload.type)
    setShowAiGuide(false)
  }

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr("제목을 입력해 주세요.")
    if (!c) return setErr("내용을 입력해 주세요.")

    const fileError = validateFiles(files)
    if (fileError) return setErr(fileError)

    try {
      setLoading(true)
      const id = await createPost({ title: t, content: c, type }, files)
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

        {isFromDevLog && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            DevLog 내용을 바탕으로 게시글 초안이 자동 입력되었어요. 필요한 부분만 다듬어서 등록해 주세요.
          </div>
        )}
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

          {type === "QUESTION" && (
            <section className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    질문 작성이 어렵다면 AI 도움을 받아보세요
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    문제 상황을 입력하면 제목과 본문 초안을 정리해드립니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiGuide((prev) => !prev)}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  {showAiGuide ? "AI 도우미 닫기" : "🤖 AI 질문 도우미"}
                </button>
              </div>

              {showAiGuide && (
                <div className="mt-5">
                  <AiAssistantPanel
                    variant="inline"
                    onMoveToWrite={handleApplyAiGuide}
                  />
                </div>
              )}
            </section>
          )}      
        
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
          
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-700">
                이미지 첨부
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                이미지 추가
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? [])
                addFiles(selected)
                e.currentTarget.value = ""
              }}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dropped = Array.from(e.dataTransfer.files ?? [])
                addFiles(dropped)
              }}
              className="cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
            >
              <div className="text-sm font-medium text-slate-700">
                이미지를 여기로 드래그하거나 클릭해서 추가하세요
              </div>
              <p className="mt-2 text-xs text-slate-500">
                한 번에 여러 장 선택하거나, 여러 번 나눠서 추가할 수 있어요. 최대 5장, 각 5MB까지 업로드 가능해요.
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                첨부 파일 ({files.length}/5)
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                  >
                    <span className="truncate text-slate-700">{file.name}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="ml-3 text-red-500"
                    >
                      제거
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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