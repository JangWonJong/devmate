import { Link } from 'react-router-dom'

type PreviewComment = {
  id: number
  memberId: number
  authorNickname: string
  content: string
  adopted?: boolean
  likeCount?: number
}

type CommentPreviewSectionProps = {
  title?: string
  comments: PreviewComment[]
  totalCount: number
  viewAllTo: string
  emptyText?: string
}

export default function CommentPreviewSection({
  title = '댓글',
  comments,
  totalCount,
  viewAllTo,
  emptyText = '댓글이 아직 없어요.',
}: CommentPreviewSectionProps) {
  const previewComments = comments.slice(0, 3)

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            최근 댓글 {totalCount}개
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={viewAllTo}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            전체 보기
          </Link>

          <Link
            to={`${viewAllTo}#comment-form`}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            댓글 작성
          </Link>
        </div>
      </div>

      {previewComments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          <p>{emptyText}</p>

          <Link
            to={`${viewAllTo}#comment-form`}
            className="mt-3 inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            첫 댓글 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {previewComments.map((comment) => (
            <Link
              key={comment.id}
              to={`${viewAllTo}#comment-${comment.id}`}
              className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-slate-800">
                  {comment.authorNickname}
                </span>

                {comment.adopted && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                    채택됨
                  </span>
                )}

                {comment.likeCount != null && comment.likeCount > 0 && (
                  <span className="text-xs text-slate-400">
                    좋아요 {comment.likeCount}
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {comment.content}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
