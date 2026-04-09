import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMe, type MeResponse } from "../../api/members"
import { getMyStudies } from "../../api/study"
import { listMyReservations } from "../../api/reservations"
import { listLikedPosts, listPosts, listBookmarkedPosts, type PostResponse } from "../../api/posts"
import { listMyComments, type MyCommentResponse } from "../../api/comments"
import { apiErrorMessage } from "../../utils/error"
import { imageUrl } from "../../utils/image"
import { isUpcomingReservation, formatDate, countRecentActivities } from "../../components/member/mypage"

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {helper && <div className="mt-2 text-xs text-slate-400">{helper}</div>}
    </div>
  )
}

function SectionHeader({
  title,
  actionLabel,
  onClick,
}: {
  title: string
  actionLabel?: string
  onClick?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>

      {actionLabel && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function PostTypeBadge({ type }: { type: "QUESTION" | "STUDY" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        type === "STUDY"
          ? "border border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {type === "STUDY" ? "스터디" : "질문"}
    </span>
  )
}

function SolvedBadge({ solved }: { solved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        solved
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {solved ? "해결됨" : "미해결"}
    </span>
  )
}

function PostItem({
  post,
  onClick,
}: {
  post: PostResponse
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PostTypeBadge type={post.type} />
        <SolvedBadge solved={post.solved} />
      </div>

      <div className="text-base font-semibold text-slate-900">{post.title}</div>

      <div className="mt-2 text-sm text-slate-500">
        {formatDate(post.createdAt)}
      </div>
    </button>
  )
}

function CommentItem({
  comment,
  onClick,
}: {
  comment: MyCommentResponse
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            comment.adopted
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          {comment.adopted ? "채택됨" : "일반 댓글"}
        </span>
      </div>

      <div className="mb-2 text-base font-semibold text-slate-900">
        {comment.postTitle}
      </div>

      <div className="line-clamp-2 break-words text-sm leading-6 text-slate-600">
        {comment.content}
      </div>

      <div className="mt-3 text-sm text-slate-500">
        {formatDate(comment.createdAt)}
      </div>
    </button>
  )
}


export function MyPage() {
  const nav = useNavigate()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [myStudiesCount, setMyStudiesCount] = useState(0)
  const [upcomingReservationsCount, setUpcomingReservationsCount] = useState(0)
  const [myPosts, setMyPosts] = useState<PostResponse[]>([])
  const [myPostsCount, setMyPostsCount] = useState(0)
  const [myComments, setMyComments] = useState<MyCommentResponse[]>([])
  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([])
  const [imageOpen, setImageOpen] = useState(false)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostResponse[]>([])

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  
  const recentPostCount = countRecentActivities(myPosts, 3)
  const recentCommentCount = countRecentActivities(myComments, 3)
  const recentLikeCount = countRecentActivities(likedPosts, 3)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErr(null)

        const [
          meData,
          myStudies,
          myReservationsPage,
          myPostsPage,
          myCommentsData,
          likedPostsData,
          bookmarkedPostsData,
        ] = await Promise.all([
          getMe(),
          getMyStudies(),
          listMyReservations({ page: 0, size: 100, sort: "date,desc" }),
          listPosts({ mine: true, page: 0, size: 10, sort: "id,desc" }),
          listMyComments(),
          listLikedPosts(),
          listBookmarkedPosts(),
        ])

        setMe(meData)
        setMyStudiesCount(myStudies.length)

        const upcomingCount = myReservationsPage.content.filter((r) =>
          isUpcomingReservation(r.date, r.endTime)
        ).length

        setUpcomingReservationsCount(upcomingCount)
        setMyPosts(myPostsPage.content)
        setMyPostsCount(myPostsPage.totalElements)
        setMyComments(myCommentsData.slice(0, 10))
        setLikedPosts(likedPostsData.slice(0, 10))
        setBookmarkedPosts(bookmarkedPostsData.slice(0, 10))
      } catch (e) {
        setErr(apiErrorMessage(e, "마이페이지 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm">
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">My Page</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            마이페이지
          </h1>
          <p className="mt-2 text-base text-slate-600">
            내 활동과 계정 정보를 한눈에 확인해보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => nav("/mypage/settings")}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          계정 설정
        </button>
      </section>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {err}
        </div>
      )}

      {me && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
  <div className="flex items-center gap-4">
    <button
      type="button"
      onClick={() => {
        if (me.profileImageUrl) setImageOpen(true)
      }}
      className={`h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-slate-100 transition ${
        me.profileImageUrl ? "cursor-pointer hover:opacity-90" : "cursor-default"
      }`}
    >
      {me.profileImageUrl ? (
        <img
          src={imageUrl(me.profileImageUrl)}
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
      <div className="flex items-center gap-2">
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {me.nickname}
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          닉네임
        </span>
      </div>
      <div className="mt-3 text-sm text-slate-500">
        {me.email}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium text-slate-700">{me.name}</span>
        <span className="text-slate-300">•</span>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            me.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {me.status}
        </span>
      </div>
    </div>
  </div>

    <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
        <div className="text-xs font-medium text-slate-500">받은 좋아요❤️</div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {me.receivedLikeCount ?? 0}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">게시글/댓글</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
        <div className="text-xs font-medium text-slate-500">프로필 좋아요❤️</div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {me.profileLikeCount ?? 0}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">프로필 기준</div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-center">
        <div className="text-xs font-medium text-indigo-600">인기 점수</div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {me.popularityScore ?? 0}
        </div>
        <div className="mt-1 text-[11px] text-indigo-500">총합 점수</div>
      </div>
    </div>
  </div>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {me.phone && (
              <div>
                <span className="font-semibold">전화번호</span>
                <span className="ml-2">{me.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold text-slate-500">
              한 줄 소개
            </div>

            {me.bio ? (
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                {me.bio}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                아직 소개가 없습니다.
              </div>
            )}
          </div>

          {(me.links ?? []).length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="text-sm font-semibold text-slate-900">프로필 링크</div>

              <div className="mt-3 grid gap-3">
                {(me.links ?? [])
                  .slice()
                  .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                  .map((link, index) => (
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
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <SectionHeader title="빠른 이동" />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => nav("/posts?scope=mine")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              내 글 보기
            </button>

            <button
              type="button"
              onClick={() => nav("/mystudies")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              내 스터디 보기
            </button>

            <button
              type="button"
              onClick={() => nav("/reservations?scope=mine")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              내 예약 보기
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="내 상태" value={me?.status ?? "-"} />
          <StatCard label="내 글" value={`${myPostsCount}개`} />
          <StatCard label="참여 중 스터디" value={`${myStudiesCount}개`} />
          <StatCard label="예정 예약" value={`${upcomingReservationsCount}건`} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          <span className="text-sm font-semibold text-slate-900">최근 활동</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            작성글 {recentPostCount}건
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            댓글 {recentCommentCount}건
          </span>

          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
            좋아요 {recentLikeCount}건
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <SectionHeader
            title="내가 쓴 글"
            actionLabel="전체 글 보기"
            onClick={() => nav("/posts/?mine=true")}
          />

          {myPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              작성한 글이 아직 없어요.
            </div>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onClick={() => nav(`/posts/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <SectionHeader title="좋아요한 게시글" />

          {likedPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              좋아요한 게시글이 아직 없어요.
            </div>
          ) : (
            <div className="space-y-3">
              {likedPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onClick={() => nav(`/posts/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <SectionHeader title="북마크한 게시글" />

          {bookmarkedPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              북마크한 게시글이 아직 없어요.
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedPosts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onClick={() => nav(`/posts/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <SectionHeader title="내가 쓴 댓글" />

          {myComments.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              작성한 댓글이 아직 없어요.
            </div>
          ) : (
            <div className="space-y-3">
              {myComments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  onClick={() => nav(`/posts/${comment.postId}#comment-${comment.commentId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {imageOpen && me?.profileImageUrl && (
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
                src={imageUrl(me.profileImageUrl)}
                alt="프로필 이미지 확대"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}