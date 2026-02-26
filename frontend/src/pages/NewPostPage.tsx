import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";


export function NewPostPage() {
  
    const nav = useNavigate()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [err , setErr] = useState<string | null>(null)
    const [loading, setLoading ] =useState(false)
    
    return (
     <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>고민 구름</h1>

      <div style={{ display: "grid", gap: 8 }}>
        <input
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, minHeight: 200 }}
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          disabled={loading}
          style={{ padding: "10px 14px" }}
          onClick={async () => {
            setErr(null);

            if (!title.trim()) return setErr("제목을 입력해줘.");
            if (!content.trim()) return setErr("내용을 입력해줘.");

            try {
              setLoading(true);
              const id = await createPost({ title: title.trim(), content: content.trim() });
              nav(`/posts/${id}`); // ✅ 생성 후 상세 페이지로 이동
            } catch (e: any) {
              setErr(e.message ?? "등록 실패");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "등록 중..." : "등록"}
        </button>

        <button
          disabled={loading}
          style={{ padding: "10px 14px" }}
          onClick={() => nav(-1)}
        >
          취소
        </button>
      </div>
    </div>
  );
}