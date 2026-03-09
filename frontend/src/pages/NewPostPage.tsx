import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";

export function NewPostPage() {
  const nav = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"QUESTION" | "STUDY">("QUESTION")

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr("제목을 입력해 주세요.")
    if (!c) return setErr("내용을 입력해 주세요.")

    try {
      setLoading(true)
      const id = await createPost({ title: t, content: c, type })
      nav(`/posts/${id}`)
    } catch (e: any) {
      setErr(e.message ?? "등록 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>고민 구름</h1>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>글 종류</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "QUESTION" | "STUDY")}
          style={{ padding: 8, border: "1px solid #ddd" }}
        >
          <option value="QUESTION">질문</option>
          <option value="STUDY">스터디</option>
        </select>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          style={{
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={{
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
            minHeight: 220,
            resize: "vertical",
            lineHeight: 1.5,
          }}
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

      {loading && <div style={{ color: "#666", marginTop: 10 }}>게시글 등록 중...</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          disabled={loading}
          style={{ padding: "10px 14px" }}
          onClick={onSubmit}
        >
          등록
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
  )
}