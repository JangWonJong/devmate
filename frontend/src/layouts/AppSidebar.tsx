import { useNavigate } from "react-router-dom"

export function AppSidebar() {
  const nav = useNavigate()

  const menuItems = [
    { label: "커뮤니티", path: "/posts", icon: "💬" },
    { label: "DevLog", path: "/devlogs", icon: "📝" },
    { label: "예약", path: "/reservations", icon: "📅" },
    { label: "마이페이지", path: "/mypage", icon: "👤" },
  ]

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">🧭 바로가기</h2>

        <div className="mt-4 grid gap-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => nav(item.path)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>
      </div>
    </aside>
  )
}