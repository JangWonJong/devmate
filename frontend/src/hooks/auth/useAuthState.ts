import { useEffect, useState } from "react"
import { tokenStore } from "../../api/auth/token"
import { getMeId } from "../../api/member/members"

export function useAuthState() {
  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn())
  const [meId, setMeId] = useState<number | null>(null)

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

  return {
    loggedIn,
    meId,
  }
}