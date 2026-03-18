
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMe, type MeResponse } from "../api/members"
import { getMyStudies } from "../api/study"
import { listMyReservations } from "../api/reservations"
import { apiErrorMessage } from "../utils/error"

function isUpcomingReservation(date: string, endTime: string) {
  const now = new Date()
  const end = new Date(`${date}T${endTime}`)
  return end >= now
}

export function MyPage() {
  const nav = useNavigate()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [myStudiesCount, setMyStudiesCount] = useState(0)
  const [upcomingReservationsCount, setUpcomingReservationsCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErr(null)

        const [meData, myStudies, myReservationsPage] = await Promise.all([
          getMe(),
          getMyStudies(),
          listMyReservations({ page: 0, size: 100, sort: "date,desc" }),
        ])

        setMe(meData)
        setMyStudiesCount(myStudies.length)

        const upcomingCount = myReservationsPage.content.filter((r) =>
          isUpcomingReservation(r.date, r.endTime)
        ).length

        setUpcomingReservationsCount(upcomingCount)
      } catch (e) {
        setErr(apiErrorMessage(e, "마이페이지 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (err) {
    return <div style={{ color: "crimson" }}>{err}</div>
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
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
          <h1
            style={{
              margin: 0,
              fontSize: 56,
              fontWeight: 800,
              color: "#24364b",
              letterSpacing: -1,
            }}
          >
            MY PAGE
          </h1>
          <div style={{ marginTop: 8, color: "#666" }}>
            내 활동과 계정 정보를 한눈에 확인해보세요.
          </div>
        </div>

        <button
          onClick={() => nav("/mypage/settings")}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: 10,
            background: "#24364b",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          계정 설정
        </button>
      </div>

      {me && (
        <div
          style={{
            marginBottom: 24,
            padding: 24,
            border: "1px solid #ddd",
            borderRadius: 16,
            background: "white",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: "#24364b", marginBottom: 8 }}>
            {me.nickname}
          </div>
          <div style={{ color: "#666", marginBottom: 6 }}>{me.email}</div>
          {me.name && <div style={{ marginBottom: 6 }}><strong>이름:</strong> {me.name}</div>}
          {me.bio && <div style={{ color: "#555" }}>{me.bio}</div>}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 16,
            background: "white",
          }}
        >
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>내 상태</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#24364b" }}>
            {me?.status ?? "-"}
          </div>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 16,
            background: "white",
          }}
        >
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>참여 중 스터디</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#24364b" }}>
            {myStudiesCount}개
          </div>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 16,
            background: "white",
          }}
        >
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>예정 예약</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#24364b" }}>
            {upcomingReservationsCount}건
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
          background: "white",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: "#24364b" }}>
          빠른 이동
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => nav("/mystudies")}
            style={{
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            내 스터디 보기
          </button>

          <button
            onClick={() => nav("/reservations?scope=mine")}
            style={{
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            내 예약 보기
          </button>
        </div>
      </div>
    </div>
  )
}