import { useEffect, useState } from "react"
import {
  bookmarkPost,
  getPostBookmarkStatus,
  getPostLikeStatus,
  likePost,
  type PostResponse,
  unlikePost,
  unbookmarkPost,
} from "../../api/post/posts"
import { apiErrorMessage } from "../../utils/error"
import { appToast } from "../../lib/toast"

type UsePostReactionsParams = {
  postId?: string
  post: PostResponse | null
  loggedIn: boolean
  
}

export function usePostReactions({
  postId,
  post,
  loggedIn,
}: UsePostReactionsParams) {
  const [likedByMe, setLikedByMe] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const [bookmarkedByMe, setBookmarkedByMe] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!postId || !loggedIn) {
        setLikedByMe(false)
        setLikeCount(post?.likeCount ?? 0)
        return
      }

      try {
        const res = await getPostLikeStatus(postId)
        setLikedByMe(res.likedByMe)
        setLikeCount(res.likeCount)
      } catch {
        setLikedByMe(false)
        setLikeCount(post?.likeCount ?? 0)
      }
    })()
  }, [postId, loggedIn, post?.likeCount])

  useEffect(() => {
    ;(async () => {
      if (!postId || !loggedIn) {
        setBookmarkedByMe(false)
        setBookmarkCount(0)
        return
      }

      try {
        const res = await getPostBookmarkStatus(postId)
        setBookmarkedByMe(res.bookmarkedByMe)
        setBookmarkCount(res.bookmarkCount)
      } catch {
        setBookmarkedByMe(false)
        setBookmarkCount(0)
      }
    })()
  }, [postId, loggedIn])

  const onToggleLike = async () => {
    if (!postId || likeLoading) return

    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    try {
      setLikeLoading(true)

      if (likedByMe) {
        await unlikePost(postId)
        setLikedByMe(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likePost(postId)
        setLikedByMe(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (e: any) {
      appToast.error(apiErrorMessage(e, "좋아요 처리 실패"))
    } finally {
      setLikeLoading(false)
    }
  }

  const onToggleBookmark = async () => {
    if (!postId || bookmarkLoading) return

    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    try {
      setBookmarkLoading(true)

      if (bookmarkedByMe) {
        await unbookmarkPost(postId)
        setBookmarkedByMe(false)
        setBookmarkCount((prev) => Math.max(0, prev - 1))
      } else {
        await bookmarkPost(postId)
        setBookmarkedByMe(true)
        setBookmarkCount((prev) => prev + 1)
      }
    } catch (e: any) {
      appToast.error(apiErrorMessage(e, "북마크 처리 실패"))
    } finally {
      setBookmarkLoading(false)
    }
  }

  return {
    likedByMe,
    likeCount,
    likeLoading,
    onToggleLike,

    bookmarkedByMe,
    bookmarkCount,
    bookmarkLoading,
    onToggleBookmark,
  }
}