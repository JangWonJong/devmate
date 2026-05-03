import { Link, useLocation } from "react-router-dom"
import { actionButtonClass } from "../../utils/button"

export type DevLogCommentItem = {
  id: number
  memberId: number
  authorNickname: string
  content: string
  likeCount: number
  likedByMe: boolean
}

type DevLogCommentSectionProps = {
  loggedIn: boolean
  meId: number | null
  commentErr: string | null
  comments: DevLogCommentItem[]
  commentInput: string
  setCommentInput: (value: string) => void
  editingCommentId: number | null
  editingContent: string
  setEditingCommentId: (value: number | null) => void
  setEditingContent: (value: string) => void
  onCreateComment: () => void
  onDeleteComment: (commentId: number) => void
  onUpdateComment: (commentId: number) => void
  commentLikedMap: Record<number, boolean>
  commentLikeCountMap: Record<number, number>
  commentLikeLoadingMap: Record<number, boolean>
  onToggleCommentLike: (commentId: number) => void
}

export default function DevLogCommentSection({
  loggedIn,
  meId,
  commentErr,
  comments,
  commentInput,
  setCommentInput,
  editingCommentId,
  editingContent,
  setEditingCommentId,
  setEditingContent,
  onCreateComment,
  onDeleteComment,
  onUpdateComment,
  commentLikedMap,
  commentLikeCountMap,
  commentLikeLoadingMap,
  onToggleCommentLike,
}: DevLogCommentSectionProps) {
  const location = useLocation()

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          댓글
        </h2>
        <span className="text-sm text-slate-400">{comments.length}개</span>
      </div>

      {commentErr && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {commentErr}
        </div>
      )}

      {loggedIn ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onCreateComment()
          }}
          className="mb-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            작성
          </button>
        </form>
      ) : (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          로그인 후 댓글을 작성할 수 있어요.
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            댓글이 아직 없어요.
          </div>
        ) : (
          comments.map((c) => {
            const isMyComment = meId != null && c.memberId === meId
            const isEditing = editingCommentId === c.id
            const isTargetComment = location.hash === `#comment-${c.id}`

            return (
              <div
                id={`comment-${c.id}`}
                key={c.id}
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition ${
                  isTargetComment ? "ring-2 ring-indigo-300 ring-offset-2" : ""
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <Link
                      to={`/members/${c.memberId}`}
                      className="font-medium text-slate-700 hover:underline"
                    >
                      {c.authorNickname}
                    </Link>
                  </div>

                  {isMyComment && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(c.id)
                          setEditingContent(c.content)
                        }}
                        className={actionButtonClass("default")}
                      >
                        수정
                      </button>

                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className={actionButtonClass("danger")}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUpdateComment(c.id)}
                        className={actionButtonClass("default")}
                      >
                        저장
                      </button>

                      <button
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingContent("")
                        }}
                        className={actionButtonClass("subtle")}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {c.content}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleCommentLike(c.id)}
                        disabled={commentLikeLoadingMap[c.id]}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs font-medium transition ${
                          commentLikedMap[c.id]
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <span>{commentLikedMap[c.id] ? "❤️" : "🤍"}</span>
                        <span>{commentLikeCountMap[c.id] ?? 0}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}