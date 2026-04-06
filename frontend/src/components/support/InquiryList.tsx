import { useEffect, useState } from "react"
import {
  formatInquiryDate,
  getInquiryStatusLabel,
  getInquiryStatusStyle,
  getInquiryTypeLabel,
  listMyInquiries,
  deleteInquiry,
  type Inquiry,
} from "../../api/inquiry"

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
          {/* 상단 */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-700">
                {getInquiryTypeLabel(item.type)}{" "}
                <span className="ml-1 font-normal text-slate-400">
                  · {formatInquiryDate(item.createdAt)}
                </span>
              </div>
            </div>

            {/* 상태 + 취소 버튼 */}
            <div className="flex items-center gap-3">
            <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${getInquiryStatusStyle(item.status)}`}
            >
                {getInquiryStatusLabel(item.status)}
            </span>

            {item.status === "RECEIVED" && (
                <button
                type="button"
                onClick={async () => {
                    const ok = window.confirm("문의 내용을 취소할까요?")
                    if (!ok) return

                    try {
                    await deleteInquiry(item.id)
                    window.dispatchEvent(new Event("inquiry-updated"))
                    } catch {
                    alert("문의 취소에 실패했습니다.")
                    }
                }}
                className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                문의 취소
                </button>
            )}
            </div>
          </div>

          {/* 내용 */}
          <div className="whitespace-pre-line break-words text-sm text-slate-700">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}