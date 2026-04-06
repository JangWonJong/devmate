import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  deletePost,
  getPost,
  solvePost,
  getPostLikeStatus,
  likePost,
  unlikePost,
  type PostResponse,
} from "../../api/posts"
import { tokenStore } from "../../auth/token"
import { getMeId } from "../../api/members"
import {
  listComments,
  createComment,
  deleteComment,
  updateComment,
  type CommentResponse,
  adoptComment,
  unlikeComment,
  likeComment,
} from "../../api/comments"
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
} from "../../api/study"
import {
  listStudyReservations,
  type ReservationResponse,
} from "../../api/reservations"
import { apiErrorMessage } from "../../utils/error"
import PostDetailHeader from "../../components/post/detail/PostDetailHeader"
import StudyInfoSection from "../../components/study/detail/StudyInfoSection"
import CommentSection from "../../components/post/detail/CommentSection"

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

  const [studyReservations, setStudyReservations] = useState<ReservationResponse[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)

  const [likedByMe, setLikedByMe] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const [commentLikedMap, setCommentLikedMap] = useState<Record<number, boolean>>({})
  const [commentLikeCountMap, setCommentLikeCountMap] = useState<Record<number, number>>({})
  const [commentLikeLoadingMap, setCommentLikeLoadingMap] = useState<Record<number, boolean>>({})

  const handledNotFoundRef = useRef(false)
  const handledHashRef = useRef<string | null>(null)

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

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn())
    sync()
    return tokenStore.subscribe(sync)
  }, [])

  useEffect(() => {
    handledNotFoundRef.current = false
    handledHashRef.current = null
  }, [id])

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
            alert("삭제되었거나 존재하지 않는 게시글입니다.")
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
    if (!comments.length) return
    if (!location.hash) return
    if (handledHashRef.current === location.hash) return

    const timer = window.setTimeout(() => {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        handledHashRef.current = location.hash
      }
    }, 100)

    return () => window.clearTimeout(timer)
  }, [comments, location.hash])

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
  }, [id, loggedIn])

  useEffect(() => {
    if (loading) return

    if (!location.hash) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      })
    }
  }, [location.pathname, location.hash, loading])

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

  const onCreateStudy = async () => {
    if (!post) return

    const input = prompt("최대 인원을 입력하세요", "4")
    if (!input) return

    const maxMembers = Number(input)

    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      setStudyError("최대 인원은 2명 이상이어야 합니다.")
      return
    }

    try {
      setStudyError(null)
      setStudyLoading(true)

      const studyId = await createStudy({
        postId: post.id,
        maxMembers,
      })

      const createdStudy = await getStudy(studyId)
      setStudy(createdStudy)

      const members = await getStudyMembers(studyId)
      setStudyMembers(members)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 생성 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onUpdateStudyCapacity = async () => {
    if (!study || !post) return

    const input = prompt("변경할 최대 인원을 입력하세요", String(study.maxMembers))
    if (!input) return

    const maxMembers = Number(input)

    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      setStudyError("최대 인원은 2명 이상이어야 합니다.")
      return
    }

    try {
      setStudyError(null)
      setStudyLoading(true)
      await updateStudyCapacity(study.id, { maxMembers })
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 정원 수정 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onJoinStudy = async () => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)
      await joinStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 참가 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onLeaveStudy = async () => {
    if (!study || !post) return

    const ok = confirm("스터디에서 탈퇴할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)
      await leaveStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 탈퇴 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onCloseStudy = async () => {
    if (!study || !post) return

    const ok = confirm("스터디 모집을 마감할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)
      await closeStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 모집 마감 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onDelegateLeader = async (targetMemberId: number) => {
    if (!study || !post) return

    const ok = confirm("이 멤버에게 리더를 위임할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)
      await delegateStudyLeader(study.id, { targetMemberId })
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "리더 위임 실패"))
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
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 작성 실패"))
    }
  }

  const onDeleteComment = async (commentId: number) => {
    const ok = confirm("댓글을 삭제할까요?")
    if (!ok) return

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
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 삭제 실패"))
    }
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
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 수정 실패"))
    }
  }

  const onSolve = async () => {
    if (!id) return
    const ok = confirm("이 글을 해결됨으로 처리할까요?")
    if (!ok) return

    try {
      setBusy(true)
      setActionErr(null)

      await solvePost(id)
      const updated = await getPost(id)
      setPost(updated)
    } catch (e: any) {
      setActionErr(apiErrorMessage(e, "해결 처리 실패"))
    } finally {
      setBusy(false)
    }
  }

  const onDeletePost = async () => {
    if (!id) return
    const ok = confirm("정말 삭제할까요?")
    if (!ok) return

    try {
      setBusy(true)
      setDeletingPost(true)
      setActionErr(null)
      await deletePost(id)
      nav("/posts", { replace: true })
    } catch (e: any) {
      setActionErr(apiErrorMessage(e, "삭제 실패"))
      setDeletingPost(false)
    } finally {
      setBusy(false)
    }
  }

  const onAdoptComment = async (commentId: number) => {
    try {
      setCommentErr(null)
      await adoptComment(commentId)
      await refreshComments()

      const updatedPost = await getPost(id!)
      setPost(updatedPost)
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 채택 실패"))
    }
  }

  const onUpdateNotice = async () => {
    if (!study || !post) return

    const input = prompt("공지 내용을 입력하세요", study.notice ?? "")
    if (input === null) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await updateStudyNotice(study.id, input)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "공지 수정 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onToggleLike = async () => {
    if (!id || likeLoading) return

    if (!loggedIn) {
      alert("로그인이 필요합니다.")
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
      alert("로그인이 필요합니다.")
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
    <div className="mx-auto max-w-4xl space-y-8">
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
    </div>
  )
}