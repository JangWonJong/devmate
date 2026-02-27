import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePost, getPost, type PostResponse } from "../api/posts";
import { tokenStore } from "../auth/token";
import { getMeId } from "../api/members";



export function PostDetailPage() {
  const nav = useNavigate()
  const { id } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [meId, setMeId] = useState<number | null>(null)
  
  useEffect(() => {
    (async () => {
      if (!tokenStore.isLoggedIn()) {
        setMeId(null)
        return
      }
      try {
        const id = await getMeId()
        setMeId(id)
      }catch {
        setMeId(null)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
        try {
            if (!id) return
            const p = await getPost(id)
            setPost(p)
        } catch (e: any) {
            setErr(e.message ?? "상세 조회 실패")
        }
    })()
  }, [id])

  if(err) return <div style={{color: "crimson"}}>{err}</div>
  if(!post) return <div >Loading...</div>
  const isMine = meId != null && post.authorId === meId

  return ( 
  <div style={{ maxWidth: 720 }}>
    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
      {post.title}
    </h1>

    <div style={{ color: "#666", marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span> 작성자: {post.authorNickname}</span>
      <span> {post.solved ? "· ✅ 해결됨" : "🕒 해결 전"} </span>
       {isMine && (
        <span
          style={{
            fontSize: 12,
            padding: "2px 8px",
            border: "1px solid #ddd",
            borderRadius: 999,
            color: "#111",
            background: "#fafafa",
          }}
        >
          내 글
    </span>
       )} 
    </div>

    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
      {post.content}
    </div>

    {/* ✅ 버튼 영역 추가 */}
    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
      <button
        disabled={busy}
        style={{ padding: "10px 14px" }}
        onClick={() => nav("/")}
      >
        목록
      </button>
      {isMine && (
      <>
        <button
        disabled={busy}
        style={{ padding: "10px 14px" }}
        onClick={async () => {
          if (!id) return;
          const ok = confirm("정말 삭제할까요?");
          if (!ok) return;

          try {
            setBusy(true);
            await deletePost(id);
            nav("/");
          } catch (e: any) {
            alert(e.message ?? "삭제 실패");
          } finally {
            setBusy(false);
          }
        }}
      >
      삭제
    </button>
    <button disabled={busy}
            style={{ padding: "10px 14px" }}
            onClick={() => nav(`/posts/${post.id}/edit`)}>
      수정
        </button>
            </>
    )}
    </div>
  </div>
)
    
}