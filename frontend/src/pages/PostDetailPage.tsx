import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost, type PostResponse } from "../api/posts";

export function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<PostResponse | null>(null)
  const [err, setErr] = useState<string | null>(null)

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
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{post.title}</h1>
      <div style={{ color: "#666", marginBottom: 16 }}>
        작성자: {post.authorNickname} {post.solved ? "· ✅ 해결됨" : ""}
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.content}</div>
    </div>
  )
}