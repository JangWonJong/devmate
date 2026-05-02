import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  deleteDevLog,
  getDevLog,
  type DevLogResponse,
} from "../../api/devlog/devlog"
import { fileUrl } from "../../utils/file"
import { apiErrorMessage } from "../../utils/error"
import { getMeId } from "../../api/member/members"
import { tokenStore } from "../../api/auth/token"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"


function normalizeMarkdown(text: string) {
  return text.replace(/\\`\\`\\`/g, "```")
}

function DevLogSection({
  title,
  content,
}: {
  title: string
  content?: string
}) {
  if (!content) return null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>

      <div className="mt-4 text-sm leading-7 text-slate-700">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "")
                const language = match?.[1] ?? "text"

                if (inline) {
                    return (
                    <code
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-pink-600"
                        {...props}
                    >
                        {children}
                    </code>
                    )
                }

                return (
                    <div className="my-5 overflow-hidden rounded-2xl border border-slate-700 bg-[#1f1f24] shadow-sm">
                    <div className="flex items-center justify-between bg-[#3b383d] px-4 py-3">
                        <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-400" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400" />
                        <span className="h-3 w-3 rounded-full bg-green-400" />
                        <span className="ml-3 text-xs font-semibold text-slate-200">
                            {language}
                        </span>
                        </div>

                        <button
                        type="button"
                        onClick={() =>
                            navigator.clipboard.writeText(
                            String(children).replace(/\n$/, "")
                            )
                        }
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20"
                        >
                        복사
                        </button>
                    </div>

                    <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        showLineNumbers
                        customStyle={{
                        margin: 0,
                        padding: "20px",
                        background: "#1f1f24",
                        fontSize: "14px",
                        lineHeight: "1.7",
                        }}
                        lineNumberStyle={{
                        color: "#64748b",
                        paddingRight: "16px",
                        }}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                    </div>
                )
                },
            }}
            >
            {normalizeMarkdown(content)}
            </ReactMarkdown>
      </div>
    </section>
  )
}

export function DevLogDetailPage() {
  const { devLogId } = useParams()
  const nav = useNavigate()

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)
  const [devLog, setDevLog] = useState<DevLogResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )
  const [error, setError] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return

      if (e.key === "Escape") {
        setSelectedImageIndex(null)
      }

      if (e.key === "ArrowLeft") {
        showPrevImage()
      }

      if (e.key === "ArrowRight") {
        showNextImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedImageIndex])

  useEffect(() => {
    async function fetchDevLog() {
      if (!devLogId) return

      try {
        setLoading(true)
        setError("")

        const data = await getDevLog(devLogId)
        setDevLog(data)
      } catch (e) {
        setError(apiErrorMessage(e, "DevLog 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchDevLog()
  }, [devLogId])

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!loggedIn) {
        setMeId(null)
        return
      }

      try {
        const id = await getMeId()
        setMeId(id)
      } catch {
        setMeId(null)
      }
    })()
  }, [loggedIn])

  const closeImageModal = () => setSelectedImageIndex(null)

  const showPrevImage = () => {
    if (!devLog || selectedImageIndex === null) return

    setSelectedImageIndex((prev) =>
      prev === null ? null : prev === 0 ? devLog.attachments.length - 1 : prev - 1
    )
  }

  const showNextImage = () => {
    if (!devLog || selectedImageIndex === null) return

    setSelectedImageIndex((prev) =>
      prev === null
        ? null
        : prev === devLog.attachments.length - 1
          ? 0
          : prev + 1
    )
  }

  const handleDelete = async () => {
    if (!devLogId) return
    if (!window.confirm("DevLog를 삭제할까요?")) return

    try {
      setDeleting(true)
      setError("")

      await deleteDevLog(devLogId)
      nav("/devlogs")
    } catch (e) {
      setError(apiErrorMessage(e, "DevLog 삭제 실패"))
    } finally {
      setDeleting(false)
    }
  }

  const convertToPost = () => {
    if (!devLog) return

    nav("/posts/new", {
      state: {
        prefilledTitle: devLog.title,
        prefilledContent: `[문제 상황]
${devLog.problem}

[해결 과정]
${devLog.solution}

${devLog.reference ? `[참고한 코드 / 개념]\n${devLog.reference}\n\n` : ""}${
          devLog.retrospective ? `[정리하며]\n${devLog.retrospective}` : ""
        }`,
        prefilledType: "QUESTION",
      },
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">
        DevLog를 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!devLog) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-slate-500">
        DevLog가 없습니다.
      </div>
    )
  }

  const isOwner = meId != null && devLog.authorId === meId

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                DevLog
            </span>

            <button
                onClick={() => nav("/devlogs")}
                className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                뒤로가기
            </button>
            </div>

            <h1 className="mt-5 break-words text-3xl font-bold leading-tight text-slate-900">
            📝 {devLog.title}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">
                {devLog.authorNickname}
            </span>
            <span>·</span>
            <span>{new Date(devLog.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
            {isOwner && (
            <>
                <button
                onClick={convertToPost}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                🚀 커뮤니티에 질문하기
                </button>

                <button
                onClick={() => nav(`/devlogs/${devLog.id}/edit`)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                ✏️ 수정
                </button>

                <button
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                🗑 {deleting ? "삭제 중..." : "삭제"}
                </button>
            </>
            )}
        </div>
        </section>

      {devLog.attachments && devLog.attachments.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">🖼 첨부 이미지</h2>

          <div className="mt-4 columns-1 gap-4 sm:columns-2">
            {devLog.attachments.map((file, index) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img
                  src={fileUrl(file.fileUrl)}
                  alt={file.originalFileName}
                  className="w-full object-contain transition group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <DevLogSection title="🧩 문제 상황" content={devLog.problem} />
      <DevLogSection title="🛠 해결 과정" content={devLog.solution} />
      <DevLogSection title="📚 참고 코드 / 개념" content={devLog.reference} />
      <DevLogSection title="💡 회고" content={devLog.retrospective} />

      {selectedImageIndex !== null && devLog.attachments[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6"
          onClick={closeImageModal}
        >
          <div
            className="relative max-h-full w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeImageModal}
              className="absolute right-0 top-0 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white"
            >
              닫기
            </button>

            {devLog.attachments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-lg font-bold text-slate-900 shadow hover:bg-white"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-lg font-bold text-slate-900 shadow hover:bg-white"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={fileUrl(devLog.attachments[selectedImageIndex].fileUrl)}
              alt={devLog.attachments[selectedImageIndex].originalFileName}
              className="mx-auto max-h-[85vh] max-w-full rounded-2xl object-contain"
            />

            <div className="mt-3 text-center text-sm text-white/80">
              {selectedImageIndex + 1} / {devLog.attachments.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}