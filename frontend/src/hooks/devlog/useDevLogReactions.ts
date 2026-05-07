import { useEffect, useState } from "react"
import {
  getDevLogLikeStatus,
  likeDevLog,
  type DevLogResponse,
  unlikeDevLog,
} from "../../api/devlog/devlog"
import { appToast } from "../../lib/toast"

type UseDevLogReactionsParams = {
  devLogId?: string
  devLog: DevLogResponse | null
  loggedIn: boolean
}

export function useDevLogReactions({
  devLogId,
  devLog,
  loggedIn,
}: UseDevLogReactionsParams) {
  const [likeCount, setLikeCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    if (!devLog) return
    setLikeCount(devLog.likeCount)
  }, [devLog])

  useEffect(() => {
    ;(async () => {
      if (!devLogId || !loggedIn) {
        setLikedByMe(false)
        setLikeCount(devLog?.likeCount ?? 0)
        return
      }

      try {
        const res = await getDevLogLikeStatus(Number(devLogId))
        setLikedByMe(res.likedByMe)
        setLikeCount(res.likeCount)
      } catch {
        setLikedByMe(false)
        setLikeCount(devLog?.likeCount ?? 0)
      }
    })()
  }, [devLogId, loggedIn, devLog?.likeCount])

  const onToggleLike = async () => {
    if (!devLogId || likeLoading) return

    if (!loggedIn) {
      appToast.info("로그인이 필요합니다.")
      return
    }

    try {
      setLikeLoading(true)

      if (likedByMe) {
        await unlikeDevLog(Number(devLogId))
        setLikedByMe(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likeDevLog(Number(devLogId))
        setLikedByMe(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch {
      appToast.error("좋아요 처리 실패")
    } finally {
      setLikeLoading(false)
    }
  }

  return {
    likeCount,
    likedByMe,
    likeLoading,
    onToggleLike,
  }
}