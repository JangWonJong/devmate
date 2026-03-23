import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../../api/auth"
import { apiErrorMessage } from "../../utils/error"


export function SignupPage() {

  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailTrim = email.trim()
  const passwordTrim = password.trim()
  const confirmTrim = confirmPassword.trim()
  const nameTrim = name.trim()
  const nicknameTrim = nickname.trim()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailTrim) return setErr("이메일을 입력해주세요")
    if (!emailRegex.test(emailTrim)) {
      return setErr("올바른 이메일 형식을 입력해주세요")
    }
    if (!passwordTrim) return setErr("비밀번호을 입력해주세요")
    if (passwordTrim.length < 8) {
      return setErr("비밀번호는 8자 이상이어야 합니다")
    }

    if (!confirmTrim) return setErr("비밀번호 확인을 입력해주세요")
    if (!nameTrim) return setErr("이름을 입력해주세요")
    if (!nicknameTrim) return setErr("닉네임을 입력해주세요")
    
    if (passwordTrim !== confirmTrim) {
      return setErr("비밀번호가 일치하지 않습니다")
    }  

    try{
      setSubmitting(true)

      await signup({
        email: emailTrim,
        password: passwordTrim,
        confirmPassword: confirmTrim,
        name: nameTrim,
        nickname: nicknameTrim
      })

      nav("/login", { state: { signupSuccess: true}})

    } catch (e: any) {
      setErr(apiErrorMessage(e, "회원가입에 실패했습니다"))
    } finally {
      setSubmitting(false)
    }

  }

  const clearError = () => {
    if (err) setErr(null)
  }

  
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            margin: 0,
            marginBottom: 12,
            color: "#24364b",
            letterSpacing: -1,
          }}
        >
          SIGN UP
        </h1>

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            clearError()
          }}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            clearError()
          }}
        />

        <input
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            border: "1px solid #cfd6de",
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="nickname"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value)
            clearError()
          }}
        />

        {err && (
          <div
            style={{
              color: "crimson",
              fontSize: 14,
              marginTop: -2,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 6,
          }}
        >
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "none",
              borderRadius: 10,
              background: "#24364b",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.85 : 1
            }}
          >
            {submitting ? "가입 중..." : "SIGN UP"}
          </button>

          <button
            type="button"
            onClick={() => nav(-1)}
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "1px solid #cfd6de",
              borderRadius: 10,
              background: "white",
              color: "#24364b",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            뒤로
          </button>
        </div>
      </form>
    </div>
  )
}