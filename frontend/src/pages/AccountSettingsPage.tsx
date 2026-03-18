import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiErrorMessage } from "../utils/error"
import {
  changePassword,
  getMe,
  updateProfile,
  withdrawMember,
  type MeResponse,
} from "../api/members"
import { tokenStore } from "../auth/token"

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

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [withdrawPassword, setWithdrawPassword] = useState("")

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoadErr(null)
        const data = await getMe()
        setMe(data)
        setName(data.name ?? "")
        setNickname(data.nickname ?? "")
        setPhone(data.phone ?? "")
        setBio(data.bio ?? "")
      } catch (e) {
        setLoadErr(apiErrorMessage(e, "내 정보 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setProfileErr(null)
      setProfileSuccess(null)
     
      const updated = await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      })
      setMe(updated)
      setProfileSuccess("회원정보가 수정되었습니다.")
    } catch (e) {
      setProfileErr(apiErrorMessage(e, "회원정보 수정 실패"))
    }
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErr(null)
    setPasswordSuccess(null)

    if (!currentPassword.trim()) return setPasswordErr("현재 비밀번호 입력")
    if (!newPassword.trim()) return setPasswordErr("새 비밀번호 입력")
    if (!confirmPassword.trim()) return setPasswordErr("새 비밀번호 확인 입력")
    if (newPassword.trim() !== confirmPassword.trim()) {
      return setPasswordErr("비밀번호가 일치하지 않습니다")
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

  const onWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawErr(null)

    if (!withdrawPassword.trim()) {
      return setWithdrawErr("탈퇴 확인용 비밀번호 입력")
    }

    const ok = window.confirm("정말 탈퇴하시겠습니까?")
    if (!ok) return

    try {
      await withdrawMember({ password: withdrawPassword.trim() })
      tokenStore.clear()
      alert("회원탈퇴가 완료되었습니다.")
      nav("/", { replace: true })
    } catch (e) {
      setWithdrawErr(apiErrorMessage(e, "회원탈퇴 실패"))
    }
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>
      <h1
        style={{
          marginBottom: 20,
          fontSize: 56,
          fontWeight: 800,
          color: "#24364b",
          letterSpacing: -1,
        }}
      >
        MY PAGE
      </h1>

      {loadErr && (
        <div
          style={{
            color: "crimson",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {loadErr}
        </div>
      )}

      {me && (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 16,
            background: "white",
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 15 }}>
            <strong>이메일:</strong> {me.email}
          </div>
          <div style={{ fontSize: 15 }}>
            <strong>상태:</strong> {me.status}
          </div>
        </div>
      )}

      <form
        onSubmit={onUpdateProfile}
        style={{
          marginBottom: 24,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
          background: "white",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, color: "#24364b" }}>
          회원정보 수정
        </h2>

        {profileErr && (
          <div style={{ color: "crimson", marginBottom: 12, fontSize: 14 }}>
            {profileErr}
          </div>
        )}
        {profileSuccess && (
          <div style={{ color: "green", marginBottom: 12, fontSize: 14 }}>
            {profileSuccess}
          </div>
        )}

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 10,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 10,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 10,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            boxSizing: "border-box",
            minHeight: 110,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
            resize: "vertical",
          }}
          placeholder="한 줄 소개"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button
          type="submit"
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: 10,
            background: "#24364b",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          회원정보 수정
        </button>
      </form>

      <form
        onSubmit={onChangePassword}
        style={{
          marginBottom: 24,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
          background: "white",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, color: "#24364b" }}>
          비밀번호 변경
        </h2>

        {passwordErr && (
          <div style={{ color: "crimson", marginBottom: 12, fontSize: 14 }}>
            {passwordErr}
          </div>
        )}
        {passwordSuccess && (
          <div style={{ color: "green", marginBottom: 12, fontSize: 14 }}>
            {passwordSuccess}
          </div>
        )}

        <input
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 10,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 10,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            boxSizing: "border-box",
            border: "1px solid #cfd6de",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: 10,
            background: "#24364b",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          비밀번호 변경
        </button>
      </form>

      <form
        onSubmit={onWithdraw}
        style={{
          padding: 24,
          border: "1px solid #f1c0c0",
          borderRadius: 16,
          background: "#fffafa",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, color: "crimson" }}>
          회원탈퇴
        </h2>

        {withdrawErr && (
          <div style={{ color: "crimson", marginBottom: 12, fontSize: 14 }}>
            {withdrawErr}
          </div>
        )}

        <input
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            boxSizing: "border-box",
            border: "1px solid #f0b6b6",
            borderRadius: 10,
            fontSize: 16,
          }}
          placeholder="비밀번호 확인"
          value={withdrawPassword}
          onChange={(e) => setWithdrawPassword(e.target.value)}
        />

        <button
          type="submit"
          style={{
            color: "white",
            background: "crimson",
            border: "none",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          회원탈퇴
        </button>
      </form>
    </div>
  )
}