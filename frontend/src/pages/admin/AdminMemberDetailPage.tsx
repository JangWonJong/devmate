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

export default function AdminMemberDetailPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()

  const [member, setMember] = useState<AdminMemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminMemo, setAdminMemo] = useState("")
  const [error, setError] = useState("")
  const [imageError, setImageError] = useState(false)

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

  async function handleToggleStatus() {
    if (!member) return

    const nextStatus = member.status === "ACTIVE" ? "DELETED" : "ACTIVE"

    const confirmed = window.confirm(
      nextStatus === "DELETED"
        ? "해당 회원을 탈퇴 처리하시겠습니까?"
        : "해당 회원을 복구 처리하시겠습니까?"
    )

    if (!confirmed) return

    try {
      setSaving(true)
      await updateAdminMemberStatus(member.id, nextStatus)
      await fetchMemberDetail(member.id)

      alert(
        nextStatus === "DELETED"
          ? "회원이 탈퇴 처리되었습니다."
          : "회원이 복구되었습니다."
      )
    } catch (e) {
      console.error(e)
      alert("회원 상태 변경에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">
        불러오는 중...
      </section>
    )
  }

  if (error || !member) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-rose-500">
        {error || "회원 정보가 없습니다."}
      </section>
    )
  }

  const currentMemberId = getCurrentMemberId()
  const isSelfAdmin = currentMemberId === member.id && member.role === "ADMIN"

  async function handleToggleRole() {
    if (!member) return

    if (isSelfAdmin) {
      alert("현재 로그인한 관리자 계정은 권한을 변경할 수 없습니다.")
      return
    }

    const nextRole = member.role === "USER" ? "ADMIN" : "USER"

    const confirmed = window.confirm(
      nextRole === "ADMIN"
        ? "해당 회원에게 관리자 권한을 부여하시겠습니까?"
        : "해당 회원을 일반 회원 권한으로 변경하시겠습니까?"
    )

    if (!confirmed) return

    try {
      setSaving(true)
      await updateAdminMemberRole(member.id, nextRole)
      await fetchMemberDetail(member.id)

      alert(
        nextRole === "ADMIN"
          ? "관리자 권한이 부여되었습니다."
          : "일반 회원 권한으로 변경되었습니다."
      )
    } catch (e) {
      console.error(e)
      alert("회원 권한 변경에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAdminMemo() {
    if (!member) return

    try {
      setSaving(true)
      await updateAdminMemberMemo(member.id, adminMemo.trim())
      await fetchMemberDetail(member.id)

      alert("관리자 메모가 저장되었습니다.")
    } catch (e) {
      console.error(e)
      alert("관리자 메모 저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleRole}
              disabled={saving || isSelfAdmin}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "처리 중..."
                : isSelfAdmin
                  ? "본인 권한 변경 불가"
                  : member.role === "USER"
                    ? "관리자 권한 부여"
                    : "일반 회원 권한 변경"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/members/${member.id}`)}
              className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              서비스 프로필 보기
            </button>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={saving}
              className={
                member.status === "ACTIVE"
                  ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  : "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {saving
                ? "처리 중..."
                : member.status === "ACTIVE"
                  ? "탈퇴 처리"
                  : "복구 처리"}
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
    </div>
  )
}