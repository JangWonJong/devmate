import { useEffect, useState } from "react"
import { getDevLog, type DevLogResponse } from "../../api/devlog/devlog"
import { apiErrorMessage } from "../../utils/error"

type UseDevLogDetailParams = {
  devLogId?: string
}

export function useDevLogDetail({ devLogId }: UseDevLogDetailParams) {
  const [devLog, setDevLog] = useState<DevLogResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDevLog() {
      if (!devLogId) return

      try {
        setLoading(true)
        setError("")

        const data = await getDevLog(devLogId)
        setDevLog(data)
      } catch (e) {
        setError(apiErrorMessage(e, "DevLog 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchDevLog()
  }, [devLogId])

  return {
    devLog,
    loading,
    error,
    setError,
  }
}