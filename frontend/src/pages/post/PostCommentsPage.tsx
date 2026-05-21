import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useScrollToHash } from '../../hooks/common/useScrollToHash'
import { ChevronLeft } from 'lucide-react'
import CommentSection from '../../components/post/CommentSection'
import { ConfirmModal } from '../../components/common/modal/ConfirmModal'
import { useAuthState } from '../../hooks/auth/useAuthState'
import { useConfirm } from '../../hooks/common/useConfirm'
import { usePostComments } from '../../hooks/post/usePostComments'
import { usePostDetail } from '../../hooks/post/usePostDetail'
import { PageContainer } from '../../layouts/PageContainer'

export function PostCommentsPage() {
  const nav = useNavigate()
  const { id } = useParams()

  const { loggedIn, meId } = useAuthState()

  const navigateToHome = useCallback(() => {
    nav('/', { replace: true })
  }, [nav])

  const {
    open,
    title,
    message,
    danger,
    action,
    confirm: openConfirm,
    closeConfirm,
  } = useConfirm()

  const { post, setPost, loading, loadErr } = usePostDetail({
    postId: id,
    navigateToHome,
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
    onAdoptComment,
    onToggleCommentLike,
  } = usePostComments({
    postId: id,
    loggedIn,
    onPostUpdated: setPost,
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

  if (loadErr || !post) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadErr || '게시글을 찾을 수 없어요.'}
        </div>
      </PageContainer>
    )
  }

  const isMine = meId != null && post.authorId === meId

  return (
    <PageContainer className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => nav(`/posts/${post.id}`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          게시글로 돌아가기
        </button>

        <h1 className="mt-4 line-clamp-2 text-2xl font-bold text-slate-900">
          {post.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">댓글 {comments.length}개</p>
      </section>

      <CommentSection
        loggedIn={loggedIn}
        meId={meId}
        isMine={isMine}
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
        onAdoptComment={onAdoptComment}
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
