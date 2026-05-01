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

      <div className="mt-4 prose max-w-none text-slate-700
                      prose-pre:bg-slate-900
                      prose-pre:text-white
                      prose-pre:p-4
                      prose-pre:rounded-xl
                      prose-code:text-pink-500">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                DevLog
            </span>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
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

            <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
                {isOwner && (
                <button
                    onClick={convertToPost}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    🚀 커뮤니티에 질문하기
                </button>
                )}

                <button
                onClick={() => nav(-1)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                뒤로가기
                </button>
            </div>

            {isOwner && (
                <div className="flex gap-2">
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
                </div>
            )}
            </div>
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