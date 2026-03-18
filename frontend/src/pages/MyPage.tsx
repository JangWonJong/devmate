import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMe, type MeResponse } from "../api/members"
import { getMyStudies } from "../api/study"
import { listMyReservations } from "../api/reservations"
import { listPosts, type PostResponse } from "../api/posts"
import { listMyComments, type MyCommentResponse } from "../api/comments"
import { apiErrorMessage } from "../utils/error"
import {
  pageStyle,
  cardStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  errorBoxStyle,
  mutedBoxStyle,
  listItemCardStyle,
  titleHeroStyle,
} from "../ui/properties"

function isUpcomingReservation(date: string, endTime: string) {
  const now = new Date()
  const end = new Date(`${date}T${endTime}`)
  return end >= now
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#24364b" }}>{value}</div>
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: "#24364b" }}>{title}</div>

      {actionLabel && onClick && (
        <button onClick={onClick} style={secondaryButtonStyle}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function PostTypeBadge({ type }: { type: "QUESTION" | "STUDY" }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        background: type === "STUDY" ? "#eef4ff" : "#f5f5f5",
        border: "1px solid #ddd",
        fontWeight: 700,
        color: "#555",
      }}
    >
      {type === "STUDY" ? "스터디" : "질문"}
    </span>
  )
}

function SolvedBadge({ solved }: { solved: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        background: solved ? "#f0fdf4" : "#fafafa",
        border: "1px solid #ddd",
        fontWeight: 700,
        color: solved ? "#15803d" : "#555",
      }}
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
      style={{
        ...listItemCardStyle,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <PostTypeBadge type={post.type} />
        <SolvedBadge solved={post.solved} />
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: "#24364b" }}>{post.title}</div>

      <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
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
      style={{
        ...listItemCardStyle,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 999,
            background: comment.adopted ? "#ecfdf5" : "#fafafa",
            border: comment.adopted ? "1px solid #86efac" : "1px solid #ddd",
            fontWeight: 700,
            color: comment.adopted ? "#15803d" : "#555",
          }}
        >
          {comment.adopted ? "채택됨" : "일반 댓글"}
        </span>
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 6 }}>
        {comment.postTitle}
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#555",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {comment.content}
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
        {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
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

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErr(null)

        const [meData, myStudies, myReservationsPage, myPostsPage, myCommentsData] = await Promise.all([
          getMe(),
          getMyStudies(),
          listMyReservations({ page: 0, size: 100, sort: "date,desc" }),
          listPosts({ mine: true, page: 0, size: 5, sort: "id,desc" }),
          listMyComments()
        ])

        setMe(meData)
        setMyStudiesCount(myStudies.length)

        const upcomingCount = myReservationsPage.content.filter((r) =>
          isUpcomingReservation(r.date, r.endTime)
        ).length

        setUpcomingReservationsCount(upcomingCount)
        setMyPosts(myPostsPage.content)
        setMyPostsCount(myPostsPage.totalElements)
        setMyComments(myCommentsData.slice(0, 5))
      } catch (e) {
        setErr(apiErrorMessage(e, "마이페이지 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div style={mutedBoxStyle}>로딩 중...</div>
  }

  return (
    <div style={{ ...pageStyle, maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={titleHeroStyle}>MY PAGE</h1>
          <div style={{ color: "#666", fontSize: 16 }}>
            내 활동과 계정 정보를 한눈에 확인해보세요.
          </div>
        </div>

        <button onClick={() => nav("/mypage/settings")} style={primaryButtonStyle}>
          계정 설정
        </button>
      </div>

      {err && <div style={errorBoxStyle}>{err}</div>}

      {me && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#24364b",
              marginBottom: 8,
            }}
          >
            {me.nickname}
          </div>

          <div style={{ color: "#666", marginBottom: 8, fontSize: 16 }}>{me.email}</div>

          {me.name && (
            <div style={{ marginBottom: 6, fontSize: 16 }}>
              <strong>이름:</strong> {me.name}
            </div>
          )}

          {me.bio && (
            <div style={{ color: "#555", fontSize: 15, marginTop: 6 }}>
              {me.bio}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="내 상태" value={me?.status ?? "-"} />
        <StatCard label="내 글" value={`${myPostsCount}개`} />
        <StatCard label="참여 중 스터디" value={`${myStudiesCount}개`} />
        <StatCard label="예정 예약" value={`${upcomingReservationsCount}건`} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, display: "grid", gap: 12 }}>
        <SectionHeader
          title="내가 쓴 글"
          actionLabel="전체 글 보기"
          onClick={() => nav("/?mine=true")}
        />

        {myPosts.length === 0 ? (
          <div style={mutedBoxStyle}>작성한 글이 아직 없어요.</div>
        ) : (
          myPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onClick={() => nav(`/posts/${post.id}`)}
            />
          ))
        )}
      </div>
      <div style={{ ...cardStyle, marginBottom: 24, display: "grid", gap: 12 }}>
        <SectionHeader title="내가 쓴 댓글" />
        {myComments.length === 0 ? (
            <div style={mutedBoxStyle}>작성한 댓글이 아직 없어요.</div>
        ) : (
            myComments.map((comment) => (
            <CommentItem
                key={comment.commentId}
                comment={comment}
                onClick={() => nav(`/posts/${comment.postId}`)}
            />
            ))
        )}
      </div>
      <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
        <SectionHeader title="빠른 이동" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => nav("/mystudies")} style={secondaryButtonStyle}>
            내 스터디 보기
          </button>

          <button onClick={() => nav("/reservations?scope=mine")} style={secondaryButtonStyle}>
            내 예약 보기
          </button>
        </div>
      </div>
    </div>
  )
}