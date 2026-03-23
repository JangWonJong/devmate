import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { tokenStore } from "../../auth/token";
import { apiErrorMessage } from "../../utils/error";


export function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()
  
  const from = 
    (loc.state as any)?.from?.pathname
      ? (loc.state as any).from.pathname +
        ((loc.state as any).from.search ?? "" ) +
        ((loc.state as any).from.hash ?? "")
      : "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const signupSuccess = Boolean((loc.state as any)?.signupSuccess)
  const withdrawSuccess = Boolean((loc.state as any)?.withdrawSuccess)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (submitting) return
    setErr(null)

    const eValue = email.trim()
    const pValue = password.trim()

    if (!eValue) return setErr("이메일을 입력해주세요")
    if (!pValue) return setErr("비밀번호를 입력해주세요")

    try {
      setSubmitting(true)
      const res = await login({ email: eValue, password: pValue })
      tokenStore.setTokens(res.accessToken, res.refreshToken)
      nav(from, { replace: true })
    } catch (e: any) {
      setErr(apiErrorMessage(e, "로그인 실패"))
    } finally {
      setSubmitting(false)
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
        onSubmit={onSubmit}
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
            fontSize: 48,
            fontWeight: 800,
            margin: 0,
            marginBottom: 12,
            color: "#24364b",
            letterSpacing: -1,
          }}
        >
          LOGIN
        </h1>
        {signupSuccess && !err && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#059669",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 14,
              marginTop: -2,
            }}
          >
            회원가입이 완료되었습니다. 로그인 해주세요.
          </div>
        )}
        {withdrawSuccess && !err && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                marginTop: -2,
              }}
            >
              회원 탈퇴가 완료되었습니다.
            </div>
          )}
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
            if (err) setErr(null) 
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
            if (err) setErr(null)
          }}
        />
        
        {err && (
          <div
            style={{
              color: "#dc2626",
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
              opacity: submitting ? 0.85 : 1,
            }}
          >
          {submitting ? "로그인 중..." : "LOGIN"}
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