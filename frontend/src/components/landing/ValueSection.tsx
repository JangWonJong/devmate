import { CalendarCheck, MessageSquare, Users } from "lucide-react"

const items = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "질문하고 해결하기",
    description:
      "댓글과 채택 기능으로 문제 해결 과정을 남기고 유용한 답변을 정리할 수 있습니다.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "함께 성장하기",
    description:
      "스터디를 만들고 참여하며 비슷한 목표를 가진 사람들과 학습 흐름을 이어갈 수 있습니다.",
  },
  {
    icon: <CalendarCheck className="h-6 w-6" />,
    title: "바로 실행하기",
    description:
      "예약 가능한 시간을 확인하고 장소를 예약해 실제 모임까지 연결할 수 있습니다.",
  },
]

export default function ValueSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 max-w-3xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          개발자의 연결을 더 자연스럽게
        </h2>
        <p className="text-muted-foreground">
          혼자 검색하고 끝나는 것이 아니라, 질문하고 답을 얻고, 스터디를 만들고,
          공간을 예약하며 학습과 협업이 이어지도록 설계했습니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1"
          >
            <div className="mb-4 inline-flex rounded-xl bg-muted p-3">{item.icon}</div>
            <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}