import { useNavigate } from "react-router-dom"

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

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger" | "success"
  type?: "button" | "submit"
}) {
  const className =
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
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

type PostDetailHeaderProps = {
  post: {
    id: number
    title: string
    content: string
    authorNickname: string
    solved: boolean
    type: string
  }
  isMine: boolean
  canSolve: boolean
  busy: boolean
  actionErr: string | null
  onSolve: () => void
  onDeletePost: () => void
}

export default function PostDetailHeader({
  post,
  isMine,
  canSolve,
  busy,
  actionErr,
  onSolve,
  onDeletePost,
}: PostDetailHeaderProps) {
  const nav = useNavigate()

  const isStudyPost = post.type === "STUDY"

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
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

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>작성자 {post.authorNickname}</span>
      </div>

      <div className="rounded-3xl bg-slate-50 px-6 py-5 text-base leading-8 text-slate-700">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      {actionErr && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionErr}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <ActionButton onClick={() => nav("/posts")}>목록</ActionButton>

          {isMine && (
            <>
              <ActionButton
                onClick={() => nav(`/posts/${post.id}/edit`)}
                disabled={busy}
              >
                수정
              </ActionButton>
              <ActionButton
                onClick={onDeletePost}
                disabled={busy}
                variant="danger"
              >
                삭제
              </ActionButton>
            </>
          )}
        </div>

        {isMine && canSolve && (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <ActionButton
              onClick={onSolve}
              disabled={busy}
              variant="success"
            >
              해결 완료
            </ActionButton>
          </div>
        )}
      </div>
    </section>
  )
}