import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  deletePost,
  getPost,
  solvePost,
  getPostLikeStatus,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  getPostBookmarkStatus,
  type PostResponse,
} from "../../api/post/posts"
import { tokenStore } from "../../api/auth/token"
import { getMeId } from "../../api/member/members"
import {
  listComments,
  createComment,
  deleteComment,
  updateComment,
  type CommentResponse,
  adoptComment,
  unlikeComment,
  likeComment,
} from "../../api/post/comments"
import {
  getStudyByPostId,
  getStudyMembers,
  createStudy,
  getStudy,
  joinStudy,
  leaveStudy,
  closeStudy,
  delegateStudyLeader,
  updateStudyCapacity,
  type StudyMemberResponse,
  type StudyResponse,
  updateStudyNotice,
} from "../../api/study/study"
import {
  listStudyReservations,
  type ReservationResponse,
} from "../../api/reservation/reservations"
import { apiErrorMessage } from "../../utils/error"
import { PageContainer } from "../../layouts/PageContainer"
import PostDetailHeader from "../../components/post/PostDetailHeader"
import StudyInfoSection from "../../components/study/detail/StudyInfoSection"
import CommentSection from "../../components/post/CommentSection"
import { ConfirmModal } from "../../components/common/ConfirmModal"
import { InputModal } from "../../components/common/InputModal"
import { useConfirm } from "../../components/common/useConfirm"
import { appToast } from "../../lib/toast"

export function PostDetailPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [commentErr, setCommentErr] = useState<string | null>(null)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const [studyError, setStudyError] = useState<string | null>(null)

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [post, setPost] = useState<PostResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [meId, setMeId] = useState<number | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [commentInput, setCommentInput] = useState("")
  const [deletingPost, setDeletingPost] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [studyLoading, setStudyLoading] = useState(false)
  const [studyMembers, setStudyMembers] = useState<StudyMemberResponse[]>([])

  const [studyReservations, setStudyReservations] = useState<
    ReservationResponse[]
  >([])
  const [reservationsLoading, setReservationsLoading] = useState(false)

  const [likedByMe, setLikedByMe] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const [commentLikedMap, setCommentLikedMap] = useState<
    Record<number, boolean>
  >({})
  const [commentLikeCountMap, setCommentLikeCountMap] = useState<
    Record<number, number>
  >({})
  const [commentLikeLoadingMap, setCommentLikeLoadingMap] = useState<
    Record<number, boolean>
  >({})

  const [bookmarkedByMe, setBookmarkedByMe] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  const [noticeModalOpen, setNoticeModalOpen] = useState(false)
  const [noticeInput, setNoticeInput] = useState("")
  const [capacityModalOpen, setCapacityModalOpen] = useState(false)
  const [capacityInput, setCapacityInput] = useState("4")
  const [capacityMode, setCapacityMode] = useState<"create" | "update">("create")

  const handledNotFoundRef = useRef(false)
  const handledHashRef = useRef<string | null>(null)

  const {
    open,
    title,
    message,
    danger,
    action,
    setOpen,
    confirm: openConfirm,
  } = useConfirm()

  const applyComments = (res: CommentResponse[]) => {
    setComments(res)
    setCommentLikedMap(
      Object.fromEntries(res.map((c) => [c.id, c.likedByMe ?? false]))
    )
    setCommentLikeCountMap(
      Object.fromEntries(res.map((c) => [c.id, c.likeCount ?? 0]))
    )
  }

  const refreshComments = async () => {
    if (!id) return

    const res = await listComments(id)
    applyComments(res)
  }

  const refreshStudySection = async (postId: number) => {
    const s = await getStudyByPostId(postId)
    setStudy(s)

    const members = await getStudyMembers(s.id)
    setStudyMembers(members)

    const reservationPage = await listStudyReservations({
      studyId: s.id,
      page: 0,
      size: 20,
      sort: "date,asc",
    })

    setStudyReservations(reservationPage.content)
  }

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()

    return tokenStore.subscribe(sync)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!loggedIn) {
        setMeId(null)
        return
      }

      try {
        const memberId = await getMeId()
        setMeId(memberId)
      } catch {
        setMeId(null)
      }
    })()
  }, [loggedIn])

  useEffect(() => {
    handledNotFoundRef.current = false
    handledHashRef.current = null
  }, [id])

  useEffect(() => {
    ;(async () => {
      try {
        setLoadErr(null)
        setLoading(true)

        if (!id) return

        const p = await getPost(id)
        setPost(p)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) {
          if (handledNotFoundRef.current) return

          handledNotFoundRef.current = true

          if (!deletingPost) {
            appToast.info("삭제되었거나 존재하지 않는 게시글입니다.")
          }

          nav("/", { replace: true })
          return
        }

        setLoadErr(apiErrorMessage(e, "상세 조회 실패"))
      } finally {
        setLoading(false)
      }
    })()
  }, [id, nav, deletingPost])

  useEffect(() => {
    ;(async () => {
      if (!id) return

      try {
        setCommentErr(null)

        const res = await listComments(id)
        applyComments(res)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) return

        setCommentErr(apiErrorMessage(e, "댓글 조회 실패"))
      }
    })()
  }, [id, loggedIn])

  useEffect(() => {
    if (loading) return

    let retryTimer: number | null = null

    if (!location.hash) {
      handledHashRef.current = null
      return
    }

    if (handledHashRef.current === location.hash) return

    const targetId = location.hash.replace("#", "")
    let retryCount = 0

    const scrollToTarget = () => {
      const el = document.getElementById(targetId)
      if (!el) return false

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      window.setTimeout(() => {
        window.scrollBy({
          top: -120,
          left: 0,
          behavior: "auto",
        })
      }, 150)

      handledHashRef.current = location.hash
      return true
    }

    const tryScroll = () => {
      if (scrollToTarget()) return
      if (retryCount >= 10) return

      retryCount += 1
      retryTimer = window.setTimeout(tryScroll, 200)
    }

    tryScroll()

    return () => {
      if (retryTimer) {
        window.clearTimeout(retryTimer)
      }
    }
  }, [loading, comments.length, location.hash])

  useEffect(() => {
    if (!post) return
    if (post.type !== "STUDY") return

    let cancelled = false

    ;(async () => {
      try {
        setStudyLoading(true)
        setReservationsLoading(true)
        setStudyError(null)

        const s = await getStudyByPostId(post.id)
        if (cancelled) return
        setStudy(s)

        const members = await getStudyMembers(s.id)
        if (cancelled) return
        setStudyMembers(members)

        const reservationPage = await listStudyReservations({
          studyId: s.id,
          page: 0,
          size: 20,
          sort: "date,asc",
        })

        if (cancelled) return
        setStudyReservations(reservationPage.content)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) {
          if (cancelled) return

          setStudy(null)
          setStudyMembers([])
          setStudyReservations([])
          return
        }

        if (cancelled) return

        setStudyError(apiErrorMessage(e, "스터디 정보를 불러오지 못했습니다."))
      } finally {
        if (!cancelled) {
          setStudyLoading(false)
          setReservationsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [post])

  useEffect(() => {
    ;(async () => {
      if (!id || !loggedIn) {
        setLikedByMe(false)
        setLikeCount(post?.likeCount ?? 0)
        return
      }

      try {
        const res = await getPostLikeStatus(id)
        setLikedByMe(res.likedByMe)
        setLikeCount(res.likeCount)
      } catch {
        setLikedByMe(false)
        setLikeCount(post?.likeCount ?? 0)
      }
    })()
  }, [id, loggedIn, post?.likeCount])

  useEffect(() => {
    ;(async () => {
      if (!id || !loggedIn) {
        setBookmarkedByMe(false)
        setBookmarkCount(0)
        return
      }

      try {
        const res = await getPostBookmarkStatus(id)
        setBookmarkedByMe(res.bookmarkedByMe)
        setBookmarkCount(res.bookmarkCount)
      } catch {
        setBookmarkedByMe(false)
        setBookmarkCount(0)
      }
    })()
  }, [id, loggedIn])

  const onCreateStudy = async () => {
    setCapacityMode("create")
    setCapacityInput("4")
    setCapacityModalOpen(true)
  }

  const onUpdateStudyCapacity = async () => {
    if (!study) return

    setCapacityMode("update")
    setCapacityInput(String(study.maxMembers))
    setCapacityModalOpen(true)
  }

  const onJoinStudy = async () => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await joinStudy(study.id)
      await refreshStudySection(post.id)

      appToast.success("스터디에 참여했습니다.")
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 참가 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onLeaveStudy = async () => {
    if (!study || !post) return

    openConfirm({
      title: "스터디 탈퇴",
      message: "스터디에서 탈퇴할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await leaveStudy(study.id)
          await refreshStudySection(post.id)

          appToast.success("스터디에서 탈퇴했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "스터디 탈퇴 실패"))
        } finally {
          setStudyLoading(false)
          setOpen(false)
        }
      },
    })
  }

  const onCloseStudy = async () => {
    if (!study || !post) return

    openConfirm({
      title: "스터디 모집 마감",
      message: "스터디 모집을 마감할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await closeStudy(study.id)
          await refreshStudySection(post.id)

          appToast.success("스터디 모집을 마감했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "스터디 모집 마감 실패"))
        } finally {
          setStudyLoading(false)
          setOpen(false)
        }
      },
    })
  }

  const onDelegateLeader = async (targetMemberId: number) => {
    if (!study || !post) return

    openConfirm({
      title: "리더 위임",
      message: "이 멤버에게 리더를 위임할까요?",
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await delegateStudyLeader(study.id, { targetMemberId })
          await refreshStudySection(post.id)

          appToast.success("리더를 위임했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "리더 위임 실패"))
        } finally {
          setStudyLoading(false)
          setOpen(false)
        }
      },
    })
  }

  const onUpdateNotice = async () => {
    if (!study || !post) return

    setNoticeInput(study.notice ?? "")
    setNoticeModalOpen(true)
  }

  const submitUpdateNotice = async (value: string) => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await updateStudyNotice(study.id, value)
      await refreshStudySection(post.id)

      appToast.success("공지 내용이 수정되었습니다.")
      setNoticeModalOpen(false)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "공지 수정 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const submitCapacity = async (value: string) => {
    if (!post) return

    const maxMembers = Number(value)

    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      setStudyError("최대 인원은 2명 이상이어야 합니다.")
      return
    }

    try {
      setStudyError(null)
      setStudyLoading(true)

      if (capacityMode === "create") {
        const studyId = await createStudy({
          postId: post.id,
          maxMembers,
        })

        const createdStudy = await getStudy(studyId)
        setStudy(createdStudy)

        const members = await getStudyMembers(studyId)
        setStudyMembers(members)

        appToast.success("스터디가 생성되었습니다.")
      } else {
        if (!study) return

        await updateStudyCapacity(study.id, { maxMembers })
        await refreshStudySection(post.id)

        appToast.success("정원이 수정되었습니다.")
      }

      setCapacityModalOpen(false)
      setCapacityInput("")
    } catch (e: any) {
      setStudyError(
        apiErrorMessage(
          e,
          capacityMode === "create"
            ? "스터디 생성 실패"
            : "스터디 정원 수정 실패"
        )
      )
    } finally {
      setStudyLoading(false)
    }
  }

  const onCreateComment = async () => {
    if (!id) return
    if (!commentInput.trim()) return

    try {
      setCommentErr(null)

      await createComment(id, { content: commentInput.trim() })
      setCommentInput("")
      await refreshComments()

      appToast.success("댓글이 작성되었습니다.")
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 작성 실패"))
    }
  }

  const onDeleteComment = async (commentId: number) => {
    openConfirm({
      title: "댓글 삭제",
      message: "댓글을 삭제할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setCommentErr(null)

          await deleteComment(commentId)

          setComments((prev) => prev.filter((c) => c.id !== commentId))

          setCommentLikedMap((prev) => {
            const next = { ...prev }
            delete next[commentId]
            return next
          })

          setCommentLikeCountMap((prev) => {
            const next = { ...prev }
            delete next[commentId]
            return next
          })

          setCommentLikeLoadingMap((prev) => {
            const next = { ...prev }
            delete next[commentId]
            return next
          })

          if (editingCommentId === commentId) {
            setEditingCommentId(null)
            setEditingContent("")
          }

          appToast.success("댓글이 삭제되었습니다.")
        } catch (e: any) {
          setCommentErr(apiErrorMessage(e, "댓글 삭제 실패"))
        } finally {
          setOpen(false)
        }
      },
    })
  }

  const onUpdateComment = async (commentId: number) => {
    const content = editingContent.trim()

    if (!content) {
      setCommentErr("댓글 내용을 입력하세요")
      return
    }

    try {
      setCommentErr(null)

      await updateComment(commentId, content)

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content } : c))
      )

      setEditingCommentId(null)
      setEditingContent("")

      appToast.success("댓글이 수정되었습니다.")
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 수정 실패"))
    }
  }

  const onAdoptComment = async (commentId: number) => {
    try {
      setCommentErr(null)

      await adoptComment(commentId)
      await refreshComments()

      const updatedPost = await getPost(id!)
      setPost(updatedPost)

      appToast.success("댓글을 채택했습니다.")
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 채택 실패"))
    }
  }

  const onSolve = async () => {
    if (!id) return

    openConfirm({
      title: "게시글 해결 처리",
      message: "이 글을 해결됨으로 처리할까요?",
      onConfirm: async () => {
        try {
          setBusy(true)
          setActionErr(null)

          await solvePost(id)

          const updated = await getPost(id)
          setPost(updated)

          appToast.success("해결 처리되었습니다.")
        } catch (e: any) {
          setActionErr(apiErrorMessage(e, "해결 처리 실패"))
        } finally {
          setBusy(false)
          setOpen(false)
        }
      },
    })
  }

  const onDeletePost = async () => {
    if (!id) return

    openConfirm({
      title: "게시글 삭제",
      message: "삭제한 게시글은 복구할 수 없어요. 정말 삭제할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setBusy(true)
          setDeletingPost(true)
          setActionErr(null)

          await deletePost(id)

          appToast.success("게시글이 삭제되었습니다.")
          nav("/posts", { replace: true })
        } catch (e: any) {
          setActionErr(apiErrorMessage(e, "삭제 실패"))
          setDeletingPost(false)
        } finally {
          setBusy(false)
          setOpen(false)
        }
      },
    })
  }

  const onToggleLike = async () => {
    if (!id || likeLoading) return

    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    try {
      setActionErr(null)
      setLikeLoading(true)

      if (likedByMe) {
        await unlikePost(id)
        setLikedByMe(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likePost(id)
        setLikedByMe(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (e: any) {
      setActionErr(apiErrorMessage(e, "좋아요 처리 실패"))
    } finally {
      setLikeLoading(false)
    }
  }

  const onToggleCommentLike = async (commentId: number) => {
    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    if (commentLikeLoadingMap[commentId]) return

    try {
      setCommentErr(null)
      setCommentLikeLoadingMap((prev) => ({
        ...prev,
        [commentId]: true,
      }))

      const liked = commentLikedMap[commentId] ?? false

      if (liked) {
        await unlikeComment(commentId)
        setCommentLikedMap((prev) => ({
          ...prev,
          [commentId]: false,
        }))
        setCommentLikeCountMap((prev) => ({
          ...prev,
          [commentId]: Math.max(0, (prev[commentId] ?? 1) - 1),
        }))
      } else {
        await likeComment(commentId)
        setCommentLikedMap((prev) => ({
          ...prev,
          [commentId]: true,
        }))
        setCommentLikeCountMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] ?? 0) + 1,
        }))
      }
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 좋아요 실패"))
    } finally {
      setCommentLikeLoadingMap((prev) => ({
        ...prev,
        [commentId]: false,
      }))
    }
  }

  const onToggleBookmark = async () => {
    if (!id || bookmarkLoading) return

    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    try {
      setActionErr(null)
      setBookmarkLoading(true)

      if (bookmarkedByMe) {
        await unbookmarkPost(id)
        setBookmarkedByMe(false)
        setBookmarkCount((prev) => Math.max(0, prev - 1))
      } else {
        await bookmarkPost(id)
        setBookmarkedByMe(true)
        setBookmarkCount((prev) => prev + 1)
      }
    } catch (e: any) {
      setActionErr(apiErrorMessage(e, "북마크 처리 실패"))
    } finally {
      setBookmarkLoading(false)
    }
  }

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
  const isStudyPost = post.type === "STUDY"

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
        onCancel={() => setOpen(false)}
      />

      <InputModal
        open={noticeModalOpen}
        title="공지 수정"
        message="스터디 공지 내용을 입력하세요."
        placeholder="공지 내용을 입력하세요"
        defaultValue={noticeInput}
        multiline
        loading={studyLoading}
        confirmText="저장"
        cancelText="취소"
        onConfirm={submitUpdateNotice}
        onCancel={() => {
          setNoticeModalOpen(false)
          setNoticeInput("")
        }}
      />

      <InputModal
        open={capacityModalOpen}
        title={
          capacityMode === "create"
            ? "스터디 생성"
            : "스터디 정원 수정"
        }
        message="최대 인원을 입력하세요."
        placeholder="예: 4"
        defaultValue={capacityInput}
        loading={studyLoading}
        confirmText="확인"
        cancelText="취소"
        onConfirm={submitCapacity}
        onCancel={() => {
          setCapacityModalOpen(false)
          setCapacityInput("")
        }}
      />
    </PageContainer>
  )
}