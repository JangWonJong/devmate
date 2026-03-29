import { Link } from "react-router-dom"

type CommentItem = {
  id: number
  memberId: number
  authorNickname: string
  content: string
  adopted: boolean
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  type = "button",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger" | "success"
  type?: "button" | "submit"
  className?: string
}) {
  const base =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : variant === "success"
      ? "bg-emerald-600 text-white hover:bg-emerald-500"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${base} ${className}`}
    >
      {children}
    </button>
  )
}

type CommentSectionProps = {
  loggedIn: boolean
  meId: number | null
  isMine: boolean
  commentErr: string | null
  comments: CommentItem[]
  commentInput: string
  setCommentInput: (value: string) => void
  editingCommentId: number | null
  editingContent: string
  setEditingCommentId: (value: number | null) => void
  setEditingContent: (value: string) => void
  onCreateComment: () => void
  onDeleteComment: (commentId: number) => void
  onUpdateComment: (commentId: number) => void
  onAdoptComment: (commentId: number) => void
  commentLikedMap: Record<number, boolean>
  commentLikeCountMap: Record<number, number>
  commentLikeLoadingMap: Record<number, boolean>
  onToggleCommentLike: (commentId: number) => void
}

export default function CommentSection({
  loggedIn,
  meId,
  isMine,
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
  onAdoptComment,
  commentLikedMap,
  commentLikeCountMap,
  commentLikeLoadingMap,
  onToggleCommentLike,
}: CommentSectionProps) {
  const sortedComments = [...comments].sort((a, b) => {
    if (a.adopted === b.adopted) return 0
    return a.adopted ? -1 : 1
  })

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">댓글</h2>
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

          <ActionButton type="submit" variant="primary">
            작성
          </ActionButton>
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
          sortedComments.map((c) => {
            const isMyComment = meId != null && c.memberId === meId
            const isEditing = editingCommentId === c.id

            return (
              <div
                key={c.id}
                className={`rounded-3xl border p-5 ${
                  c.adopted
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <Link to={`/members/${c.memberId}`} className="font-medium text-slate-700 hover:underline">
                        {c.authorNickname}
                    </Link>

                    {c.adopted && (
                      <span className="inline-flex rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white">
                        채택됨
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isMine && !c.adopted && (
                      <ActionButton
                        onClick={() => onAdoptComment(c.id)}
                        variant="success"
                        className="shadow-sm px-5"
                        >
                        채택
                        </ActionButton>
                    )}

                    {isMyComment && (
                      <>
                        <ActionButton
                          onClick={() => {
                            setEditingCommentId(c.id)
                            setEditingContent(c.content)
                          }}
                        >
                          수정
                        </ActionButton>

                        <ActionButton onClick={() => onDeleteComment(c.id)} variant="danger">
                          삭제
                        </ActionButton>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                    <div className="flex flex-wrap gap-2">
                      <ActionButton onClick={() => onUpdateComment(c.id)} variant="primary">
                        저장
                      </ActionButton>
                      <ActionButton
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingContent("")
                        }}
                      >
                        취소
                      </ActionButton>
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
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs font-medium transition
                          ${
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