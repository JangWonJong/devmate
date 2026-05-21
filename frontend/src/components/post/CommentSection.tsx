import { Link, useLocation } from "react-router-dom"
import { actionButtonClass } from "../../utils/button"
import { toast } from "sonner"

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
    variant === 'primary'
      ? 'border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : variant === 'success'
          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'

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
  const location = useLocation()

  const sortedComments = [...comments].sort((a, b) => {
    if (a.adopted !== b.adopted) {
      return a.adopted ? -1 : 1
    }

    return b.id - a.id
  })

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
          id="comment-form"
          onSubmit={(e) => {
            e.preventDefault()
            onCreateComment()
          }}
          className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()

                if (!commentInput.trim()) {
                  return
                }

                toast('댓글을 등록하시겠습니까?', {
                  action: {
                    label: '등록',
                    onClick: () => {
                      onCreateComment()
                    },
                  },
                })
              }
            }}
            placeholder="댓글을 입력하세요"
            rows={4}
            className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200"
          />

          <div className="mt-3 flex justify-end">
            <ActionButton type="submit" variant="primary">
              작성
            </ActionButton>
          </div>
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
            const isTargetComment = location.hash === `#comment-${c.id}`

            return (
              <div
                id={`comment-${c.id}`}
                key={c.id}
                className={`scroll-mt-24 rounded-3xl border p-6 transition ${
                  c.adopted
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                } ${isTargetComment ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <Link
                      to={`/members/${c.memberId}`}
                      className="font-medium text-slate-700 hover:underline"
                    >
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
                      <button
                        onClick={() => onAdoptComment(c.id)}
                        className={actionButtonClass('success')}
                      >
                        채택
                      </button>
                    )}

                    {isMyComment && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id)
                            setEditingContent(c.content)
                          }}
                          className={actionButtonClass('default')}
                        >
                          수정
                        </button>

                        <button
                          onClick={() => onDeleteComment(c.id)}
                          className={actionButtonClass('danger')}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()

                          if (!commentInput.trim()) {
                            return
                          }

                          toast('댓글을 수정하시겠습니까?', {
                            action: {
                              label: '수정',
                              onClick: () => {
                                onCreateComment()
                              },
                            },
                          })
                        }
                      }}
                      placeholder="댓글을 입력하세요"
                      rows={4}
                      className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUpdateComment(c.id)}
                        className={actionButtonClass('default')}
                      >
                        저장
                      </button>

                      <button
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingContent('')
                        }}
                        className={actionButtonClass('subtle')}
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
                            ? 'border-red-200 bg-red-50 text-red-600'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span>{commentLikedMap[c.id] ? '❤️' : '🤍'}</span>
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