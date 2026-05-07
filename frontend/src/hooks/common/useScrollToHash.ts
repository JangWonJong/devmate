import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

type UseScrollToHashParams = {
  enabled?: boolean
  deps?: unknown[]
  offset?: number
  retryLimit?: number
  retryDelay?: number
}

export function useScrollToHash({
  enabled = true,
  deps = [],
  offset = 120,
  retryLimit = 10,
  retryDelay = 200,
}: UseScrollToHashParams) {
  const location = useLocation()
  const handledHashRef = useRef<string | null>(null)

  useEffect(() => {
    handledHashRef.current = null
  }, [location.pathname])

  useEffect(() => {
    if (!enabled) return

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
          top: -offset,
          left: 0,
          behavior: "auto",
        })
      }, 150)

      handledHashRef.current = location.hash
      return true
    }

    const tryScroll = () => {
      if (scrollToTarget()) return
      if (retryCount >= retryLimit) return

      retryCount += 1
      retryTimer = window.setTimeout(tryScroll, retryDelay)
    }

    tryScroll()

    return () => {
      if (retryTimer) {
        window.clearTimeout(retryTimer)
      }
    }
  }, [enabled, location.hash, location.pathname, offset, retryDelay, retryLimit, ...deps])
}