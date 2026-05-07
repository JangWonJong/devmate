import { useEffect, useRef, useState } from "react"
import { getPost, type PostResponse } from "../../api/post/posts"
import { apiErrorMessage } from "../../utils/error"
import { appToast } from "../../lib/toast"

type UsePostDetailParams = {
  postId?: string
  navigateToHome: () => void
}

export function usePostDetail({
  postId,
  navigateToHome,
}: UsePostDetailParams) {
  const [post, setPost] = useState<PostResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  const handledNotFoundRef = useRef(false)

  useEffect(() => {
    handledNotFoundRef.current = false
  }, [postId])

  useEffect(() => {
    ;(async () => {
      try {
        setLoadErr(null)
        setLoading(true)

        if (!postId) return

        const p = await getPost(postId)
        setPost(p)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) {
            if (handledNotFoundRef.current) return

            handledNotFoundRef.current = true

            appToast.info("삭제되었거나 존재하지 않는 게시글입니다.")
            navigateToHome()
            return
            }

        setLoadErr(apiErrorMessage(e, "상세 조회 실패"))
      } finally {
        setLoading(false)
      }
    })()
  }, [postId, navigateToHome])

  return {
    post,
    setPost,
    loading,
    loadErr,
  }
}