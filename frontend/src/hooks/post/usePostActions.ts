import { deletePost, getPost, solvePost, type PostResponse } from "../../api/post/posts"
import { apiErrorMessage } from "../../utils/error"
import { appToast } from "../../lib/toast"
import { useState } from "react"

type ConfirmHandler = (options: {
  title: string
  message: string
  danger?: boolean
  onConfirm: () => Promise<void>
}) => void

type UsePostActionsParams = {
  postId?: string
  setPost: (post: PostResponse) => void
  navigateToPosts: () => void
  confirm: ConfirmHandler
  closeConfirm: () => void
}

export function usePostActions({
  postId,
  setPost,
  navigateToPosts,
  confirm,
  closeConfirm,
}: UsePostActionsParams) {
  const [busy, setBusy] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)

  const onSolve = async () => {
    if (!postId) return

    confirm({
      title: "게시글 해결 처리",
      message: "이 글을 해결됨으로 처리할까요?",
      onConfirm: async () => {
        try {
          setBusy(true)
          setActionErr(null)

          await solvePost(postId)

          const updated = await getPost(postId)
          setPost(updated)

          appToast.success("해결 처리되었습니다.")
        } catch (e: any) {
          setActionErr(apiErrorMessage(e, "해결 처리 실패"))
        } finally {
          setBusy(false)
          closeConfirm()
        }
      },
    })
  }

  const onDeletePost = async () => {
    if (!postId) return

    confirm({
      title: "게시글 삭제",
      message: "삭제한 게시글은 복구할 수 없어요. 정말 삭제할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setBusy(true)
          setActionErr(null)

          await deletePost(postId)

          appToast.success("게시글이 삭제되었습니다.")
          navigateToPosts()
        } catch (e: any) {
          setActionErr(apiErrorMessage(e, "삭제 실패"))
        } finally {
          setBusy(false)
          closeConfirm()
        }
      },
    })
  }

  return {
    busy,
    actionErr,
    onSolve,
    onDeletePost,
  }
}