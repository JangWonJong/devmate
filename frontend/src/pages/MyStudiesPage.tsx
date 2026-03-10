import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyStudies, type StudyResponse } from "../api/study";


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
        return <div style={{ color: "#666"}}>내 스터디 불러오는중</div>
    }

    if (error) {
        return <div style={{ color: "crimson"}}>{error}</div>
    }

    return (
       <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
        내 스터디
      </h1>

      {studies.length === 0 ? (
        <div style={{ color: "#666" }}>참여 중인 스터디가 없어요.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {studies.map((study) => (
            <div
              key={study.id}
              onClick={() => nav(`/posts/${study.postId}`)}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                background: "#fafafa",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0" }}>{study.postTitle}</h3>

              <div style={{ display: "grid", gap: 6, color: "#333" }}>
                <div>
                  <strong>상태:</strong>{" "}
                  {study.status === "RECRUITING" ? "모집중" : "모집 마감"}
                </div>
                 <div>
                  <strong>작성자:</strong> {study.authorNickname}
                </div>
                <div>
                  <strong>리더:</strong> {study.leaderNickname}
                </div>
                <div>
                  <strong>현재 인원:</strong> {study.currentMembers} / {study.maxMembers}
                </div>
                <div>
                  <strong>생성일:</strong>{" "}
                  {new Date(study.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div> 
    )

}