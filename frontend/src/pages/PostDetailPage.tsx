import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePost, getPost, type PostResponse } from "../api/posts";



export function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

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


  return ( 
  <div style={{ maxWidth: 720 }}>
    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
      {post.title}
    </h1>

    <div style={{ color: "#666", marginBottom: 16 }}>
      작성자: {post.authorNickname} {post.solved ? "· ✅ 해결됨" : "🕒 해결 전"}
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

    </div>

  </div>
)
    
}