import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { tokenStore } from "../auth/token";


export function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const loc = useLocation() as any
  const next = loc.state?.next ?? "/"
  
  return (
  <div style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>LOGIN</h1>

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

      <button
        style={{ padding: "10px 14px" }}
        onClick={async () => {
          setErr(null);

          const e = email.trim()
          const p = password.trim()
          if (!e) return setErr("이메일 입력")
          if (!p) return setErr("비밀번호 입력")

          try {
            const res = await login({ email: e, password: p });
            tokenStore.setTokens(res.accessToken, res.refreshToken);
            nav(next);
          } catch (e: any) {
            const msg = e.response?.data?.error?.message ?? "로그인 실패"
            setErr(msg);

          }
        }}
      >
        LOGIN
      </button>
      <button style={{ padding: "10px 14px" }} onClick={() => nav(-1)}>
        뒤로
      </button>

    </div>
  )
}