import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createDevLog } from "../../api/devlog/devlog"
import { apiErrorMessage } from "../../utils/error"
import { validateFiles } from "../../utils/file"
import { Puzzle, Wrench, BookOpen, Lightbulb } from "lucide-react"
import { insertCodeBlockAtCursor } from "../../utils/button"
import { CodeBlockButtons } from "./DevlogCommon"
import { PageContainer } from "../../layouts/PageContainer"

export function NewDevLogPage() {
  const nav = useNavigate()

  const [title, setTitle] = useState("")
  const [problem, setProblem] = useState("")
  const [solution, setSolution] = useState("")
  const [reference, setReference] = useState("")
  const [retrospective, setRetrospective] = useState("")
  const [files, setFiles] = useState<File[]>([])
  
  const problemRef = useRef<HTMLTextAreaElement | null>(null)
  const solutionRef = useRef<HTMLTextAreaElement | null>(null)
  const referenceRef = useRef<HTMLTextAreaElement | null>(null)
  const retrospectiveRef = useRef<HTMLTextAreaElement | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addFiles = (selected: File[]) => {
    setFiles((prev) => {
      const merged = [...prev, ...selected]
      return merged.slice(0, 5)
    })
  }

  const submit = async () => {
    const fileError = validateFiles(files)
    if (fileError) return setError(fileError)

    if (!title.trim()) return setError("제목을 입력해 주세요.")
    if (!problem.trim()) return setError("문제 상황을 입력해 주세요.")
    if (!solution.trim()) return setError("해결 과정을 입력해 주세요.")

    try {
      setLoading(true)
      setError("")

      const id = await createDevLog(
        {
          title: title.trim(),
          problem: problem.trim(),
          solution: solution.trim(),
          reference: reference.trim() || undefined,
          retrospective: retrospective.trim() || undefined,
        },
        files
      )

      nav(`/devlogs/${id}`)
    } catch (e) {
      setError(apiErrorMessage(e, "DevLog 작성 실패"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold text-blue-600">New DevLog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            📝 DevLog 작성
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            개발 중 해결한 문제와 배운 점을 기록해보세요.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              🏷 제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: refresh token 재발급 무한 루프 해결"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-500"
            />
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
              const dropped = Array.from(e.dataTransfer.files)
              addFiles(dropped)
            }}
            className="cursor-pointer rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center transition hover:bg-slate-50"
          >
            🖼 이미지 업로드 (최대 5장)
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                첨부 이미지 ({files.length}/5)
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

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Puzzle size={18} className="text-blue-500" />
                <span className="font-semibold">문제 상황</span>
              </div>
              <CodeBlockButtons
                onSelect={(lang) =>
                  insertCodeBlockAtCursor(problemRef, problem, setProblem, lang)
                }
              />
            </div>
            <textarea
              ref={problemRef}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="어떤 문제가 발생했는지 작성해 주세요."
              className="mt-2 min-h-[150px] w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-green-500" />
                <span className="font-semibold">해결 과정</span>
              </div>
              <CodeBlockButtons
                onSelect={(lang) =>
                  insertCodeBlockAtCursor(solutionRef, solution, setSolution, lang)
                }
              />
            </div>
            <textarea
              ref={solutionRef}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="어떻게 해결했는지 작성해 주세요."
              className="mt-2 min-h-[200px] w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-purple-500" />
                <span className="font-semibold">참고 코드 / 개념</span>
              </div>
              <CodeBlockButtons
                onSelect={(lang) =>
                  insertCodeBlockAtCursor(referenceRef, reference, setReference, lang)
                }
              />
            </div>
            <textarea
              ref= {referenceRef}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="참고한 코드, 개념, 링크 등을 작성해 주세요."
              className="mt-2 min-h-[120px] w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-500" />
                <span className="font-semibold">회고</span>
              </div>
              <CodeBlockButtons
                onSelect={(lang) =>
                  insertCodeBlockAtCursor(retrospectiveRef, retrospective, setRetrospective, lang)
                }
              />
            </div>
            <textarea
              ref= {retrospectiveRef}
              value={retrospective}
              onChange={(e) => setRetrospective(e.target.value)}
              placeholder="이번 경험을 통해 배운 점을 작성해 주세요."
              className="mt-2 min-h-[120px] w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <button
              disabled={loading}
              onClick={submit}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "등록 중..." : "🚀 등록"}
            </button>

            <button
              disabled={loading}
              onClick={() => nav(-1)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}