const steps = [
  {
    number: "01",
    title: "고민을 올립니다",
    description: "개발 중 막힌 문제나 학습 고민을 공유합니다.",
  },
  {
    number: "02",
    title: "답변을 받고 해결합니다",
    description: "댓글과 채택으로 핵심 해결책을 정리합니다.",
  },
  {
    number: "03",
    title: "스터디를 모집합니다",
    description: "비슷한 관심사를 가진 사람들과 연결됩니다.",
  },
  {
    number: "04",
    title: "공간을 예약하고 진행합니다",
    description: "스터디룸을 예약하고 실제 모임으로 이어집니다.",
  },
]

export default function FlowSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          질문에서 모임까지 이어지는 흐름
        </h2>
        <p className="text-muted-foreground">
          DevMine는 기능을 나열하는 서비스가 아니라, 학습과 협업의 흐름을 연결하는 서비스입니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number} className="rounded-2xl border p-6">
            <div className="mb-4 text-sm font-semibold text-primary">{step.number}</div>
            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}