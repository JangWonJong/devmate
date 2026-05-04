import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  listRecentDevLoggers,
  type DevLoggerSummaryResponse,
} from "../../api/devlog/devlog"
import { imageUrl } from "../../utils/image"

export function DevLoggerCard() {
  const [list, setList] = useState<DevLoggerSummaryResponse[]>([])

  useEffect(() => {
    listRecentDevLoggers(5)
      .then(setList)
      .catch(() => setList([]))
  }, [])

  if (list.length === 0) return null

  return (
    <section className="rounded-[24px] border border-slate-300 bg-white p-4 shadow-md ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          👀 DevLogger
        </h2>
        <span className="text-[11px] text-slate-400">최근 작성</span>
      </div>

      <div className="space-y-2">
        {list.map((m, idx) => (
          <Link
            key={m.memberId}
            to={`/members/${m.memberId}/devlogs`}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
          >
            {/* 프로필 */}
            <div className="relative shrink-0">
              {m.profileImageUrl ? (
                <img
                  src={imageUrl(m.profileImageUrl)}
                  alt={m.nickname}
                  className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {m.nickname.slice(0, 1)}
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-white">
                {idx + 1}
              </div>
            </div>

            {/* 텍스트 */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">
                {m.nickname}
              </div>
              <div className="truncate text-xs text-slate-500">
                {m.bio || "개발 기록 작성 중"}
              </div>
            </div>

            {/* 개수 */}
            <div className="shrink-0 text-right">
              <div className="text-xs font-semibold text-slate-900">
                {m.devLogCount}
              </div>
              <div className="text-[10px] text-slate-400">DevLog</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}