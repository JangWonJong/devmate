import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  formatAdminMemberDate,
  getAdminMemberDetail,
  getAdminMemberStatusLabel,
  getAdminMemberStatusStyle,
  updateAdminMemberMemo,
  updateAdminMemberRole,
  updateAdminMemberStatus,
  type AdminMemberDetail,
} from "../../api/admin/memberManagement"
import { getCurrentMemberId } from "../../api/auth/currentUser"
import { imageUrl } from "../../utils/image"
import { appToast } from "../../lib/toast"
import { ConfirmModal } from "../../components/common/feedback/ConfirmModal"
import { useConfirm } from "../../hooks/common/useConfirm"

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function ActivityEmpty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
      {text}
    </p>
  )
}

function getActionTypeLabel(type: string) {
  switch (type) {
    case "MEMBER_STATUS_CHANGE":
      return "상태 변경"
    case "MEMBER_ROLE_CHANGE":
      return "권한 변경"
    case "ADMIN_MEMO_UPDATE":
      return "메모 수정"
    default:
      return type
  }
}

export default function AdminMemberDetailPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()

  const [member, setMember] = useState<AdminMemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminMemo, setAdminMemo] = useState("")
  const [actionFilter, setActionFilter] = useState<"ALL" | "STATUS" | "ROLE" | "MEMO">("ALL")
  const [searchKeyword, setSearchKeyword] = useState("")

  const [error, setError] = useState("")
  const [imageError, setImageError] = useState(false)

  const {
      open,
      title,
      message,
      danger,
      action,
      confirm: openConfirm,
      closeConfirm,
    } = useConfirm()

  async function fetchMemberDetail(id: number) {
    const data = await getAdminMemberDetail(id)
    setMember(data)
    setAdminMemo(data.adminMemo ?? "")
  }

  useEffect(() => {
    setImageError(false)
  }, [memberId])

  useEffect(() => {
    if (!memberId) return

    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getAdminMemberDetail(Number(memberId))

        if (!mounted) return

        setMember(data)
        setAdminMemo(data.adminMemo ?? "")
      } catch (e) {
        console.error(e)

        if (mounted) {
          setError("회원 상세 정보를 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [memberId])

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        불러오는 중...
      </section>
    )
  }

  if (error || !member) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-rose-500 shadow-sm">
        {error || "회원 정보가 없습니다."}
      </section>
    )
  }

  const currentMemberId = getCurrentMemberId()
  const isSelfAdmin = currentMemberId === member.id && member.role === "ADMIN"
  const isDeletedMember = member.status === "DELETED"
  const isSuspendedMember = member.status === "SUSPENDED"
  const isActionDisabled = saving

  const filteredLogs = member.actionLogs.filter((log) => {
    if (actionFilter !== "ALL") {
      if (actionFilter === "STATUS" && log.actionType !== "MEMBER_STATUS_CHANGE") return false
      if (actionFilter === "ROLE" && log.actionType !== "MEMBER_ROLE_CHANGE") return false
      if (actionFilter === "MEMO" && log.actionType !== "ADMIN_MEMO_UPDATE") return false
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      return (
        log.description.toLowerCase().includes(keyword) ||
        log.adminNickname.toLowerCase().includes(keyword)
      )
    }

    return true
  })

  async function handleToggleStatus() {
    if (!member) return

    if (member.status === "SUSPENDED") {
      appToast.info("정지 상태에서는 탈퇴 처리를 할 수 없습니다. 먼저 정지를 해제해주세요.")
      return
    }

    const nextStatus = member.status === "DELETED" ? "ACTIVE" : "DELETED"

    openConfirm({
      title:
        nextStatus === "DELETED"
          ? "회원 탈퇴 처리"
          : "회원 복구 처리",

      message:
        nextStatus === "DELETED"
          ? "해당 회원을 탈퇴 처리하시겠습니까?"
          : "해당 회원을 복구 처리하시겠습니까?",

      danger: nextStatus === "DELETED",

      onConfirm: async () => {
        try {
          setSaving(true)

          await updateAdminMemberStatus(member.id, nextStatus)
          await fetchMemberDetail(member.id)

          appToast.success(
            nextStatus === "DELETED"
              ? "회원이 탈퇴 처리되었습니다."
              : "회원이 복구되었습니다."
          )
        } catch (e) {
          console.error(e)
          appToast.error("회원 상태 변경에 실패했습니다.")
        } finally {
          setSaving(false)
          closeConfirm()
        }
      },
    })
  }

  async function handleToggleRole() {
    if (!member) return

    if (isSelfAdmin) {
      appToast.info("현재 로그인한 관리자 계정은 권한을 변경할 수 없습니다.")
      return
    }

    if (isDeletedMember) {
      appToast.info("탈퇴한 회원의 권한은 변경할 수 없습니다.")
      return
    }

    if (isSuspendedMember) {
      appToast.info("정지된 회원의 권한은 변경할 수 없습니다.")
      return
    }

    const nextRole = member.role === "USER" ? "ADMIN" : "USER"

    openConfirm({
      title:
        nextRole === "ADMIN"
          ? "관리자 권한 부여"
          : "일반 회원 권한 변경",

      message:
        nextRole === "ADMIN"
          ? "해당 회원에게 관리자 권한을 부여하시겠습니까?"
          : "해당 회원을 일반 회원 권한으로 변경하시겠습니까?",

      onConfirm: async () => {
        try {
          setSaving(true)

          await updateAdminMemberRole(member.id, nextRole)
          await fetchMemberDetail(member.id)

          appToast.success(
            nextRole === "ADMIN"
              ? "관리자 권한이 부여되었습니다."
              : "일반 회원 권한으로 변경되었습니다."
          )
        } catch (e) {
          console.error(e)
          appToast.error("회원 권한 변경에 실패했습니다.")
        } finally {
          setSaving(false)
          closeConfirm()
        }
      },
    })
  }

  async function handleSuspendMember() {
    if (!member) return

    const nextStatus = member.status === "SUSPENDED"
      ? "ACTIVE"
      : "SUSPENDED"

    openConfirm({
      title:
        nextStatus === "SUSPENDED"
          ? "회원 정지 처리"
          : "회원 정지 해제",

      message:
        nextStatus === "SUSPENDED"
          ? "해당 회원을 정지 처리하시겠습니까?"
          : "해당 회원의 정지를 해제하시겠습니까?",

      danger: nextStatus === "SUSPENDED",

      onConfirm: async () => {
        try {
          setSaving(true)

          await updateAdminMemberStatus(member.id, nextStatus)
          await fetchMemberDetail(member.id)

          appToast.success(
            nextStatus === "SUSPENDED"
              ? "회원이 정지 처리되었습니다."
              : "회원 정지가 해제되었습니다."
          )
        } catch (e) {
          console.error(e)
          appToast.error("회원 정지 상태 변경에 실패했습니다.")
        } finally {
          setSaving(false)
          closeConfirm()
        }
      },
    })
  }

  async function handleSaveAdminMemo() {
    if (!member) return

    try {
      setSaving(true)
      await updateAdminMemberMemo(member.id, adminMemo.trim())
      await fetchMemberDetail(member.id)

      appToast.success("관리자 메모가 저장되었습니다.")
    } catch (e) {
      console.error(e)
      appToast.error("관리자 메모 저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 lg:max-w-[360px]">
            <button
              type="button"
              onClick={() => navigate("/admin/members")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← 회원 목록
            </button>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              회원 상세
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              회원 기본 정보와 상태를 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 overflow-x-auto lg:w-auto lg:justify-end">
            <button
              type="button"
              onClick={handleToggleRole}
              disabled={
                isActionDisabled ||
                isSelfAdmin ||
                isDeletedMember ||
                isSuspendedMember
              }
              className="whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "처리 중..."
                : isSelfAdmin
                  ? "본인 권한 변경 불가"
                  : isDeletedMember
                    ? "탈퇴 회원 권한 변경 불가"
                    : isSuspendedMember
                      ? "정지 회원 변경 불가"
                      : member.role === "USER"
                        ? "관리자 권한 부여"
                        : "일반 회원 권한 변경"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/members/${member.id}`)}
              className="whitespace-nowrap rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              프로필 보기
            </button>

            {!isDeletedMember && (
              <button
                type="button"
                onClick={handleSuspendMember}
                disabled={saving}
                className={
                  isSuspendedMember
                    ? "whitespace-nowrap rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    : "whitespace-nowrap rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {saving
                  ? "처리 중..."
                  : isSuspendedMember
                    ? "정지 해제"
                    : "정지 처리"}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={saving || isSuspendedMember}
              className={
                isSuspendedMember
                  ? "whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                  : member.status === "DELETED"
                    ? "whitespace-nowrap rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    : "whitespace-nowrap rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {saving
                ? "처리 중..."
                : isSuspendedMember
                  ? "탈퇴 불가"
                  : member.status === "DELETED"
                    ? "복구 처리"
                    : "탈퇴 처리"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {member.profileImageUrl && !imageError ? (
              <img
                src={imageUrl(member.profileImageUrl)}
                alt={member.nickname}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {member.nickname.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">
                {member.nickname}
              </p>
              <p className="mt-1 text-sm text-slate-500">{member.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {member.role}
              </span>

              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  getAdminMemberStatusStyle(member.status),
                ].join(" ")}
              >
                {getAdminMemberStatusLabel(member.status)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">운영 정보</h2>
          <p className="mt-1 text-sm text-slate-500">
            회원의 서비스 이용 및 활동 현황입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="작성 게시글 수" value={member.postCount} />
          <StatCard label="작성 댓글 수" value={member.commentCount} />
          <StatCard label="문의 수" value={member.inquiryCount} />
          <StatCard label="예약 수" value={member.reservationCount} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="이름" value={member.name || "-"} />
          <InfoCard label="닉네임" value={member.nickname || "-"} />
          <InfoCard label="이메일" value={member.email || "-"} />
          <InfoCard label="전화번호" value={member.phone || "-"} />
          <InfoCard label="권한" value={member.role} />
          <InfoCard
            label="상태"
            value={getAdminMemberStatusLabel(member.status)}
          />
          <InfoCard
            label="가입일"
            value={formatAdminMemberDate(member.createdAt)}
          />
          <InfoCard
            label="수정일"
            value={formatAdminMemberDate(member.updatedAt)}
          />
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-slate-500">소개</p>
          <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {member.bio?.trim() ? member.bio : "등록된 소개가 없습니다."}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">최근 활동</h2>
          <p className="mt-1 text-sm text-slate-500">
            회원의 최근 서비스 이용 내역입니다.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              최근 게시글
            </h3>

            <div className="space-y-3">
              {member.recentPosts.length === 0 ? (
                <ActivityEmpty text="최근 게시글이 없습니다." />
              ) : (
                member.recentPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => navigate(`/posts/${post.id}`)}
                    className="min-h-[76px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-white hover:shadow-sm"
                  >
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {post.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatAdminMemberDate(post.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              최근 문의
            </h3>

            <div className="space-y-3">
              {member.recentInquiries.length === 0 ? (
                <ActivityEmpty text="최근 문의가 없습니다." />
              ) : (
                member.recentInquiries.map((inquiry) => (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                    className="min-h-[76px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-white hover:shadow-sm"
                  >
                    <p className="line-clamp-2 text-sm text-slate-700">
                      {inquiry.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatAdminMemberDate(inquiry.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              최근 예약
            </h3>

            <div className="space-y-3">
              {member.recentReservations.length === 0 ? (
                <ActivityEmpty text="최근 예약이 없습니다." />
              ) : (
                member.recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="min-h-[76px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {reservation.title}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {reservation.roomName} · {reservation.date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {reservation.startTime.slice(0, 5)} ~{" "}
                      {reservation.endTime.slice(0, 5)}
                    </p>

                    <span
                      className={[
                        "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        reservation.status === "ACTIVE"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-slate-200 bg-white text-slate-500",
                      ].join(" ")}
                    >
                      {reservation.status === "ACTIVE" ? "예약중" : "취소됨"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">관리자 메모</h2>
            <p className="mt-1 text-sm text-slate-500">
              내부 운영 참고용 메모입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAdminMemo}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "저장 중..." : "메모 저장"}
          </button>
        </div>

        <textarea
          value={adminMemo}
          onChange={(e) => setAdminMemo(e.target.value.slice(0, 500))}
          rows={5}
          placeholder="예: 반복 문의 이력, 운영상 주의사항, 계정 확인 내용 등을 기록합니다."
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
        />

        <div className="mt-2 text-right text-xs text-slate-400">
          {adminMemo.length} / 500
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">관리 이력</h2>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "ALL", label: "전체" },
                { key: "STATUS", label: "상태 변경" },
                { key: "ROLE", label: "권한 변경" },
                { key: "MEMO", label: "메모 수정" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActionFilter(item.key as any)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    actionFilter === item.key
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="관리 이력 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full max-w-[240px] rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
            />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            관리자에 의해 처리된 회원 관리 기록입니다.
          </p>
        </div>

        {filteredLogs.length === 0 ? (
          <ActivityEmpty text="관리 이력이 없습니다." />
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    {log.description}
                  </p>

                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {getActionTypeLabel(log.actionType)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  처리자: {log.adminNickname} ·{" "}
                  {formatAdminMemberDate(log.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      <ConfirmModal
        open={open}
        title={title}
        message={message}
        confirmText="확인"
        cancelText="취소"
        danger={danger}
        onConfirm={() => action?.()}
        onCancel={closeConfirm}
      />
    </div>
    
  )
}