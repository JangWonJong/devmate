import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyStudies, type StudyResponse } from "../../api/study/study"
import { PageContainer } from "../../layouts/PageContainer"

function StudyStatusBadge({ status }: { status: string }) {
  const isRecruiting = status === "RECRUITING"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isRecruiting
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isRecruiting ? "모집중" : "모집 마감"}
    </span>
  )
}

export function MyStudiesPage() {
  const nav = useNavigate()

  const [studies, setStudies] = useState<StudyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await getMyStudies()
        setStudies(res)
      } catch (e: any) {
        setError(e.message ?? "내 스터디 목록 조회 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        내 스터디 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <PageContainer className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          내 스터디
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          참여 중인 스터디를 확인하고 바로 이동해보세요.
        </p>
      </section>

      {studies.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
          참여 중인 스터디가 없어요.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
        {studies.map((study) => (
          <button
            key={study.id}
            type="button"
            onClick={() => nav(`/posts/${study.postId}`)}
            className="block w-full rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StudyStatusBadge status={study.status} />
              </div>

              <div className="space-y-2">
                <h2 className="break-words text-xl font-bold leading-8 tracking-tight text-slate-900">
                  {study.postTitle}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">
                    작성자 {study.authorNickname}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>리더 {study.leaderNickname}</span>
                  <span className="text-slate-300">•</span>
                  <span>
                    {new Date(study.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-500">
                  현재 인원
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {study.currentMembers} / {study.maxMembers}
                </div>
              </div>
            </div>
          </button>
        ))}
      </section>
      )}
    </PageContainer>
  )
}