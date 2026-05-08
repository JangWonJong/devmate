import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmModal } from '../../components/common/modal/ConfirmModal'
import { InputModal } from '../../components/common/modal/InputModal'
import CommentSection from '../../components/post/CommentSection'
import PostDetailHeader from '../../components/post/PostDetailHeader'
import StudyInfoSection from '../../components/study/detail/StudyInfoSection'
import { useAuthState } from '../../hooks/auth/useAuthState'
import { useConfirm } from '../../hooks/common/useConfirm'
import { useScrollToHash } from '../../hooks/common/useScrollToHash'
import { usePostActions } from '../../hooks/post/usePostActions'
import { usePostComments } from '../../hooks/post/usePostComments'
import { usePostDetail } from '../../hooks/post/usePostDetail'
import { usePostReactions } from '../../hooks/post/usePostReactions'
import { usePostStudySection } from '../../hooks/post/usePostStudySection'
import { PageContainer } from '../../layouts/PageContainer'
import { StudyCreateModal } from '../../components/study/modal/StudyCreateModal'
import { PlaceSelectModal } from '../../components/common/map/PlaceSelectModal'

export function PostDetailPage() {
  const nav = useNavigate()

  const navigateToHome = useCallback(() => {
    nav('/', { replace: true })
  }, [nav])

  const navigateToPosts = useCallback(() => {
    nav('/posts', { replace: true })
  }, [nav])

  const { id } = useParams()

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

  const { post, setPost, loading, loadErr } = usePostDetail({
    postId: id,
    navigateToHome,
  })

  const {
    study,
    studyLoading,
    studyError,
    studyMembers,
    studyReservations,
    reservationsLoading,

    noticeCreateInput,
    noticeModalOpen,
    noticeUpdateInput,
    setNoticeCreateInput,
    setNoticeModalOpen,
    setNoticeUpdateInput,

    capacityModalOpen,
    capacityInput,
    capacityMode,
    setCapacityModalOpen,
    setCapacityInput,

    placeNameInput,
    addressInput,
    setPlaceNameInput,
    setAddressInput,
    setLatitudeInput,
    setLongitudeInput,

    onCreateStudy,
    onJoinStudy,
    onLeaveStudy,
    onCloseStudy,
    onUpdateStudyCapacity,
    onUpdateNotice,
    onDelegateLeader,
    submitUpdateNotice,
    submitCapacity,

    placeModalOpen,
    placeUpdateNameInput,
    placeUpdateAddressInput,
    setPlaceModalOpen,
    setPlaceUpdateNameInput,
    setPlaceUpdateAddressInput,
    setPlaceUpdateLatitudeInput,
    setPlaceUpdateLongitudeInput,
    onUpdatePlace,
    submitUpdatePlace,
  } = usePostStudySection({
    post,
    openConfirm,
    closeConfirm,
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

  const {
    likedByMe,
    likeCount,
    likeLoading,
    onToggleLike,

    bookmarkedByMe,
    bookmarkCount,
    bookmarkLoading,
    onToggleBookmark,
  } = usePostReactions({
    postId: id,
    post,
    loggedIn,
  })
  

  const { busy, actionErr, onSolve, onDeletePost } = usePostActions({
    postId: id,
    setPost,
    navigateToPosts,
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
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        게시글 불러오는 중...
      </div>
    )
  }

  if (loadErr) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {loadErr}
      </div>
    )
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        게시글이 없어요.
      </div>
    )
  }

  const isMine = meId != null && post.authorId === meId
  const canSolve = isMine && !post.solved
  const isStudyPost = post.type === 'STUDY'

  return (
    <PageContainer className="mx-auto max-w-4xl space-y-8">
      <PostDetailHeader
        post={post}
        isMine={isMine}
        canSolve={canSolve}
        busy={busy}
        actionErr={actionErr}
        onSolve={onSolve}
        onDeletePost={onDeletePost}
        likedByMe={likedByMe}
        likeCount={likeCount}
        likeLoading={likeLoading}
        onToggleLike={onToggleLike}
        bookmarkedByMe={bookmarkedByMe}
        bookmarkCount={bookmarkCount}
        bookmarkLoading={bookmarkLoading}
        onToggleBookmark={onToggleBookmark}
      />

      {isStudyPost && (
        <StudyInfoSection
          study={study}
          studyLoading={studyLoading}
          studyError={studyError}
          studyMembers={studyMembers}
          studyReservations={studyReservations}
          reservationsLoading={reservationsLoading}
          loggedIn={loggedIn}
          meId={meId}
          isAuthor={isMine}
          onCreateStudy={onCreateStudy}
          onJoinStudy={onJoinStudy}
          onLeaveStudy={onLeaveStudy}
          onCloseStudy={onCloseStudy}
          onUpdateCapacity={onUpdateStudyCapacity}
          onUpdateNotice={onUpdateNotice}
          onDelegateLeader={onDelegateLeader}
          onUpdatePlace={onUpdatePlace}
        />
      )}

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

      <InputModal
        open={noticeModalOpen}
        title="공지 수정"
        message="스터디 공지 내용을 입력하세요."
        placeholder="공지 내용을 입력하세요"
        defaultValue={noticeUpdateInput}
        multiline
        loading={studyLoading}
        confirmText="저장"
        cancelText="취소"
        onConfirm={submitUpdateNotice}
        onCancel={() => {
          setNoticeModalOpen(false)
          setNoticeUpdateInput('')
        }}
      />
      <StudyCreateModal
        open={capacityModalOpen}
        title={capacityMode === 'create' ? '스터디 생성' : '스터디 정원 수정'}
        loading={studyLoading}
        showPlaceFields={capacityMode === 'create'}
        notice={noticeCreateInput}
        maxMembers={capacityInput}
        placeName={placeNameInput}
        address={addressInput}
        onChangeNotice={setNoticeCreateInput}
        onChangeMaxMembers={setCapacityInput}
        onChangePlaceName={setPlaceNameInput}
        onChangeAddress={setAddressInput}
        onSelectPlace={(place) => {
          setPlaceNameInput(place.placeName)
          setAddressInput(place.roadAddress || place.address)
          setLatitudeInput(place.latitude)
          setLongitudeInput(place.longitude)
        }}
        onConfirm={submitCapacity}
        onCancel={() => {
          setNoticeCreateInput('')
          setCapacityModalOpen(false)
          setCapacityInput('4')
          setPlaceNameInput('')
          setAddressInput('')
          setLatitudeInput(null)
          setLongitudeInput(null)
        }}
      />
      <PlaceSelectModal
        open={placeModalOpen}
        title="스터디 장소 수정"
        loading={studyLoading}
        placeName={placeUpdateNameInput}
        address={placeUpdateAddressInput}
        onChangePlaceName={setPlaceUpdateNameInput}
        onChangeAddress={setPlaceUpdateAddressInput}
        onSelectPlace={(place) => {
          setPlaceUpdateNameInput(place.placeName)
          setPlaceUpdateAddressInput(place.roadAddress || place.address)
          setPlaceUpdateLatitudeInput(place.latitude)
          setPlaceUpdateLongitudeInput(place.longitude)
        }}
        onConfirm={submitUpdatePlace}
        onCancel={() => setPlaceModalOpen(false)}
      />
    </PageContainer>
  )
}
