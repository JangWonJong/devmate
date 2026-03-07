import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePost, getPost, solvePost, type PostResponse } from "../api/posts";
import { tokenStore } from "../auth/token";
import { getMeId } from "../api/members";
import {
  listComments,
  createComment,
  deleteComment,
  updateComment,
  type CommentResponse,
  adoptComment,
} from "../api/comments";

function StatusBadge({ solved }: { solved: boolean }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "2px 8px",
        border: "1px solid #ddd",
        borderRadius: 999,
        background: solved ? "#f3fff6" : "#fafafa",
        color: "#111",
      }}
    >
      {solved ? "해결됨" : "해결 전"}
    </span>
  );
}

export function PostDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [commentErr, setCommentErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn());
  const [post, setPost] = useState<PostResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    const sync = () => setLoggedIn(tokenStore.isLoggedIn());
    sync();
    return tokenStore.subscribe(sync);
  }, []);

  useEffect(() => {
    (async () => {
      if (!loggedIn) {
        setMeId(null);
        return;
      }
      try {
        const id = await getMeId();
        setMeId(id);
      } catch {
        setMeId(null);
      }
    })();
  }, [loggedIn]);

  useEffect(() => {
    (async () => {
      try {
        setLoadErr(null);
        setLoading(true);

        if (!id) return;
        const p = await getPost(id);
        setPost(p);
      } catch (e: any) {
        setLoadErr(e.message ?? "상세 조회 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setCommentErr(null);
        const res = await listComments(id);
        setComments(res);
      } catch (e: any) {
        setCommentErr(e.message ?? "댓글 조회 실패");
      }
    })();
  }, [id]);

  if (loading) return <div style={{ color: "#666" }}>게시글 불러오는 중...</div>;
  if (loadErr) return <div style={{ color: "crimson" }}>{loadErr}</div>;
  if (!post) return <div style={{ color: "#666" }}>게시글이 없어요.</div>;

  const isMine = meId != null && post.authorId === meId;
  const canSolve = isMine && !post.solved;

  const onCreateComment = async () => {
    if (!id) return;
    if (!commentInput.trim()) return;

    try {
      setCommentErr(null);
      await createComment(id, { content: commentInput.trim() });
      setCommentInput("");

      const res = await listComments(id);
      setComments(res);
    } catch (e: any) {
      setCommentErr(e.message ?? "댓글 작성 실패");
    }
  };

  const onDeleteComment = async (commentId: number) => {
    const ok = confirm("댓글을 삭제할까요?");
    if (!ok) return;

    try {
      setCommentErr(null);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (e: any) {
      setCommentErr(e.message ?? "댓글 삭제 실패");
    }
  };

  const onUpdateComment = async (commentId: number) => {
    const content = editingContent.trim();
    if (!content) return setCommentErr("댓글 내용을 입력하세요");

    try {
      setCommentErr(null);
      await updateComment(commentId, content);

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content } : c))
      );

      setEditingCommentId(null);
      setEditingContent("");
    } catch (e: any) {
      setCommentErr(e.message ?? "댓글 수정 실패");
    }
  };

  const onSolve = async () => {
    if (!id) return;
    const ok = confirm("이 글을 해결됨으로 처리할까요?");
    if (!ok) return;

    try {
      setBusy(true);
      setActionErr(null);

      await solvePost(id);
      const updated = await getPost(id);
      setPost(updated);
    } catch (e: any) {
      setActionErr(e.message ?? "해결 처리 실패");
    } finally {
      setBusy(false);
    }
  };

  const onDeletePost = async () => {
    if (!id) return;
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      setBusy(true);
      setActionErr(null);
      await deletePost(id);
      nav("/");
    } catch (e: any) {
      setActionErr(e.message ?? "삭제 실패");
    } finally {
      setBusy(false);
    }
  };

  const onAdoptComment = async (commentId: number) => {
  try {
    setCommentErr(null)
    await adoptComment(commentId)

    const res = await listComments(id!)
    setComments(res)

    const updatedPost = await getPost(id!)
    setPost(updatedPost)
  } catch (e: any) {
    setCommentErr(e.message ?? "댓글 채택 실패")
  }
}

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        {post.title}
      </h1>

      <div
        style={{
          color: "#666",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span>작성자: {post.authorNickname}</span>
        <StatusBadge solved={post.solved} />

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

      {actionErr && (
        <div style={{ color: "crimson", marginTop: 12 }}>{actionErr}</div>
      )}

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
            {canSolve && (
              <button
                disabled={busy}
                style={{ padding: "10px 14px" }}
                onClick={onSolve}
              >
                해결 처리
              </button>
            )}

            <button
              disabled={busy}
              style={{ padding: "10px 14px" }}
              onClick={onDeletePost}
            >
              삭제
            </button>

            <button
              disabled={busy}
              style={{ padding: "10px 14px" }}
              onClick={() => nav(`/posts/${post.id}/edit`)}
            >
              수정
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ marginBottom: 10 }}>댓글</h3>

        {commentErr && (
          <div style={{ color: "crimson", marginBottom: 12 }}>{commentErr}</div>
        )}

        {loggedIn ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateComment();
            }}
            style={{ display: "flex", gap: 8, marginBottom: 16 }}
          >
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요"
              style={{ flex: 1, padding: 8, border: "1px solid #ddd" }}
            />

            <button type="submit" style={{ padding: "8px 12px" }}>
              작성
            </button>
          </form>
        ) : (
          <div style={{ color: "#666", marginBottom: 12 }}>
            로그인 후 댓글을 작성할 수 있어요
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {comments.length === 0 ? (
            <div style={{ color: "#666" }}>댓글이 아직 없어요</div>
          ) : (
            comments.map((c) => {
              const isMyComment = meId != null && c.memberId === meId;
              const isEditing = editingCommentId === c.id;

              return (
                <div
                  key={c.id}
                  style={{ border: "1px solid #eee", padding: 10 }}
                >
                  <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                        color: "#666",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{c.authorNickname}</span>

                          {c.adopted && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "2px 8px",
                                border: "1px solid #ddd",
                                borderRadius: 999,
                                background: "#f3fff6",
                                color: "#111",
                              }}
                            >
                              채택됨
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          {isMine && !c.adopted && (
                            <button
                              onClick={() => onAdoptComment(c.id)}
                              style={{ fontSize: 12 }}
                            >
                              채택
                            </button>
                          )}

                          {isMyComment && (
                            <>
                              <button
                                onClick={() => {
                                  setCommentErr(null);
                                  setEditingCommentId(c.id);
                                  setEditingContent(c.content);
                                }}
                                style={{ fontSize: 12 }}
                              >
                                수정
                              </button>

                              <button
                                onClick={() => onDeleteComment(c.id)}
                                style={{ fontSize: 12 }}
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                  {isEditing ? (
                    <div style={{ marginTop: 6 }}>
                      <input
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 8,
                          border: "1px solid #ddd",
                          boxSizing: "border-box",
                        }}
                      />

                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => onUpdateComment(c.id)}
                          style={{ fontSize: 12 }}
                        >
                          저장
                        </button>

                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          style={{ fontSize: 12 }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 6 }}>{c.content}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}