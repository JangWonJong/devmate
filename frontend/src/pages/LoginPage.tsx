import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { tokenStore } from "../auth/token";
import { apiErrorMessage } from "../utils/error";


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
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErr(null)

    const eValue = email.trim()
    const pValue = password.trim()

    if (!eValue) return setErr("이메일 입력")
    if (!pValue) return setErr("비밀번호 입력")

    try {
      const res = await login({ email: eValue, password: pValue })
      tokenStore.setTokens(res.accessToken, res.refreshToken)
      nav(from, { replace: true })
    } catch (e: any) {
      setErr(apiErrorMessage(e, "로그인 실패"))
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
            LOGIN
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