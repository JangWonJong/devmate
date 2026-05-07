import { useEffect, useState } from "react"
import {
  createDevLogComment,
  deleteDevLogComment,
  likeDevLogComment,
  listDevLogComments,
  type DevLogCommentResponse,
  unlikeDevLogComment,
  updateDevLogComment,
} from "../../api/devlog/devlogComment"
import { appToast } from "../../lib/toast"

type ConfirmHandler = (options: {
  title: string
  message: string
  danger?: boolean
  onConfirm: () => Promise<void>
}) => void

type UseDevLogCommentsParams = {
  devLogId: number | null
  confirm: ConfirmHandler
  closeConfirm: () => void
}

export function useDevLogComments({
  devLogId,
  confirm,
  closeConfirm,
}: UseDevLogCommentsParams) {
  const [comments, setComments] = useState<DevLogCommentResponse[]>([])
  const [commentInput, setCommentInput] = useState("")
  const [commentErr, setCommentErr] = useState<string | null>(null)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const [commentLikedMap, setCommentLikedMap] = useState<Record<number, boolean>>({})
  const [commentLikeCountMap, setCommentLikeCountMap] = useState<Record<number, number>>({})
  const [commentLikeLoadingMap, setCommentLikeLoadingMap] = useState<Record<number, boolean>>({})

  const applyComments = (data: DevLogCommentResponse[]) => {
    setComments(data)
    setCommentLikedMap(Object.fromEntries(data.map((c) => [c.id, c.likedByMe])))
    setCommentLikeCountMap(Object.fromEntries(data.map((c) => [c.id, c.likeCount])))
  }

  const refreshComments = async () => {
    if (!devLogId) return

    const data = await listDevLogComments(devLogId)
    applyComments(data)
  }

  useEffect(() => {
    ;(async () => {
      if (!devLogId) return

      try {
        setCommentErr(null)
        await refreshComments()
      } catch {
        setCommentErr("댓글을 불러오지 못했습니다.")
      }
    })()
  }, [devLogId])

  const onCreateComment = async () => {
    if (!devLogId) return
    if (!commentInput.trim()) return

    try {
      await createDevLogComment(devLogId, commentInput.trim())
      setCommentInput("")
      await refreshComments()
      appToast.success("댓글이 작성되었습니다.")
    } catch {
      appToast.error("댓글 작성 실패")
    }
  }

  const onUpdateComment = async (commentId: number) => {
    if (!devLogId) return

    const content = editingContent.trim()

    if (!content) {
      setCommentErr("댓글 내용을 입력하세요.")
      return
    }

    try {
      await updateDevLogComment(devLogId, commentId, content)
      setEditingCommentId(null)
      setEditingContent("")
      await refreshComments()
      appToast.success("댓글이 수정되었습니다.")
    } catch {
      appToast.error("댓글 수정 실패")
    }
  }

  const onDeleteComment = (commentId: number) => {
    confirm({
      title: "댓글 삭제",
      message: "댓글을 삭제할까요?",
      danger: true,
      onConfirm: async () => {
        if (!devLogId) return

        try {
          await deleteDevLogComment(devLogId, commentId)
          appToast.success("댓글이 삭제되었습니다.")
          await refreshComments()
        } catch {
          appToast.error("댓글 삭제 실패")
        } finally {
          closeConfirm()
        }
      },
    })
  }

  const onToggleCommentLike = async (commentId: number) => {
    if (commentLikeLoadingMap[commentId]) return

    setCommentLikeLoadingMap((prev) => ({
      ...prev,
      [commentId]: true,
    }))

    try {
      if (commentLikedMap[commentId]) {
        await unlikeDevLogComment(commentId)
      } else {
        await likeDevLogComment(commentId)
      }

      await refreshComments()
    } catch {
      appToast.error("좋아요 실패")
    } finally {
      setCommentLikeLoadingMap((prev) => ({
        ...prev,
        [commentId]: false,
      }))
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
    onToggleCommentLike,
    refreshComments,
  }
}