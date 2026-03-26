import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiErrorMessage } from "../../utils/error"
import {
  changePassword,
  getMe,
  updateProfile,
  withdrawMember,
  type ProfileLinkForm,
  type MeResponse,
  type ProfileLinkType,
} from "../../api/members"
import { tokenStore } from "../../auth/token"

const inputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

type ProfileSnapshot = {
  name: string
  nickname: string
  phone: string
  bio: string
  links: ProfileLinkForm[]
}

const normalizeText = (value: string | null | undefined) => (value ?? "").trim()

const normalizeLinks = (links: ProfileLinkForm[]) =>
  links
    .map((link, index) => ({
      type: link.type,
      label: normalizeText(link.label),
      url: normalizeText(link.url),
      displayOrder: index,
    }))
    .filter((link) => link.label || link.url)

const validateLinks = (links: ProfileLinkForm[]) => {
  for (let i = 0; i < links.length; i++) {
    const label = links[i].label.trim()
    const url = links[i].url.trim()

    const hasLabel = Boolean(label)
    const hasUrl = Boolean(url)

    if (!hasLabel && !hasUrl) continue

    if (!hasLabel) {
      return `프로필 링크 ${i + 1}번의 이름을 입력해주세요.`
    }

    if (!hasUrl) {
      return `프로필 링크 ${i + 1}번의 주소를 입력해주세요.`
    }

    const isValidUrl =
      url.startsWith("http://") || url.startsWith("https://")

    if (!isValidUrl) {
      return `프로필 링크 ${i + 1}번의 주소는 http:// 또는 https://로 시작해야 해요.`
    }
  }

  return null
}

export function AccountSettingsPage() {
  const nav = useNavigate()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordErr, setPasswordErr] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [withdrawErr, setWithdrawErr] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [links, setLinks] = useState<ProfileLinkForm[]>([])

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [withdrawPassword, setWithdrawPassword] = useState("")

  const [originalProfile, setOriginalProfile] = useState<ProfileSnapshot | null>(null)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoadErr(null)
        const data = await getMe()

        const mappedLinks = (data.links ?? []).map((link, index) => ({
          type: link.type,
          label: link.label,
          url: link.url,
          displayOrder: link.displayOrder ?? index,
        }))

        setMe(data)
        setName(data.name ?? "")
        setNickname(data.nickname ?? "")
        setPhone(data.phone ?? "")
        setBio(data.bio ?? "")
        setLinks(mappedLinks)

        setOriginalProfile({
          name: data.name ?? "",
          nickname: data.nickname ?? "",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          links: mappedLinks,
        })
      } catch (e) {
        setLoadErr(apiErrorMessage(e, "내 정보 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const isProfileDirty = useMemo(() => {
    if (!originalProfile) return false

    const current = {
      name: normalizeText(name),
      nickname: normalizeText(nickname),
      phone: normalizeText(phone),
      bio: normalizeText(bio),
      links: normalizeLinks(links),
    }

    const original = {
      name: normalizeText(originalProfile.name),
      nickname: normalizeText(originalProfile.nickname),
      phone: normalizeText(originalProfile.phone),
      bio: normalizeText(originalProfile.bio),
      links: normalizeLinks(originalProfile.links),
    }

    return JSON.stringify(current) !== JSON.stringify(original)
  }, [originalProfile, name, nickname, phone, bio, links])

  const onUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setProfileErr(null)
    setProfileSuccess(null)

    const linkValidationError = validateLinks(links)
    if (linkValidationError) {
      setProfileErr(linkValidationError)
      return
    }

    try {
      const updated = await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        links: links
          .map((link, index) => ({
            type: link.type,
            label: link.label.trim(),
            url: link.url.trim(),
            displayOrder: index,
          }))
          .filter((link) => link.label && link.url),
      })

      const mappedLinks = (updated.links ?? []).map((link, index) => ({
        type: link.type,
        label: link.label,
        url: link.url,
        displayOrder: link.displayOrder ?? index,
      }))

      setMe(updated)
      setName(updated.name ?? "")
      setNickname(updated.nickname ?? "")
      setPhone(updated.phone ?? "")
      setBio(updated.bio ?? "")
      setLinks(mappedLinks)

      setOriginalProfile({
        name: updated.name ?? "",
        nickname: updated.nickname ?? "",
        phone: updated.phone ?? "",
        bio: updated.bio ?? "",
        links: mappedLinks,
      })

      setProfileSuccess("프로필이 저장되었습니다.")
    } catch (e) {
      setProfileErr(apiErrorMessage(e, "프로필 저장 실패"))
    }
  }

  const onChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setPasswordErr(null)
    setPasswordSuccess(null)

    if (!currentPassword.trim()) {
      setPasswordErr("현재 비밀번호를 입력해주세요")
      return
    }

    if (!newPassword.trim()) {
      setPasswordErr("새 비밀번호를 입력해주세요")
      return
    }

    if (!confirmPassword.trim()) {
      setPasswordErr("새 비밀번호 확인을 입력해주세요")
      return
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordErr("비밀번호가 일치하지 않습니다")
      return
    }

    try {
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSuccess("비밀번호가 변경되었습니다.")
    } catch (e) {
      setPasswordErr(apiErrorMessage(e, "비밀번호 변경 실패"))
    }
  }

  const addLink = () => {
    setProfileErr(null)
    setProfileSuccess(null)
    setLinks((prev) => [
      ...prev,
      {
        type: "ETC",
        label: "",
        url: "",
        displayOrder: prev.length,
      },
    ])
  }

  const removeLink = (index: number) => {
    setProfileErr(null)
    setProfileSuccess(null)
    setLinks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((link, i) => ({
          ...link,
          displayOrder: i,
        }))
    )
  }

  const updateLink = <K extends keyof ProfileLinkForm>(
    index: number,
    key: K,
    value: ProfileLinkForm[K]
  ) => {
    setProfileErr(null)
    setProfileSuccess(null)
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [key]: value } : link))
    )
  }

  const onWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setWithdrawErr(null)

    if (!withdrawPassword.trim()) {
      setWithdrawErr("탈퇴 확인용 비밀번호를 입력해주세요")
      return
    }

    const ok = window.confirm("정말 탈퇴하시겠습니까?")
    if (!ok) return

    try {
      await withdrawMember({ password: withdrawPassword.trim() })
      tokenStore.clear()

      nav("/login", {
        replace: true,
        state: { withdrawSuccess: true },
      })
    } catch (e) {
      setWithdrawErr(apiErrorMessage(e, "회원탈퇴 실패"))
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">로딩 중...</div>
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">계정 설정</h1>
        <p className="mt-2 text-sm text-slate-600">
          내 정보를 관리하고 보안을 설정할 수 있어요.
        </p>
      </div>

      {loadErr && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {loadErr}
        </div>
      )}

      {me && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">이메일</div>
          <div className="mt-1 text-base font-medium text-slate-900">{me.email}</div>

          <div className="mt-4 text-sm text-slate-500">상태</div>
          <div className="mt-1 text-sm font-semibold text-slate-700">{me.status}</div>
        </div>
      )}

      <form
        onSubmit={onUpdateProfile}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">회원정보 수정</h2>

        {profileErr && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {profileErr}
          </div>
        )}

        {profileSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            {profileSuccess}
          </div>
        )}

        {isProfileDirty && !profileSuccess && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            저장되지 않은 변경사항이 있어요.
          </div>
        )}

        <input
          className={inputClassName}
          placeholder="이름"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (profileErr) setProfileErr(null)
            if (profileSuccess) setProfileSuccess(null)
          }}
        />

        <input
          className={inputClassName}
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value)
            if (profileErr) setProfileErr(null)
            if (profileSuccess) setProfileSuccess(null)
          }}
        />

        <input
          className={inputClassName}
          placeholder="전화번호"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (profileErr) setProfileErr(null)
            if (profileSuccess) setProfileSuccess(null)
          }}
        />

        <textarea
          className={`${inputClassName} min-h-[110px] resize-y placeholder:text-slate-400`}
          placeholder="한 줄 소개"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value)
            if (profileErr) setProfileErr(null)
            if (profileSuccess) setProfileSuccess(null)
          }}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">프로필 링크</h3>
            <button
              type="button"
              onClick={addLink}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              링크 추가
            </button>
          </div>

          {links.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              등록된 프로필 링크가 없어요.
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                    <select
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={link.type}
                      onChange={(e) =>
                        updateLink(index, "type", e.target.value as ProfileLinkType)
                      }
                    >
                      <option value="GITHUB">GitHub</option>
                      <option value="BLOG">Blog</option>
                      <option value="PORTFOLIO">Portfolio</option>
                      <option value="ETC">기타</option>
                    </select>

                    <input
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="링크 이름"
                      value={link.label}
                      onChange={(e) => updateLink(index, "label", e.target.value)}
                    />
                  </div>

                  <div className="mt-3 flex gap-3">
                    <input
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          링크 이름과 주소를 모두 입력해야 저장되며, 추가/삭제 변경사항은 프로필 저장 시 반영돼요.
        </p>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          프로필 저장
        </button>
      </form>

      <form
        onSubmit={onChangePassword}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">비밀번호 변경</h2>

        {passwordErr && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {passwordErr}
          </div>
        )}

        {passwordSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            {passwordSuccess}
          </div>
        )}

        <input
          type="password"
          placeholder="현재 비밀번호"
          className={inputClassName}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (passwordErr) setPasswordErr(null)
            if (passwordSuccess) setPasswordSuccess(null)
          }}
        />

        <input
          type="password"
          placeholder="새 비밀번호"
          className={inputClassName}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (passwordErr) setPasswordErr(null)
            if (passwordSuccess) setPasswordSuccess(null)
          }}
        />

        <input
          type="password"
          placeholder="새 비밀번호 확인"
          className={inputClassName}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (passwordErr) setPasswordErr(null)
            if (passwordSuccess) setPasswordSuccess(null)
          }}
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          비밀번호 변경
        </button>
      </form>

      <form
        onSubmit={onWithdraw}
        className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6"
      >
        <h2 className="text-lg font-bold text-red-600">회원탈퇴</h2>

        <p className="text-sm leading-6 text-red-700">
          탈퇴 시 계정은 비활성화되며 작성한 게시글과 댓글은 삭제되지 않고 작성자 정보만 변경됩니다.
        </p>

        {withdrawErr && (
          <div className="rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600">
            {withdrawErr}
          </div>
        )}

        <input
          type="password"
          placeholder="비밀번호 확인"
          className="w-full rounded-xl border border-red-300 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          value={withdrawPassword}
          onChange={(e) => {
            setWithdrawPassword(e.target.value)
            if (withdrawErr) setWithdrawErr(null)
          }}
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          회원탈퇴 진행
        </button>
      </form>
    </div>
  )
}