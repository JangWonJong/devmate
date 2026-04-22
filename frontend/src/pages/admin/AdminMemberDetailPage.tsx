import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  formatAdminMemberDate,
  getAdminMemberDetail,
  getAdminMemberStatusLabel,
  getAdminMemberStatusStyle,
  updateAdminMemberStatus,
  type AdminMemberDetail,
} from "../../api/admin/memberManagement"
import { imageUrl } from "../../utils/image"

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

export default function AdminMemberDetailPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()

  const [member, setMember] = useState<AdminMemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imageError, setImageError] = useState(false)

  async function fetchMemberDetail(id: number) {
    const data = await getAdminMemberDetail(id)
    setMember(data)
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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/members")}
              className="mb-3 text-sm text-slate-500 transition hover:text-slate-700"
            >
              ← 목록으로
            </button>

            <h1 className="text-2xl font-bold text-slate-900">회원 상세</h1>

            <p className="mt-2 text-sm text-slate-500">
              회원 기본 정보와 상태를 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={saving}
              className={
                member.status === "ACTIVE"
                  ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                  : "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              }
            >
              {saving
                ? "처리 중..."
                : member.status === "ACTIVE"
                  ? "탈퇴 처리"
                  : "복구 처리"}
            </button>

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

          <div>
            <p className="text-xl font-bold text-slate-900">{member.nickname}</p>
            <p className="mt-1 text-sm text-slate-500">{member.email}</p>
          </div>
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
    </div>
  )
}