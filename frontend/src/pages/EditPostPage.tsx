import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, updatePost } from "../api/posts";


export function EditPostPage(){

    const {id} = useParams()
    const nav = useNavigate()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [solved, setSolved] = useState(false)

    const [err, setErr] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                if(!id) return
                const p = await getPost(id)
                setTitle(p.title)
                setContent(p.content)
                setSolved(!!p.solved)
            } catch (e: any){
                setErr(e.message ?? "불러오기 실패")
            }
        })()
    }, [id])

    if (err) return <div style={{color: "crimson"}}>{err}</div>
    if (!id) return <div>잘못된 접근</div>

    return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>수정</h1>

      <div style={{ display: "grid", gap: 8 }}>
        <input
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, minHeight: 220 }}
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={solved}
            onChange={(e) => setSolved(e.target.checked)}
          />
          해결됨
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          disabled={busy}
          style={{ padding: "10px 14px" }}
          onClick={async () => {
            setErr(null);

            if (!title.trim()) return setErr("제목을 입력해줘.");
            if (!content.trim()) return setErr("내용을 입력해줘.");

            try {
              setBusy(true);
              await updatePost(id, { title: title.trim(), content: content.trim(), solved });
              nav(`/posts/${id}`);
            } catch (e: any) {
              setErr(e.message ?? "수정 실패");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "저장 중..." : "저장"}
        </button>

        <button disabled={busy} style={{ padding: "10px 14px" }} onClick={() => nav(-1)}>
          취소
        </button>
      </div>
    </div>
    )
}