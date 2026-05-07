import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import type { PostResponse } from "../../api/post/posts"
import { actionButtonClass } from "../../utils/button"
import { ImageGalleryModal } from "../common/image/ImageGalleryModal"
import { MarkdownViewer } from "../common/markdown/MarkdownViewer"


function StatusBadge({ solved }: { solved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        solved
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {solved ? "고민 해결됨" : "고민 해결 전"}
    </span>
  )
}

type PostDetailHeaderProps = {
  post: PostResponse
  isMine: boolean
  canSolve: boolean
  busy: boolean
  actionErr: string | null
  onSolve: () => void
  onDeletePost: () => void
  likedByMe: boolean
  likeCount: number
  likeLoading: boolean
  onToggleLike: () => void
  bookmarkedByMe: boolean
  bookmarkCount: number
  bookmarkLoading: boolean
  onToggleBookmark: () => void
}

export default function PostDetailHeader({
  post,
  isMine,
  canSolve,
  busy,
  actionErr,
  onSolve,
  onDeletePost,
  likedByMe,
  likeCount,
  likeLoading,
  onToggleLike,
  bookmarkedByMe,
  bookmarkCount,
  bookmarkLoading,
  onToggleBookmark,
}: PostDetailHeaderProps) {
  const nav = useNavigate()
  const isStudyPost = post.type === "STUDY"

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImageIndex(null)
  }

  const goPrevImage = () => {
    if (!post.attachments.length || selectedImageIndex == null) return
    setSelectedImageIndex((prev) =>
      prev == null
        ? 0
        : (prev - 1 + post.attachments.length) % post.attachments.length
    )
  }

  const goNextImage = () => {
    if (!post.attachments.length || selectedImageIndex == null) return
    setSelectedImageIndex((prev) =>
      prev == null ? 0 : (prev + 1) % post.attachments.length
    )
  }

  return (
    <>
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge solved={post.solved} />

              {isMine && (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  내 글
                </span>
              )}

              {isStudyPost && (
                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  스터디 글
                </span>
              )}
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
              {post.title}
            </h1>

            <span className="text-sm text-slate-500">
              작성자{" "}
              <Link
                to={`/members/${post.authorId}`}
                className="font-medium text-slate-700 hover:underline"
              >
                {post.authorNickname}
              </Link>
            </span>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              onClick={() => nav("/posts")}
              className="
                  rounded-2xl px-4 py-2.5 text-sm font-semibold transition
                  bg-indigo-50 text-gray-600
                  hover:bg-indigo-100
                  disabled:opacity-50
                "
            >
              전체 목록으로
            </button>

            {isMine && (
              <button
                onClick={() => nav(`/posts/${post.id}/edit`)}
                disabled={busy}
                className="
                  rounded-2xl px-4 py-2.5 text-sm font-semibold transition
                  bg-indigo-50 text-indigo-600
                  hover:bg-indigo-100
                  disabled:opacity-50
                "
              >
                게시글 수정
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 px-6 py-5">
          <MarkdownViewer content={post.content} />
        </div>

        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-semibold text-slate-700">첨부 이미지</div>

            <div className="columns-1 gap-4 sm:columns-2">
            {post.attachments.map((file, index) => (
              <button
                key={file.id}
                type="button"
                onClick={() => openImageModal(index)}
                className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:shadow-md"
              >
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${file.fileUrl}`}
                  alt={file.originalFileName}
                  className="w-auto object-contain hover:scale-[1.02] transition"
                />
              </button>
            ))}
          </div>
          </div>
        )}

        {actionErr && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionErr}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2">
        {/* ⭐ 좋아요 (왼쪽) */}
        <button
          onClick={onToggleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm transition
            ${
              likedByMe
                ? "bg-red-100 text-red-600"
                : "bg-slate-100 text-slate-600"
            }
            hover:scale-105 active:scale-95`}
        >
          {likedByMe ? "❤️" : "🤍"} {likeCount}
        </button>

         <button
        onClick={onToggleBookmark}
        disabled={bookmarkLoading}
        className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm transition
          ${
            bookmarkedByMe
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600"
          }
          hover:scale-105 active:scale-95`}>
        {bookmarkedByMe ? "🔖" : "📑"} {bookmarkCount}
      </button>
        </div>
        {/* 오른쪽 버튼들 */}
        <div className="flex gap-3">
          {isMine && canSolve && (
            <button
              onClick={onSolve}
              disabled={busy}
              className={actionButtonClass("success", busy)}
            >
              해결 완료
            </button>
          )}

          {isMine && (
            <button
              onClick={onDeletePost}
              disabled={busy}
              className={actionButtonClass("danger", busy)}
            >
              삭제
            </button>
          )}
        </div>
      </div>
      </section>

      {selectedImageIndex != null && (
        <ImageGalleryModal
          images={post.attachments}
          currentIndex={selectedImageIndex}
          getImageUrl={(fileUrl) => `${import.meta.env.VITE_API_BASE_URL}${fileUrl}`}
          onClose={closeImageModal}
          onPrev={goPrevImage}
          onNext={goNextImage}
        />
      )}
    </>
  )
}