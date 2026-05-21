import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useScrollToHash } from '../../hooks/common/useScrollToHash'

import { ConfirmModal } from '../../components/common/modal/ConfirmModal'
import DevLogCommentSection from '../../components/devlog/DevLogCommentSection'
import { useAuthState } from '../../hooks/auth/useAuthState'
import { useConfirm } from '../../hooks/common/useConfirm'
import { useDevLogComments } from '../../hooks/devlog/useDevLogComments'
import { useDevLogDetail } from '../../hooks/devlog/useDevLogDetail'
import { PageContainer } from '../../layouts/PageContainer'

export function DevLogCommentsPage() {
  const nav = useNavigate()
  const { devLogId } = useParams()

  const id = devLogId ? Number(devLogId) : null

  const { loggedIn, meId } = useAuthState()

  const {
    open,
    title,
    message,
    danger,
    action,
    confirm: openConfirm,
    closeConfirm,
  } = useConfirm()

  const { devLog, loading, error } = useDevLogDetail({
    devLogId,
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

  useScrollToHash({
    enabled: !loading,
    deps: [comments.length],
    offset: 120,
  })

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          댓글을 불러오는 중...
        </div>
      </PageContainer>
    )
  }

  if (error || !devLog) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'DevLog를 찾을 수 없어요.'}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => nav(`/devlogs/${devLog.id}`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          DevLog로 돌아가기
        </button>

        <h1 className="mt-4 line-clamp-2 text-2xl font-bold text-slate-900">
          {devLog.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">댓글 {comments.length}개</p>
      </section>

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

      <ConfirmModal
        open={open}
        title={title}
        message={message}
        confirmText="확인"
        cancelText="취소"
        danger={danger}
        onConfirm={() => action?.()}
        onCancel={closeConfirm}
      />
    </PageContainer>
  )
}
