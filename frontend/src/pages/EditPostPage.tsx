import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, updatePost } from "../api/posts";

export function EditPostPage() {
  const nav = useNavigate()
  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [solved, setSolved] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setErr(null)
        setLoading(true)

        if (!id) return
        const post = await getPost(id)
        setTitle(post.title)
        setContent(post.content)
        setSolved(post.solved)
      } catch (e: any) {
        setErr(e.message ?? "게시글 불러오기 실패")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr("제목을 입력해 주세요.")
    if (!c) return setErr("내용을 입력해 주세요.")
    if (!id) return setErr("잘못된 접근입니다.")

    try {
      setSaving(true)
      await updatePost(id, {
        title: t,
        content: c,
        solved,
      })
      nav(`/posts/${id}`)
    } catch (e: any) {
      setErr(e.message ?? "수정 실패")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ color: "#666" }}>게시글 불러오는 중...</div>
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>게시글 수정</h1>

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

        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <input
            type="checkbox"
            checked={solved}
            onChange={(e) => setSolved(e.target.checked)}
          />
          해결됨으로 표시
        </label>
      </div>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

      {saving && <div style={{ color: "#666", marginTop: 10 }}>게시글 수정 중...</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          disabled={saving}
          style={{ padding: "10px 14px" }}
          onClick={onSubmit}
        >
          수정
        </button>

        <button
          disabled={saving}
          style={{ padding: "10px 14px" }}
          onClick={() => nav(-1)}
        >
          취소
        </button>
      </div>
    </div>
  )
}