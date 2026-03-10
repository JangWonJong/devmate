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
import { getStudyByPostId, getStudyMembers, createStudy, getStudy, joinStudy, leaveStudy, closeStudy, delegateStudyLeader,
   type StudyMemberResponse, type StudyResponse } from "../api/study";


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
  const [studyError, setStudyError] =useState<string | null>(null)

  const [loggedIn, setLoggedIn] = useState(tokenStore.isLoggedIn());
  const [post, setPost] = useState<PostResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [studyLoading, setStudyLoading] = useState(false)
  const [studyMembers, setStudyMembers] = useState<StudyMemberResponse[]>([])
  //const [membersLoading, setMembersLoading] = useState(false)


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

  useEffect(() => {
    if (!post) return
    if (post.type !== "STUDY") return

    let cancelled = false

    ;(async () => {
      try {
        setStudyLoading(true)
        setStudyError(null)

        const s = await getStudyByPostId(post.id)
        if (cancelled) return
        setStudy(s)

        const members = await getStudyMembers(s.id)
        if (cancelled) return
        setStudyMembers(members)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) {
          if (cancelled) return
          setStudy(null)
          setStudyMembers([])
          return
        }

        if (cancelled) return
        setStudyError("스터디 정보를 불러오지 못했습니다.")
      } finally {
        if (!cancelled) {
          setStudyLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [post])


  if (loading) return <div style={{ color: "#666" }}>게시글 불러오는 중...</div>;
  if (loadErr) return <div style={{ color: "crimson" }}>{loadErr}</div>;
  if (!post) return <div style={{ color: "#666" }}>게시글이 없어요.</div>;
  
  const isMine = meId != null && post.authorId === meId;
  const canSolve = isMine && !post.solved;

  const onCreateStudy = async () => {
    if (!post) return

    const input = prompt("최대 인원을 입력하세요", "4")
    if (!input) return

    const maxMembers = Number(input)

    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      setStudyError("최대 인원은 2명 이상이어야 합니다.")
      return
    }

    try {
      setStudyError(null)
      setStudyLoading(true)

      const studyId = await createStudy({
        postId: post.id,
        maxMembers,
      })

      const createdStudy = await getStudy(studyId)
      setStudy(createdStudy)

      const members = await getStudyMembers(studyId)
      setStudyMembers(members)
    } catch (e: any) {
      setStudyError(e.message ?? "스터디 생성 실패")
    } finally {
      setStudyLoading(false)
    }
  }

  const refreshStudySection = async (postId: number) => {
    const s = await getStudyByPostId(postId)
    setStudy(s)

    const members = await getStudyMembers(s.id)
    setStudyMembers(members)
  }

  const onJoinStudy = async () => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await joinStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(e.message ?? "스터디 참가 실패")
    } finally {
      setStudyLoading(false)
    }
  }

  const onLeaveStudy = async () => {
    if (!study || !post) return

    const ok = confirm("스터디에서 탈퇴할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await leaveStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(e.message ?? "스터디 탈퇴 실패")
    } finally {
      setStudyLoading(false)
    }
  } 

  const onCloseStudy = async () => {
    if (!study || !post) return

    const ok = confirm("스터디 모집을 마감할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await closeStudy(study.id)
      await refreshStudySection(post.id)
    } catch (e: any) {
      setStudyError(e.message ?? "스터디 모집 마감 실패")
    } finally {
      setStudyLoading(false)
    }
  }

  const onDelegateLeader = async (targetMemberId: number) => {
    if (!study || !post) return

    const ok = confirm("이 멤버에게 리더를 위임할까요?")
    if (!ok) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await delegateStudyLeader(study.id, {targetMemberId})
      await refreshStudySection(post.id)

    } catch (e: any) {
      setStudyError(e.message ?? "리더 위임 실패")
    } finally {
      setStudyLoading(false)
    }

  }

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

  const sortedComments = [...comments].sort((a,b) => {
    if (a.adopted === b.adopted) return 0
    return a.adopted ? -1 :1
  })

  
  
  const isAuthor = meId != null && post.authorId === meId
  const isStudyPost = post.type === "STUDY"
  const isStudyLeader = studyMembers.some(
    (member) => member.memberId === meId && member.role === "LEADER"
  )
  const isStudyJoined = studyMembers.some(
    (member) => member.memberId === meId
  )

  const isRecruiting = study?.status === "RECRUITING"


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
      {isStudyPost && (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fafafa",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>스터디 정보</h3>

          {studyLoading ? (
            <div style={{ color: "#666" }}>스터디 정보를 불러오는 중...</div>
          ) : studyError ? (
            <div style={{ color: "crimson" }}>{studyError}</div>
          ) : study ? (
            <>
              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <strong>상태:</strong>{" "}
                  {study.status === "RECRUITING" ? "모집중" : "모집 마감"}
                </div>
                <div>
                  <strong>현재 인원:</strong> {study.currentMembers} / {study.maxMembers}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8 }}>참여 멤버</h4>

                {studyMembers.length === 0 ? (
                  <div style={{ color: "#666" }}>참여 중인 멤버가 없습니다.</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {studyMembers.map((member) => (
                  <li
                    key={member.memberId}
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      {member.nickname}{" "}
                      {member.role === "LEADER" && (
                        <span style={{ color: "#666", fontSize: 13 }}>(리더)</span>
                      )}
                    </div>

                    {isStudyLeader &&
                      member.role !== "LEADER" &&
                      member.memberId !== meId && (
                        <button
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() => onDelegateLeader(member.memberId)}
                        >
                          리더 위임
                        </button>
                      )}
                  </li>
                    ))}
                  </ul>
                )}
              </div>
            {loggedIn && (
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                {isRecruiting && !isStudyJoined && (
                  <button
                    style={{ padding: "8px 12px" }} onClick={onJoinStudy}>
                    참가하기
                  </button>
                )}

                {isRecruiting && isStudyJoined && !isStudyLeader && (
                  <button
                    style={{ padding: "8px 12px" }} onClick={onLeaveStudy}>
                    탈퇴하기
                  </button>
                )}

                {isRecruiting && isStudyLeader && (
                  <button
                    style={{ padding: "8px 12px" }}  onClick={onCloseStudy}>
                    모집 마감
                  </button>
                )}
              </div>
            )}
          </>
          ) : (
            <div>
              <div style={{ color: "#666", marginBottom: 12 }}>
                아직 스터디가 생성되지 않았습니다.
              </div>

              {isAuthor && (
                <button style={{ padding: "8px 12px" }}  onClick={onCreateStudy}>
                  스터디 생성
                </button>
              )}
            </div>
          )}
        </section>
      )}
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
            sortedComments.map((c) => {
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