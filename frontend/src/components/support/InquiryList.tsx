import { useEffect, useState } from "react"
import { listMyInquiries, type Inquiry } from "../../api/inquiry"

export default function InquiryList() {
  const [list, setList] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const data = await listMyInquiries()
      setList(data)
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()

    const handleUpdated = () => {
      void fetchData()
    }

    window.addEventListener("inquiry-updated", handleUpdated)
    return () => window.removeEventListener("inquiry-updated", handleUpdated)
  }, [])

  if (loading) {
    return <div className="text-sm text-slate-400">불러오는 중...</div>
  }

  if (list.length === 0) {
    return <div className="text-sm text-slate-400">등록된 문의가 없습니다.</div>
  }

  return (
    <div className="space-y-2 overflow-y-auto pr-1">
      {list.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {typeLabel(item.type)}
            </span>
            <span className="text-xs text-slate-400">
              {statusLabel(item.status)}
            </span>
          </div>

          <div className="line-clamp-3 text-sm text-slate-700">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

function typeLabel(type: string) {
  if (type === "BUG") return "버그"
  if (type === "FEATURE") return "기능 요청"
  return "기타"
}

function statusLabel(status: string) {
  if (status === "COMPLETED") return "처리 완료"
  return "접수됨"
}