import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getMemberProfile, type MemberProfileResponse } from "../../api/members"
import { apiErrorMessage } from "../../utils/error"

export function MemberProfilePage() {
  const { memberId } = useParams()
  const nav = useNavigate()

  const [profile, setProfile] = useState<MemberProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageOpen, setImageOpen] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!memberId) return

      try {
        setLoading(true)
        setErr(null)

        const data = await getMemberProfile(memberId)
        setProfile(data)
      } catch (e) {
        setErr(apiErrorMessage(e, "프로필 조회 실패"))
      } finally {
        setLoading(false)
      }
    })()
  }, [memberId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
          프로필을 불러오는 중...
        </div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
          {err}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
          프로필이 없어요.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className="h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-slate-100 transition hover:opacity-90"
              >
                {profile.profileImageUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${profile.profileImageUrl}`}
                    alt="프로필 이미지"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    없음
                  </div>
                )}
              </button>

              <div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  {profile.nickname}
                </div>
                <div className="mt-1 text-sm text-slate-500">{profile.status}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => nav(-1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              뒤로 가기
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">프로필 상태</div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {profile.status}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-medium text-slate-500">받은 좋아요</div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {profile.receivedLikeCount}개
              </div>
              <div className="mt-2 text-xs text-slate-400">게시글/댓글 합산</div>
            </div>

            
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-slate-900">한 줄 소개</div>
            {profile.bio ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {profile.bio}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                아직 소개가 없습니다.
              </div>
            )}
          </div>

          {profile.links.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="text-sm font-semibold text-slate-900">프로필 링크</div>

              <div className="mt-3 grid gap-3">
                {profile.links.map((link, index) => (
                  <div
                    key={`${link.type}-${link.label}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">{link.label}</div>
                      <div className="truncate text-sm font-medium text-slate-900">
                        {link.url}
                      </div>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                    >
                      이동
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {imageOpen && profile.profileImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setImageOpen(false)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImageOpen(false)}
              className="absolute right-0 top-[-44px] rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              닫기
            </button>

            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${profile.profileImageUrl}`}
                alt="프로필 이미지 확대"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}