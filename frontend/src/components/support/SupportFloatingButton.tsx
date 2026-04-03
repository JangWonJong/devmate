type Props = {
  onClick: () => void
  open: boolean
}

export default function SupportFloatingButton({ onClick, open }: Props) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
    >
      {open ? "닫기" : "문의 / 질문 가이드"}
    </button>
  )
}