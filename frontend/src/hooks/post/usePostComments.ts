import { useEffect, useState } from "react"
import {
  adoptComment,
  createComment,
  deleteComment,
  likeComment,
  listComments,
  type CommentResponse,
  unlikeComment,
  updateComment,
} from "../../api/post/comments"
import { getPost, type PostResponse } from "../../api/post/posts"
import { apiErrorMessage } from "../../utils/error"
import { appToast } from "../../lib/toast"

type ConfirmHandler = (options: {
  title: string
  message: string
  danger?: boolean
  onConfirm: () => Promise<void>
}) => void

type UsePostCommentsParams = {
  postId?: string
  loggedIn: boolean
  onPostUpdated?: (post: PostResponse) => void
  confirm: ConfirmHandler
  closeConfirm: () => void
}

export function usePostComments({
  postId,
  loggedIn,
  onPostUpdated,
  confirm,
  closeConfirm,
}: UsePostCommentsParams) {
  const [commentErr, setCommentErr] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [commentInput, setCommentInput] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const [commentLikedMap, setCommentLikedMap] = useState<Record<number, boolean>>({})
  const [commentLikeCountMap, setCommentLikeCountMap] = useState<Record<number, number>>({})
  const [commentLikeLoadingMap, setCommentLikeLoadingMap] = useState<Record<number, boolean>>({})

  const applyComments = (res: CommentResponse[]) => {
    setComments(res)
    setCommentLikedMap(Object.fromEntries(res.map((c) => [c.id, c.likedByMe ?? false])))
    setCommentLikeCountMap(Object.fromEntries(res.map((c) => [c.id, c.likeCount ?? 0])))
  }

  const refreshComments = async () => {
    if (!postId) return
    const res = await listComments(postId)
    applyComments(res)
  }

  useEffect(() => {
    ;(async () => {
      if (!postId) return

      try {
        setCommentErr(null)
        await refreshComments()
      } catch (e: any) {
        if (e?.response?.status === 404) return
        setCommentErr(apiErrorMessage(e, "댓글 조회 실패"))
      }
    })()
  }, [postId, loggedIn])

  const onCreateComment = async () => {
    if (!postId) return
    if (!commentInput.trim()) return

    try {
      setCommentErr(null)
      await createComment(postId, { content: commentInput.trim() })
      setCommentInput("")
      await refreshComments()
      appToast.success("댓글이 작성되었습니다.")
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 작성 실패"))
    }
  }

  const onDeleteComment = (commentId: number) => {
    confirm({
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
            closeConfirm()
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

      if (postId && onPostUpdated) {
        const updatedPost = await getPost(postId)
        onPostUpdated(updatedPost)
      }

      appToast.success("댓글을 채택했습니다.")
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 채택 실패"))
    }
  }

  const onToggleCommentLike = async (commentId: number) => {
    if (!loggedIn) {
      appToast.error("로그인이 필요합니다.")
      return
    }

    if (commentLikeLoadingMap[commentId]) return

    try {
      setCommentErr(null)
      setCommentLikeLoadingMap((prev) => ({ ...prev, [commentId]: true }))

      const liked = commentLikedMap[commentId] ?? false

      if (liked) {
        await unlikeComment(commentId)
        setCommentLikedMap((prev) => ({ ...prev, [commentId]: false }))
        setCommentLikeCountMap((prev) => ({
          ...prev,
          [commentId]: Math.max(0, (prev[commentId] ?? 1) - 1),
        }))
      } else {
        await likeComment(commentId)
        setCommentLikedMap((prev) => ({ ...prev, [commentId]: true }))
        setCommentLikeCountMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] ?? 0) + 1,
        }))
      }
    } catch (e: any) {
      setCommentErr(apiErrorMessage(e, "댓글 좋아요 실패"))
    } finally {
      setCommentLikeLoadingMap((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  return {
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
    refreshComments,
  }
}