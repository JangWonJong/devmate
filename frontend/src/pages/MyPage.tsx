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

export function MyPage() {
  const nav = useNavigate()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

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
        setErr(null)
        const data = await getMe()
        setMe(data)
        setName(data.name ?? "")
        setNickname(data.nickname ?? "")
        setPhone(data.phone ?? "")
        setBio(data.bio ?? "")
      } catch (e) {
        setErr(apiErrorMessage(e, "내 정보 조회 실패"))
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setErr(null)
      const updated = await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      })
      setMe(updated)
      alert("회원정보가 수정되었습니다.")
    } catch (e) {
      setErr(apiErrorMessage(e, "회원정보 수정 실패"))
    }
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword.trim()) return setErr("현재 비밀번호 입력")
    if (!newPassword.trim()) return setErr("새 비밀번호 입력")
    if (!confirmPassword.trim()) return setErr("새 비밀번호 확인 입력")
    if (newPassword.trim() !== confirmPassword.trim()) {
      return setErr("비밀번호가 일치하지 않습니다")
    }

    try {
      setErr(null)
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      alert("비밀번호가 변경되었습니다.")
    } catch (e) {
      setErr(apiErrorMessage(e, "비밀번호 변경 실패"))
    }
  }

  const onWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!withdrawPassword.trim()) {
      return setErr("탈퇴 확인용 비밀번호 입력")
    }

    const ok = window.confirm("정말 탈퇴하시겠습니까?")
    if (!ok) return

    try {
      setErr(null)
      await withdrawMember({ password: withdrawPassword.trim() })
      tokenStore.clear()
      alert("회원탈퇴가 완료되었습니다.")
      nav("/", { replace: true })
    } catch (e) {
      setErr(apiErrorMessage(e, "회원탈퇴 실패"))
    }
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ marginBottom: 20 }}>MY PAGE</h1>

      {err && (
        <div style={{ color: "crimson", marginBottom: 16 }}>
          {err}
        </div>
      )}

      {me && (
        <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <div><strong>이메일:</strong> {me.email}</div>
          <div><strong>상태:</strong> {me.status}</div>
        </div>
      )}

      <form
        onSubmit={onUpdateProfile}
        style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}
      >
        <h2 style={{ marginTop: 0 }}>회원정보 수정</h2>

        <input
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <input
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box", minHeight: 100 }}
          placeholder="한 줄 소개"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button type="submit">회원정보 수정</button>
      </form>

      <form
        onSubmit={onChangePassword}
        style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}
      >
        <h2 style={{ marginTop: 0 }}>비밀번호 변경</h2>

        <input
          type="password"
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">비밀번호 변경</button>
      </form>

      <form
        onSubmit={onWithdraw}
        style={{ padding: 16, border: "1px solid #f1c0c0", borderRadius: 12 }}
      >
        <h2 style={{ marginTop: 0, color: "crimson" }}>회원탈퇴</h2>

        <input
          type="password"
          style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box" }}
          placeholder="비밀번호 확인"
          value={withdrawPassword}
          onChange={(e) => setWithdrawPassword(e.target.value)}
        />

        <button type="submit" style={{ color: "white", background: "crimson", border: "none", padding: "10px 14px", borderRadius: 8 }}>
          회원탈퇴
        </button>
      </form>
    </div>
  )
}