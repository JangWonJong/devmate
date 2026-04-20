import { useEffect, useState } from "react"
import { getAnalyticsSummary, type AnalyticsSummaryResponse } from "../../api/analytics/analytics"

type Props = {
  compact?: boolean
}

export function VisitorStats({ compact = false }: Props) {
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getAnalyticsSummary()
        setSummary(data)
      } catch (e) {
        console.error("analytics summary failed", e)
      }
    })()
  }, [])

  if (!summary) {
    return null
  }

  if (compact) {
    return (
      <div className="flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 items-center gap-2">
        <span>
          Today <b className="text-slate-900">{summary.dailyVisitors}</b>
        </span>

        <span className="text-slate-300">·</span>

        <span>
          Total <b className="text-slate-900">{summary.totalVisitors}</b>
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Today <b className="text-slate-900">{summary.dailyVisitors}</b>
        </span>
        <span>
          Total <b className="text-slate-900">{summary.totalVisitors}</b>
        </span>
      </div>
    </div>
  )
}