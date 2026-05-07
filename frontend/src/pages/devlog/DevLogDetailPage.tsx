import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  deleteDevLog,
} from "../../api/devlog/devlog"
import DevLogCommentSection from "../../components/devlog/DevLogCommentSection"
import { useAuthState } from "../../hooks/auth/useAuthState"
import { useDevLogDetail } from "../../hooks/devlog/useDevLogDetail"
import { useDevLogReactions } from "../../hooks/devlog/useDevLogReactions"
import { useDevLogComments } from "../../hooks/devlog/useDevLogComments"
import { fileUrl } from "../../utils/file"
import { apiErrorMessage } from "../../utils/error"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { PageContainer } from "../../layouts/PageContainer"
import { appToast } from "../../lib/toast"
import { useConfirm } from "../../hooks/common/useConfirm"
import { ConfirmModal } from "../../components/common/feedback/ConfirmModal"
import { ImageGalleryModal } from "../../components/common/image/ImageGalleryModal"
import "../../components/common/devlog.css"

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

      <div className="mt-4 text-sm leading-7 text-slate-700 devlog-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "")
              const language = match?.[1] ?? "text"
              const code = String(children).replace(/\n$/, "")

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
                      onClick={() => navigator.clipboard.writeText(code)}
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
                    {code}
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

  const id = devLogId ? Number(devLogId) : null

  const { loggedIn, meId } = useAuthState()

  const [deleting, setDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const {
    open,
    title,
    message,
    danger,
    action,
    confirm: openConfirm,
    closeConfirm,
  } = useConfirm()

  const {
    devLog,
    loading,
    error,
    setError,
  } = useDevLogDetail({
    devLogId,
  })

  const {
    likeCount,
    likedByMe,
    likeLoading,
    onToggleLike,
  } = useDevLogReactions({
    devLogId,
    devLog,
    loggedIn,
  })

  const {
    commentErr,
    comments,
    commentInput,
    setCommentInput,

    editingCommentId,
    editingContent,
    setEditingCommentId,
    setEditingContent,

    commentLikedMap,
    commentLikeCountMap,
    commentLikeLoadingMap,

    onCreateComment,
    onDeleteComment,
    onUpdateComment,
    onToggleCommentLike,
  } = useDevLogComments({
    devLogId: id,
    confirm: openConfirm,
    closeConfirm,
  })

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

    try {
      setDeleting(true)
      setError("")

      await deleteDevLog(devLogId)
      appToast.success("DevLog가 삭제되었습니다.")
      nav("/devlogs")
    } catch (e) {
      appToast.error(apiErrorMessage(e, "DevLog 삭제 실패"))
    } finally {
      setDeleting(false)
      closeConfirm()
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
    <PageContainer className="space-y-6">
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
              목록
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

          <button
            type="button"
            onClick={onToggleLike}
            disabled={likeLoading}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              likedByMe
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {likedByMe ? "❤️" : "🤍"} {likeCount}
          </button>
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
                onClick={() => {
                  openConfirm({
                    title: "DevLog 삭제",
                    message: "삭제한 DevLog는 복구할 수 없어요. 정말 삭제할까요?",
                    danger: true,
                    onConfirm: handleDelete,
                  })
                }}
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

      <DevLogCommentSection
        loggedIn={loggedIn}
        meId={meId}
        commentErr={commentErr}
        comments={comments}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        editingCommentId={editingCommentId}
        editingContent={editingContent}
        setEditingCommentId={setEditingCommentId}
        setEditingContent={setEditingContent}
        onCreateComment={onCreateComment}
        onDeleteComment={onDeleteComment}
        onUpdateComment={onUpdateComment}
        commentLikedMap={commentLikedMap}
        commentLikeCountMap={commentLikeCountMap}
        commentLikeLoadingMap={commentLikeLoadingMap}
        onToggleCommentLike={onToggleCommentLike}
        />
      {selectedImageIndex !== null && (
        <ImageGalleryModal
          images={devLog.attachments}
          currentIndex={selectedImageIndex}
          getImageUrl={fileUrl}
          onClose={closeImageModal}
          onPrev={showPrevImage}
          onNext={showNextImage}
        />
      )}
      <ConfirmModal
        open={open}
        title={title}
        message={message}
        confirmText={danger ? "삭제" : "확인"}
        cancelText="취소"
        danger={danger}
        loading={deleting}
        onConfirm={() => action?.()}
        onCancel={closeConfirm}
      />
    </PageContainer>
  )
  
}