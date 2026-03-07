import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { tokenStore } from "../auth/token";


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
      const msg = e.response?.data?.error?.message ?? "로그인 실패"
      setErr(msg)
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>LOGIN</h1>

      <form onSubmit={onSubmit}>
        <input
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "10px 14px" }}>
            LOGIN
          </button>

          <button
            type="button"
            style={{ padding: "10px 14px" }}
            onClick={() => nav(-1)}
          >
            뒤로
          </button>
        </div>
      </form>
    </div>
  )
}