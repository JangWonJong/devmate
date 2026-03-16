import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signup } from "../api/auth"
import { apiErrorMessage } from "../utils/error"


export function SignupPage() {

  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")

  const [err, setErr] = useState<string | null>(null)
  
  const handleSignup = async (e: React.FormEvent) => {
    
    e.preventDefault()
    setErr(null)

    const emailTrim = email.trim()
    const passwordTrim = password.trim()
    const confirmTrim = confirmPassword.trim()
    const nicknameTrim = nickname.trim()

    if (!emailTrim) return setErr("이메일 입력")
    if (!passwordTrim) return setErr("비밀번호 입력")
    if (!confirmTrim) return setErr("비밀번화 확인 입력")
    if (!nicknameTrim) return setErr("닉네임 입력")
    
    if (passwordTrim !== confirmTrim) {
      return setErr("비밀번호가 일치하지 않습니다")
    }  

    try{
      await signup({
        email: emailTrim,
        password: passwordTrim,
        confirmPassword: confirmTrim,
        nickname: nicknameTrim
      })

      nav("/login", { state: { signupSuccess: true}})

    } catch (e: any) {
      setErr(apiErrorMessage(e, "회원가입실패"))
    }

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
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
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
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          onChange={(e) => setNickname(e.target.value)}
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
              cursor: "pointer",
            }}
          >
            SIGN UP
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